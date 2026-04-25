const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  checkoutSessionId: { type: String, required: true },
  customerName: { type: String, default: 'Guest' },
  customerEmail: { type: String },
  contactNumber: { type: String }, // Added Phone Number
  shippingAddress: { type: Object }, // Added Full Address Object
  amountPaid: { type: Number, required: true },
  items: { type: Array, default: [] },
  status: { type: String, default: 'Paid' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);