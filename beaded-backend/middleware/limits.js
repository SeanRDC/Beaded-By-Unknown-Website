const { rateLimit } = require('express-rate-limit');

const MINUTE = 60 * 1000;
const pass = (req, res, next) => next();

/* One set per app, so each limiter counts on its own. Tests pass enabled: false. */
function buildLimits({ enabled = true } = {}) {
  const make = (limit, windowMs, extra = {}) => {
    if (!enabled) return pass;
    return rateLimit({
      windowMs,
      limit,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: { error: 'Too many requests. Please wait a moment and try again.' },
      ...extra
    });
  };

  return {
    general: make(300, MINUTE),
    auth: make(10, MINUTE),
    email: make(3, MINUTE),
    checkout: make(10, MINUTE),
    design: make(10, MINUTE),
    admin: make(30, 15 * MINUTE, { skipSuccessfulRequests: true })
  };
}

module.exports = { buildLimits };
