const { after, before, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { api, codeFor, flush, resetDb, sent, startDb, stopDb } = require('./helpers');
const User = require('../models/User');

before(startDb);
after(stopDb);
beforeEach(resetDb);

const EMAIL = 'ana@example.test';
const PASSWORD = 'correct horse battery';

async function account(overrides = {}) {
  return User.create({ firstName: 'Ana', email: EMAIL, password: await bcrypt.hash(PASSWORD, 4), ...overrides });
}

async function startLogin(client = api()) {
  const res = await client.post('/api/login').send({ email: EMAIL, password: PASSWORD });
  assert.equal(res.status, 200);
  return codeFor(EMAIL);
}

/* Moves past the short gap between codes, which would otherwise hold back a second request. */
const pastTheGap = () => User.updateOne({ email: EMAIL }, { otpNextAt: new Date(0) });

const otherThan = (code) => (code === '111111' ? '222222' : '111111');
const guess = (otp) => api().post('/api/verify-login-otp').send({ email: EMAIL, otp });

const stubGoogle = (identity) => {
  require('../services/firebase').verifyIdToken = async () => identity;
};

test('a code that is not a string is refused', async () => {
  await account();
  await startLogin();
  const res = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: { $ne: null } });
  assert.equal(res.status, 400);
  assert.equal(res.body.token, undefined);
});

test('an email that is not a string is refused when checking a code', async () => {
  await account();
  await startLogin();
  const res = await api().post('/api/verify-otp').send({ email: { $ne: null }, otp: { $ne: null } });
  assert.equal(res.status, 400);
  assert.notEqual(res.body.message, 'OTP verified');
});

test('the correct code signs the customer in', async () => {
  await account();
  const code = await startLogin();
  const res = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: code });
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.equal(res.body.user.firstName, 'Ana');
});

test('a login code works only once', async () => {
  await account();
  const code = await startLogin();
  await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: code });
  const again = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: code });
  assert.equal(again.status, 400);
});

test('a password reset code cannot be used to sign in', async () => {
  await account();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const code = await codeFor(EMAIL);
  const res = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: code });
  assert.equal(res.status, 400);
  assert.equal(res.body.token, undefined);
});

test('after five wrong guesses even the right code fails', async () => {
  await account();
  const code = await startLogin();
  const wrong = code === '111111' ? '222222' : '111111';
  for (let i = 0; i < 5; i++) {
    await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: wrong });
  }
  const res = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: code });
  assert.equal(res.status, 400);
});

test('a code is not stored in readable form', async () => {
  await account();
  const code = await startLogin();
  const stored = await User.findOne({ email: EMAIL }).lean();
  assert.ok(!JSON.stringify(stored).includes(code));
});

test('a password cannot be reset without a code', async () => {
  await account();
  const res = await api().post('/api/reset-password').send({ email: EMAIL, newPassword: 'a brand new password' });
  assert.equal(res.status, 400);
  const user = await User.findOne({ email: EMAIL });
  assert.ok(await bcrypt.compare(PASSWORD, user.password));
});

test('a password cannot be reset with a wrong code', async () => {
  await account();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const code = await codeFor(EMAIL);
  const wrong = code === '111111' ? '222222' : '111111';
  const res = await api().post('/api/reset-password').send({ email: EMAIL, otp: wrong, newPassword: 'a brand new password' });
  assert.equal(res.status, 400);
  const user = await User.findOne({ email: EMAIL });
  assert.ok(await bcrypt.compare(PASSWORD, user.password));
});

test('a reset code changes the password once', async () => {
  await account();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const code = await codeFor(EMAIL);

  const check = await api().post('/api/verify-otp').send({ email: EMAIL, otp: code });
  assert.equal(check.status, 200);

  const first = await api().post('/api/reset-password').send({ email: EMAIL, otp: code, newPassword: 'a brand new password' });
  assert.equal(first.status, 200);
  const user = await User.findOne({ email: EMAIL });
  assert.ok(await bcrypt.compare('a brand new password', user.password));

  const second = await api().post('/api/reset-password').send({ email: EMAIL, otp: code, newPassword: 'another password here' });
  assert.equal(second.status, 400);
});

test('forgot-password answers the same for known and unknown emails', async () => {
  await account();
  const known = await api().post('/api/forgot-password').send({ email: EMAIL });
  const unknown = await api().post('/api/forgot-password').send({ email: 'nobody@example.test' });
  assert.equal(known.status, unknown.status);
  assert.deepEqual(known.body, unknown.body);
});

test('resend answers the same for known and unknown emails', async () => {
  await account();
  await startLogin();
  const known = await api().post('/api/resend-otp').send({ email: EMAIL });
  const unknown = await api().post('/api/resend-otp').send({ email: 'nobody@example.test' });
  assert.equal(known.status, unknown.status);
  assert.deepEqual(known.body, unknown.body);
});

