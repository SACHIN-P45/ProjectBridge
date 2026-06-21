require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/db');

const seedDemoUsers = async () => {
  try {
    await connectDB();

    // Admin
    const adminEmail = 'admin@demo.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: '123456',
        role: 'admin',
        isActive: true,
        isVerified: true
      });
      console.log('✅ Admin user created: admin@demo.com / password123');
    } else {
      console.log('⚠️ Admin user already exists.');
    }

    // Student
    const studentEmail = 'student@demo.com';
    const existingStudent = await User.findOne({ email: studentEmail });
    if (!existingStudent) {
      await User.create({
        name: 'Demo Student',
        email: studentEmail,
        password: 'demo123',
        role: 'student',
        isActive: true,
        isVerified: true,
        college: 'ProjectBridge University'
      });
      console.log('✅ Student user created: student@demo.com / demo123');
    } else {
      console.log('⚠️ Student user already exists.');
    }

    // Developer
    const devEmail = 'dev@demo.com';
    const existingDev = await User.findOne({ email: devEmail });
    if (!existingDev) {
      await User.create({
        name: 'Demo Developer',
        email: devEmail,
        password: 'demo123',
        role: 'developer',
        isActive: true,
        isVerified: true,
        bio: 'Senior Full Stack Engineer | React & Node.js Expert',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'Tailwind CSS'],
        techStack: ['React', 'Node.js', 'Express', 'MongoDB'],
        rating: 4.8,
        totalReviews: 12,
        completedProjects: 8,
        totalEarnings: 45000
      });
      console.log('✅ Developer user created: dev@demo.com / demo123');
    } else {
      console.log('⚠️ Developer user already exists.');
    }

    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedDemoUsers();
