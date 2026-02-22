const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,

  // Pricing
  price: {
    monthly: Number,
    quarterly: Number, // 3 months
    yearly: Number,    // 12 months (usually with discount)
  },

  // Features
  features: {
    maxLeadsPerDay: { type: Number, default: 5 },
    freeCreditsPerMonth: { type: Number, default: 0 },
    creditDiscount: { type: Number, default: 0 }, // percentage
    featuredListing: { type: Boolean, default: false },
    prioritySupport: { type: Boolean, default: false },
    analyticsAccess: { type: Boolean, default: false },
    customBranding: { type: Boolean, default: false },
  },

  // Display
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isPopular: {
    type: Boolean,
    default: false,
  },

  // Razorpay Plan IDs
  razorpayPlanIds: {
    monthly: String,
    quarterly: String,
    yearly: String,
  },
}, {
  timestamps: true,
});

const SubscriptionPlan = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
module.exports = SubscriptionPlan;
