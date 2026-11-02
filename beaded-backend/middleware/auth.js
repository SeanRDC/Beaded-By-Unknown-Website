const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { HttpError } = require('./errors');

const signToken = (user) => jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '7d' });

/* Sets req.account, or answers 401 for a missing or bad token and for a deleted account. */
async function requireUser(req, res, next) {
  const token = (req.get('authorization') || '').replace(/^Bearer /, '');
  if (!token) throw new HttpError(401, 'Please sign in.');

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch {
    throw new HttpError(401, 'Please sign in again.');
  }

  req.account = await User.findById(payload.userId);
  if (!req.account) throw new HttpError(401, 'Please sign in again.');
  next();
}

module.exports = { requireUser, signToken };
