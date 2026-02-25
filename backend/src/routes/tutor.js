const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const CreditService = require('../services/creditService');
const PaymentService = require('../services/paymentService');
const Tutor = require('../models/Tutor');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

// Public tutor search
router.get('/', async (req, res, next) => {
  try {
    const { subject, city, search, page = 1, limit = 20 } = req.query;
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);

    const query = {
      isApproved: true,
      isActive: true,
    };

    if (subject) {
      query['subjects.name'] = new RegExp(subject, 'i');
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { bio: new RegExp(search, 'i') },
        { headline: new RegExp(search, 'i') },
        { 'subjects.name': new RegExp(search, 'i') },
      ];
    }

    const tutors = await Tutor.find(query)
      .sort({ isFeatured: -1, 'metrics.rankingScore': -1, createdAt: -1 })
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .select('-password -notifications -preferences -documents')
      .lean();

    const total = await Tutor.countDocuments(query);

    res.json({
      success: true,
      data: {
        tutors,
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          pages: Math.ceil(total / parsedLimit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Public tutor details
router.get('/:id([0-9a-fA-F]{24})', async (req, res, next) => {
  try {
    const tutor = await Tutor.findOne({
      _id: req.params.id,
      isApproved: true,
      isActive: true,
    })
      .select('-password -notifications -preferences -documents')
      .lean();

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    res.json({
      success: true,
      data: { tutor },
    });
  } catch (error) {
    next(error);
  }
});

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

// Tutor analytics summary
router.get('/analytics', auth, authorize('tutor'), async (req, res, next) => {
  try {
    const tutor = await Tutor.findById(req.userId).lean();
    const recentLocks = await Lead.find({ 'lockInfo.tutor': req.userId })
      .sort({ 'lockInfo.lockedAt': -1 })
      .limit(30)
      .lean();

    const profileViews = tutor.metrics?.rankingScore ? Math.round(tutor.metrics.rankingScore * 6) : 0;
    const totalLeads = tutor.metrics?.totalLeads || 0;
    const conversionRate = tutor.metrics?.conversionRate || 0;
    const responseRate = tutor.metrics?.responseRate || 0;

    const chartData = recentLocks.map((lead) => ({
      date: new Date(lead.lockInfo?.lockedAt || lead.createdAt).toISOString().slice(0, 10),
      unlocked: lead.status === 'locked' || lead.status === 'converted' ? 1 : 0,
      converted: lead.status === 'converted' ? 1 : 0,
      views: Math.max(1, Math.round(profileViews / 30)),
    }));

    res.json({
      success: true,
      data: {
        stats: {
          profileViews,
          totalLeads,
          conversionRate,
          responseRate,
          avgResponseTime: tutor.metrics?.avgResponseTime
            ? `${tutor.metrics.avgResponseTime} mins`
            : 'N/A',
          satisfaction: tutor.rating?.average ? Math.round((tutor.rating.average / 5) * 100) : 0,
          activeSessions: tutor.metrics?.unlockedLeads || 0,
        },
        chartData,
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
