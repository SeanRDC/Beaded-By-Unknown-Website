const crypto = require('crypto');

const { checkoutMode, clientUrl } = require('../config/env');
const { HttpError } = require('../middleware/errors');

const SESSIONS = 'https://api.paymongo.com/v1/checkout_sessions';
const SIGNATURE_TOLERANCE_S = 5 * 60;
const METHODS = ['gcash', 'paymaya', 'card', 'qrph'];

const unavailable = () => new HttpError(502, 'Could not start the payment. Please try again.');

function authHeader() {
  if (!process.env.PAYMONGO_SECRET_KEY) throw unavailable();
  return `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`;
}

/* In showcase mode PayMongo only ever sees this single line. */
const TEST_LINE = { currency: 'PHP', amount: 100, name: 'Test Order (1 Peso)', quantity: 1, description: 'Portfolio project test payment' };

function lineItems(lines, shippingFee, region) {
  if (checkoutMode() === 'showcase') return [TEST_LINE];

  const items = lines.map((line) => ({
    currency: 'PHP',
    amount: line.amount,
    name: line.name,
    quantity: line.quantity,
    description: line.color
  }));
  if (shippingFee > 0) {
    items.push({ currency: 'PHP', amount: Math.round(shippingFee * 100), name: 'Shipping', quantity: 1, description: `J&T Express (${region})` });
  }
  return items;
}

const payments = {
  async createSession({ lines, shippingFee, region, form, ref }) {
    const res = await fetch(SESSIONS, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader() },
      body: JSON.stringify({
        data: {
          attributes: {
            send_email_receipt: true,
            show_description: true,
            show_line_items: true,
            payment_method_types: METHODS,
            billing: {
              name: `${form.firstName} ${form.lastName}`,
              email: form.email,
              phone: form.phone,
              address: {
                line1: form.street,
                line2: form.barangay,
                city: form.city,
                state: form.province,
                postal_code: form.postalCode,
                country: 'PH'
              }
            },
            line_items: lineItems(lines, shippingFee, region),
            success_url: `${clientUrl()}/checkout/confirmed?ref=${ref}`,
            cancel_url: `${clientUrl()}/checkout?canceled=true`,
            description: 'Beaded by Unknown order',
            metadata: { order_ref: ref }
          }
        }
      })
    });
    const body = await res.json().catch(() => null);
    const url = body?.data?.attributes?.checkout_url;
    if (!res.ok || !url) throw unavailable();
    return { id: body.data.id, checkoutUrl: url };
  },

  async fetchSession(id) {
    const res = await fetch(`${SESSIONS}/${encodeURIComponent(id)}`, { headers: { Authorization: authHeader() } });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body?.data) throw new HttpError(502, 'Could not check the payment. Please try again.');
    return body.data.attributes;
  },

  isPaid(session) {
    const paid = (session.payments || []).some((payment) => payment.attributes?.status === 'paid');
    return paid || session.payment_intent?.attributes?.status === 'succeeded';
  },

  /* PayMongo signs `timestamp.rawBody`, with one signature for test events and one for live. */
  verifySignature(header, rawBody, secret, livemode) {
    const parts = Object.fromEntries(String(header || '').split(',').map((part) => part.trim().split('=')));
    const given = livemode ? parts.li : parts.te;
    if (!parts.t || !given) return false;
    if (Math.abs(Date.now() / 1000 - Number(parts.t)) > SIGNATURE_TOLERANCE_S) return false;

    const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest();
    const received = Buffer.from(given, 'hex');
    return received.length === expected.length && crypto.timingSafeEqual(received, expected);
  }
};

module.exports = payments;
