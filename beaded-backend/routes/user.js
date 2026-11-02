const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

const { requireUser } = require('../middleware/auth');
const { HttpError } = require('../middleware/errors');
const { code, optionalText, text, validate } = require('../middleware/validate');
const anyCase = require('../models/anyCase');
const CustomOrder = require('../models/CustomOrder');
const Order = require('../models/Order');
const mail = require('../services/email');
const { checkOtp, issueOtp } = require('../services/otp');

const id = z.union([z.string().max(64), z.number()]);

/* What a bag line may hold. Anything else is dropped before saving. */
const cartLine = z.object({
  _id: id.optional(),
  id: id.optional(),
  customOrderId: z.string().max(64).optional(),
  name: z.string().max(160).optional(),
  price: z.number().min(0).max(1000000).optional(),
  img: z.string().max(600).optional(),
  img2: z.string().max(600).nullable().optional(),
  mat: z.string().max(300).nullable().optional(),
  cat: z.string().max(80).optional(),
  sz: z.string().max(20).optional(),
  qty: z.number().int().min(1).max(99).optional()
});

const syncBody = z.object({
  cart: z.array(cartLine).max(50),
  wishlist: z.array(id).max(200)
});

const address = z.object({
  street: optionalText(200),
  barangay: optionalText(120),
  city: optionalText(120),
  province: optionalText(120),
  postalCode: optionalText(20),
  region: optionalText(40)
});

const profileBody = z.object({
  firstName: text(80, 'Enter your first name.'),
  lastName: optionalText(80),
  phone: optionalText(30),
  shippingAddress: address.optional()
});

const deleteBody = z.object({ otp: code });

const publicUser = (user) => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  points: user.points,
  shippingAddress: user.shippingAddress
});

const designAsOrder = (design) => ({
  _id: design._id,
  createdAt: design.createdAt,
  status: design.status,
  amountPaid: design.totalPrice,
  items: [{
    name: `Custom design: ${design.name || 'Bracelet'}`,
    quantity: 1,
    amount: design.totalPrice * 100,
    color: design.beadType || 'Mixed'
  }]
});

function userRoutes(limits) {
  const router = express.Router();

  router.get('/user/me', requireUser, (req, res) => {
    res.json({ user: publicUser(req.account), cart: req.account.cart, wishlist: req.account.wishlist });
  });

  router.post('/user/sync', requireUser, validate(syncBody), async (req, res) => {
    req.account.cart = req.body.cart;
    req.account.wishlist = req.body.wishlist;
    await req.account.save();
    res.json({ success: true });
  });

  router.put('/user/profile', requireUser, validate(profileBody), async (req, res) => {
    Object.assign(req.account, req.body);
    await req.account.save();
    res.json({ user: publicUser(req.account) });
  });

  router.get('/user/orders', requireUser, async (req, res) => {
    const { email } = req.account;
    const [orders, designs] = await Promise.all([
      Order.find({ customerEmail: email, status: mongoose.trusted({ $ne: Order.PENDING }) }).collation(anyCase).lean(),
      CustomOrder.find({ email, paid: mongoose.trusted({ $ne: false }) }).collation(anyCase).lean()
    ]);
    /* A design bought through checkout already shows inside its order. */
    const bought = new Set(orders.flatMap((order) => (order.items || []).map((item) => item.customOrderId)));
    const all = [...orders, ...designs.filter((design) => !bought.has(String(design._id))).map(designAsOrder)];
    res.json(all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
  });

  router.post('/user/request-delete', limits.email, requireUser, async (req, res) => {
    const otp = await issueOtp(req.account, 'delete');
    await mail.send({ to: req.account.email, ...mail.deleteCode(otp) });
    res.json({ success: true });
  });

  router.delete('/user/delete', limits.auth, requireUser, validate(deleteBody), async (req, res) => {
    if (!(await checkOtp(req.account, 'delete', req.body.otp))) throw new HttpError(400, 'Invalid or expired code.');
    await req.account.deleteOne();
    res.json({ success: true });
  });

  return router;
}

module.exports = userRoutes;
module.exports.cartLine = cartLine;
module.exports.publicUser = publicUser;
