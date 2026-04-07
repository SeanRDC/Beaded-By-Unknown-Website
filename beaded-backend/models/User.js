const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String }, // Made optional 
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Made optional for Google users
  points: { type: Number, default: 0 }, 
  wishlist: { type: Array, default: [] },
  cart: { type: Array, default: [] },
  orders: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);