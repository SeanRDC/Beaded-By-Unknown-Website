const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  ex: { type: String, required: true }, // Excerpt/Subtitle
  content: { type: String, required: true }, // The full story
  cat: { type: String, default: 'Journal' }, // Category
  time: { type: String, default: '5 min' }, // Read time
  img: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);