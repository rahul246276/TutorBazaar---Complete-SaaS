const mongoose = require('mongoose');

const creditTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    required: true,
  },
  tutor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tutor',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['purchase', 'unlock', 'refund', 'bonus', 'expiry', 'adjustment'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  // Related entities
  relatedLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lead',
  },
  relatedPayment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
  relatedOrder: {
    razorpayOrderId: String,
    razorpayPaymentId: String,
  },
  // Metadata
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Index for tutor transaction history
creditTransactionSchema.index({ tutor: 1, createdAt: -1 });
creditTransactionSchema.index({ type: 1, createdAt: -1 });

// Pre-save to generate transaction ID
creditTransactionSchema.pre('save', function(next) {
  if (!this.transactionId) {
    const prefix = 'TXN';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.transactionId = `${prefix}-${timestamp}-${random}`;
  }
  next();
});

const CreditTransaction = mongoose.model('CreditTransaction', creditTransactionSchema);
module.exports = CreditTransaction;
