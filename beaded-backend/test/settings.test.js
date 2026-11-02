const { after, afterEach, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const { ADMIN, api, resetDb, startDb, stopDb } = require('./helpers');
const Blog = require('../models/Blog');
const Order = require('../models/Order');
const Review = require('../models/Review');

before(startDb);
after(stopDb);
beforeEach(resetDb);
afterEach(() => {
  delete process.env.CHECKOUT_MODE;
});

test('settings include theme, shipping and showcase mode', async () => {
  const res = await api().get('/api/settings');
  assert.equal(res.status, 200);
  assert.equal(res.body.theme, 'brown');
  assert.deepEqual(res.body.shippingRates, { 'Metro Manila': 85, Luzon: 100, Visayas: 120, Mindanao: 130 });
  assert.equal(res.body.freeShippingOver, 500);
  assert.equal(res.body.showcase, true);
});

test('showcase is false once checkout is live', async () => {
  process.env.CHECKOUT_MODE = 'live';
  const res = await api().get('/api/settings');
  assert.equal(res.body.showcase, false);
});

test('the admin can save the theme and customers see it', async () => {
  await api().get('/api/settings');
  const saved = await api().put('/api/admin/settings').set(ADMIN).send({ theme: 'pink' });
  assert.equal(saved.status, 200);
  const res = await api().get('/api/settings');
  assert.equal(res.body.theme, 'pink');
});

test('an unknown theme is refused', async () => {
  const res = await api().put('/api/admin/settings').set(ADMIN).send({ theme: 'neon' });
  assert.equal(res.status, 400);
});

test('the admin can change shipping rates and the free shipping threshold', async () => {
  await api().put('/api/admin/settings').set(ADMIN).send({ shippingRates: { Luzon: 90, Visayas: 110 }, freeShippingOver: 750 });
  const res = await api().get('/api/settings');
  assert.deepEqual(res.body.shippingRates, { Luzon: 90, Visayas: 110 });
  assert.equal(res.body.freeShippingOver, 750);
});

test('a negative shipping rate is refused', async () => {
  const res = await api().put('/api/admin/settings').set(ADMIN).send({ shippingRates: { Luzon: -1 } });
  assert.equal(res.status, 400);
});

test('saving settings keeps fields that were not sent', async () => {
  await api().put('/api/admin/settings').set(ADMIN).send({ topBannerText: 'Hello', categories: ['Bracelet'] });
  await api().put('/api/admin/settings').set(ADMIN).send({ theme: 'pink' });
  const res = await api().get('/api/settings');
  assert.equal(res.body.topBannerText, 'Hello');
  assert.deepEqual(res.body.categories, ['Bracelet']);
});

for (const url of ['/api/products', '/api/settings', '/api/blogs', '/api/reviews', '/api/bestsellers']) {
  test(`${url} can be cached by browsers`, async () => {
    const res = await api().get(url);
    assert.equal(res.status, 200);
    assert.match(res.headers['cache-control'], /public/);
    assert.match(res.headers['cache-control'], /stale-while-revalidate/);
  });
}

test('admin answers are never cached', async () => {
  const res = await api().get('/api/admin/stats').set(ADMIN);
  assert.doesNotMatch(res.headers['cache-control'] || '', /public/);
});

test('a new review appears straight away', async () => {
  await api().get('/api/reviews');
  await api().post('/api/admin/reviews').set(ADMIN).send({ author: 'Ana', text: 'Lovely' });
  const res = await api().get('/api/reviews');
  assert.equal(res.body[0].author, 'Ana');
});

test('a new post appears straight away and can be removed', async () => {
  await api().get('/api/blogs');
  const made = await api().post('/api/admin/blogs').set(ADMIN).send({ title: 'T', ex: 'E', content: 'C', img: 'i' });
  assert.equal((await api().get('/api/blogs')).body.length, 1);
  await api().delete(`/api/admin/blogs/${made.body._id}`).set(ADMIN);
  assert.equal((await api().get('/api/blogs')).body.length, 0);
});

test('reviews and posts come newest first', async () => {
  await Review.create({ author: 'Old', text: 'x', createdAt: new Date('2026-01-01') });
  await Review.create({ author: 'New', text: 'x', createdAt: new Date('2026-06-01') });
  await Blog.create({ title: 'Old', ex: 'x', content: 'x', img: 'x', createdAt: new Date('2026-01-01') });
  await Blog.create({ title: 'New', ex: 'x', content: 'x', img: 'x', createdAt: new Date('2026-06-01') });
  assert.equal((await api().get('/api/reviews')).body[0].author, 'New');
  assert.equal((await api().get('/api/blogs')).body[0].title, 'New');
});

test('stats total paid orders and skip pending ones', async () => {
  await Order.create({ checkoutSessionId: 'a', amountPaid: 100, status: 'Paid' });
  await Order.create({ checkoutSessionId: 'b', amountPaid: 50, status: 'Delivered' });
  await Order.create({ checkoutSessionId: 'c', amountPaid: 999, status: 'Pending Payment' });
  const res = await api().get('/api/admin/stats').set(ADMIN);
  assert.deepEqual(res.body, { revenue: 150, totalOrders: 2 });
});

test('an order status outside the list is refused', async () => {
  const order = await Order.create({ checkoutSessionId: 'a', amountPaid: 100, status: 'Paid' });
  const res = await api().patch(`/api/admin/orders/${order._id}/status`).set(ADMIN).send({ status: 'Hacked' });
  assert.equal(res.status, 400);
});

test('marking an order shipped updates it', async () => {
  const order = await Order.create({ checkoutSessionId: 'a', amountPaid: 100, status: 'Paid', customerEmail: 'a@b.test', customerName: 'Ana' });
  const res = await api().patch(`/api/admin/orders/${order._id}/status`).set(ADMIN).send({ status: 'Shipped' });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'Shipped');
});

test('compressible answers are compressed', async () => {
  for (let i = 0; i < 30; i++) {
    await Review.create({ author: `Person ${i}`, text: 'A long enough review to make compression worthwhile for this response body.' });
  }
  const res = await api().get('/api/reviews').set('Accept-Encoding', 'gzip');
  assert.equal(res.headers['content-encoding'], 'gzip');
});
