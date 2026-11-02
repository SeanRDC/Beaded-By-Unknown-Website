const mongoose = require('mongoose');

const { checkoutMode } = require('../config/env');
const CustomOrder = require('../models/CustomOrder');
const Order = require('../models/Order');
const cache = require('./cache');
const mail = require('./email');

/* Only the caller that flips the status sends the receipt, however many arrive together. */
async function markOrderPaid(sessionId) {
  const order = await Order.findOneAndUpdate(
    { checkoutSessionId: sessionId, status: Order.PENDING },
    { status: 'Paid' },
    { returnDocument: 'after' }
  );
  if (!order) return null;

  const designs = order.items.map((item) => item.customOrderId).filter(Boolean);
  if (designs.length) await CustomOrder.updateMany({ _id: mongoose.trusted({ $in: designs }) }, { paid: true });

  cache.clear('bestsellers');
  await mail.send({ to: order.customerEmail, ...mail.receipt(order, { showcase: checkoutMode() === 'showcase' }) });
  return order;
}

module.exports = { markOrderPaid };
