const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');
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

  const { data: userExists, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (checkError) throw checkError;

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
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

  // Hash password manually since we don't have mongoose pre-save hooks
  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, error: createError } = await supabase
    .from('users')
    .insert({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole,
      is_verified: false,
      email_verification_token: emailVerificationToken,
      email_verification_expire: emailVerificationExpire,
    })
    .select()
    .single();

  if (createError) throw createError;

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

  // Write token URL to file for developer testing ease
  const fs = require('fs');
  const path = require('path');
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'verify-token.txt'), verifyUrl);
  } catch (err) {
    console.error('Failed to write verify-token.txt on registration:', err);
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
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (fetchError) throw fetchError;

  // Helpful error if user registered via OAuth and has no password
  if (user && user.auth_provider !== 'local') {
    res.status(400);
    throw new Error(
      `This account was registered with ${user.auth_provider.charAt(0).toUpperCase() + user.auth_provider.slice(1)}. Please use the "Continue with ${user.auth_provider.charAt(0).toUpperCase() + user.auth_provider.slice(1)}" button to sign in.`
    );
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.is_verified) {
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    const tokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        email_verification_token: hashedToken,
        email_verification_expire: tokenExpire,
      })
      .eq('id', user.id);

    if (updateError) throw updateError;

    const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

    // Write token URL to file for developer testing ease
    const fs = require('fs');
    const path = require('path');
    try {
      fs.writeFileSync(path.join(__dirname, '..', 'verify-token.txt'), verifyUrl);
    } catch (err) {
      console.error('Failed to write verify-token.txt on login token regeneration:', err);
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
      clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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

    res.status(401);
    throw new Error('Please verify your email address to activate your account.');
  }

  // If developer has a temporary password and must set a personal password
  if (user.role === 'developer' && user.must_change_password) {
    res.status(400);
    throw new Error('first_login_password_change_required');
  }

  res.json({
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    bio: user.bio,
    skills: user.skills,
    techStack: user.tech_stack,
    githubUrl: user.github_url,
    portfolioUrl: user.portfolio_url,
    location: user.location,
    college: user.college,
    rating: user.rating,
    totalReviews: user.total_reviews,
    completedProjects: user.completed_projects,
    totalEarnings: user.total_earnings,
    isVerified: user.is_verified,
    token: generateToken(user.id),
  });
});

// @desc Get current user
// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.user.id)
    .single();

  if (error) {
    res.status(404);
    throw new Error('User not found');
  }

  delete user.password;
  user._id = user.id;
  res.json(user);
});

// @desc Update profile
// @route PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, bio, skills, techStack, githubUrl, portfolioUrl, location, college } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (bio !== undefined) updateData.bio = bio;
  if (skills) updateData.skills = typeof skills === 'string' ? JSON.parse(skills) : skills;
  if (techStack) updateData.tech_stack = typeof techStack === 'string' ? JSON.parse(techStack) : techStack;
  if (githubUrl !== undefined) updateData.github_url = githubUrl;
  if (portfolioUrl !== undefined) updateData.portfolio_url = portfolioUrl;
  if (location !== undefined) updateData.location = location;
  if (college !== undefined) updateData.college = college;

  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'avatars', 'image', req.file.originalname);
    updateData.avatar = result.secure_url;
  }

  const { data: updated, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', req.user.id)
    .select()
    .single();

  if (error) {
    res.status(400);
    throw error;
  }

  res.json({
    _id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    avatar: updated.avatar,
    bio: updated.bio,
    skills: updated.skills,
    techStack: updated.tech_stack,
    githubUrl: updated.github_url,
    portfolioUrl: updated.portfolio_url,
    rating: updated.rating,
    totalReviews: updated.total_reviews,
    completedProjects: updated.completed_projects,
    totalEarnings: updated.total_earnings,
    token: generateToken(updated.id),
  });
});

// @desc Get developer profile by id
// @route GET /api/auth/developer/:id
const getDeveloperProfile = asyncHandler(async (req, res) => {
  const { data: developer, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (error || !developer || developer.role !== 'developer') {
    res.status(404);
    throw new Error('Developer not found');
  }

  delete developer.password;
  developer._id = developer.id;
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

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  // Get reset token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken field
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire (10 minutes)
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('users')
    .update({
      reset_password_token: resetPasswordToken,
      reset_password_expire: resetPasswordExpire,
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  // Create reset url
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

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
        clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
      }),
    });

    res.status(200).json({ success: true, message: 'Email sent' });
  } catch (err) {
    // Clear tokens if email failed
    await supabase
      .from('users')
      .update({
        reset_password_token: null,
        reset_password_expire: null,
      })
      .eq('id', user.id);

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

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('reset_password_token', resetPasswordToken)
    .gt('reset_password_expire', new Date().toISOString())
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(password, 12);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expire: null,
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

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

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email_verification_token', emailVerificationToken)
    .gt('email_verification_expire', new Date().toISOString())
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired email verification token.');
  }

  const { error: updateError } = await supabase
    .from('users')
    .update({
      is_verified: true,
      email_verification_token: null,
      email_verification_expire: null,
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  res.status(200).json({
    success: true,
    message: 'Email verified successfully! You can now log in.',
    role: user.role,
    email: user.email,
    mustChangePassword: user.must_change_password || false,
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

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (!user) {
    res.status(404);
    throw new Error('There is no user registered with this email');
  }

  if (user.is_verified) {
    res.status(400);
    throw new Error('This email address is already verified');
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  // Token expires in 24 hours
  const tokenExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  const { error: updateError } = await supabase
    .from('users')
    .update({
      email_verification_token: hashedToken,
      email_verification_expire: tokenExpire,
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;

  // Write token URL to file for developer testing ease
  const fs = require('fs');
  const path = require('path');
  try {
    fs.writeFileSync(path.join(__dirname, '..', 'verify-token.txt'), verifyUrl);
  } catch (err) {
    console.error('Failed to write verify-token.txt on resend:', err);
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
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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

// @desc  OAuth callback — called after Passport verifies the OAuth user
// @route GET /api/auth/google/callback  (and /github/callback)
const oauthCallback = asyncHandler(async (req, res) => {
  const user = req.user;

  if (!user) {
    return res.redirect(
      `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`
    );
  }

  const token = generateToken(user.id);

  const userData = encodeURIComponent(
    JSON.stringify({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      skills: user.skills,
      techStack: user.tech_stack,
      githubUrl: user.github_url,
      portfolioUrl: user.portfolio_url,
      location: user.location,
      college: user.college,
      rating: user.rating,
      totalReviews: user.total_reviews,
      completedProjects: user.completed_projects,
      totalEarnings: user.total_earnings,
      isVerified: user.is_verified,
      authProvider: user.auth_provider,
      token,
    })
  );

  res.redirect(
    `${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth/callback?token=${token}&user=${userData}`
  );
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
  oauthCallback,
};
