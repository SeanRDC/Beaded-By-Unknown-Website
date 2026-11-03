const { afterEach, beforeEach, test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
require('./helpers');
const firebase = require('../services/firebase');

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

const realFetch = globalThis.fetch;

beforeEach(() => {
  firebase.resetCerts();
  globalThis.fetch = async () => ({
    ok: true,
    headers: new Headers({ 'cache-control': 'public, max-age=3600' }),
    json: async () => ({ key1: publicKey })
  });
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

const claims = { sub: 'user1', email: 'ana@example.test', email_verified: true, name: 'Ana Maria Cruz' };
const sign = (overrides = {}, options = {}) => jwt.sign({ ...claims, ...overrides }, privateKey, {
  algorithm: 'RS256',
  keyid: 'key1',
  audience: 'beaded-shop',
  issuer: 'https://securetoken.google.com/beaded-shop',
  expiresIn: '1h',
  ...options
});

test('a genuine token returns who it was issued to', async () => {
  const who = await firebase.verifyIdToken(sign());
  assert.deepEqual(who, { email: 'ana@example.test', firstName: 'Ana', lastName: 'Maria Cruz' });
});

test('a token without a name falls back to the email', async () => {
  const who = await firebase.verifyIdToken(sign({ name: undefined }));
  assert.equal(who.firstName, 'ana');
});

test('rubbish is refused', async () => {
  await assert.rejects(firebase.verifyIdToken('not.a.token'), (err) => err.status === 401);
});

test('a token for another project is refused', async () => {
  await assert.rejects(firebase.verifyIdToken(sign({}, { audience: 'other-project' })), (err) => err.status === 401);
});

test('a token from another issuer is refused', async () => {
  await assert.rejects(firebase.verifyIdToken(sign({}, { issuer: 'https://evil.test' })), (err) => err.status === 401);
});

test('an expired token is refused', async () => {
  await assert.rejects(firebase.verifyIdToken(sign({}, { expiresIn: -10 })), (err) => err.status === 401);
});

test('an unverified email is refused', async () => {
  await assert.rejects(firebase.verifyIdToken(sign({ email_verified: false })), (err) => err.status === 401);
});

test('an unknown signing key is refused', async () => {
  await assert.rejects(firebase.verifyIdToken(sign({}, { keyid: 'other' })), (err) => err.status === 401);
});

test('a token signed by a different key is refused', async () => {
  const stranger = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    publicKeyEncoding: { type: 'spki', format: 'pem' }
  }).privateKey;
  const forged = jwt.sign(claims, stranger, { algorithm: 'RS256', keyid: 'key1', audience: 'beaded-shop', issuer: 'https://securetoken.google.com/beaded-shop', expiresIn: '1h' });
  await assert.rejects(firebase.verifyIdToken(forged), (err) => err.status === 401);
});

test('signing certificates are reused until they expire', async () => {
  let calls = 0;
  const inner = globalThis.fetch;
  globalThis.fetch = async (...args) => {
    calls += 1;
    return inner(...args);
  };
  await firebase.verifyIdToken(sign());
  await firebase.verifyIdToken(sign());
  assert.equal(calls, 1);
});
