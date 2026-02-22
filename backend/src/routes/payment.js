const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const PaymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const logger = require('../utils/logger');

// Razorpay webhook (public, signature verified)
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];

    await PaymentService.handleWebhook(req.body, signature);

    res.json({ success: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    // Still return 200 to prevent Razorpay retries for signature errors
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get payment history (tutor)
router.get('/history', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const history = await PaymentService.getPaymentHistory(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
});

// Get invoice
router.get('/invoice/:paymentId', auth, async (req, res, next) => {
  try {
    const invoice = await PaymentService.generateInvoice(req.params.paymentId);

    res.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
