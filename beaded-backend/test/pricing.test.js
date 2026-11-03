const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const { resetDb, startDb, stopDb } = require('./helpers');
const Product = require('../models/Product');
const CustomOrder = require('../models/CustomOrder');
const { priceCart, priceCustomDesign } = require('../services/pricing');

before(startDb);
after(stopDb);
beforeEach(resetDb);

const settings = { shippingRates: { 'Metro Manila': 85, Luzon: 100, Visayas: 120, Mindanao: 130 }, freeShippingOver: 500 };
const beads = (n, name = 'Blue') => Array.from({ length: n }, () => ({ name }));
const product = (overrides = {}) => Product.create({ name: 'Necklace', price: 185, img: 'x', cat: 'Necklace', ...overrides });

test('a Cat Eye 8 mm bracelet matches the builder sum', () => {
  const design = priceCustomDesign({ collectionId: 'ce8', beads: beads(20), stringId: 's1', wristCm: 16.5 });
  assert.equal(design.totalPrice, 73);
  assert.equal(design.beadType, 'Cat Eye (8mm)');
  assert.equal(design.beadSize, '8mm');
  assert.equal(design.string, 'Stretchable Nylon');
});

test('half-peso beads add up exactly', () => {
  const design = priceCustomDesign({ collectionId: 'rs3', beads: beads(55, 'Pink'), stringId: 's1', wristCm: 16.5 });
  assert.equal(design.totalPrice, 60.5);
});

test('the lock string, extender and charm are priced', () => {
  const design = priceCustomDesign({ collectionId: 'ce8', beads: beads(20), stringId: 's2', lockColor: 'Gold', extender: true, charmIds: ['c1'], wristCm: 16.5 });
  assert.equal(design.totalPrice, 25 + 40 + 6 + 8 + 10);
  assert.equal(design.string, 'Nylon String with Lock (Gold w/ Extender)');
  assert.equal(design.charms[0].name, 'Black Cat');
});

test('an extender is free of charge only by not being chosen', () => {
  const design = priceCustomDesign({ collectionId: 'ce8', beads: beads(20), stringId: 's1', extender: true, wristCm: 16.5 });
  assert.equal(design.totalPrice, 73);
});

for (const [name, input] of Object.entries({
  'an unknown collection': { collectionId: 'zz', beads: beads(20), stringId: 's1', wristCm: 16 },
  'a colour outside the collection': { collectionId: 'ip8', beads: beads(20, 'Red'), stringId: 's1', wristCm: 16 },
  'an unknown string': { collectionId: 'ce8', beads: beads(20), stringId: 's9', wristCm: 16 },
  'an unknown charm': { collectionId: 'ce8', beads: beads(20), stringId: 's1', charmIds: ['c99'], wristCm: 16 }
})) {
  test(`${name} is refused`, () => {
    assert.throws(() => priceCustomDesign(input), (err) => err.status === 400);
  });
}

test('the cart uses the stored price, not the one it carries', async () => {
  const item = await product();
  const result = await priceCart([{ _id: String(item._id), name: 'Necklace', price: 1, qty: 2, sz: 'M' }], 'Luzon', settings);
  assert.equal(result.subtotal, 370);
  assert.equal(result.shippingFee, 100);
  assert.equal(result.total, 470);
  assert.deepEqual(result.lines[0], { name: 'Necklace', quantity: 2, unitPrice: 185, amount: 18500, color: 'M', productId: String(item._id) });
});

test('each region pays its own rate', async () => {
  const item = await product();
  const cart = [{ _id: String(item._id), qty: 1 }];
  for (const [region, fee] of Object.entries(settings.shippingRates)) {
    const result = await priceCart(cart, region, settings);
    assert.equal(result.shippingFee, fee);
  }
});

test('shipping is free at exactly the threshold', async () => {
  const item = await product({ price: 500 });
  const result = await priceCart([{ _id: String(item._id), qty: 1 }], 'Mindanao', settings);
  assert.equal(result.shippingFee, 0);
  assert.equal(result.total, 500);
});

test('shipping is charged one peso under the threshold', async () => {
  const item = await product({ price: 499 });
  const result = await priceCart([{ _id: String(item._id), qty: 1 }], 'Mindanao', settings);
  assert.equal(result.shippingFee, 130);
});

test('an unknown region is refused', async () => {
  const item = await product();
  await assert.rejects(priceCart([{ _id: String(item._id), qty: 1 }], 'Mars', settings), (err) => err.status === 400);
});

test('an empty cart is refused', async () => {
  await assert.rejects(priceCart([], 'Luzon', settings), (err) => err.status === 400);
});

test('a sold out piece stops the checkout with its name', async () => {
  const item = await product({ isAvailable: false });
  await assert.rejects(priceCart([{ _id: String(item._id), qty: 1 }], 'Luzon', settings), (err) => err.status === 400 && err.message.includes('Necklace'));
});

test('a deleted piece stops the checkout with its name', async () => {
  const item = await product();
  await Product.deleteOne({ _id: item._id });
  await assert.rejects(priceCart([{ _id: String(item._id), name: 'Necklace', qty: 1 }], 'Luzon', settings), (err) => err.status === 400 && err.message.includes('Necklace'));
});

test('a custom line is priced from its saved design', async () => {
  const design = await CustomOrder.create({ email: 'a@b.test', name: 'Mine', totalPrice: 73 });
  const result = await priceCart([{ id: 123, name: 'Mine', price: 1, qty: 1, customOrderId: String(design._id) }], 'Luzon', settings);
  assert.equal(result.subtotal, 73);
  assert.equal(result.lines[0].customOrderId, String(design._id));
});

test('an old custom line with no saved design asks the customer to rebuild it', async () => {
  await assert.rejects(priceCart([{ id: 1730000000000, name: 'Custom Bracelet', price: 73, qty: 1 }], 'Luzon', settings), (err) => err.status === 400 && /rebuild/i.test(err.message));
});

test('the server and the storefront carry the same prices', async () => {
  const storefront = await import('../../beaded-frontend/src/data/beads.js');
  const server = require('../data/beads');
  const prices = (list) => list.map(({ id, price, colors, size }) => ({ id, price, colors, size }));
  assert.deepEqual(prices(storefront.COLLECTIONS), prices(server.COLLECTIONS));
  assert.deepEqual(prices(storefront.STRINGS), prices(server.STRINGS));
  assert.deepEqual(prices(storefront.CHARMS), prices(server.CHARMS));
});
