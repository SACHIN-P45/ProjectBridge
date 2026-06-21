require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const verifyExistingDevelopers = async () => {
  try {
    await connectDB();

    console.log('🔍 Searching for developer accounts...');
    
    // Find all users with role developer who are not verified or not active
    const unverifiedOrInactiveDevs = await User.find({
      role: 'developer',
      $or: [
        { isVerified: { $ne: true } },
        { isActive: { $ne: true } }
      ]
    });

    console.log(`📋 Found ${unverifiedOrInactiveDevs.length} developer accounts that need updating.`);

    if (unverifiedOrInactiveDevs.length > 0) {
      const result = await User.updateMany(
        { role: 'developer' },
        { 
          $set: { 
            isVerified: true, 
            isActive: true 
          } 
        }
      );
      console.log(`✅ Successfully updated ${result.modifiedCount} developer accounts.`);
    } else {
      console.log('ℹ️ All developer accounts are already verified and active.');
    }

    console.log('🎉 Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  }
};

verifyExistingDevelopers();
