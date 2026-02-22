const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    logger.error('SMTP configuration error:', error);
  } else {
    logger.info('SMTP server is ready to send emails');
  }
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `TutorBazaar <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  welcomeTutor: (name) => ({
    subject: 'Welcome to TutorBazaar - Start Getting Students!',
    html: `
      <h1>Welcome ${name}!</h1>
      <p>Thank you for joining TutorBazaar. Your profile is under review and will be approved within 24 hours.</p>
      <p>Once approved, you can:</p>
      <ul>
        <li>Purchase credits to unlock student leads</li>
        <li>Get featured for more visibility</li>
        <li>Start growing your tutoring business</li>
      </ul>
      <p>Best regards,<br>TutorBazaar Team</p>
    `,
  }),

  leadUnlocked: (tutorName, leadId, studentName) => ({
    subject: `New Lead Unlocked - ${studentName}`,
    html: `
      <h1>Hello ${tutorName},</h1>
      <p>You have successfully unlocked a new lead!</p>
      <p><strong>Lead ID:</strong> ${leadId}</p>
      <p><strong>Student:</strong> ${studentName}</p>
      <p>Contact the student quickly to increase your chances of conversion.</p>
      <a href="${process.env.CLIENT_URL}/tutor/leads" style="padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">View Lead</a>
    `,
  }),

  lowCredits: (tutorName, balance) => ({
    subject: 'Low Credit Balance Alert',
    html: `
      <h1>Hello ${tutorName},</h1>
      <p>Your credit balance is running low (${balance} credits remaining).</p>
      <p>Purchase more credits to continue unlocking leads and growing your business.</p>
      <a href="${process.env.CLIENT_URL}/tutor/credits" style="padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Buy Credits</a>
    `,
  }),

  paymentSuccess: (name, amount, credits) => ({
    subject: 'Payment Successful - Credits Added',
    html: `
      <h1>Payment Successful!</h1>
      <p>Hello ${name},</p>
      <p>Your payment of ₹${amount} was successful.</p>
      <p><strong>Credits Added:</strong> ${credits}</p>
      <p>You can now unlock more leads and connect with students.</p>
    `,
  }),

  passwordReset: (name, resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>Hello ${name},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="padding: 10px 20px; background: #4F46E5; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  }),
};

module.exports = { sendEmail, emailTemplates };
