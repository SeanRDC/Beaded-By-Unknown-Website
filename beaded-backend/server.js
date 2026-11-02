require('dotenv').config();
const mongoose = require('mongoose');

const { createApp } = require('./app');
const { assertEnv } = require('./config/env');

assertEnv();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(`MongoDB connection failed: ${err.name}`));

const PORT = process.env.PORT || 4242;
createApp().listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
});
