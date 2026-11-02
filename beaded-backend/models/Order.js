const mongoose = require('mongoose');

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

const Order = mongoose.model('Order', orderSchema);

/* Saved before payment. Never counted as a sale. */
Order.PENDING = 'Pending Payment';

module.exports = Order;
