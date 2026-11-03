const express = require('express');
const mongoose = require('mongoose');
const { z } = require('zod');

const { requireAdmin } = require('../middleware/admin');
const { HttpError } = require('../middleware/errors');
const { email, optionalText, validate, validId } = require('../middleware/validate');
const CustomOrder = require('../models/CustomOrder');
const mail = require('../services/email');
const { priceCustomDesign } = require('../services/pricing');

const designBody = z.object({
  email,
  name: optionalText(120),
  collectionId: z.string({ error: 'Choose a bead type.' }).max(10),
  beads: z.array(z.object({ name: z.string().max(40) }), { error: 'String at least 5 beads.' }).min(5, 'String at least 5 beads.').max(200, 'That is too many beads.'),
  stringId: z.string({ error: 'Choose a string.' }).max(10),
  lockColor: z.enum(['Gold', 'Silver']).optional(),
  extender: z.boolean().optional(),
  charmIds: z.array(z.string().max(10)).max(3).optional(),
  wristCm: z.coerce.number({ error: 'Enter your wrist size in centimetres.' }).min(10, 'Enter your wrist size in centimetres.').max(25, 'Enter your wrist size in centimetres.')
});

const statusBody = z.object({ status: z.enum(['Pending Studio Review', 'Crafting', 'Shipped', 'Delivered'], { error: 'Choose a valid status.' }) });

function customOrderRoutes(limits) {
  const router = express.Router();
  const admin = [limits.admin, requireAdmin];

  router.post('/custom-orders', limits.design, validate(designBody), async (req, res) => {
    const design = await CustomOrder.create({
      email: req.body.email,
      name: req.body.name || 'Custom Bracelet',
      ...priceCustomDesign(req.body)
    });
    res.status(201).json(design);
  });

  router.get('/custom-orders', admin, async (req, res) => {
    /* Designs saved before payments were tracked have no paid field, so they stay in the queue. */
    res.json(await CustomOrder.find({ paid: mongoose.trusted({ $ne: false }) }).sort({ createdAt: -1 }).lean());
  });

  router.patch('/admin/custom-orders/:id/status', admin, validId, validate(statusBody), async (req, res) => {
    const { status } = req.body;
    const design = await CustomOrder.findByIdAndUpdate(req.params.id, { status }, { returnDocument: 'after' });
    if (!design) throw new HttpError(404, 'Design not found.');
    if (status === 'Shipped' || status === 'Delivered') {
      await mail.send({ to: design.email, ...mail.designStatus(design, status) });
    }
    res.json(design);
  });

  return router;
}

module.exports = customOrderRoutes;
