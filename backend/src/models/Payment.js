const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Razorpay IDs
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  razorpayPaymentId: {
    type: String,
    sparse: true,
    unique: true,
  },
  razorpaySignature: {
    type: String,
  },

  // Payment Details
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userType: {
    type: String,
    enum: ['tutor', 'student', 'admin'],
    required: true,
  },

  // Amount Details
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },

  // Payment Type
  type: {
    type: String,
    enum: ['credit_purchase', 'subscription', 'featured_boost', 'refund'],
    required: true,
  },

  // For credit purchases
  creditsPurchased: {
    type: Number,
    default: 0,
  },
  creditPackage: {
    name: String,
    credits: Number,
    price: Number,
    discount: Number,
  },

  // For subscriptions
  subscriptionPlan: {
    name: String,
    duration: String, // monthly, quarterly, yearly
    price: Number,
  },

  // Status
  status: {
    type: String,
    enum: ['created', 'attempted', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'created',
    index: true,
  },

  // GST Details
  gst: {
    cgst: Number,
    sgst: Number,
    igst: Number,
    totalTax: Number,
    gstin: String,
  },

  // Invoice
  invoice: {
    number: String,
    url: String,
    generatedAt: Date,
  },

  // Failure/Error Details
  error: {
    code: String,
    description: String,
    source: String,
    step: String,
    reason: String,
  },

  // Refund Details
  refund: {
    amount: Number,
    status: String,
    razorpayRefundId: String,
    reason: String,
    processedAt: Date,
  },

  // Metadata
  metadata: {
    type: Map,
    of: String,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  paidAt: Date,
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes
paymentSchema.index({ user: 1, status: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });

// Method to mark as paid
paymentSchema.methods.markAsPaid = async function(paymentId, signature) {
  this.razorpayPaymentId = paymentId;
  this.razorpaySignature = signature;
  this.status = 'paid';
  this.paidAt = new Date();
  return this.save();
};

// Method to process refund
paymentSchema.methods.processRefund = async function(amount, reason) {
  this.refund = {
    amount: amount,
    status: 'processed',
    reason: reason,
    processedAt: new Date(),
  };
  this.status = 'refunded';
  return this.save();
};

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
