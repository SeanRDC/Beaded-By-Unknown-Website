const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  topBannerText: { type: String, default: 'A gift for your friends, family, and yourself' },
  featureOne: { type: String, default: 'Free shipping over ₱500' },
  featureTwo: { type: String, default: 'Handmade' },
  featureThree: { type: String, default: 'Pre-order 7 to 14 days' },
  categories: { type: [String], default: ['Bracelet', 'Necklace', 'Phone Strap', 'Keychain'] },
  theme: { type: String, enum: ['brown', 'pink'], default: 'brown' },
  shippingRates: {
    type: Map,
    of: Number,
    default: () => ({ 'Metro Manila': 85, Luzon: 100, Visayas: 120, Mindanao: 130 })
  },
  freeShippingOver: { type: Number, default: 500 }
});

module.exports = mongoose.model('Settings', settingsSchema);
