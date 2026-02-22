const cron = require('node-cron');
const Lead = require('../models/Lead');
const Tutor = require('../models/Tutor');
const CreditTransaction = require('../models/CreditTransaction');
const logger = require('../utils/logger');

// Run every hour to check for expired leads
const expireLeadsJob = () => {
  cron.schedule('0 * * * *', async () => {
    try {
      logger.info('Running lead expiry job...');

      const now = new Date();

      // Find expired locked leads
      const expiredLeads = await Lead.find({
        status: 'locked',
        'lockInfo.expiresAt': { $lt: now },
      });

      for (const lead of expiredLeads) {
        // Return lead to pool
        await lead.unlock();

        logger.info(`Lead ${lead.leadId} expired and returned to pool`);

        // Notify tutor that lock expired
        if (global.io) {
          global.io.to(`tutor_${lead.lockInfo.tutor}`).emit('lead_lock_expired', {
            leadId: lead._id,
            leadIdString: lead.leadId,
          });
        }
      }

      logger.info(`Expired ${expiredLeads.length} leads`);
    } catch (error) {
      logger.error('Lead expiry job error:', error);
    }
  });
};

// Run daily at midnight to clean up old data
const dailyCleanupJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Running daily cleanup job...');

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      // Archive old notifications
      const tutors = await Tutor.find();
      for (const tutor of tutors) {
        if (tutor.notifications.length > 50) {
          tutor.notifications = tutor.notifications.slice(0, 50);
          await tutor.save({ validateBeforeSave: false });
        }
      }

      // Update tutor rankings
      const activeTutors = await Tutor.find({ isApproved: true });
      for (const tutor of activeTutors) {
        await tutor.updateRankingScore();
      }

      logger.info('Daily cleanup completed');
    } catch (error) {
      logger.error('Daily cleanup job error:', error);
    }
  });
};

// Check for low credit balances and send alerts
const lowCreditAlertJob = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Checking for low credit balances...');

      const tutors = await Tutor.find({
        'credits.balance': { $lt: 20, $gt: 0 },
        isActive: true,
      });

      for (const tutor of tutors) {
        // Send notification
        await tutor.addNotification({
          type: 'system',
          title: 'Low Credit Balance',
          message: `Your credit balance is running low (${tutor.credits.balance} credits). Purchase more to continue unlocking leads.`,
        });

        // Send email
        const { sendEmail, emailTemplates } = require('../utils/email');
        await sendEmail({
          to: tutor.email,
          ...emailTemplates.lowCredits(tutor.firstName, tutor.credits.balance),
        });
      }

      logger.info(`Sent low credit alerts to ${tutors.length} tutors`);
    } catch (error) {
      logger.error('Low credit alert job error:', error);
    }
  });
};

// Initialize all cron jobs
const initJobs = () => {
  expireLeadsJob();
  dailyCleanupJob();
  lowCreditAlertJob();
  logger.info('Cron jobs initialized');
};

module.exports = initJobs;
