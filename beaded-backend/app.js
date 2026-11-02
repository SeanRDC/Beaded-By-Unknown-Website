const compression = require('compression');
const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const mongoose = require('mongoose');

const { allowedOrigins } = require('./config/env');
const { errorHandler, notFound } = require('./middleware/errors');
const { buildLimits } = require('./middleware/limits');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const customOrderRoutes = require('./routes/customOrders');
const orderRoutes = require('./routes/orders');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/user');
const webhookRoutes = require('./routes/webhooks');

/* Query values that arrive as objects are treated as plain data, never as operators. */
mongoose.set('sanitizeFilter', true);

function createApp({ rateLimits = true } = {}) {
  const app = express();
  app.set('trust proxy', 1);
  const limits = buildLimits({ enabled: rateLimits });

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: (origin, done) => done(null, !origin || allowedOrigins().includes(origin)) }));
  app.use(compression());

  /* Before the JSON parser, because the signature covers the raw bytes. */
  app.use('/api/webhooks', webhookRoutes());

  app.use(express.json({ limit: '100kb' }));
  app.use('/api', limits.general);

  app.get('/api/health', (req, res) => {
    const up = mongoose.connection.readyState === 1;
    res.status(up ? 200 : 503).json({ status: up ? 'ok' : 'degraded', db: up ? 'up' : 'down', uptime: Math.round(process.uptime()) });
  });

  app.use('/api', authRoutes(limits));
  app.use('/api', userRoutes());
  app.use('/api', productRoutes(limits));
  app.use('/api', orderRoutes(limits));
  app.use('/api', customOrderRoutes(limits));
  app.use('/api', contentRoutes(limits));
  app.use('/api', adminRoutes(limits));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
