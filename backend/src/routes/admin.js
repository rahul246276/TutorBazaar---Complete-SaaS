const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const CreditService = require('../services/creditService');
const Tutor = require('../models/Tutor');
const Student = require('../models/Student');
const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const logger = require('../utils/logger');

// Get admin dashboard stats
router.get('/dashboard', auth, authorize('admin'), async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Calculate stats
    const [
      totalTutors,
      activeTutors,
      pendingTutors,
      totalStudents,
      totalLeads,
      todayLeads,
      monthLeads,
      totalRevenue,
      monthRevenue,
    ] = await Promise.all([
      Tutor.countDocuments(),
      Tutor.countDocuments({ isApproved: true, isActive: true }),
      Tutor.countDocuments({ isApproved: false }),
      Student.countDocuments(),
      Lead.countDocuments(),
      Lead.countDocuments({ createdAt: { $gte: today } }),
      Lead.countDocuments({ createdAt: { $gte: thisMonth } }),
      Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Payment.aggregate([{ $match: { status: 'paid', createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    // Recent activity
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('student.id', 'firstName lastName')
      .lean();

    const recentPayments = await Payment.find({ status: 'paid' })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName email')
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          tutors: {
            total: totalTutors,
            active: activeTutors,
            pending: pendingTutors,
          },
          students: totalStudents,
          leads: {
            total: totalLeads,
            today: todayLeads,
            thisMonth: monthLeads,
          },
          revenue: {
            total: totalRevenue[0]?.total || 0,
            thisMonth: monthRevenue[0]?.total || 0,
          },
        },
        recentActivity: {
          leads: recentLeads,
          payments: recentPayments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get all tutors (with filters)
router.get('/tutors', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { 
      status = 'all', 
      search, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};

    if (status === 'pending') query.isApproved = false;
    if (status === 'approved') query.isApproved = true;
    if (status === 'featured') query.isFeatured = true;

    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const tutors = await Tutor.find(query)
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('-password')
      .lean();

    const total = await Tutor.countDocuments(query);

    res.json({
      success: true,
      data: {
        tutors,
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

// Approve tutor
router.put('/tutors/:id/approve', auth, authorize('admin'), async (req, res, next) => {
  try {
    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { 
        isApproved: true,
        'metrics.rankingScore': 50, // Base score for new approved tutors
      },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    // Send approval email
    const { sendEmail, emailTemplates } = require('../utils/email');
    await sendEmail({
      to: tutor.email,
      subject: 'Your TutorBazaar Profile is Approved!',
      html: `
        <h1>Congratulations ${tutor.firstName}!</h1>
        <p>Your tutor profile has been approved. You can now start unlocking leads and connecting with students.</p>
        <p>Get started by purchasing credits and browsing available leads in your city.</p>
        <a href="${process.env.CLIENT_URL}/tutor/dashboard" style="padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
      `,
    });

    logger.info(`Tutor ${tutor._id} approved by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Tutor approved successfully',
      data: { tutor },
    });
  } catch (error) {
    next(error);
  }
});

// Suspend tutor
router.put('/tutors/:id/suspend', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { 
        isActive: false,
        adminNotes: reason,
      },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    logger.info(`Tutor ${tutor._id} suspended by admin ${req.userId}. Reason: ${reason}`);

    res.json({
      success: true,
      message: 'Tutor suspended successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Add/Remove featured status
router.put('/tutors/:id/featured', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { isFeatured, duration = 30 } = req.body;

    const featuredUntil = isFeatured 
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : null;

    const tutor = await Tutor.findByIdAndUpdate(
      req.params.id,
      { 
        isFeatured,
        featuredUntil,
      },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({
        success: false,
        message: 'Tutor not found',
      });
    }

    res.json({
      success: true,
      message: isFeatured ? 'Tutor featured' : 'Featured status removed',
      data: { tutor },
    });
  } catch (error) {
    next(error);
  }
});

// Adjust tutor credits (admin)
router.post('/tutors/:id/credits', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { amount, reason } = req.body;

    const result = await CreditService.addBonusCredits(
      req.params.id,
      amount,
      reason,
      req.userId
    );

    res.json({
      success: true,
      message: 'Credits adjusted successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Refund credits (admin)
router.post('/tutors/:id/refund', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { leadId, reason } = req.body;

    const result = await CreditService.refundCredits(
      req.params.id,
      leadId,
      reason,
      req.userId
    );

    res.json({
      success: true,
      message: 'Credits refunded successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// Get subscription plans
router.get('/subscription-plans', auth, authorize('admin'), async (req, res, next) => {
  try {
    const plans = await SubscriptionPlan.find().sort({ displayOrder: 1 });

    res.json({
      success: true,
      data: { plans },
    });
  } catch (error) {
    next(error);
  }
});

// Create/Update subscription plan
router.post('/subscription-plans', auth, authorize('admin'), async (req, res, next) => {
  try {
    const planData = req.body;

    let plan;
    if (planData._id) {
      plan = await SubscriptionPlan.findByIdAndUpdate(planData._id, planData, { new: true });
    } else {
      plan = new SubscriptionPlan(planData);
      await plan.save();
    }

    res.json({
      success: true,
      message: 'Plan saved successfully',
      data: { plan },
    });
  } catch (error) {
    next(error);
  }
});

// Get all leads (admin table view)
router.get('/leads', auth, authorize('admin'), async (req, res, next) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);
    const query = {};

    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const leads = await Lead.find(query)
      .sort(sortOptions)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .lean();

    const total = await Lead.countDocuments(query);

    res.json({
      success: true,
      data: {
        leads,
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

// Get all payments (admin table view)
router.get('/payments', auth, authorize('admin'), async (req, res, next) => {
  try {
    const {
      status,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const parsedLimit = Math.max(parseInt(limit, 10) || 20, 1);
    const query = {};

    if (status) {
      query.status = status;
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const payments = await Payment.find(query)
      .populate('user', 'firstName lastName email')
      .sort(sortOptions)
      .skip((parsedPage - 1) * parsedLimit)
      .limit(parsedLimit)
      .lean();

    const total = await Payment.countDocuments(query);
    const totalRevenueAgg = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true,
      data: {
        payments,
        totalRevenue: totalRevenueAgg[0]?.total || 0,
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

module.exports = router;
