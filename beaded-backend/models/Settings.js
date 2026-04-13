const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  topBannerText: { type: String, default: 'WELCOME' }
});

module.exports = mongoose.model('Settings', settingsSchema);