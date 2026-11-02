const { after, afterEach, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { ADMIN, api, flush, resetDb, sent, startDb, stopDb } = require('./helpers');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const CustomOrder = require('../models/CustomOrder');

before(startDb);
after(stopDb);
beforeEach(resetDb);

const form = { firstName: 'Ana', lastName: 'Cruz', email: 'ana@example.test', phone: '09171234567', street: '1 Rizal St', barangay: 'San Isidro', city: 'Makati', province: 'Metro Manila', postalCode: '1200' };

/* PayMongo is the one external system here, so these tests replace fetch only. */
const realFetch = globalThis.fetch;
let paymongo;

beforeEach(() => {
  paymongo = { sessions: [], paid: true };
  globalThis.fetch = async (url, init = {}) => {
    if (!String(url).includes('api.paymongo.com')) return realFetch(url, init);
    if (init.method === 'POST') {
      const body = JSON.parse(init.body);
      paymongo.sessions.push(body.data.attributes);
      return { ok: true, json: async () => ({ data: { id: `cs_${paymongo.sessions.length}`, attributes: { checkout_url: 'https://pay.test/session' } } }) };
    }
    const status = paymongo.paid ? 'paid' : 'pending';
    return { ok: true, json: async () => ({ data: { id: 'cs_1', attributes: { payments: paymongo.paid ? [{ attributes: { status } }] : [] } } }) };
  };
});

afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.CHECKOUT_MODE;
});

const product = () => Product.create({ name: 'Necklace', price: 185, img: 'x', cat: 'Necklace' });
const line = (item, extra = {}) => ({ _id: String(item._id), name: item.name, price: 1, qty: 2, sz: 'M', ...extra });
const start = async (cart, region = 'Luzon') => api().post('/api/create-checkout-session').send({ cart, checkoutForm: form, shippingRegion: region });

function signed(payload, { secret = process.env.PAYMONGO_WEBHOOK_SECRET, at = Math.floor(Date.now() / 1000), key = 'te' } = {}) {
  const raw = JSON.stringify(payload);
  const sig = crypto.createHmac('sha256', secret).update(`${at}.${raw}`).digest('hex');
  return { raw, header: `t=${at},te=${key === 'te' ? sig : ''},li=${key === 'li' ? sig : ''}` };
}

const paidEvent = (sessionId = 'cs_1', livemode = false) => ({
  data: { attributes: { type: 'checkout_session.payment.paid', livemode, data: { id: sessionId, attributes: {} } } }
});

const webhook = ({ raw, header }) => api().post('/api/webhooks/paymongo').set('Content-Type', 'application/json').set('Paymongo-Signature', header).send(raw);

test('the browser can no longer declare an order paid', async () => {
  const res = await api().post('/api/orders').send({ cart: [], checkoutForm: form, shippingRegion: 'Luzon', amount: 1 });
  assert.equal(res.status, 404);
  assert.equal(await Order.countDocuments(), 0);
});

test('showcase checkout charges one peso and records the real total', async () => {
  const res = await start([line(await product())]);
  assert.equal(res.status, 200);
  assert.equal(res.body.checkout_url, 'https://pay.test/session');

  const session = paymongo.sessions[0];
  assert.equal(session.line_items.length, 1);
  assert.equal(session.line_items[0].amount, 100);
  assert.equal(session.line_items[0].quantity, 1);

  const order = await Order.findOne();
  assert.equal(order.status, 'Pending Payment');
  assert.equal(order.amountPaid, 470);
  assert.equal(order.chargedAmount, 1);
  assert.equal(order.items[0].name, 'Necklace');
  assert.equal(order.items[0].amount, 18500);
  assert.ok(order.ref);
  assert.ok(session.success_url.includes(order.ref));
});

test('live checkout sends the real lines and shipping', async () => {
  process.env.CHECKOUT_MODE = 'live';
  await start([line(await product())]);
  const items = paymongo.sessions[0].line_items;
  assert.deepEqual(items.map((i) => [i.name, i.amount, i.quantity]), [['Necklace', 18500, 2], ['Shipping', 10000, 1]]);
  const order = await Order.findOne();
  assert.equal(order.chargedAmount, 470);
});

test('live checkout leaves shipping off when it is free', async () => {
  process.env.CHECKOUT_MODE = 'live';
  const item = await Product.create({ name: 'Big', price: 600, img: 'x', cat: 'Necklace' });
  await start([{ _id: String(item._id), qty: 1 }]);
  assert.equal(paymongo.sessions[0].line_items.length, 1);
});

test('a sold out piece stops checkout before any session exists', async () => {
  const item = await Product.create({ name: 'Gone', price: 10, img: 'x', cat: 'x', isAvailable: false });
  const res = await start([line(item)]);
  assert.equal(res.status, 400);
  assert.ok(res.body.error.includes('Gone'));
  assert.equal(paymongo.sessions.length, 0);
  assert.equal(await Order.countDocuments(), 0);
});

test('an incomplete address is refused', async () => {
  const res = await api().post('/api/create-checkout-session').send({ cart: [line(await product())], checkoutForm: { ...form, street: '' }, shippingRegion: 'Luzon' });
  assert.equal(res.status, 400);
  assert.equal(paymongo.sessions.length, 0);
});

