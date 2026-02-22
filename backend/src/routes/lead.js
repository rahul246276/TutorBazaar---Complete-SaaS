const express = require('express');
const router = express.Router();
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const Lead = require('../models/Lead');
const Tutor = require('../models/Tutor');
const logger = require('../utils/logger');

// Search leads (for admin)
router.get('/search', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { 
      status, 
      city, 
      subject, 
      page = 1, 
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = {};
    if (status) query.status = status;
    if (city) query['requirements.city'] = new RegExp(city, 'i');
    if (subject) query['requirements.subjects'] = new RegExp(subject, 'i');

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    const leads = await Lead.find(query)
      .sort(sortOptions)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('lockInfo.tutor', 'firstName lastName email phone')
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

// Get lead by ID (admin only)
router.get('/:id', auth, authorize('admin'), async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('lockInfo.tutor', 'firstName lastName email phone')
      .populate('conversion.convertedBy', 'firstName lastName')
      .lean();

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    res.json({
      success: true,
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
});

// Update lead status (admin)
router.put('/:id/status', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { 
        status,
        adminNotes: notes,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    logger.info(`Lead ${lead.leadId} status updated to ${status} by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Lead status updated',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
});

// Manual lead redistribution (admin)
router.post('/:id/redistribute', auth, authorize('admin'), async (req, res, next) => {
  try {
    const { reason } = req.body;
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    if (lead.status !== 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Only locked leads can be redistributed',
      });
    }

    // Unlock the lead
    await lead.unlock();

    // Notify original tutor
    const io = req.io;
    if (io && lead.lockInfo.tutor) {
      io.to(`tutor_${lead.lockInfo.tutor}`).emit('lead_redistributed', {
        leadId: lead._id,
        reason,
      });
    }

    logger.info(`Lead ${lead.leadId} redistributed by admin ${req.userId}`);

    res.json({
      success: true,
      message: 'Lead redistributed successfully',
      data: { lead },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
