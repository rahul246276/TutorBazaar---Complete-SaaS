const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const CreditService = require('./creditService');
const { sendEmail, emailTemplates } = require('../utils/email');
const logger = require('../utils/logger');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

class PaymentService {
  /**
   * Create order for credit purchase
   */
  static async createCreditOrder(tutorId, creditPackage) {
    try {
      const packages = {
        starter: { credits: 50, price: 500, discount: 0 },
        popular: { credits: 120, price: 1000, discount: 17 }, // Save ₹200
        premium: { credits: 300, price: 2000, discount: 33 }, // Save ₹1000
        enterprise: { credits: 1000, price: 5000, discount: 50 }, // Save ₹5000
      };

      const pkg = packages[creditPackage];
      if (!pkg) {
        throw new Error('Invalid credit package');
      }

      // Calculate GST (18%)
      const gstAmount = Math.round(pkg.price * 0.18);
      const totalAmount = pkg.price + gstAmount;

      // Create Razorpay order
      const orderOptions = {
        amount: totalAmount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `credit_${tutorId}_${Date.now()}`,
        notes: {
          tutorId: tutorId.toString(),
          type: 'credit_purchase',
          credits: pkg.credits,
          baseAmount: pkg.price,
        },
      };

      const order = await razorpay.orders.create(orderOptions);

      // Create payment record in database
      const payment = new Payment({
        razorpayOrderId: order.id,
        user: tutorId,
        userType: 'tutor',
        type: 'credit_purchase',
        amount: totalAmount,
        currency: 'INR',
        creditsPurchased: pkg.credits,
        creditPackage: {
          name: creditPackage,
          credits: pkg.credits,
          price: pkg.price,
          discount: pkg.discount,
        },
        gst: {
          cgst: gstAmount / 2,
          sgst: gstAmount / 2,
          totalTax: gstAmount,
        },
        status: 'created',
      });

      await payment.save();

      logger.info(`Credit order created: ${order.id} for tutor ${tutorId}`);

      return {
        success: true,
        orderId: order.id,
        amount: totalAmount,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID,
        credits: pkg.credits,
        packageDetails: pkg,
      };
    } catch (error) {
      logger.error('Create credit order error:', error);
      throw error;
    }
  }

  /**
   * Verify payment and process credits
   */
  static async verifyAndProcessPayment(paymentData) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

    try {
      // 1. Verify signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        throw new Error('Invalid payment signature');
      }

      // 2. Find payment record
      const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
      if (!payment) {
        throw new Error('Payment record not found');
      }

      if (payment.status === 'paid') {
        return { success: true, alreadyProcessed: true, payment };
      }

      // 3. Update payment status
      await payment.markAsPaid(razorpay_payment_id, razorpay_signature);

      // 4. Process based on payment type
      if (payment.type === 'credit_purchase') {
        await CreditService.purchaseCredits(
          payment.user,
          payment.amount,
          payment.creditsPurchased,
          {
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
          }
        );

        // Send confirmation email
        const tutor = await require('../models/Tutor').findById(payment.user);
        if (tutor) {
          await sendEmail({
            to: tutor.email,
            ...emailTemplates.paymentSuccess(
              tutor.firstName,
              payment.amount,
              payment.creditsPurchased
            ),
          });
        }
      }

      logger.info(`Payment verified and processed: ${razorpay_payment_id}`);

      return {
        success: true,
        payment,
        creditsAdded: payment.creditsPurchased,
      };
    } catch (error) {
      logger.error('Payment verification error:', error);
      throw error;
    }
  }

  /**
   * Handle Razorpay webhook
   */
  static async handleWebhook(payload, signature) {
    try {
      // Verify webhook signature
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

      if (expectedSignature !== signature) {
        throw new Error('Invalid webhook signature');
      }

      const event = payload.event;
      const data = payload.payload;

      logger.info(`Webhook received: ${event}`);

      switch (event) {
        case 'payment.captured':
          // Payment captured - already handled in verify endpoint
          break;

        case 'payment.failed':
          await this.handlePaymentFailure(data.payment.entity);
          break;

        case 'refund.processed':
          await this.handleRefund(data.refund.entity);
          break;

        case 'subscription.charged':
          await this.handleSubscriptionCharge(data.subscription.entity);
          break;

        default:
          logger.info(`Unhandled webhook event: ${event}`);
      }

      return { success: true };
    } catch (error) {
      logger.error('Webhook handling error:', error);
      throw error;
    }
  }

  /**
   * Handle payment failure
   */
  static async handlePaymentFailure(paymentData) {
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: paymentData.order_id },
      {
        status: 'failed',
        error: {
          code: paymentData.error_code,
          description: paymentData.error_description,
          source: paymentData.error_source,
          step: paymentData.error_step,
          reason: paymentData.error_reason,
        },
      }
    );

    logger.warn(`Payment failed: ${paymentData.id}`);
    return payment;
  }

  /**
   * Process refund
   */
  static async processRefund(paymentId, amount, reason) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'paid') {
        throw new Error('Can only refund paid payments');
      }

      // Create Razorpay refund
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: amount * 100, // Convert to paise
        notes: {
          reason: reason,
          originalPayment: paymentId,
        },
      });

      // Update payment record
      await payment.processRefund(amount, reason);
      payment.refund.razorpayRefundId = refund.id;
      await payment.save();

      // If credit purchase, deduct credits
      if (payment.type === 'credit_purchase') {
        // This would require credit deduction logic
        // For now, we log it for manual review
        logger.warn(`Credit refund processed for payment ${paymentId}. Manual credit adjustment may be needed.`);
      }

      logger.info(`Refund processed: ${refund.id} for payment ${paymentId}`);

      return {
        success: true,
        refundId: refund.id,
        amount: refund.amount / 100,
      };
    } catch (error) {
      logger.error('Refund processing error:', error);
      throw error;
    }
  }

  /**
   * Get payment history for user
   */
  static async getPaymentHistory(userId, options = {}) {
    const { page = 1, limit = 20, status = null } = options;

    const query = { user: userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Payment.countDocuments(query);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Generate invoice
   */
  static async generateInvoice(paymentId) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new Error('Payment not found');
    }

    // Generate invoice number if not exists
    if (!payment.invoice.number) {
      const date = new Date();
      const invoiceNumber = `INV-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}-${payment._id.toString().slice(-6).toUpperCase()}`;

      payment.invoice.number = invoiceNumber;
      payment.invoice.generatedAt = new Date();
      await payment.save();
    }

    // In production, generate PDF and upload to cloud storage
    // For now, return invoice data
    return {
      invoiceNumber: payment.invoice.number,
      date: payment.invoice.generatedAt,
      paymentDetails: payment,
      // PDF URL would be here
    };
  }
}

module.exports = PaymentService;
