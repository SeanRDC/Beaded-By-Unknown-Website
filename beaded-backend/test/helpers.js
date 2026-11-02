const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const resendModule = require('resend');

process.env.JWT_SECRET = 'test-jwt-secret';
process.env.ADMIN_SECRET = 'test-admin-secret';
process.env.CLIENT_URL = 'https://www.example.test';
process.env.MONGODB_URI = 'mongodb://unused';
process.env.PAYMONGO_SECRET_KEY = 'sk_test_unused';
process.env.PAYMONGO_WEBHOOK_SECRET = 'whsk_test';
process.env.RESEND_API_KEY = 're_test_unused';
delete process.env.CHECKOUT_MODE;

const ADMIN = { admin_secret: 'test-admin-secret' };

/* Email leaves the system through Resend, so that is the one place tests intercept it. */
const sent = [];
class FakeResend {
  constructor() {
    this.emails = {
      send: async (message) => {
        sent.push(message);
        return { id: 'email_test' };
      }
    };
  }
}
Object.defineProperty(resendModule, 'Resend', { value: FakeResend, configurable: true, writable: true });

let mongod;

async function startDb() {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
}

async function stopDb() {
  await mongoose.disconnect();
  await mongod.stop();
}

async function resetDb() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
  sent.length = 0;
  try {
    require('../services/cache').clear();
  } catch {
    /* not built yet */
  }
}

function api(options = {}) {
  const { createApp } = require('../app');
  return request(createApp({ rateLimits: false, ...options }));
}

/* Lets a just-fired email settle, for routes that do not wait for delivery. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 20));

/* The newest one-time code emailed to an address. */
async function codeFor(address) {
  await flush();
  const mail = [...sent].reverse().find((m) => m.to === address);
  const match = mail && mail.html.match(/>\s*(\d{6})\s*</);
  return match ? match[1] : null;
}

module.exports = { ADMIN, api, codeFor, flush, resetDb, sent, startDb, stopDb };
