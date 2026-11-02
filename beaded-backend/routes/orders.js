const crypto = require('crypto');
const express = require('express');
const { z } = require('zod');

const { checkoutMode } = require('../config/env');
const { HttpError } = require('../middleware/errors');
const { email, text, validate } = require('../middleware/validate');
const Order = require('../models/Order');
const { markOrderPaid } = require('../services/orders');
const payments = require('../services/payments');
const { priceCart } = require('../services/pricing');
const { getSettings } = require('../services/settings');
const { cartLine } = require('./user');

const checkoutBody = z.object({
  cart: z.array(cartLine, { error: 'Your bag is empty.' }).min(1, 'Your bag is empty.').max(50),
  shippingRegion: text(40, 'Choose a shipping region.'),
  checkoutForm: z.object({
    firstName: text(80, 'Enter your first name.'),
    lastName: text(80, 'Enter your last name.'),
    email,
    phone: text(30, 'Enter your mobile number.'),
    street: text(200, 'Enter your street address.'),
    barangay: text(120, 'Enter your barangay.'),
    city: text(120, 'Enter your city.'),
    province: text(120, 'Enter your province.'),
    postalCode: text(20, 'Enter your postal code.')
  }, { error: 'Enter your delivery details.' })
});

const confirmBody = z.object({ ref: z.string({ error: 'Invalid reference.' }).min(1).max(64) });

function orderRoutes(limits) {
  const router = express.Router();

  /* The order is saved here, at the server's prices, and only ever becomes Paid through markOrderPaid. */
  router.post('/create-checkout-session', limits.checkout, validate(checkoutBody), async (req, res) => {
    const { cart, checkoutForm: form, shippingRegion: region } = req.body;
    const priced = await priceCart(cart, region, await getSettings());
    const ref = crypto.randomBytes(12).toString('base64url');
    const session = await payments.createSession({ ...priced, region, form, ref });

    await Order.create({
      checkoutSessionId: session.id,
      ref,
      status: Order.PENDING,
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      contactNumber: form.phone,
      shippingAddress: {
        street: form.street,
        barangay: form.barangay,
        city: form.city,
        province: form.province,
        region,
        postalCode: form.postalCode
      },
      amountPaid: priced.total,
      chargedAmount: checkoutMode() === 'showcase' ? 1 : priced.total,
      items: priced.lines
    });

    res.json({ checkout_url: session.checkoutUrl });
  });

  /* Asks PayMongo directly, so a customer's return from payment proves nothing by itself. */
  router.post('/orders/confirm', limits.checkout, validate(confirmBody), async (req, res) => {
    const order = await Order.findOne({ ref: req.body.ref });
    if (!order) throw new HttpError(404, 'Order not found.');
    if (order.status !== Order.PENDING) return res.json({ status: order.status });

    const session = await payments.fetchSession(order.checkoutSessionId);
    if (!payments.isPaid(session)) return res.json({ status: order.status });

    await markOrderPaid(order.checkoutSessionId);
    return res.json({ status: 'Paid' });
  });

  return router;
}

module.exports = orderRoutes;