test('a failed payment provider call reports a clean error', async () => {
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ errors: [{ detail: 'secret detail' }] }) });
  const res = await start([line(await product())]);
  assert.equal(res.status, 502);
  assert.ok(!JSON.stringify(res.body).includes('secret detail'));
  assert.equal(await Order.countDocuments(), 0);
});

test('confirming a paid session marks the order paid and sends one receipt', async () => {
  await start([line(await product())]);
  const { ref } = await Order.findOne();
  const first = await api().post('/api/orders/confirm').send({ ref });
  assert.equal(first.status, 200);
  assert.equal(first.body.status, 'Paid');
  await api().post('/api/orders/confirm').send({ ref });
  await flush();
  assert.equal((await Order.findOne()).status, 'Paid');
  assert.equal(sent.filter((m) => m.to === form.email).length, 1);
});

test('returning from PayMongo without paying leaves the order pending', async () => {
  paymongo.paid = false;
  await start([line(await product())]);
  const { ref } = await Order.findOne();
  const res = await api().post('/api/orders/confirm').send({ ref });
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'Pending Payment');
  await flush();
  assert.equal(sent.length, 0);
});

test('confirming an unknown reference returns 404', async () => {
  const res = await api().post('/api/orders/confirm').send({ ref: 'nope' });
  assert.equal(res.status, 404);
});

test('a confirm reference must be a plain string', async () => {
  const res = await api().post('/api/orders/confirm').send({ ref: { $ne: null } });
  assert.equal(res.status, 400);
});

test('a webhook with a bad signature changes nothing', async () => {
  await start([line(await product())]);
  const res = await webhook(signed(paidEvent(), { secret: 'wrong' }));
  assert.equal(res.status, 400);
  assert.equal((await Order.findOne()).status, 'Pending Payment');
});

test('a webhook with no signature changes nothing', async () => {
  await start([line(await product())]);
  const res = await api().post('/api/webhooks/paymongo').set('Content-Type', 'application/json').send(JSON.stringify(paidEvent()));
  assert.equal(res.status, 400);
  assert.equal((await Order.findOne()).status, 'Pending Payment');
});

test('an old signed webhook is refused', async () => {
  await start([line(await product())]);
  const res = await webhook(signed(paidEvent(), { at: Math.floor(Date.now() / 1000) - 3600 }));
  assert.equal(res.status, 400);
  assert.equal((await Order.findOne()).status, 'Pending Payment');
});

test('the webhook refuses everything when its secret is not configured', async () => {
  await start([line(await product())]);
  const payload = signed(paidEvent());
  const saved = process.env.PAYMONGO_WEBHOOK_SECRET;
  delete process.env.PAYMONGO_WEBHOOK_SECRET;
  const quiet = console.warn;
  console.warn = () => {};
  try {
    const res = await webhook(payload);
    assert.equal(res.status, 400);
  } finally {
    process.env.PAYMONGO_WEBHOOK_SECRET = saved;
    console.warn = quiet;
  }
  assert.equal((await Order.findOne()).status, 'Pending Payment');
});

test('a signed test-mode webhook marks the order paid', async () => {
  await start([line(await product())]);
  const res = await webhook(signed(paidEvent()));
  assert.equal(res.status, 200);
  assert.equal((await Order.findOne()).status, 'Paid');
});

test('a signed live-mode webhook is checked against the live signature', async () => {
  await start([line(await product())]);
  const res = await webhook(signed(paidEvent('cs_1', true), { key: 'li' }));
  assert.equal(res.status, 200);
  assert.equal((await Order.findOne()).status, 'Paid');
});

test('a webhook for an unknown session is acknowledged and ignored', async () => {
  const res = await webhook(signed(paidEvent('cs_unknown')));
  assert.equal(res.status, 200);
});

test('the webhook and the confirm call arriving together send one receipt', async () => {
  await start([line(await product())]);
  const { ref } = await Order.findOne();
  await Promise.all([webhook(signed(paidEvent())), api().post('/api/orders/confirm').send({ ref }), webhook(signed(paidEvent()))]);
  await flush();
  assert.equal((await Order.findOne()).status, 'Paid');
  assert.equal(sent.filter((m) => m.to === form.email).length, 1);
});

test('a failed receipt email does not fail the order', async () => {
  const email = require('../services/email');
  const real = email.transport.deliver;
  email.transport.deliver = async () => {
    throw new Error('mail provider down');
  };
  const quiet = console.error;
  console.error = () => {};
  try {
    await start([line(await product())]);
    const res = await webhook(signed(paidEvent()));
    assert.equal(res.status, 200);
    assert.equal((await Order.findOne()).status, 'Paid');
  } finally {
    email.transport.deliver = real;
    console.error = quiet;
  }
});

