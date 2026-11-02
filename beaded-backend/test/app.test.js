const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const { api, startDb, stopDb } = require('./helpers');
const { assertEnv, allowedOrigins, checkoutMode } = require('../config/env');
const { errorHandler, HttpError } = require('../middleware/errors');

before(startDb);
after(stopDb);

const complete = { JWT_SECRET: 'a', ADMIN_SECRET: 'b', MONGODB_URI: 'c', CLIENT_URL: 'd' };

for (const key of Object.keys(complete)) {
  test(`startup refuses to run without ${key}`, () => {
    const env = { ...complete };
    delete env[key];
    assert.throws(() => assertEnv(env), new RegExp(key));
  });
}

test('startup accepts a complete environment', () => {
  assert.doesNotThrow(() => assertEnv(complete));
});

test('checkout stays in showcase mode unless live is set explicitly', () => {
  assert.equal(checkoutMode({}), 'showcase');
  assert.equal(checkoutMode({ CHECKOUT_MODE: 'anything' }), 'showcase');
  assert.equal(checkoutMode({ CHECKOUT_MODE: 'live' }), 'live');
});

test('allowed origins cover both the www and bare forms of the shop', () => {
  const origins = allowedOrigins({ CLIENT_URL: 'https://www.shop.test', NODE_ENV: 'production' });
  assert.deepEqual(origins.sort(), ['https://shop.test', 'https://www.shop.test']);
});

test('local development origins are allowed outside production only', () => {
  assert.ok(allowedOrigins({ CLIENT_URL: 'https://shop.test' }).includes('http://localhost:5173'));
  assert.ok(!allowedOrigins({ CLIENT_URL: 'https://shop.test', NODE_ENV: 'production' }).includes('http://localhost:5173'));
});

test('an unknown route returns JSON 404', async () => {
  const res = await api().get('/api/nope');
  assert.equal(res.status, 404);
  assert.equal(res.body.error, 'Not found');
});

test('malformed JSON returns 400, not 500', async () => {
  const res = await api().post('/api/login').set('Content-Type', 'application/json').send('{bad');
  assert.equal(res.status, 400);
});

test('an unexpected error hides its internal message', () => {
  let status, body;
  const res = { headersSent: false, status(s) { status = s; return this; }, json(b) { body = b; return this; } };
  const quiet = console.error;
  console.error = () => {};
  errorHandler(new Error('connection string with secrets'), { method: 'GET', path: '/x' }, res, () => {});
  console.error = quiet;
  assert.equal(status, 500);
  assert.ok(!JSON.stringify(body).includes('secrets'));
});

test('an HttpError keeps its status and message', () => {
  let status, body;
  const res = { headersSent: false, status(s) { status = s; return this; }, json(b) { body = b; return this; } };
  errorHandler(new HttpError(409, 'Taken'), { method: 'GET', path: '/x' }, res, () => {});
  assert.equal(status, 409);
  assert.deepEqual(body, { error: 'Taken' });
});

test('the allowed origin gets CORS headers and a stranger does not', async () => {
  const good = await api().get('/api/health').set('Origin', 'https://www.example.test');
  assert.equal(good.headers['access-control-allow-origin'], 'https://www.example.test');
  const bad = await api().get('/api/health').set('Origin', 'https://evil.test');
  assert.equal(bad.headers['access-control-allow-origin'], undefined);
});

test('security headers are present and Express is not advertised', async () => {
  const res = await api().get('/api/health');
  assert.equal(res.headers['x-content-type-options'], 'nosniff');
  assert.equal(res.headers['x-powered-by'], undefined);
});

test('health reports the database state', async () => {
  const res = await api().get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.db, 'up');
});
