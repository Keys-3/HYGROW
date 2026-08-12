import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
    });

    const options = {
      amount: Math.round(amount * 100), // amount in paise
      currency: currency || 'INR',
      receipt: receipt || `rcptid_${Date.now()}`
    };

    const order = await instance.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create Razorpay order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/verify', (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid signature sent!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/refund', async (req, res) => {
  try {
    const { payment_id, amount } = req.body;
    
    if (!payment_id) {
      return res.status(400).json({ success: false, message: "payment_id is required for a refund" });
    }

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_mock_secret',
    });

    const refund = await instance.payments.refund(payment_id);
    
    res.json({ success: true, refund });
  } catch (error) {
    console.error('Razorpay Refund Error:', error);
    const errorMsg = error.message || (error.error && error.error.description) || 'An unknown error occurred during refund processing';
    res.status(500).json({ success: false, message: errorMsg });
  }
});

export default router;
