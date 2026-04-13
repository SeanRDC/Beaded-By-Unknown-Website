const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  topBannerText: { type: String, default: 'WELCOME' },
  featureOne: { type: String, default: 'Free shipping over ₱50' },
  featureTwo: { type: String, default: 'Handmade' },
  featureThree: { type: String, default: 'Ethically sourced' }
});

module.exports = mongoose.model('Settings', settingsSchema);