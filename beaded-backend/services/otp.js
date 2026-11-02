const crypto = require('crypto');

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const digest = (code) => crypto.createHmac('sha256', process.env.JWT_SECRET).update(String(code)).digest();

function clear(user) {
  user.otpHash = null;
  user.otpPurpose = null;
  user.otpExpire = null;
  user.otpAttempts = 0;
}

/* Saves a new code on the account, replacing any earlier one, and returns it for emailing. */
async function issueOtp(user, purpose) {
  const code = String(crypto.randomInt(100000, 1000000));
  user.otpHash = digest(code).toString('hex');
  user.otpPurpose = purpose;
  user.otpExpire = new Date(Date.now() + TTL_MS);
  user.otpAttempts = 0;
  await user.save();
  return code;
}

/* A code only ever answers for the purpose it was issued for. Wrong guesses burn it. */
async function checkOtp(user, purpose, code, { consume = true } = {}) {
  const active = user.otpHash && user.otpPurpose === purpose && user.otpExpire && user.otpExpire.getTime() > Date.now();
  if (!active) return false;

  const matches = crypto.timingSafeEqual(digest(code), Buffer.from(user.otpHash, 'hex'));
  if (!matches) {
    user.otpAttempts += 1;
    if (user.otpAttempts >= MAX_ATTEMPTS) clear(user);
    await user.save();
    return false;
  }

  if (consume) {
    clear(user);
    await user.save();
  }
  return true;
}

module.exports = { checkOtp, issueOtp };