test('resend emails nothing unless a login is in progress', async () => {
  await account();
  await api().post('/api/resend-otp').send({ email: EMAIL });
  await flush();
  assert.equal(sent.length, 0);
});

test('resend replaces the code for a login in progress', async () => {
  await account();
  const first = await startLogin();
  await pastTheGap();
  await api().post('/api/resend-otp').send({ email: EMAIL });
  await flush();
  assert.equal(sent.length, 2);
  const second = await codeFor(EMAIL);
  if (first !== second) {
    const old = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: first });
    assert.equal(old.status, 400);
  }
  const res = await api().post('/api/verify-login-otp').send({ email: EMAIL, otp: second });
  assert.equal(res.status, 200);
});

test('Google sign-in refuses a request with no token', async () => {
  await account();
  const res = await api().post('/api/google-login').send({ email: EMAIL, firstName: 'Ana' });
  assert.equal(res.status, 400);
  assert.equal(res.body.token, undefined);
});

test('Google sign-in refuses a token that fails verification', async () => {
  await account();
  const { HttpError } = require('../middleware/errors');
  require('../services/firebase').verifyIdToken = async () => {
    throw new HttpError(401, 'Google sign-in failed.');
  };
  const res = await api().post('/api/google-login').send({ idToken: 'forged' });
  assert.equal(res.status, 401);
  assert.equal(res.body.token, undefined);
});

test('Google sign-in takes identity from the verified token, not the body', async () => {
  await account();
  stubGoogle({ email: 'real@example.test', firstName: 'Real', lastName: 'Person' });
  const res = await api().post('/api/google-login').send({ idToken: 'valid', email: EMAIL, firstName: 'Ana' });
  assert.equal(res.status, 200);
  assert.equal(res.body.user.email, 'real@example.test');
  assert.ok(await User.findOne({ email: 'real@example.test' }));
});

test('a deleted customer can no longer use their token', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  await User.deleteOne({ _id: user._id });
  const res = await api().get('/api/user/me').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 401);
});

test('a bad token returns 401', async () => {
  const res = await api().get('/api/user/me').set('Authorization', 'Bearer rubbish');
  assert.equal(res.status, 401);
});

test('deleting an account needs a code issued for deletion', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const code = await startLogin();
  const res = await api().delete('/api/user/delete').set('Authorization', `Bearer ${token}`).send({ otp: code });
  assert.equal(res.status, 400);
  assert.ok(await User.findById(user._id));
});

test('bag sync stores only known fields', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const res = await api().post('/api/user/sync').set('Authorization', `Bearer ${token}`).send({
    cart: [{ id: 'abc', name: 'Necklace', price: 10, qty: 1, sz: 'M', isAdmin: true }],
    wishlist: ['abc']
  });
  assert.equal(res.status, 200);
  const saved = await User.findById(user._id).lean();
  assert.equal(saved.cart[0].isAdmin, undefined);
  assert.equal(saved.cart[0].name, 'Necklace');
});

test('bag sync refuses a bag that is not a list', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const res = await api().post('/api/user/sync').set('Authorization', `Bearer ${token}`).send({ cart: 'x', wishlist: [] });
  assert.equal(res.status, 400);
});

test('repeated login attempts are rate limited', async () => {
  await account();
  const client = api({ rateLimits: true });
  let last;
  for (let i = 0; i < 12; i++) {
    last = await client.post('/api/login').send({ email: EMAIL, password: 'wrong password' });
  }
  assert.equal(last.status, 429);
});

test('new accounts need a password of at least 8 characters', async () => {
  const res = await api().post('/api/register').send({ firstName: 'Ana', lastName: 'Cruz', email: EMAIL, password: 'short' });
  assert.equal(res.status, 400);
  assert.equal(await User.countDocuments(), 0);
});

test('an expired sign-in cannot be revived without the password', async () => {
  await account();
  await startLogin();
  await User.updateOne({ email: EMAIL }, { otpExpire: new Date(Date.now() - 1000), otpNextAt: new Date(0) });
  sent.length = 0;
  await api().post('/api/resend-otp').send({ email: EMAIL });
  await flush();
  assert.equal(sent.length, 0);
});

test('asking for another code does not refill the guesses', async () => {
  await account();
  const first = await startLogin();
  for (let i = 0; i < 4; i++) await guess(otherThan(first));
  await pastTheGap();
  await api().post('/api/resend-otp').send({ email: EMAIL });
  const second = await codeFor(EMAIL);
  await guess(otherThan(second));
  assert.equal((await guess(second)).status, 400);
});

test('asking for another reset code does not refill the guesses', async () => {
  await account();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const first = await codeFor(EMAIL);
  const check = (otp) => api().post('/api/verify-otp').send({ email: EMAIL, otp });
  for (let i = 0; i < 4; i++) await check(otherThan(first));
  await pastTheGap();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const second = await codeFor(EMAIL);
  await check(otherThan(second));
  assert.equal((await check(second)).status, 400);
});

