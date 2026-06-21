const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const sendEmail = require('../utils/sendEmail');
const { getEmailTemplate } = require('../utils/emailTemplates');


// @desc Register user
// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
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

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Force public registration to always be 'student'
  // Developers must be created by an admin
  const userRole = 'student';

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
  const emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: userRole,
    isVerified: false,
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
  const textMessage = `Thank you for registering at ProjectBridge. Please verify your email by clicking the link: ${verifyUrl}`;
  const htmlMessage = getEmailTemplate({
    title: 'Verify Your Email Address',
    previewText: 'Thanks for signing up for ProjectBridge! Please verify your email to activate your account.',
    leadText: 'Thanks for signing up for ProjectBridge! Please click the button below to verify your email address and activate your account:',
    btnLink: verifyUrl,
    btnText: 'Verify Email',
    icon: '✉️',
    securityNote: 'This verification link is valid for 24 hours. If you did not sign up for a ProjectBridge account, you can safely ignore this email.',
    securityNoteType: 'success',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'ProjectBridge Email Verification',
      text: textMessage,
      html: htmlMessage,
    });
  } catch (err) {
    console.error('Failed to send verification email during registration:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
  });
});

// @desc Login user
// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter all fields');
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const tokenExpire = Date.now() + 24 * 60 * 60 * 1000;

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          emailVerificationToken: hashedToken,
          emailVerificationExpire: tokenExpire
        }
      }
    );

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

    const fs = require('fs');
    const path = require('path');
    try {
      fs.writeFileSync(path.join(__dirname, '..', 'verify-token.txt'), verifyUrl);
    } catch (err) {
      console.error('Failed to write verify-token.txt:', err);
    }

    const textMessage = `Please verify your email address to activate your ProjectBridge account. Link: ${verifyUrl}`;
    const htmlMessage = getEmailTemplate({
      title: 'Verify Your Email Address',
      previewText: 'Please verify your email address to activate your ProjectBridge account.',
      leadText: 'Please click the button below to verify your email address and activate your ProjectBridge account:',
      btnLink: verifyUrl,
      btnText: 'Verify Email',
      icon: '🔑',
      securityNote: 'This verification link is valid for 24 hours. If you did not request this email, please contact our support team.',
      securityNoteType: 'info',
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
    });

    try {
      await sendEmail({
        to: user.email,
        subject: 'ProjectBridge - Email Verification Required',
        text: textMessage,
        html: htmlMessage,
      });
    } catch (err) {
      console.error('Failed to send verification email on login:', err);
    }
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    skills: user.skills,
    techStack: user.techStack,
    githubUrl: user.githubUrl,
    portfolioUrl: user.portfolioUrl,
    location: user.location,
    college: user.college,
    rating: user.rating,
    totalReviews: user.totalReviews,
    completedProjects: user.completedProjects,
    totalEarnings: user.totalEarnings,
    isVerified: user.isVerified,
    token: generateToken(user._id),
  });
});

// @desc Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc Update profile
// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const { name, bio, skills, techStack, githubUrl, portfolioUrl, location, college } = req.body;

  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (skills) user.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
  if (techStack) user.techStack = typeof techStack === 'string' ? JSON.parse(techStack) : techStack;
  if (githubUrl !== undefined) user.githubUrl = githubUrl;
  if (portfolioUrl !== undefined) user.portfolioUrl = portfolioUrl;
  if (location !== undefined) user.location = location;
  if (college !== undefined) user.college = college;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image', req.file.originalname);
    user.avatar = result.secure_url;
  }

  const updated = await user.save();

  res.json({
    _id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatar: updated.avatar,
    bio: updated.bio,
    skills: updated.skills,
    techStack: updated.techStack,
    githubUrl: updated.githubUrl,
    portfolioUrl: updated.portfolioUrl,
    rating: updated.rating,
    totalReviews: updated.totalReviews,
    completedProjects: updated.completedProjects,
    totalEarnings: updated.totalEarnings,
    token: generateToken(updated._id),
  });
});

// @desc Get developer profile by id
// @route GET /api/auth/developer/:id
const getDeveloperProfile = asyncHandler(async (req, res) => {
  const developer = await User.findById(req.params.id).select('-password').lean();
  if (!developer || developer.role !== 'developer') {
    res.status(404);
    throw new Error('Developer not found');
  }
  res.json(developer);
});

// @desc Forgot password
// @route POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken field
  user.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

  // Write reset URL to a file for developer testing ease
  const fs = require('fs');
  const path = require('path');
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'reset-token.txt'), resetUrl);
  } catch (err) {
    console.error('Failed to write reset-token.txt:', err);
  }

  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please click on the link below or paste it into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'ProjectBridge Password Reset',
      text: message,
      html: getEmailTemplate({
        title: 'Reset Password Request',
        previewText: 'You requested a password reset for your ProjectBridge account.',
        leadText: 'You requested a password reset for your ProjectBridge account. Please click the button below to set a new password:',
        btnLink: resetUrl,
        btnText: 'Reset Password',
        icon: '🔒',
        securityNote: 'This reset link is only valid for 10 minutes. If you did not request this change, you can safely ignore this email and your password will remain secure.',
        securityNoteType: 'warning',
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
      }),
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc Reset password
// @route PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Please provide a new password');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  // Hash token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Clean up reset-token.txt if it exists
  try {
    const fs = require('fs');
    const path = require('path');
    const tokenFile = path.join(__dirname, '..', 'reset-token.txt');
    if (fs.existsSync(tokenFile)) {
      fs.unlinkSync(tokenFile);
    }
  } catch (err) {
    // Ignore errors on deletion
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
  });
});

// @desc Verify email address
// @route GET /api/auth/verify-email/:token
const verifyEmail = asyncHandler(async (req, res) => {
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    emailVerificationToken,
    emailVerificationExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired email verification token.');
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
  });
});

// @desc Resend verification email
// @route POST /api/auth/resend-verification
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error('There is no user registered with this email');
  }

  if (user.isVerified) {
    res.status(400);
    throw new Error('This email address is already verified');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  user.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Token expires in 24 hours
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;

  await user.save();

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
  const textMessage = `Thank you for registering at ProjectBridge. Please verify your email by clicking the link: ${verifyUrl}`;
  const htmlMessage = getEmailTemplate({
    title: 'Verify Your Email Address',
    previewText: 'Thanks for signing up for ProjectBridge! Please verify your email to activate your account.',
    leadText: 'Thanks for signing up for ProjectBridge! Please click the button below to verify your email address and activate your account:',
    btnLink: verifyUrl,
    btnText: 'Verify Email',
    icon: '✉️',
    securityNote: 'This verification link is valid for 24 hours. If you did not sign up for a ProjectBridge account, you can safely ignore this email.',
    securityNoteType: 'success',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173'
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'ProjectBridge Email Verification',
      text: textMessage,
      html: htmlMessage,
    });
  } catch (err) {
    console.error('Failed to send verification email during resend:', err);
    res.status(500);
    throw new Error('Verification email could not be sent. Please try again.');
  }

  res.status(200).json({ success: true, message: 'Verification email sent' });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getDeveloperProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
};
