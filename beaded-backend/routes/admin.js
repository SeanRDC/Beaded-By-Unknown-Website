const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

const { requireAdmin } = require('../middleware/admin');
const { HttpError } = require('../middleware/errors');
const { validate, validId } = require('../middleware/validate');
const Order = require('../models/Order');
const mail = require('../services/email');

const statusBody = z.object({ status: z.enum(['Paid', 'Crafting', 'Shipped', 'Delivered'], { error: 'Choose a valid status.' }) });

function adminRoutes(limits) {
  const router = express.Router();
  const admin = [limits.admin, requireAdmin];

  router.get('/admin/orders', admin, async (req, res) => {
    res.json(await Order.find({ status: mongoose.trusted({ $ne: Order.PENDING }) }).sort({ createdAt: -1 }).limit(50).lean());
  });

  router.patch('/admin/orders/:id/status', admin, validId, validate(statusBody), async (req, res) => {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    if (!order) throw new HttpError(404, 'Order not found.');
    if (status === 'Shipped' || status === 'Delivered') {
      await mail.send({ to: order.customerEmail, ...mail.orderStatus(order, status) });
    }
    res.json(order);
  });

  router.get('/admin/stats', admin, async (req, res) => {
    const [totals] = await Order.aggregate([
      { $match: { status: { $ne: Order.PENDING } } },
      { $group: { _id: null, revenue: { $sum: '$amountPaid' }, totalOrders: { $sum: 1 } } }
    ]);
    res.json({ revenue: totals?.revenue || 0, totalOrders: totals?.totalOrders || 0 });
  });

  return router;
}

module.exports = adminRoutes;
