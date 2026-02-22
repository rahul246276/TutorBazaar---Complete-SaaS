const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Payment = require('../models/Payment');
const Tutor = require('../models/Tutor');

// Revenue analytics
router.get('/revenue', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    let groupFormat;
    if (period === 'daily') {
      groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === 'monthly') {
      groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    } else {
      groupFormat = { $dateToString: { format: '%Y', date: '$createdAt' } };
    }

    const revenue = await Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: new Date(`${year}-01-01`) } } },
      {
        $group: {
          _id: groupFormat,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: { revenue },
    });
  } catch (error) {
    next(error);
  }
});

// City-wise lead distribution
router.get('/cities', auth, authorize('admin'), async (req, res, next) => {
  try {
    const cityStats = await Lead.aggregate([
      {
        $group: {
          _id: '$requirements.city',
          totalLeads: { $sum: 1 },
          activeLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'converted'] }, 1, 0] },
          },
        },
      },
      { $sort: { totalLeads: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: { cities: cityStats },
    });
  } catch (error) {
    next(error);
  }
});

// Subject demand analytics
router.get('/subjects', auth, authorize('admin'), async (req, res, next) => {
  try {
    const subjectStats = await Lead.aggregate([
      { $unwind: '$requirements.subjects' },
      {
        $group: {
          _id: '$requirements.subjects',
          count: { $sum: 1 },
          avgBudget: { $avg: '$requirements.budget.max' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    res.json({
      success: true,
      data: { subjects: subjectStats },
    });
  } catch (error) {
    next(error);
  }
});

// Tutor performance metrics
router.get('/tutor-performance', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const tutors = await Tutor.find({ isApproved: true })
      .sort({ 'metrics.rankingScore': -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select('firstName lastName city metrics rating')
      .lean();

    res.json({
      success: true,
      data: { tutors },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
