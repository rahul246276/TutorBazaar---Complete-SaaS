const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const CreditService = require('../services/creditService');
const PaymentService = require('../services/paymentService');
const Tutor = require('../models/Tutor');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

// Get tutor dashboard stats
router.get('/dashboard', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.userId);

    // Get recent leads
    const recentLeads = await Lead.find({
      'lockInfo.tutor': req.userId,
      status: { $in: ['locked', 'converted'] },
    })
      .sort({ 'lockInfo.lockedAt': -1 })
      .limit(5)
      .lean();

    // Get unread notifications count
    const unreadNotifications = tutor.notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      data: {
        stats: {
          credits: tutor.credits,
          subscription: tutor.subscription,
          metrics: tutor.metrics,
          profileCompletion: tutor.profileCompletion,
        },
        recentLeads,
        unreadNotifications,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get tutor profile
router.get('/profile', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.userId)
      .select('-password -notifications')
      .lean();

    res.json({
      success: true,
      data: { tutor },
    });
  } catch (error) {
    next(error);
  }
});

// Update tutor profile
router.put('/profile', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'bio', 'headline', 'subjects',
      'city', 'locality', 'teachingModes', 'pricing', 'availability',
      'education', 'experience', 'preferences'
    ];

    const updateData = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateData[key] = updates[key];
      }
    });

    const tutor = await Tutor.findByIdAndUpdate(
      req.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { tutor },
    });
  } catch (error) {
    next(error);
  }
});

// Get available leads for tutor
router.get('/leads/available', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.userId);

    if (!tutor.isApproved) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval',
      });
    }

    const { page = 1, limit = 10 } = req.query;

    const leads = await Lead.findMatchesForTutor(tutor, {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      success: true,
      data: {
        leads,
        creditsRequired: parseInt(process.env.LEAD_UNLOCK_COST) || 10,
        currentBalance: tutor.credits.balance,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get my unlocked leads
router.get('/leads/my', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const { status = 'all', page = 1, limit = 10 } = req.query;

    const query = { 'lockInfo.tutor': req.userId };
    if (status !== 'all') query.status = status;

    const leads = await Lead.find(query)
      .sort({ 'lockInfo.lockedAt': -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: {
        leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Unlock a lead
router.post('/leads/:leadId/unlock', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const result = await CreditService.unlockLead(
      req.userId,
      req.params.leadId,
      req.io
    );

    res.json({
      success: true,
      message: 'Lead unlocked successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get credit balance and transaction history
router.get('/credits', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const tutor = await Tutor.findById(req.userId).select('credits');
    const history = await CreditService.getTransactionHistory(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });

    res.json({
      success: true,
      data: {
        balance: tutor.credits,
        history,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Purchase credits - Create order
router.post('/credits/purchase', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const { package: creditPackage } = req.body;

    const order = await PaymentService.createCreditOrder(req.userId, creditPackage);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment
router.post('/credits/verify', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const result = await PaymentService.verifyAndProcessPayment(req.body);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get notifications
router.get('/notifications', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const tutor = await Tutor.findById(req.userId)
      .select('notifications')
      .slice('notifications', [(parseInt(page) - 1) * parseInt(limit), parseInt(limit)]);

    res.json({
      success: true,
      data: {
        notifications: tutor.notifications,
        unreadCount: tutor.notifications.filter(n => !n.isRead).length,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', auth, authorize('tutor'), async (req, res, next) => {
  try {
    await Tutor.updateOne(
      { _id: req.userId, 'notifications._id': req.params.notificationId },
      { $set: { 'notifications.$.isRead': true } }
    );

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
