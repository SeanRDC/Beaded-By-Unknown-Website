const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema({
  email: String,
  name: String,
  beadType: String,
  beads: [mongoose.Schema.Types.Mixed],
  string: String,
  beadSize: String,
  wristSize: String,
  charms: [mongoose.Schema.Types.Mixed],
  totalPrice: Number,
  status: { type: String, default: 'Pending Studio Review' }
}, { timestamps: true });

customOrderSchema.index({ email: 1 });
customOrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CustomOrder', customOrderSchema);