test('after five wrong guesses only the password can start again', async () => {
  await account();
  const code = await startLogin();
  for (let i = 0; i < 5; i++) await guess(otherThan(code));
  sent.length = 0;
  await api().post('/api/resend-otp').send({ email: EMAIL });
  await api().post('/api/forgot-password').send({ email: EMAIL });
  await flush();
  assert.equal(sent.length, 0);

  const fresh = await startLogin();
  assert.equal((await guess(fresh)).status, 200);
});

test('a spent code does not hold back the next request', async () => {
  await account();
  await guess(await startLogin());
  sent.length = 0;
  await api().post('/api/forgot-password').send({ email: EMAIL });
  await flush();
  assert.equal(sent.length, 1);
});

test('an inbox cannot be flooded with reset codes', async () => {
  await account();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  await api().post('/api/forgot-password').send({ email: EMAIL });
  await flush();
  assert.equal(sent.length, 1);
});

test('a reset request cannot interrupt a sign-in in progress', async () => {
  await account();
  const code = await startLogin();
  await pastTheGap();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  assert.equal((await guess(code)).status, 200);
});

test('guesses sent side by side each use up an attempt', async () => {
  await account();
  const code = await startLogin();
  await Promise.all(Array.from({ length: 12 }, () => guess(otherThan(code))));
  assert.equal((await guess(code)).status, 400);
});

test('two requests with the right code sign in only once', async () => {
  await account();
  const code = await startLogin();
  const results = await Promise.all([guess(code), guess(code), guess(code)]);
  assert.equal(results.filter((res) => res.status === 200).length, 1);
});

test('checking a reset code does not use up a guess', async () => {
  await account();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const code = await codeFor(EMAIL);
  const check = (otp) => api().post('/api/verify-otp').send({ email: EMAIL, otp });
  for (let i = 0; i < 4; i++) await check(otherThan(code));
  assert.equal((await check(code)).status, 200);
  const res = await api().post('/api/reset-password').send({ email: EMAIL, otp: code, newPassword: 'a brand new password' });
  assert.equal(res.status, 200);
});

test('changing the password signs out every earlier session', async () => {
  await account();
  const signedIn = await guess(await startLogin());
  const before = await api().get('/api/user/me').set('Authorization', `Bearer ${signedIn.body.token}`);
  assert.equal(before.status, 200);

  await pastTheGap();
  await api().post('/api/forgot-password').send({ email: EMAIL });
  const code = await codeFor(EMAIL);
  await api().post('/api/reset-password').send({ email: EMAIL, otp: code, newPassword: 'a brand new password' });

  const after = await api().get('/api/user/me').set('Authorization', `Bearer ${signedIn.body.token}`);
  assert.equal(after.status, 401);
});

test('a session from before versions existed keeps working', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const res = await api().get('/api/user/me').set('Authorization', `Bearer ${token}`);
  assert.equal(res.status, 200);
});

test('account deletion codes are rate limited', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const client = api({ rateLimits: true });
  let last;
  for (let i = 0; i < 5; i++) {
    last = await client.post('/api/user/request-delete').set('Authorization', `Bearer ${token}`);
  }
  assert.equal(last.status, 429);
});

test('account deletion guesses are rate limited', async () => {
  const user = await account();
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const client = api({ rateLimits: true });
  let last;
  for (let i = 0; i < 12; i++) {
    last = await client.delete('/api/user/delete').set('Authorization', `Bearer ${token}`).send({ otp: '123456' });
  }
  assert.equal(last.status, 429);
});

test('a new account is stored in lowercase', async () => {
  await api().post('/api/register').send({ firstName: 'Ana', lastName: 'Cruz', email: 'Ana@Example.TEST', password: PASSWORD });
  await flush();
  assert.equal((await User.findOne()).email, 'ana@example.test');
});

test('signing in ignores the case of the email', async () => {
  await account();
  const res = await api().post('/api/login').send({ email: 'ANA@example.test', password: PASSWORD });
  assert.equal(res.status, 200);
});

test('an older account with capitals in its email can still sign in', async () => {
  await account({ email: 'Ana@Example.test' });
  const res = await api().post('/api/login').send({ email: 'ana@example.test', password: PASSWORD });
  assert.equal(res.status, 200);
  assert.equal(res.body.email, 'Ana@Example.test');
});

test('registering cannot create a second account in different capitals', async () => {
  await account({ email: 'Ana@Example.test' });
  const res = await api().post('/api/register').send({ firstName: 'Ana', lastName: 'Cruz', email: 'ana@example.test', password: PASSWORD });
  assert.equal(res.status, 400);
  assert.equal(await User.countDocuments(), 1);
});

test('Google sign-in finds an older account with capitals in its email', async () => {
  await account({ email: 'Ana@Example.test' });
  stubGoogle({ email: 'ana@example.test', firstName: 'Ana', lastName: 'Cruz' });
  const res = await api().post('/api/google-login').send({ idToken: 'valid' });
  assert.equal(res.status, 200);
  assert.equal(await User.countDocuments(), 1);
});
