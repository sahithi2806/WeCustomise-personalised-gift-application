const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const router = express.Router();

function isRazorpayConfigured() {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  return Boolean(keyId && keySecret && !keyId.includes('demo') && !keySecret.includes('demo'));
}

const razorpay = isRazorpayConfigured()
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

router.post('/create-order', async (req, res) => {
  try {
    const amount = Math.round(Number(req.body.amount || 0));
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'A valid amount is required.' });
    }

    if (!razorpay) {
      return res.json({
        success: true,
        gateway: 'demo',
        order: {
          id: `demo_order_${Date.now()}`,
          amount: amount * 100,
          currency: 'INR',
        },
      });
    }

    const receipt = String(req.body.receipt || `wc_${Date.now()}`);
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt,
      notes: {
        platform: 'wecustomise',
      },
    });

    res.json({
      success: true,
      gateway: 'razorpay',
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error('Payment order creation failed', error);
    res.status(500).json({ error: 'Could not initialise payment gateway.' });
  }
});

router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({ valid: true, gateway: 'demo' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const valid = generatedSignature === razorpay_signature;
    res.json({ valid, gateway: 'razorpay' });
  } catch (error) {
    console.error('Payment verification failed', error);
    res.status(500).json({ error: 'Could not verify payment.' });
  }
});

module.exports = router;
