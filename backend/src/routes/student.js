const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

// Create new enquiry/lead
router.post('/enquiry', async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      city,
      locality,
      class: className,
      board,
      subjects,
      mode,
      budget,
      preferredTiming,
      startDate,
      goals,
      specialRequirements,
    } = req.body;

    // Create or find student
    let student = await Student.findOne({ email });

    if (!student) {
      student = new Student({
        email,
        password: Math.random().toString(36).slice(-8), // Random temp password
        firstName,
        lastName,
        phone,
        city,
        locality,
        class: className,
        board,
        subjects: subjects.map(s => ({ name: s })),
        preferences: {
          mode,
          budget,
        },
      });
      await student.save();
    }

    // Create lead
    const lead = new Lead({
      student: {
        id: student._id,
        name: `${firstName} ${lastName}`,
        phone,
        email,
      },
      requirements: {
        class: className,
        subjects,
        board,
        mode,
        city,
        locality,
        budget,
        preferredTiming,
        startDate: startDate ? new Date(startDate) : null,
        goals,
        specialRequirements,
      },
    });

    await lead.save();

    // Update student's enquiries
    student.enquiries.push(lead._id);
    await student.save();

    logger.info(`New lead created: ${lead.leadId} for ${city} - ${subjects.join(', ')}`);

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
      data: {
        leadId: lead.leadId,
        message: 'Tutors will contact you shortly',
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get student profile (protected)
router.get('/profile', auth, authorize('student'), async (req, res, next) => {
  try {
    const student = await Student.findById(req.userId)
      .populate('enquiries')
      .lean();

    res.json({
      success: true,
      data: { student },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
