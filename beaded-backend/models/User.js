const mongoose = require('mongoose');

const anyCase = require('./anyCase');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  points: { type: Number, default: 0 },
  wishlist: { type: Array, default: [] },
  cart: { type: Array, default: [] },
  orders: { type: Array, default: [] },
  shippingAddress: { type: Object, default: {} },
  otpHash: { type: String, default: null },
  otpPurpose: { type: String, enum: ['login', 'reset', 'delete', null], default: null },
  otpExpire: { type: Date, default: null },
  otpAttempts: { type: Number, default: 0 },
  otpNextAt: { type: Date, default: null },
  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.index({ email: 1 }, { name: 'email_any_case', collation: anyCase });

userSchema.statics.findByEmail = function findByEmail(email) {
  return this.findOne({ email }).collation(anyCase);
};

module.exports = mongoose.model('User', userSchema);
