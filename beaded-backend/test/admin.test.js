const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const { ADMIN, api, resetDb, startDb, stopDb } = require('./helpers');
const Product = require('../models/Product');
const CustomOrder = require('../models/CustomOrder');

before(startDb);
after(stopDb);
beforeEach(resetDb);

const ID = '69ee3bee758fbf56e6af05f8';
const product = (overrides = {}) => Product.create({ name: 'Necklace', price: 100, img: 'https://res.test/a.jpg', cat: 'Necklace', ...overrides });

const guarded = [
  ['post', '/api/products'],
  ['put', `/api/products/${ID}`],
  ['put', `/api/products/${ID}/status`],
  ['post', '/api/admin/products'],
  ['put', `/api/admin/products/${ID}`],
  ['delete', `/api/admin/products/${ID}`],
  ['get', '/api/admin/orders'],
  ['patch', `/api/admin/orders/${ID}/status`],
  ['get', '/api/admin/stats'],
  ['put', '/api/admin/settings'],
  ['post', '/api/admin/reviews'],
  ['delete', `/api/admin/reviews/${ID}`],
  ['post', '/api/admin/blogs'],
  ['put', `/api/admin/blogs/${ID}`],
  ['delete', `/api/admin/blogs/${ID}`],
  ['get', '/api/custom-orders'],
  ['patch', `/api/admin/custom-orders/${ID}/status`]
];

for (const [method, url] of guarded) {
  test(`${method.toUpperCase()} ${url} needs the admin key`, async () => {
    const res = await api()[method](url).send({});
    assert.equal(res.status, 403);
  });

  test(`${method.toUpperCase()} ${url} refuses a wrong key`, async () => {
    const res = await api()[method](url).set('admin_secret', 'guess').send({});
    assert.equal(res.status, 403);
  });
}

test('admin routes stay closed if the secret is not configured', async () => {
  const saved = process.env.ADMIN_SECRET;
  delete process.env.ADMIN_SECRET;
  try {
    const res = await api().get('/api/admin/stats');
    assert.equal(res.status, 403);
  } finally {
    process.env.ADMIN_SECRET = saved;
  }
});

test('nothing is stored when an anonymous visitor posts a product', async () => {
  await api().post('/api/admin/products').send({ name: 'Spam', price: 1, img: 'x', cat: 'x' });
  await api().post('/api/products').field('name', 'Spam').field('price', '1').field('cat', 'x');
  assert.equal(await Product.countDocuments(), 0);
});

test('product writes ignore fields outside the list', async () => {
  const item = await product({ rating: 5 });
  const res = await api().put(`/api/admin/products/${item._id}`).set(ADMIN).send({ name: 'Renamed', rating: 1 });
  assert.equal(res.status, 200);
  const saved = await Product.findById(item._id);
  assert.equal(saved.name, 'Renamed');
  assert.equal(saved.rating, 5);
});

test('a product write with a bad price is refused', async () => {
  const item = await product();
  const res = await api().put(`/api/admin/products/${item._id}`).set(ADMIN).send({ price: -5 });
  assert.equal(res.status, 400);
});

test('a malformed product id returns 400', async () => {
  const res = await api().put('/api/admin/products/not-an-id').set(ADMIN).send({ name: 'x' });
  assert.equal(res.status, 400);
});

test('creating a product uploads its pictures', async () => {
  const uploads = require('../services/uploads');
  uploads.store = async (file) => `https://res.test/${file.fieldname}.jpg`;
  const res = await api()
    .post('/api/products')
    .set(ADMIN)
    .field('name', 'New piece')
    .field('price', '120')
    .field('cat', 'Bracelet')
    .attach('primaryImage', Buffer.from('fake'), { filename: 'a.jpg', contentType: 'image/jpeg' });
  assert.equal(res.status, 201);
  const saved = await Product.findOne({ name: 'New piece' });
  assert.equal(saved.img, 'https://res.test/primaryImage.jpg');
  assert.equal(saved.price, 120);
});

test('editing a product replaces its picture', async () => {
  const uploads = require('../services/uploads');
  uploads.store = async () => 'https://res.test/replaced.jpg';
  const item = await product();
  const res = await api()
    .put(`/api/products/${item._id}`)
    .set(ADMIN)
    .field('name', 'Necklace')
    .attach('primaryImage', Buffer.from('fake'), { filename: 'a.jpg', contentType: 'image/jpeg' });
  assert.equal(res.status, 200);
  const saved = await Product.findById(item._id);
  assert.equal(saved.img, 'https://res.test/replaced.jpg');
});

test('editing a product without a new picture keeps the old one', async () => {
  const item = await product();
  const res = await api().put(`/api/products/${item._id}`).set(ADMIN).field('name', 'Renamed').field('existingPrimaryImage', 'https://evil.test/x.jpg');
  assert.equal(res.status, 200);
  const saved = await Product.findById(item._id);
  assert.equal(saved.img, 'https://res.test/a.jpg');
  assert.equal(saved.name, 'Renamed');
});

test('a file that is not an image is refused', async () => {
  const res = await api()
    .post('/api/products')
    .set(ADMIN)
    .field('name', 'x')
    .field('price', '1')
    .field('cat', 'x')
    .attach('primaryImage', Buffer.from('<script>'), { filename: 'a.html', contentType: 'text/html' });
  assert.equal(res.status, 400);
});

test('a picture over 5 MB is refused', async () => {
  const res = await api()
    .post('/api/products')
    .set(ADMIN)
    .field('name', 'x')
    .field('price', '1')
    .field('cat', 'x')
    .attach('primaryImage', Buffer.alloc(5 * 1024 * 1024 + 1), { filename: 'a.jpg', contentType: 'image/jpeg' });
  assert.equal(res.status, 400);
});

test('availability can be toggled with the key', async () => {
  const item = await product();
  const res = await api().put(`/api/products/${item._id}/status`).set(ADMIN).send({ isAvailable: false });
  assert.equal(res.status, 200);
  assert.equal((await Product.findById(item._id)).isAvailable, false);
});

test('the custom order list is readable with the key', async () => {
  await CustomOrder.create({ email: 'ana@example.test', name: 'Mine', totalPrice: 73 });
  const res = await api().get('/api/custom-orders').set(ADMIN);
  assert.equal(res.status, 200);
  assert.equal(res.body.length, 1);
});

test('a product change shows up immediately for the next reader', async () => {
  const item = await product();
  await api().get('/api/products');
  await api().put(`/api/admin/products/${item._id}`).set(ADMIN).send({ name: 'Fresh name' });
  const res = await api().get('/api/products');
  assert.equal(res.body[0].name, 'Fresh name');
});
