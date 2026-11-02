const mongoose = require('mongoose');

const { CHARMS, COLLECTIONS, COLOURS, STRINGS } = require('../data/beads');
const { HttpError } = require('../middleware/errors');
const CustomOrder = require('../models/CustomOrder');
const Product = require('../models/Product');

const BASE_SETTING = 25;
const EXTENDER = 8;

const refuse = (message) => new HttpError(400, message);
const isObjectId = (value) => mongoose.isObjectIdOrHexString(String(value));

function stringLabel(string, lockColor, extender) {
  if (string.id !== 's2') return string.name;
  return `${string.name} (${lockColor || 'Gold'}${extender ? ' w/ Extender' : ''})`;
}

/* Works out a custom design from the server's own price tables. */
function priceCustomDesign({ collectionId, beads, stringId, lockColor, extender = false, charmIds = [], wristCm }) {
  const collection = COLLECTIONS.find((c) => c.id === collectionId);
  if (!collection) throw refuse('Choose a bead type.');

  const unknown = beads.find((bead) => !collection.colors.includes(bead.name));
  if (unknown) throw refuse(`${unknown.name} is not available in ${collection.name}.`);

  const string = STRINGS.find((s) => s.id === stringId);
  if (!string) throw refuse('Choose a string.');

  const charms = charmIds.map((id) => {
    const charm = CHARMS.find((c) => c.id === id);
    if (!charm) throw refuse('Choose a charm from the list.');
    return charm;
  });

  const hasExtender = extender && string.id === 's2';
  const totalPrice = BASE_SETTING
    + beads.length * collection.price
    + string.price
    + charms.reduce((sum, charm) => sum + charm.price, 0)
    + (hasExtender ? EXTENDER : 0);

  return {
    beadType: collection.name,
    beadSize: `${collection.size}mm`,
    beads: beads.map(({ name }) => ({ name, hex: COLOURS[name] })),
    string: stringLabel(string, lockColor, hasExtender),
    charms: charms.map(({ name, em }) => ({ name, em })),
    wristSize: `${wristCm}cm`,
    totalPrice
  };
}

async function priceCustomLine(line, quantity) {
  const design = isObjectId(line.customOrderId) ? await CustomOrder.findById(line.customOrderId).lean() : null;
  if (!design) throw refuse(`Please rebuild ${line.name || 'your custom piece'} before checking out.`);
  return {
    name: design.name || 'Custom Bracelet',
    quantity,
    unitPrice: design.totalPrice,
    amount: Math.round(design.totalPrice * 100),
    color: design.beadType || 'Custom',
    customOrderId: String(design._id)
  };
}

async function priceProductLine(line, quantity) {
  const id = line._id ?? line.id;
  if (!isObjectId(id)) throw refuse(`Please rebuild ${line.name || 'your custom piece'} before checking out.`);

  const product = await Product.findById(String(id)).lean();
  if (!product || product.isAvailable === false) {
    throw refuse(`${product?.name || line.name || 'A piece in your bag'} is no longer available. Remove it to continue.`);
  }
  return {
    name: product.name,
    quantity,
    unitPrice: product.price,
    amount: Math.round(product.price * 100),
    color: line.sz || 'Standard',
    productId: String(product._id)
  };
}

/* Prices are always read here. Whatever the cart carries is only an identifier. */
async function priceCart(cart, region, settings) {
  if (!cart.length) throw refuse('Your bag is empty.');

  const rate = settings.shippingRates[region];
  if (rate === undefined) throw refuse('Choose a shipping region.');

  const lines = await Promise.all(cart.map((line) => {
    const quantity = line.qty || 1;
    return line.customOrderId ? priceCustomLine(line, quantity) : priceProductLine(line, quantity);
  }));

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shippingFee = subtotal >= settings.freeShippingOver ? 0 : rate;
  return { lines, subtotal, shippingFee, total: subtotal + shippingFee };
}

module.exports = { priceCart, priceCustomDesign };
