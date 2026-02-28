const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Student = require('../models/Student');
const Lead = require('../models/Lead');
const ContactMessage = require('../models/ContactMessage');
const logger = require('../utils/logger');
const { sendEmail } = require('../utils/email');

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

// Contact form
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject and message are required',
      });
    }

    const savedMessage = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      source: 'frontend_contact_form',
    });

    const supportEmail = process.env.SUPPORT_EMAIL || process.env.SMTP_USER;
    const smtpConfigured =
      Boolean(process.env.SMTP_HOST) &&
      Boolean(process.env.SMTP_PORT) &&
      Boolean(process.env.SMTP_USER) &&
      Boolean(process.env.SMTP_PASS);

    if (supportEmail && smtpConfigured) {
      try {
        await sendEmail({
          to: supportEmail,
          subject: `[TutorBazaar Contact] ${subject}`,
          html: `
            <h3>New Contact Request</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });
      } catch (emailError) {
        logger.error('Contact email send failed:', emailError);
      }
    }

    res.json({
      success: true,
      message: 'Message received successfully',
      data: {
        contactId: savedMessage._id,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
