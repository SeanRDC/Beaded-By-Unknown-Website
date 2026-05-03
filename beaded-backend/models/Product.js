const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  img: { type: String, required: true },
  img2: { type: String }, // Optional hover image
  colors: [{ type: String }], // Array of hex codes like '#C9A96E'
  cat: { type: String, required: true }, // Category (e.g., 'Gemstone')
  rating: { type: Number, default: 5 },
  reviews: { type: Number, default: 0 },
  mat: { type: String }, // Material description
  sizes: [{ type: String, default: ['S', 'M', 'L'] }],
  tag: { type: String }, // Optional (e.g., 'Bestseller')
  isAvailable: { type: Boolean, default: true } 
  
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);