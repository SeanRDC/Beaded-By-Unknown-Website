const crypto = require('crypto');

const { HttpError } = require('./errors');

const digest = (value) => crypto.createHash('sha256').update(value).digest();

/* Stays closed when ADMIN_SECRET is unset, and compares without leaking timing. */
function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_SECRET;
  const given = req.get('admin_secret');
  if (!expected || !given || !crypto.timingSafeEqual(digest(given), digest(expected))) {
    throw new HttpError(403, 'Invalid admin key.');
  }
  res.set('Cache-Control', 'no-store');
  next();
}

module.exports = { requireAdmin };
