const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  topBannerText: { type: String, default: 'WELCOME' },
  featureOne: { type: String, default: 'Free shipping over ₱50' },
  featureTwo: { type: String, default: 'Handmade' },
  featureThree: { type: String, default: 'Ethically sourced' },
  categories: { type: [String], default: ['Plastic', 'Gemstone', 'Glass'] }
});

module.exports = mongoose.model('Settings', settingsSchema);