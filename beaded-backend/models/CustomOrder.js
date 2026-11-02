const mongoose = require('mongoose');

const anyCase = require('./anyCase');

const UNPAID_DAYS = 30;

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
  status: { type: String, default: 'Pending Studio Review' },
  paid: { type: Boolean, default: false }
}, { timestamps: true });

customOrderSchema.index({ email: 1 });
customOrderSchema.index({ createdAt: -1 });
customOrderSchema.index({ email: 1 }, { name: 'email_any_case', collation: anyCase });

/* A design is saved when it goes in the bag, so one that is never bought should not linger. */
customOrderSchema.index({ createdAt: 1 }, {
  name: 'unpaid_expiry',
  expireAfterSeconds: UNPAID_DAYS * 24 * 60 * 60,
  partialFilterExpression: { paid: false }
});

module.exports = mongoose.model('CustomOrder', customOrderSchema);