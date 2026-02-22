const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Tutor = require('./src/models/Tutor');
const SubscriptionPlan = require('./src/models/SubscriptionPlan');
require('dotenv').config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional - remove in production)
    await SubscriptionPlan.deleteMany({});
    console.log('Cleared existing subscription plans');

    // Create Subscription Plans
    const plans = [
      {
        name: 'Free',
        slug: 'free',
        description: 'Get started with basic features',
        price: {
          monthly: 0,
          quarterly: 0,
          yearly: 0,
        },
        features: {
          maxLeadsPerDay: 3,
          freeCreditsPerMonth: 0,
          creditDiscount: 0,
          featuredListing: false,
          prioritySupport: false,
          analyticsAccess: false,
          customBranding: false,
        },
        displayOrder: 1,
        isActive: true,
      },
      {
        name: 'Basic',
        slug: 'basic',
        description: 'Perfect for part-time tutors',
        price: {
          monthly: 299,
          quarterly: 799,
          yearly: 2999,
        },
        features: {
          maxLeadsPerDay: 10,
          freeCreditsPerMonth: 20,
          creditDiscount: 10,
          featuredListing: false,
          prioritySupport: false,
          analyticsAccess: true,
          customBranding: false,
        },
        displayOrder: 2,
        isActive: true,
      },
      {
        name: 'Premium',
        slug: 'premium',
        description: 'Best for full-time tutors',
        price: {
          monthly: 599,
          quarterly: 1499,
          yearly: 4999,
        },
        features: {
          maxLeadsPerDay: 25,
          freeCreditsPerMonth: 50,
          creditDiscount: 20,
          featuredListing: true,
          prioritySupport: true,
          analyticsAccess: true,
          customBranding: false,
        },
        displayOrder: 3,
        isPopular: true,
        isActive: true,
      },
      {
        name: 'Pro',
        slug: 'pro',
        description: 'For tutoring businesses',
        price: {
          monthly: 1299,
          quarterly: 3499,
          yearly: 11999,
        },
        features: {
          maxLeadsPerDay: 100,
          freeCreditsPerMonth: 150,
          creditDiscount: 30,
          featuredListing: true,
          prioritySupport: true,
          analyticsAccess: true,
          customBranding: true,
        },
        displayOrder: 4,
        isActive: true,
      },
    ];

    await SubscriptionPlan.insertMany(plans);
    console.log('✅ Subscription plans created');

    // Create Admin User
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || 'admin@tutorbazaar.com' });

    if (!adminExists) {
      const admin = new User({
        email: process.env.ADMIN_EMAIL || 'admin@tutorbazaar.com',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        isVerified: true,
        isActive: true,
      });
      await admin.save();
      console.log('✅ Admin user created');
      console.log('   Email:', process.env.ADMIN_EMAIL || 'admin@tutorbazaar.com');
      console.log('   Password:', process.env.ADMIN_PASSWORD || 'admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create Sample Tutor (for testing)
    const sampleTutorExists = await Tutor.findOne({ email: 'tutor@example.com' });

    if (!sampleTutorExists) {
      const tutor = new Tutor({
        email: 'tutor@example.com',
        password: 'password123',
        role: 'tutor',
        firstName: 'Rahul',
        lastName: 'Sharma',
        phone: '9876543210',
        city: 'Delhi',
        locality: 'Connaught Place',
        bio: 'Experienced Mathematics tutor with 5+ years of teaching experience. Specialized in CBSE and competitive exams.',
        headline: 'Expert Math Tutor | CBSE Specialist',
        subjects: [
          { name: 'Mathematics', levels: ['Class 9-10', 'Class 11-12'], boards: ['CBSE', 'ICSE'] },
          { name: 'Physics', levels: ['Class 11-12'], boards: ['CBSE'] },
        ],
        teachingModes: ['online', 'offline'],
        pricing: {
          hourlyRate: 500,
          monthlyRate: 8000,
          currency: 'INR',
        },
        education: [
          { degree: 'B.Tech', institution: 'IIT Delhi', year: 2018 },
        ],
        experience: {
          years: 5,
          details: '5 years of tutoring experience',
        },
        isApproved: true,
        credits: {
          balance: 50,
          totalPurchased: 100,
          totalSpent: 50,
        },
      });
      await tutor.save();
      console.log('✅ Sample tutor created');
      console.log('   Email: tutor@example.com');
      console.log('   Password: password123');
    } else {
      console.log('ℹ️ Sample tutor already exists');
    }

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
