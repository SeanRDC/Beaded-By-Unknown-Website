const express = require('express');
const { z } = require('zod');

const { requireAdmin } = require('../middleware/admin');
const { HttpError } = require('../middleware/errors');
const { text, validate, validId } = require('../middleware/validate');
const Product = require('../models/Product');
const { cached, clear, publicCache } = require('../services/cache');
const uploads = require('../services/uploads');

const MINUTE = 60 * 1000;

const list = z.union([
  z.array(z.string().trim().max(40)).max(30),
  z.string().max(500).transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean))
]);

/* A blank or empty price must never read as zero. */
const price = z.preprocess(
  (value) => (value === null || String(value).trim() === '' ? Number.NaN : value),
  z.coerce.number({ error: 'Enter a valid price.' }).min(0, 'Enter a valid price.').max(1000000, 'Enter a valid price.')
);

const fields = {
  name: text(160, 'Enter a name.'),
  price,
  cat: text(80, 'Choose a category.'),
  mat: z.string().trim().max(300),
  tag: z.string().trim().max(60),
  desc: z.string().trim().max(1000),
  sizes: list,
  colors: list
};
const images = { img: text(600, 'Add a picture.'), img2: z.string().trim().max(600) };

const newProduct = z.object({ ...fields, ...images }).partial({ mat: true, tag: true, desc: true, sizes: true, colors: true, img2: true });
const productEdit = z.object({ ...fields, ...images, isAvailable: z.boolean() }).partial();
const newUpload = z.object(fields).partial({ mat: true, tag: true, desc: true, sizes: true, colors: true });
const uploadEdit = z.object(fields).partial();
const statusBody = z.object({ isAvailable: z.boolean({ error: 'Choose available or not.' }) });

const firstFile = (files, ...names) => names.map((name) => files?.[name]?.[0]).find(Boolean);

async function updateProduct(id, changes) {
  const product = await Product.findByIdAndUpdate(id, changes, { returnDocument: 'after', runValidators: true });
  if (!product) throw new HttpError(404, 'Product not found.');
  clear('products');
  return product;
}

function productRoutes(limits) {
  const router = express.Router();
  const admin = [limits.admin, requireAdmin];

  router.get('/products', publicCache, async (req, res) => {
    res.json(await cached('products', MINUTE, () => Product.find().select('-__v').lean()));
  });

  /* Dashboard form. The key is checked before any file is read. */
  router.post('/products', admin, uploads.acceptImages, validate(newUpload), async (req, res) => {
    const main = firstFile(req.files, 'primaryImage', 'image');
    if (!main) throw new HttpError(400, 'Add a main picture.');
    const second = firstFile(req.files, 'secondaryImage');

    const product = await Product.create({
      ...req.body,
      img: await uploads.store(main),
      img2: second ? await uploads.store(second) : undefined
    });
    clear('products');
    res.status(201).json({ message: 'Product added.', product });
  });

  router.put('/products/:id', admin, validId, uploads.acceptImages, validate(uploadEdit), async (req, res) => {
    const main = firstFile(req.files, 'primaryImage', 'image');
    const second = firstFile(req.files, 'secondaryImage');
    const changes = { ...req.body };
    if (main) changes.img = await uploads.store(main);
    if (second) changes.img2 = await uploads.store(second);
    res.json({ status: 'OK', product: await updateProduct(req.params.id, changes) });
  });

  router.put('/products/:id/status', admin, validId, validate(statusBody), async (req, res) => {
    res.json(await updateProduct(req.params.id, req.body));
  });

  router.post('/admin/products', admin, validate(newProduct), async (req, res) => {
    const product = await Product.create(req.body);
    clear('products');
    res.json(product);
  });

  router.put('/admin/products/:id', admin, validId, validate(productEdit), async (req, res) => {
    res.json(await updateProduct(req.params.id, req.body));
  });

  router.delete('/admin/products/:id', admin, validId, async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    clear('products');
    res.json({ success: true });
  });

  return router;
}

module.exports = productRoutes;
