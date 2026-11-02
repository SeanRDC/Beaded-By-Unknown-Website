const mongoose = require('mongoose');

const anyCase = require('./anyCase');

const PENDING = 'Pending Payment';
const UNPAID_DAYS = 7;

const orderSchema = new mongoose.Schema({
  checkoutSessionId: { type: String, required: true, unique: true },
  ref: { type: String, unique: true, sparse: true },
  customerName: { type: String, default: 'Guest' },
  customerEmail: { type: String },
  contactNumber: { type: String },
  shippingAddress: { type: Object },
  amountPaid: { type: Number, required: true },
  chargedAmount: { type: Number },
  items: { type: Array, default: [] },
  status: { type: String, default: 'Paid' }
}, { timestamps: true });

orderSchema.index({ customerEmail: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ customerEmail: 1 }, { name: 'customerEmail_any_case', collation: anyCase });

/* A checkout that was never paid leaves a name and address behind, so it is not kept for long. */
orderSchema.index({ createdAt: 1 }, {
  name: 'unpaid_expiry',
  expireAfterSeconds: UNPAID_DAYS * 24 * 60 * 60,
  partialFilterExpression: { status: PENDING }
});

const Order = mongoose.model('Order', orderSchema);

/* Saved before payment. Never counted as a sale. */
Order.PENDING = PENDING;

module.exports = Order;
