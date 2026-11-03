const Settings = require('../models/Settings');
const { cached, clear } = require('./cache');

const MINUTE = 60 * 1000;

async function settingsDoc() {
  return (await Settings.findOne()) || Settings.create({});
}

/* A plain object, safe to share between requests. */
const getSettings = () => cached('settings', MINUTE, async () => (await settingsDoc()).toObject({ flattenMaps: true }));

async function saveSettings(changes) {
  const doc = await settingsDoc();
  doc.set(changes);
  await doc.save();
  clear('settings');
  return doc.toObject({ flattenMaps: true });
}

module.exports = { getSettings, saveSettings };
