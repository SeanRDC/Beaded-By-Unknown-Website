const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

const { checkoutMode } = require('../config/env');
const { requireAdmin } = require('../middleware/admin');
const { optionalText, text, validate, validId } = require('../middleware/validate');
const Blog = require('../models/Blog');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Review = require('../models/Review');
const { cached, clear, publicCache } = require('../services/cache');
const { getSettings, saveSettings } = require('../services/settings');

const MINUTE = 60 * 1000;

const settingsBody = z.object({
  topBannerText: optionalText(200),
  featureOne: optionalText(120),
  featureTwo: optionalText(120),
  featureThree: optionalText(120),
  theme: z.enum(['brown', 'pink'], { error: 'Choose a valid theme.' }).optional(),
  categories: z.array(text(60, 'Enter a category name.')).max(30).optional(),
  shippingRates: z.record(z.string().max(40), z.number({ error: 'Enter a valid rate.' }).min(0, 'Enter a valid rate.').max(10000)).optional(),
  freeShippingOver: z.number({ error: 'Enter a valid amount.' }).min(0).max(1000000).optional()
});

const reviewBody = z.object({
  author: text(120, 'Enter a name.'),
  text: text(1000, 'Enter the review.'),
  rating: z.coerce.number().min(1).max(5).optional()
});

const blogBody = z.object({
  title: text(200, 'Enter a title.'),
  ex: text(500, 'Enter an excerpt.'),
  content: text(40000, 'Enter the story.'),
  cat: optionalText(60),
  time: optionalText(30),
  img: text(600, 'Add a picture.'),
  date: optionalText(40)
});

async function bestsellers() {
  const top = await Order.aggregate([
    { $match: { status: { $ne: Order.PENDING } } },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', totalSold: { $sum: '$items.quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: 4 }
  ]);
  return Product.find({ name: mongoose.trusted({ $in: top.map((item) => item._id) }) }).select('-__v').lean();
}

function contentRoutes(limits) {
  const router = express.Router();
  const admin = [limits.admin, requireAdmin];

  router.get('/settings', publicCache, async (req, res) => {
    res.json({ ...(await getSettings()), showcase: checkoutMode() === 'showcase' });
  });

  router.put('/admin/settings', admin, validate(settingsBody), async (req, res) => {
    res.json(await saveSettings(req.body));
  });

  router.get('/bestsellers', publicCache, async (req, res) => {
    res.json(await cached('bestsellers', 5 * MINUTE, bestsellers));
  });

  router.get('/reviews', publicCache, async (req, res) => {
    res.json(await cached('reviews', MINUTE, () => Review.find().sort({ createdAt: -1 }).select('-__v').lean()));
  });

  router.post('/admin/reviews', admin, validate(reviewBody), async (req, res) => {
    const review = await Review.create(req.body);
    clear('reviews');
    res.json(review);
  });

  router.delete('/admin/reviews/:id', admin, validId, async (req, res) => {
    await Review.findByIdAndDelete(req.params.id);
    clear('reviews');
    res.json({ success: true });
  });

  router.get('/blogs', publicCache, async (req, res) => {
    res.json(await cached('blogs', MINUTE, () => Blog.find().sort({ createdAt: -1 }).select('-__v').lean()));
  });

  router.post('/admin/blogs', admin, validate(blogBody), async (req, res) => {
    const post = await Blog.create(req.body);
    clear('blogs');
    res.json(post);
  });

  router.put('/admin/blogs/:id', admin, validId, validate(blogBody.partial()), async (req, res) => {
    const post = await Blog.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    clear('blogs');
    res.json(post);
  });

  router.delete('/admin/blogs/:id', admin, validId, async (req, res) => {
    await Blog.findByIdAndDelete(req.params.id);
    clear('blogs');
    res.json({ success: true });
  });

  return router;
}

module.exports = contentRoutes;
