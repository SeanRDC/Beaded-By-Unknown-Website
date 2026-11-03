const bcrypt = require('bcryptjs');
const express = require('express');
const { z } = require('zod');

const { signToken } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');
const { code, email, newPassword, optionalText, text, validate } = require('../middleware/validate');
const User = require('../models/User');
const mail = require('../services/email');
const firebase = require('../services/firebase');
const { canSendOtp, checkOtp, hasActiveOtp, issueOtp } = require('../services/otp');
const { publicUser } = require('./user');

const GOOGLE_ONLY = 'google-auth-no-password';
const SALT_ROUNDS = 10;

const registerBody = z.object({
  firstName: text(80, 'Enter your first name.'),
  lastName: optionalText(80),
  email,
  password: newPassword
});
const loginBody = z.object({ email, password: z.string({ error: 'Enter your password.' }).min(1, 'Enter your password.').max(200) });
const emailBody = z.object({ email });
const codeBody = z.object({ email, otp: code });
const resetBody = z.object({ email, otp: code, newPassword });
const googleBody = z.object({ idToken: z.string({ error: 'Google sign-in failed. Please try again.' }).min(1).max(4096) });

const session = (user) => ({ token: signToken(user), user: publicUser(user), cart: user.cart, wishlist: user.wishlist });

function authRoutes(limits) {
  const router = express.Router();

  router.post('/register', limits.auth, validate(registerBody), async (req, res) => {
    if (await User.findByEmail(req.body.email)) throw new HttpError(400, 'Email already in use.');

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, SALT_ROUNDS)
    });
    const otp = await issueOtp(user, 'login');
    await mail.send({ to: user.email, ...mail.welcomeCode(otp) });
    res.json({ requireOtp: true, email: user.email });
  });

  router.post('/login', limits.auth, validate(loginBody), async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (!user) throw new HttpError(400, 'Invalid email or password.');
    if (user.password === GOOGLE_ONLY) throw new HttpError(400, 'Please sign in with Google.');
    if (!(await bcrypt.compare(req.body.password, user.password))) throw new HttpError(400, 'Invalid email or password.');

    const otp = await issueOtp(user, 'login');
    await mail.send({ to: user.email, ...mail.loginCode(otp) });
    res.json({ requireOtp: true, email: user.email });
  });

  /* Only a live sign-in gets a fresh code. The answer never reveals whether an account exists. */
  router.post('/resend-otp', limits.email, validate(emailBody), async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (user && hasActiveOtp(user, 'login') && canSendOtp(user)) {
      const otp = await issueOtp(user, 'login');
      await mail.send({ to: user.email, ...mail.loginCode(otp) });
    }
    res.json({ success: true });
  });

  router.post('/verify-login-otp', limits.auth, validate(codeBody), async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (!user || !(await checkOtp(user, 'login', req.body.otp))) throw new HttpError(400, 'Invalid or expired code.');
    res.json(session(user));
  });

  router.post('/google-login', limits.auth, validate(googleBody), async (req, res) => {
    const identity = await firebase.verifyIdToken(req.body.idToken);
    const user = (await User.findByEmail(identity.email)) || (await User.create({ ...identity, password: GOOGLE_ONLY }));
    res.json(session(user));
  });

  /* Same answer for known and unknown emails. A reset never interrupts a sign-in in progress. */
  router.post('/forgot-password', limits.email, validate(emailBody), async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (user && canSendOtp(user) && !hasActiveOtp(user, 'login')) {
      const otp = await issueOtp(user, 'reset');
      await mail.send({ to: user.email, ...mail.resetCode(otp) });
    }
    res.json({ message: 'If that account exists, a code is on its way.' });
  });

  router.post('/verify-otp', limits.auth, validate(codeBody), async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (!user || !(await checkOtp(user, 'reset', req.body.otp, { consume: false }))) throw new HttpError(400, 'Invalid or expired code.');
    res.json({ message: 'Code verified.' });
  });

  router.post('/reset-password', limits.auth, validate(resetBody), async (req, res) => {
    const user = await User.findByEmail(req.body.email);
    if (!user || !(await checkOtp(user, 'reset', req.body.otp))) throw new HttpError(400, 'Invalid or expired code.');
    user.password = await bcrypt.hash(req.body.newPassword, SALT_ROUNDS);
    user.tokenVersion += 1;
    await user.save();
    res.json({ message: 'Password changed.' });
  });

  return router;
}

module.exports = authRoutes;
