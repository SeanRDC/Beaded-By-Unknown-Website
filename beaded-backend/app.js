const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');

const { allowedOrigins } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errors');
const legacy = require('./routes/legacy');

/* Query values that arrive as objects are treated as plain data, never as operators. */
mongoose.set('sanitizeFilter', true);

function createApp() {
  const app = express();
  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: (origin, done) => done(null, !origin || allowedOrigins().includes(origin)) }));
  app.use(compression());
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', (req, res) => {
    const up = mongoose.connection.readyState === 1;
    res.status(up ? 200 : 503).json({ status: up ? 'ok' : 'degraded', db: up ? 'up' : 'down', uptime: Math.round(process.uptime()) });
  });

  legacy(app);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
