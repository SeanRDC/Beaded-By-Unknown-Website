const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  checkoutSessionId: { type: String, required: true },
  customerName: { type: String, default: 'Guest' },
  customerEmail: { type: String },
  amountPaid: { type: Number, required: true },
  items: { type: Array, default: [] },
  status: { type: String, default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);