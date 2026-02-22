const mongoose = require('mongoose');
const User = require('./User');

const tutorSchema = new mongoose.Schema({
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
  },
  headline: {
    type: String,
    maxlength: [150, 'Headline cannot exceed 150 characters'],
  },

  // Teaching Details
  subjects: [{
    name: { type: String, required: true },
    levels: [{ type: String }], // e.g., ['Class 9-10', 'Class 11-12', 'Competitive']
    boards: [{ type: String }], // e.g., ['CBSE', 'ICSE', 'State Board']
  }],

  // Location & Mode
  city: {
    type: String,
    required: [true, 'City is required'],
    index: true,
  },
  locality: {
    type: String,
  },
  teachingModes: [{
    type: String,
    enum: ['online', 'offline', 'both'],
  }],

  // Pricing
  pricing: {
    hourlyRate: { type: Number, min: 0 },
    monthlyRate: { type: Number, min: 0 },
    currency: { type: String, default: 'INR' },
  },

  // Verification & Status
  isApproved: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  featuredUntil: {
    type: Date,
  },

  // Documents
  documents: {
    idProof: { type: String }, // URL to Cloudinary
    qualificationProof: { type: String },
    addressProof: { type: String },
  },

  // Experience & Education
  education: [{
    degree: String,
    institution: String,
    year: Number,
  }],
  experience: {
    years: { type: Number, default: 0 },
    details: String,
  },

  // Ratings & Reviews
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 },
  },
  reviews: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now },
  }],

  // Availability
  availability: {
    type: Map,
    of: [{
      start: String, // "09:00"
      end: String,   // "17:00"
    }],
    default: {},
  },

  // Credit System
  credits: {
    balance: { type: Number, default: 0, min: 0 },
    totalPurchased: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },

  // Subscription
  subscription: {
    plan: { type: String, enum: ['free', 'basic', 'premium', 'pro'], default: 'free' },
    startDate: Date,
    endDate: Date,
    autoRenew: { type: Boolean, default: true },
    razorpaySubscriptionId: String,
  },

  // Performance Metrics
  metrics: {
    totalLeads: { type: Number, default: 0 },
    unlockedLeads: { type: Number, default: 0 },
    convertedLeads: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 }, // percentage
    conversionRate: { type: Number, default: 0 }, // percentage
    avgResponseTime: { type: Number, default: 0 }, // minutes
    rankingScore: { type: Number, default: 0 },
  },

  // Preferences
  preferences: {
    maxDistance: { type: Number, default: 10 }, // km
    minBudget: { type: Number, default: 0 },
    preferredClasses: [{ type: String }],
  },

  // Notification Settings
  notifications: [{
    type: { type: String, enum: ['lead', 'message', 'system', 'payment'] },
    title: String,
    message: String,
    isRead: { type: Boolean, default: false },
    data: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for full name
tutorSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for profile completion percentage
tutorSchema.virtual('profileCompletion').get(function() {
  let completed = 0;
  let total = 8;

  if (this.bio) completed++;
  if (this.subjects.length > 0) completed++;
  if (this.city) completed++;
  if (this.pricing.hourlyRate || this.pricing.monthlyRate) completed++;
  if (this.education.length > 0) completed++;
  if (this.experience.years > 0) completed++;
  if (this.availability && Object.keys(this.availability).length > 0) completed++;
  if (this.profilePicture) completed++;

  return Math.round((completed / total) * 100);
});

// Index for search
tutorSchema.index({ city: 1, 'subjects.name': 1, isApproved: 1 });
tutorSchema.index({ isFeatured: 1, featuredUntil: 1 });
tutorSchema.index({ 'metrics.rankingScore': -1 });

// Method to update ranking score
tutorSchema.methods.updateRankingScore = function() {
  const weights = {
    rating: 0.3,
    conversion: 0.25,
    response: 0.2,
    profile: 0.15,
    featured: 0.1,
  };

  const ratingScore = (this.rating.average / 5) * 100;
  const conversionScore = this.metrics.conversionRate;
  const responseScore = this.metrics.responseRate;
  const profileScore = this.profileCompletion;
  const featuredScore = this.isFeatured ? 100 : 0;

  this.metrics.rankingScore = (
    ratingScore * weights.rating +
    conversionScore * weights.conversion +
    responseScore * weights.response +
    profileScore * weights.profile +
    featuredScore * weights.featured
  );

  return this.save({ validateBeforeSave: false });
};

// Method to add credits
tutorSchema.methods.addCredits = function(amount, session = null) {
  this.credits.balance += amount;
  this.credits.totalPurchased += amount;

  if (session) {
    return this.save({ session });
  }
  return this.save();
};

// Method to deduct credits
tutorSchema.methods.deductCredits = function(amount, session = null) {
  if (this.credits.balance < amount) {
    throw new Error('Insufficient credits');
  }

  this.credits.balance -= amount;
  this.credits.totalSpent += amount;

  if (session) {
    return this.save({ session });
  }
  return this.save();
};

// Method to add notification
tutorSchema.methods.addNotification = async function(notificationData) {
  this.notifications.unshift(notificationData);
  // Keep only last 50 notifications
  if (this.notifications.length > 50) {
    this.notifications = this.notifications.slice(0, 50);
  }
  return this.save({ validateBeforeSave: false });
};

const Tutor = User.discriminator('tutor', tutorSchema);

module.exports = Tutor;
