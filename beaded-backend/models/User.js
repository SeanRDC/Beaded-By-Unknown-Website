const mongoose = require('mongoose');

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
  shippingAddress: { type: Object, default: {} } 
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);