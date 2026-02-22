const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  // Lead Identification
  leadId: {
    type: String,
    unique: true,
    index: true,
  },

  // Student Information (denormalized for performance)
  student: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    name: String,
    phone: String,
    email: String,
  },

  // Requirements
  requirements: {
    class: { type: String, required: true },
    subjects: [{ type: String, required: true }],
    board: String,
    mode: { type: String, enum: ['online', 'offline', 'both'], required: true },
    city: { type: String, required: true, index: true },
    locality: String,
    budget: {
      min: Number,
      max: Number,
    },
    preferredTiming: String,
    startDate: Date,
    goals: String,
    specialRequirements: String,
  },

  // Status
  status: {
    type: String,
    enum: ['active', 'locked', 'converted', 'expired', 'cancelled', 'refunded'],
    default: 'active',
    index: true,
  },

  // Lock Information
  lockInfo: {
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
    lockedAt: Date,
    expiresAt: Date,
    creditsDeducted: { type: Number, default: 0 },
    unlockCount: { type: Number, default: 0 }, // How many tutors unlocked
  },

  // Matching
  matchedTutors: [{
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
    matchScore: Number,
    notifiedAt: Date,
  }],

  // Conversion Tracking
  conversion: {
    convertedAt: Date,
    convertedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutor' },
    notes: String,
    feedback: {
      rating: Number,
      comment: String,
    },
  },

  // Admin Controls
  adminNotes: String,
  isManual: { type: Boolean, default: false }, // Manually created by admin
  priority: { type: String, enum: ['low', 'normal', 'high'], default: 'normal' },

  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, index: true }, // Auto-expiry
}, {
  timestamps: true,
});

// Compound indexes for efficient queries
leadSchema.index({ status: 1, 'requirements.city': 1, 'requirements.subjects': 1 });
leadSchema.index({ status: 1, 'lockInfo.expiresAt': 1 });
leadSchema.index({ createdAt: -1 });

// Pre-save middleware to generate lead ID
leadSchema.pre('save', async function(next) {
  if (!this.leadId) {
    const date = new Date();
    const prefix = 'TB';
    const timestamp = date.getTime().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    this.leadId = `${prefix}-${timestamp}-${random}`;
  }

  // Set expiry time (24 hours from creation if not set)
  if (!this.expiresAt && this.isNew) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  next();
});

// Method to lock lead
leadSchema.methods.lock = async function(tutorId, credits, session = null) {
  if (this.status !== 'active') {
    throw new Error('Lead is not available for locking');
  }

  this.status = 'locked';
  this.lockInfo = {
    tutor: tutorId,
    lockedAt: new Date(),
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours lock
    creditsDeducted: credits,
    unlockCount: this.lockInfo.unlockCount + 1,
  };

  if (session) {
    return this.save({ session });
  }
  return this.save();
};

// Method to unlock lead (return to pool)
leadSchema.methods.unlock = async function(session = null) {
  this.status = 'active';
  this.lockInfo = {
    tutor: null,
    lockedAt: null,
    expiresAt: null,
    creditsDeducted: 0,
    unlockCount: this.lockInfo.unlockCount,
  };

  if (session) {
    return this.save({ session });
  }
  return this.save();
};

// Method to mark as converted
leadSchema.methods.markConverted = async function(tutorId, notes = '') {
  this.status = 'converted';
  this.conversion = {
    convertedAt: new Date(),
    convertedBy: tutorId,
    notes: notes,
  };
  return this.save();
};

// Static method to find matching leads for tutor
leadSchema.statics.findMatchesForTutor = async function(tutor, options = {}) {
  const { limit = 20, skip = 0 } = options;

  const query = {
    status: 'active',
    'requirements.city': tutor.city,
    'requirements.subjects': { $in: tutor.subjects.map(s => s.name) },
    'requirements.mode': { $in: tutor.teachingModes },
  };

  // Add budget filter if tutor has pricing
  if (tutor.pricing.hourlyRate) {
    query.$or = [
      { 'requirements.budget.max': { $gte: tutor.pricing.hourlyRate } },
      { 'requirements.budget.max': { $exists: false } },
    ];
  }

  // Exclude leads already matched to this tutor
  query['matchedTutors.tutor'] = { $ne: tutor._id };

  return this.find(query)
    .sort({ createdAt: -1, priority: -1 })
    .limit(limit)
    .skip(skip)
    .lean();
};

const Lead = mongoose.model('Lead', leadSchema);
module.exports = Lead;
