const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);