test('pending orders stay out of stats, bestsellers and order lists', async () => {
  const item = await product();
  await start([line(item)]);
  const user = await User.create({ firstName: 'Ana', email: form.email, password: await bcrypt.hash('secret123', 4) });
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  const stats = await api().get('/api/admin/stats').set(ADMIN);
  assert.deepEqual(stats.body, { revenue: 0, totalOrders: 0 });
  assert.deepEqual((await api().get('/api/bestsellers')).body, []);
  assert.deepEqual((await api().get('/api/admin/orders').set(ADMIN)).body, []);
  assert.deepEqual((await api().get('/api/user/orders').set('Authorization', `Bearer ${token}`)).body, []);
});

test('paid orders count, using real item names in test mode', async () => {
  const item = await product();
  await start([line(item)]);
  await webhook(signed(paidEvent()));

  const stats = await api().get('/api/admin/stats').set(ADMIN);
  assert.deepEqual(stats.body, { revenue: 470, totalOrders: 1 });
  const best = await api().get('/api/bestsellers');
  assert.equal(best.body[0].name, 'Necklace');
});

test('a custom design is priced by the server and can be bought', async () => {
  const res = await api().post('/api/custom-orders').send({
    email: form.email,
    name: 'My bracelet',
    collectionId: 'ce8',
    beads: Array.from({ length: 20 }, () => ({ name: 'Blue', hex: '#000' })),
    stringId: 's1',
    wristCm: 16.5,
    totalPrice: 1
  });
  assert.equal(res.status, 201);
  assert.equal(res.body.totalPrice, 73);
  assert.equal(res.body.status, 'Pending Studio Review');
  assert.equal((await CustomOrder.findById(res.body._id)).beadType, 'Cat Eye (8mm)');

  await start([{ id: 99, name: 'My bracelet', price: 1, qty: 1, customOrderId: res.body._id }]);
  const order = await Order.findOne();
  assert.equal(order.amountPaid, 73 + 100);
});

test('an invalid custom design is refused', async () => {
  const res = await api().post('/api/custom-orders').send({ email: 'nope', collectionId: 'ce8', beads: [], stringId: 's1', wristCm: 16 });
  assert.equal(res.status, 400);
  assert.equal(await CustomOrder.countDocuments(), 0);
});

const design = (overrides = {}) => CustomOrder.create({ email: form.email, name: 'Mine', totalPrice: 73, beadType: 'Cat Eye', ...overrides });
const tokenFor = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const customer = () => User.create({ firstName: 'Ana', email: form.email, password: 'x' });
const history = async (user) => (await api().get('/api/user/orders').set('Authorization', `Bearer ${tokenFor(user)}`)).body;

test('a built-in object name is not a shipping region', async () => {
  const res = await start([line(await product())], 'constructor');
  assert.equal(res.status, 400);
  assert.equal(await Order.countDocuments(), 0);
});

test('a design left in the bag is not an order', async () => {
  const user = await customer();
  await design();
  assert.deepEqual(await history(user), []);
  const queue = await api().get('/api/custom-orders').set(ADMIN);
  assert.deepEqual(queue.body, []);
});

test('nobody can plant a design in another customer\'s history', async () => {
  const user = await customer();
  await api().post('/api/custom-orders').send({ email: form.email, collectionId: 'ce8', beads: Array.from({ length: 20 }, () => ({ name: 'Blue' })), stringId: 's1', wristCm: 16.5 });
  assert.deepEqual(await history(user), []);
});

test('paying for a design sends it to the studio and lists it once for the customer', async () => {
  const user = await customer();
  const mine = await design();
  await start([{ id: 99, name: 'Mine', price: 1, qty: 1, customOrderId: String(mine._id) }]);
  await webhook(signed(paidEvent()));
  await flush();

  const queue = await api().get('/api/custom-orders').set(ADMIN);
  assert.equal(queue.body.length, 1);
  const list = await history(user);
  assert.equal(list.length, 1);
  assert.equal(list[0].status, 'Paid');
});

test('a design from before payments were tracked stays visible', async () => {
  const user = await customer();
  await CustomOrder.collection.insertOne({ email: form.email, name: 'Older', totalPrice: 73, status: 'Crafting', createdAt: new Date() });
  assert.equal((await history(user)).length, 1);
  const queue = await api().get('/api/custom-orders').set(ADMIN);
  assert.equal(queue.body.length, 1);
});

test('orders appear for an older account with capitals in its email', async () => {
  const user = await User.create({ firstName: 'Ana', email: 'Ana@Example.test', password: 'x' });
  await start([line(await product())]);
  await webhook(signed(paidEvent()));
  await flush();
  assert.equal((await history(user)).length, 1);
});

test('unpaid checkouts are set to expire, and paid orders are not', async () => {
  await Order.init();
  const indexes = await Order.collection.indexes();
  const expiry = indexes.find((index) => index.expireAfterSeconds !== undefined);
  assert.ok(expiry);
  assert.deepEqual(expiry.partialFilterExpression, { status: Order.PENDING });
});

test('abandoned designs are set to expire, and paid ones are not', async () => {
  await CustomOrder.init();
  const indexes = await CustomOrder.collection.indexes();
  const expiry = indexes.find((index) => index.expireAfterSeconds !== undefined);
  assert.ok(expiry);
  assert.deepEqual(expiry.partialFilterExpression, { paid: false });
});
