const mongoose = require('mongoose');
const Tutor = require('../models/Tutor');
const CreditTransaction = require('../models/CreditTransaction');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');

class CreditService {
  /**
   * Purchase credits for a tutor
   * Uses MongoDB transactions for atomicity
   */
  static async purchaseCredits(tutorId, amount, credits, paymentDetails, session = null) {
    const isExternalSession = !!session;

    if (!isExternalSession) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    try {
      // 1. Update tutor credit balance
      const tutor = await Tutor.findById(tutorId).session(session);
      if (!tutor) {
        throw new Error('Tutor not found');
      }

      const previousBalance = tutor.credits.balance;
      await tutor.addCredits(credits, session);

      // 2. Create transaction record
      const transaction = new CreditTransaction({
        tutor: tutorId,
        type: 'purchase',
        amount: credits,
        balanceAfter: previousBalance + credits,
        description: `Purchased ${credits} credits for ₹${amount}`,
        relatedOrder: {
          razorpayOrderId: paymentDetails.orderId,
          razorpayPaymentId: paymentDetails.paymentId,
        },
      });

      await transaction.save({ session });

      if (!isExternalSession) {
        await session.commitTransaction();
      }

      logger.info(`Credits purchased: ${credits} for tutor ${tutorId}`);

      return {
        success: true,
        transaction,
        newBalance: tutor.credits.balance,
      };
    } catch (error) {
      if (!isExternalSession) {
        await session.abortTransaction();
      }
      logger.error(`Credit purchase failed for tutor ${tutorId}:`, error);
      throw error;
    } finally {
      if (!isExternalSession) {
        session.endSession();
      }
    }
  }

  /**
   * Unlock a lead using credits
   * Atomic operation: Deduct credits + Lock lead + Create transaction
   */
  static async unlockLead(tutorId, leadId, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Get tutor and lead within transaction
      const [tutor, lead] = await Promise.all([
        Tutor.findById(tutorId).session(session),
        Lead.findById(leadId).session(session),
      ]);

      if (!tutor) throw new Error('Tutor not found');
      if (!lead) throw new Error('Lead not found');
      if (!tutor.isApproved) throw new Error('Tutor not approved yet');

      // 2. Check if lead is available
      if (lead.status !== 'active') {
        throw new Error('Lead is no longer available');
      }

      // 3. Check if tutor already unlocked this lead
      const alreadyUnlocked = await CreditTransaction.findOne({
        tutor: tutorId,
        relatedLead: leadId,
        type: 'unlock',
      }).session(session);

      if (alreadyUnlocked) {
        throw new Error('You have already unlocked this lead');
      }

      // 4. Check credit balance
      const unlockCost = parseInt(process.env.LEAD_UNLOCK_COST) || 10;
      if (tutor.credits.balance < unlockCost) {
        throw new Error(`Insufficient credits. Required: ${unlockCost}, Available: ${tutor.credits.balance}`);
      }

      // 5. Deduct credits
      const previousBalance = tutor.credits.balance;
      await tutor.deductCredits(unlockCost, session);

      // 6. Lock the lead
      await lead.lock(tutorId, unlockCost, session);

      // 7. Create transaction record
      const transaction = new CreditTransaction({
        tutor: tutorId,
        type: 'unlock',
        amount: -unlockCost,
        balanceAfter: previousBalance - unlockCost,
        description: `Unlocked lead ${lead.leadId}`,
        relatedLead: leadId,
      });
      await transaction.save({ session });

      // 8. Update tutor metrics
      tutor.metrics.unlockedLeads += 1;
      await tutor.save({ session, validateBeforeSave: false });

      // Commit transaction
      await session.commitTransaction();

      // 9. Notify other tutors that lead is locked (outside transaction)
      if (io) {
        io.emit('lead_locked', {
          leadId: lead._id,
          lockedBy: tutorId,
        });
      }

      logger.info(`Lead ${leadId} unlocked by tutor ${tutorId}`);

      return {
        success: true,
        transaction,
        lead: {
          id: lead._id,
          leadId: lead.leadId,
          student: lead.student,
          requirements: lead.requirements,
          lockedAt: lead.lockInfo.lockedAt,
          expiresAt: lead.lockInfo.expiresAt,
        },
        remainingCredits: tutor.credits.balance,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Lead unlock failed for tutor ${tutorId}, lead ${leadId}:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Refund credits (e.g., when lead is cancelled or fake)
   */
  static async refundCredits(tutorId, leadId, reason, adminId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // 1. Find the original unlock transaction
      const unlockTransaction = await CreditTransaction.findOne({
        tutor: tutorId,
        relatedLead: leadId,
        type: 'unlock',
      }).session(session);

      if (!unlockTransaction) {
        throw new Error('No unlock transaction found for this lead');
      }

      // 2. Check if already refunded
      const existingRefund = await CreditTransaction.findOne({
        tutor: tutorId,
        relatedLead: leadId,
        type: 'refund',
      }).session(session);

      if (existingRefund) {
        throw new Error('Credits already refunded for this lead');
      }

      const tutor = await Tutor.findById(tutorId).session(session);
      const previousBalance = tutor.credits.balance;
      const refundAmount = Math.abs(unlockTransaction.amount);

      // 3. Add credits back
      await tutor.addCredits(refundAmount, session);

      // 4. Create refund transaction
      const refundTransaction = new CreditTransaction({
        tutor: tutorId,
        type: 'refund',
        amount: refundAmount,
        balanceAfter: previousBalance + refundAmount,
        description: `Refund for lead ${leadId}: ${reason}`,
        relatedLead: leadId,
      });
      await refundTransaction.save({ session });

      // 5. Update lead status
      await Lead.findByIdAndUpdate(leadId, {
        status: 'refunded',
        adminNotes: `Refunded by admin ${adminId}. Reason: ${reason}`,
      }).session(session);

      await session.commitTransaction();

      logger.info(`Credits refunded for tutor ${tutorId}, lead ${leadId}`);

      return {
        success: true,
        refundTransaction,
        newBalance: tutor.credits.balance,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error(`Credit refund failed:`, error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Add bonus credits (promotions, compensation, etc.)
   */
  static async addBonusCredits(tutorId, amount, reason, adminId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const tutor = await Tutor.findById(tutorId).session(session);
      if (!tutor) throw new Error('Tutor not found');

      const previousBalance = tutor.credits.balance;
      await tutor.addCredits(amount, session);

      const transaction = new CreditTransaction({
        tutor: tutorId,
        type: 'bonus',
        amount: amount,
        balanceAfter: previousBalance + amount,
        description: `Bonus: ${reason} (by admin ${adminId})`,
      });
      await transaction.save({ session });

      await session.commitTransaction();

      logger.info(`Bonus credits added: ${amount} for tutor ${tutorId}`);

      return {
        success: true,
        transaction,
        newBalance: tutor.credits.balance,
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transaction history for a tutor
   */
  static async getTransactionHistory(tutorId, options = {}) {
    const { page = 1, limit = 20, type = null } = options;

    const query = { tutor: tutorId };
    if (type) query.type = type;

    const transactions = await CreditTransaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await CreditTransaction.countDocuments(query);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Check if tutor has sufficient credits
   */
  static async hasSufficientCredits(tutorId, requiredAmount) {
    const tutor = await Tutor.findById(tutorId).select('credits.balance');
    if (!tutor) return false;
    return tutor.credits.balance >= requiredAmount;
  }
}

module.exports = CreditService;
