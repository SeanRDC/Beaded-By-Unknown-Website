const { z } = require('zod');

const { HttpError } = require('./errors');

/* Replaces req.body with the parsed value, so unlisted fields never reach a route. */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) throw new HttpError(400, result.error.issues[0]?.message || 'Invalid request.');
  req.body = result.data;
  next();
};

const validId = (req, res, next) => {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) throw new HttpError(400, 'Invalid id.');
  next();
};

const text = (max, message) => z.string({ error: message }).trim().min(1, message).max(max, message);
const optionalText = (max) => z.string().trim().max(max).optional();

const email = z.string({ error: 'Enter a valid email address.' }).trim().email('Enter a valid email address.').max(254);
const code = z.string({ error: 'Enter the 6-digit code.' }).regex(/^\d{6}$/, 'Enter the 6-digit code.');
const newPassword = z.string({ error: 'Use at least 8 characters.' }).min(8, 'Use at least 8 characters.').max(200, 'That password is too long.');

module.exports = { code, email, newPassword, optionalText, text, validate, validId };
