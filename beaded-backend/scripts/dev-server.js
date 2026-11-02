/* A throwaway copy of the API for local testing. It uses an in-memory database, never reads .env,
   and fakes PayMongo, Cloudinary and email, so nothing here can touch the real shop.

   node scripts/dev-server.js */
process.env.JWT_SECRET = 'dev-jwt-secret';
process.env.ADMIN_SECRET = 'dev-admin-secret';
process.env.CLIENT_URL = process.env.DEV_CLIENT_URL || 'http://localhost:5173';
process.env.MONGODB_URI = 'in-memory';
process.env.PAYMONGO_SECRET_KEY = 'sk_test_dev';
process.env.PAYMONGO_WEBHOOK_SECRET = 'whsk_dev';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

const { createApp } = require('../app');
const Blog = require('../models/Blog');
const Product = require('../models/Product');
const Review = require('../models/Review');
const email = require('../services/email');
const uploads = require('../services/uploads');

const PORT = process.env.PORT || 4599;
const CLOUD = 'https://res.cloudinary.com/donzfsztu/image/upload';

const PRODUCTS = [
  { name: 'Basic Beads Bracelet', price: 65, cat: 'Bracelet', mat: 'Seed beads', desc: 'Bright seed beads in two runs of colour, strung by hand.', img: `${CLOUD}/v1777220619/beaded_by_unknown/imnopafkwtqvijmyjold.jpg`, img2: `${CLOUD}/v1777220619/beaded_by_unknown/jcr52fscyl6f4qvk2cxj.jpg` },
  { name: 'Glossy Beads Bracelet', price: 85, cat: 'Bracelet', mat: 'Glass seed beads', desc: 'Glossy glass seed beads in soft pink and pale blue.', img: `${CLOUD}/v1777220590/beaded_by_unknown/rbpjutb4kgive6nkg3ks.jpg`, img2: `${CLOUD}/v1777220590/beaded_by_unknown/v9dklmzkjfqrnr0nkdh8.jpg`, isAvailable: false },
  { name: 'November Necklace', price: 185, cat: 'Necklace', mat: 'Glass, acrylic and imitation stone beads, flower pendant', desc: 'Grey and black beads with clear bicones, finished with a black flower pendant.', img: `${CLOUD}/v1777642085/beaded_by_unknown/f3nkccg0hsvh8fmk5zh4.jpg`, img2: `${CLOUD}/v1777642085/beaded_by_unknown/xilo8lbwb2vur39caw3y.jpg` }
];

const REVIEWS = [
  { author: 'Charise Mendiola', text: 'I got exactly what I wanted.', rating: 4.5 },
  { author: 'Iyesha Chelsea Mendiola', text: 'The seller is approachable.', rating: 4 }
];

const POST = { title: 'How it all began', ex: 'A glimpse into the origins of a journey.', content: 'Every story has a beginning.\nThis is mine.', img: 'https://images.unsplash.com/photo-1762762938024-6d69c11d8c0a?w=800', date: 'Apr 19, 2026' };

/* Stands in for PayMongo: every session goes straight back to the shop as paid. */
function fakePayments() {
  const real = globalThis.fetch;
  let sessions = 0;
  globalThis.fetch = async (url, init = {}) => {
    if (!String(url).includes('api.paymongo.com')) return real(url, init);
    if (init.method === 'POST') {
      const { success_url: success } = JSON.parse(init.body).data.attributes;
      sessions += 1;
      return { ok: true, json: async () => ({ data: { id: `cs_dev_${sessions}`, attributes: { checkout_url: success } } }) };
    }
    return { ok: true, json: async () => ({ data: { attributes: { payments: [{ attributes: { status: 'paid' } }] } } }) };
  };
}

async function main() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  await Product.create(PRODUCTS);
  await Review.create(REVIEWS);
  await Blog.create(POST);

  fakePayments();
  uploads.store = async () => PRODUCTS[0].img;
  const mail = [];
  email.transport.deliver = async (message) => {
    mail.push(message);
  };

  const app = createApp({ rateLimits: false });
  /* Lets browser tests read the code they would have received by email. */
  const server = require('http').createServer((req, res) => {
    if (req.url === '/__dev/mail') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.end(JSON.stringify(mail));
    }
    return app(req, res);
  });
  server.listen(PORT, () => console.log(`Dev API on http://localhost:${PORT}`));
}

main();
