const express = require('express');

const { markOrderPaid } = require('../services/orders');
const payments = require('../services/payments');

const PAID = 'checkout_session.payment.paid';

/* Mounted before the JSON parser: the signature covers the exact bytes PayMongo sent. */
function webhookRoutes() {
  const router = express.Router();

  router.post('/paymongo', express.raw({ type: () => true, limit: '1mb' }), async (req, res) => {
    const secret = process.env.PAYMONGO_WEBHOOK_SECRET;
    if (!secret) {
      console.warn('PayMongo webhook refused: PAYMONGO_WEBHOOK_SECRET is not set.');
      return res.status(400).json({ error: 'Webhook is not configured.' });
    }

    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';
    let event;
    try {
      event = JSON.parse(raw).data;
    } catch {
      return res.status(400).json({ error: 'Invalid payload.' });
    }

    const trusted = payments.verifySignature(req.get('paymongo-signature'), raw, secret, Boolean(event?.attributes?.livemode));
    if (!trusted) return res.status(400).json({ error: 'Invalid signature.' });

    if (event.attributes.type === PAID) await markOrderPaid(event.attributes.data.id);
    return res.status(200).send('Webhook received');
  });

  return router;
}

module.exports = webhookRoutes;
