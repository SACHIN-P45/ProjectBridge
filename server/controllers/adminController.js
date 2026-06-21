const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const ProjectRequest = require('../models/ProjectRequest');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { getEmailTemplate } = require('../utils/emailTemplates');

// @desc Get dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalDevelopers = await User.countDocuments({ role: 'developer' });
  
  const totalProjects = await ProjectRequest.countDocuments();
  const activeProjects = await ProjectRequest.countDocuments({
    status: { $in: ['in-progress', 'testing'] }
  });
  const completedProjects = await ProjectRequest.countDocuments({
    status: { $in: ['completed', 'delivered'] }
  });

  const payments = await Payment.find({ status: { $in: ['completed', 'released'] } });
  const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

  res.json({
    totalStudents,
    totalDevelopers,
    totalProjects,
    activeProjects,
    completedProjects,
    totalRevenue
  });
});

// @desc Get all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
  res.json(users);
});

// @desc Create developer
// @route POST /api/admin/developers
const createDeveloper = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  const normalizedEmail = email.toLowerCase();
  const userExists = await User.findOne({ email: normalizedEmail });

  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: 'developer',
    isVerified: false,
    isActive: true,
    emailVerificationToken,
    emailVerificationExpire
  });

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

  // Write token URL to file for developer testing ease
  const fs = require('fs');
  const path = require('path');
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'verify-token.txt'), verifyUrl);
  } catch (err) {
    console.error('Failed to write verify-token.txt:', err);
  }

  // Send the verification email using a beautiful HTML template
  const textMessage = `An account has been created for you on ProjectBridge. Please verify your email by clicking the link: ${verifyUrl}`;
  const htmlMessage = getEmailTemplate({
    title: 'Welcome to ProjectBridge!',
    previewText: 'An administrator has created a Developer Account for you on ProjectBridge.',
    leadText: 'An administrator has created a Developer Account for you on ProjectBridge. Please click the button below to verify your email address and activate your account:',
    btnLink: verifyUrl,
    btnText: 'Verify Email & Activate Account',
    icon: '💻',
    securityNote: 'This invitation is valid for 24 hours. Once verified, you will be able to log in with the password provided by the administrator.',
    securityNoteType: 'success',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Welcome to ProjectBridge - Account Activation Required',
      text: textMessage,
      html: htmlMessage,
    });
  } catch (err) {
    console.error('Failed to send verification email during developer creation:', err);
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified
  });
});

// @desc Update user active status
// @route PUT /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = req.body.isActive;
  await user.save();
  res.json({ _id: user._id, isActive: user.isActive });
});

// @desc Delete user
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User removed' });
});

// @desc Get all projects
// @route GET /api/admin/projects
const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await ProjectRequest.find()
    .populate('student', 'name email avatar')
    .populate('assignedDeveloper', 'name email avatar')
    .sort({ createdAt: -1 });
  res.json(projects);
});

// @desc Delete project
// @route DELETE /api/admin/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await ProjectRequest.findById(req.params.id);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  await ProjectRequest.findByIdAndDelete(req.params.id);
  res.json({ message: 'Project removed' });
});

// @desc Get all payments
// @route GET /api/admin/payments
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .populate('student', 'name email')
    .populate('developer', 'name email')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
  res.json(payments);
});

// @desc Get all reviews
// @route GET /api/admin/reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find()
    .populate('reviewer', 'name email avatar')
    .populate('reviewee', 'name email avatar')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

// @desc Delete review
// @route DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: 'Review removed' });
});

// @desc Send global notification
// @route POST /api/admin/notifications
const sendGlobalNotification = asyncHandler(async (req, res) => {
  const { title, message } = req.body;
  const users = await User.find({ role: { $ne: 'admin' } }).select('_id');
  
  const notifications = users.map(user => ({
    user: user._id,
    type: 'general',
    title,
    message
  }));

  if (notifications.length > 0) {
    await Notification.insertMany(notifications);
  }

  res.status(201).json({ message: `Notification sent to ${users.length} users` });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  createDeveloper,
  updateUserStatus,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAllPayments,
  getAllReviews,
  deleteReview,
  sendGlobalNotification
};
