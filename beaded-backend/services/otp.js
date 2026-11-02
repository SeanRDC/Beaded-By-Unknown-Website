const crypto = require('crypto');
const mongoose = require('mongoose');

const User = require('../models/User');

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const GAP_MS = 25 * 1000;
const LOCK_MS = 15 * 60 * 1000;

const CLEARED = { otpHash: null, otpPurpose: null, otpExpire: null, otpAttempts: 0 };

const digest = (code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(code)).digest();

/* True while the account holds a live code for this purpose. */
const hasActiveOtp = (user, purpose) => Boolean(user.otpHash)
  && user.otpPurpose === purpose
  && user.otpExpire?.getTime() > Date.now();

/* Requests that prove nothing wait for this. It keeps an inbox from being flooded, and after
   five wrong guesses it stops the guessing from starting over with a fresh code. */
const canSendOtp = (user) => !(user.otpNextAt?.getTime() > Date.now());

/* Saves a new code on the account, replacing any earlier one, and returns it for emailing.
   Guesses already made on a live code carry over to its replacement. */
async function issueOtp(user, purpose) {
  const code = String(crypto.randomInt(100000, 1000000));
  if (!hasActiveOtp(user, purpose)) user.otpAttempts = 0;
  user.otpHash = digest(code).toString('hex');
  user.otpPurpose = purpose;
  user.otpExpire = new Date(Date.now() + TTL_MS);
  user.otpNextAt = new Date(Date.now() + GAP_MS);
  await user.save();
  return code;
}

/* A code only ever answers for the purpose it was issued for. Every guess is counted in the
   database first, so guesses sent side by side cannot share one attempt. */
async function checkOtp(user, purpose, code, { consume = true } = {}) {
  const current = await User.findOneAndUpdate(
    {
      _id: user._id,
      otpPurpose: purpose,
      otpHash: mongoose.trusted({ $ne: null }),
      otpExpire: mongoose.trusted({ $gt: new Date() }),
      otpAttempts: mongoose.trusted({ $lt: MAX_ATTEMPTS })
    },
    { $inc: { otpAttempts: 1 } },
    { returnDocument: 'after' }
  ).lean();
  if (!current) return false;

  const sameCode = { _id: user._id, otpHash: current.otpHash };

  if (!crypto.timingSafeEqual(digest(code), Buffer.from(current.otpHash, 'hex'))) {
    if (current.otpAttempts >= MAX_ATTEMPTS) {
      await User.updateOne(sameCode, { ...CLEARED, otpNextAt: new Date(Date.now() + LOCK_MS) });
    }
    return false;
  }

  /* A right answer that leaves the code in place is not a guess. */
  if (!consume) {
    await User.updateOne(sameCode, { $inc: { otpAttempts: -1 } });
    return true;
  }

  /* Only one request can spend a code, however many arrive together. Spending it proves the
     mailbox is theirs, so nothing is left to wait for. */
  const { modifiedCount } = await User.updateOne(sameCode, { ...CLEARED, otpNextAt: null });
  return modifiedCount === 1;
}

module.exports = { canSendOtp, checkOtp, hasActiveOtp, issueOtp };
