const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { supabase } = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const { getEmailTemplate } = require('../utils/emailTemplates');

// @desc Get dashboard stats
// @route GET /api/admin/stats
const getDashboardStats = asyncHandler(async (req, res) => {
  const { count: totalStudents } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'student');

  const { count: totalDevelopers } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'developer');

  const { count: totalProjects } = await supabase
    .from('project_requests')
    .select('id', { count: 'exact', head: true });

  const { count: activeProjects } = await supabase
    .from('project_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['in-progress', 'testing']);

  const { count: completedProjects } = await supabase
    .from('project_requests')
    .select('id', { count: 'exact', head: true })
    .in('status', ['completed', 'delivered']);

  const { data: payments, error: paymentsError } = await supabase
    .from('payments')
    .select('amount')
    .in('status', ['completed', 'released']);

  if (paymentsError) throw paymentsError;

  const totalRevenue = (payments || []).reduce((acc, curr) => acc + Number(curr.amount), 0);

  res.json({
    totalStudents: totalStudents || 0,
    totalDevelopers: totalDevelopers || 0,
    totalProjects: totalProjects || 0,
    activeProjects: activeProjects || 0,
    completedProjects: completedProjects || 0,
    totalRevenue,
  });
});

// @desc Get all users
// @route GET /api/admin/users
const getAllUsers = asyncHandler(async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedUsers = (users || []).map((u) => {
    const formatted = {
      ...u,
      _id: u.id,
      isActive: u.is_active,
      isVerified: u.is_verified,
      mustChangePassword: u.must_change_password,
      totalEarnings: u.total_earnings,
      completedProjects: u.completed_projects,
    };
    delete formatted.password;
    return formatted;
  });

  res.json(formattedUsers);
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
  const { data: userExists, error: checkError } = await supabase
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (checkError) throw checkError;

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
  const emailVerificationExpire = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Hash password manually since we bypass Mongoose
  const hashedPassword = await bcrypt.hash(password, 12);

  const { data: user, error: createError } = await supabase
    .from('users')
    .insert({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'developer',
      is_verified: false,
      is_active: true,
      must_change_password: true,
      email_verification_token: emailVerificationToken,
      email_verification_expire: emailVerificationExpire,
    })
    .select()
    .single();

  if (createError) {
    res.status(400);
    throw createError;
  }

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
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
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
    _id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    isVerified: user.is_verified,
  });
});

// @desc Update user active status
// @route PUT /api/admin/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .update({ is_active: req.body.isActive })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({ _id: user.id, isActive: user.is_active });
});

// @desc Delete user
// @route DELETE /api/admin/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', req.params.id);

  if (deleteError) throw deleteError;

  res.json({ message: 'User removed' });
});

// @desc Update developer details (name, email)
// @route PUT /api/admin/developers/:id
const updateDeveloper = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !user || user.role !== 'developer') {
    res.status(404);
    throw new Error('Developer not found');
  }

  const updateData = {};
  if (email && email.toLowerCase() !== user.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please provide a valid email address');
    }

    const { data: emailExists } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (emailExists) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    updateData.email = email.toLowerCase();
    updateData.is_verified = false;
  }

  if (name) updateData.name = name;

  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (updateError) throw updateError;

  res.json({
    _id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    isActive: updated.is_active,
    isVerified: updated.is_verified,
    mustChangePassword: updated.must_change_password,
  });
});

// @desc Developer sets password after email verification (first login)
// @route POST /api/admin/developers/set-password
const developerSetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and new password are required');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long');
  }

  const { data: user, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.trim().toLowerCase())
    .eq('role', 'developer')
    .maybeSingle();

  if (fetchError || !user) {
    res.status(404);
    throw new Error('Developer account not found');
  }

  if (!user.is_verified) {
    res.status(400);
    throw new Error('Please verify your email first before setting a password');
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const { error: updateError } = await supabase
    .from('users')
    .update({
      password: hashedPassword,
      must_change_password: false,
    })
    .eq('id', user.id);

  if (updateError) throw updateError;

  res.status(200).json({ success: true, message: 'Password set successfully. You can now log in.' });
});

// @desc Get all projects
// @route GET /api/admin/projects
const getAllProjects = asyncHandler(async (req, res) => {
  const { data: projects, error } = await supabase
    .from('project_requests')
    .select('*, student:users!student_id(id, name, email, avatar), assignedDeveloper:users!assigned_developer_id(id, name, email, avatar)')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedProjects = (projects || []).map((p) => {
    return {
      ...p,
      _id: p.id,
      techStack: p.tech_stack,
      assignedDeveloper: p.assignedDeveloper ? { ...p.assignedDeveloper, _id: p.assignedDeveloper.id } : null,
      student: p.student ? { ...p.student, _id: p.student.id } : null,
    };
  });

  res.json(formattedProjects);
});

// @desc Delete project
// @route DELETE /api/admin/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const { data: project, error: fetchError } = await supabase
    .from('project_requests')
    .select('id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const { error: deleteError } = await supabase
    .from('project_requests')
    .delete()
    .eq('id', req.params.id);

  if (deleteError) throw deleteError;

  res.json({ message: 'Project removed' });
});

// @desc Get all payments
// @route GET /api/admin/payments
const getAllPayments = asyncHandler(async (req, res) => {
  const { data: payments, error } = await supabase
    .from('payments')
    .select('*, student:users!student_id(id, name, email), developer:users!developer_id(id, name, email), project:project_requests(id, title)')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedPayments = (payments || []).map((p) => {
    return {
      ...p,
      _id: p.id,
      project: p.project ? { ...p.project, _id: p.project.id } : null,
      student: p.student ? { ...p.student, _id: p.student.id } : null,
      developer: p.developer ? { ...p.developer, _id: p.developer.id } : null,
    };
  });

  res.json(formattedPayments);
});

// @desc Get all reviews
// @route GET /api/admin/reviews
const getAllReviews = asyncHandler(async (req, res) => {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(id, name, email, avatar), reviewee:users!reviewee_id(id, name, email, avatar), project:project_requests(id, title)')
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedReviews = (reviews || []).map((r) => {
    return {
      ...r,
      _id: r.id,
      project: r.project ? { ...r.project, _id: r.project.id } : null,
      reviewer: r.reviewer ? { ...r.reviewer, _id: r.reviewer.id } : null,
      reviewee: r.reviewee ? { ...r.reviewee, _id: r.reviewee.id } : null,
    };
  });

  res.json(formattedReviews);
});

// @desc Delete review
// @route DELETE /api/admin/reviews/:id
const deleteReview = asyncHandler(async (req, res) => {
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('id')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchError || !review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const { error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .eq('id', req.params.id);

  if (deleteError) throw deleteError;

  res.json({ message: 'Review removed' });
});

// @desc Send global notification
// @route POST /api/admin/notifications
const sendGlobalNotification = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  const { data: users, error } = await supabase
    .from('users')
    .select('id')
    .neq('role', 'admin');

  if (error) {
    res.status(400);
    throw error;
  }

  const notifications = (users || []).map((user) => ({
    user_id: user.id,
    type: 'general',
    title,
    message,
  }));

  if (notifications.length > 0) {
    const { error: insertError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (insertError) throw insertError;
  }

  res.status(201).json({ message: `Notification sent to ${users.length} users` });
});

// @desc Process refund (approve/reject)
// @route PUT /api/admin/payments/:id/refund
const processRefund = asyncHandler(async (req, res) => {
  const { decision } = req.body; // 'approved' or 'rejected'

  const { data: payment, error: fetchPaymentError } = await supabase
    .from('payments')
    .select('*')
    .eq('id', req.params.id)
    .maybeSingle();

  if (fetchPaymentError || !payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.refund_status !== 'requested') {
    res.status(400);
    throw new Error('No active refund request for this payment');
  }

  const { data: project } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', payment.project_id)
    .maybeSingle();

  const previousDeveloper = payment.developer_id;

  if (decision === 'approved') {
    await supabase
      .from('payments')
      .update({
        status: 'refunded',
        refund_status: 'approved',
      })
      .eq('id', payment.id);

    // Reset project status to open, remove assigned developer, and clear isPaid/isSecondPaid flags
    if (project) {
      await supabase
        .from('project_requests')
        .update({
          status: 'open',
          is_paid: false,
          is_second_paid: false,
          is_payment_released: false,
          assigned_developer_id: null,
          selected_bid_id: null,
        })
        .eq('id', project.id);

      // Reset bids status:
      // Mark all bids for this project to 'pending'
      await supabase
        .from('bids')
        .update({ status: 'pending' })
        .eq('project_id', project.id);

      // Mark the refunded developer's bid as 'rejected'
      await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('project_id', project.id)
        .eq('developer_id', payment.developer_id);
    }

    // Update the previous developer's stats (as they are no longer assigned and payment is refunded)
    if (previousDeveloper) {
      const { updateDeveloperStats } = require('../utils/developerStats');
      await updateDeveloperStats(previousDeveloper);
    }

    // Update student stats
    if (project && project.student_id) {
      const { updateStudentStats } = require('../utils/developerStats');
      await updateStudentStats(project.student_id);
    }

    // Notify the developer about the cancellation/refund
    if (previousDeveloper) {
      await supabase
        .from('notifications')
        .insert({
          user_id: previousDeveloper,
          type: 'payment',
          title: 'Project Assignment Cancelled ⚠️',
          message: `The escrow payment of ₹${payment.amount.toLocaleString()} for "${project?.title || 'Project'}" has been refunded, and the project has been reopened.`,
          link: '/developer/browse',
          related_id: payment.project_id,
        });
    }
  } else if (decision === 'rejected') {
    await supabase
      .from('payments')
      .update({ refund_status: 'rejected' })
      .eq('id', payment.id);
  } else {
    res.status(400);
    throw new Error('Invalid refund decision');
  }

  // Create notification for student
  await supabase
    .from('notifications')
    .insert({
      user_id: payment.student_id,
      type: 'payment',
      title: decision === 'approved' ? 'Refund Processed Successfully 💸' : 'Refund Request Rejected ❌',
      message: decision === 'approved'
        ? `Your refund of ₹${payment.amount.toLocaleString()} for the project "${project?.title || 'Project'}" has been approved and processed back to your original payment method.`
        : `Your refund request of ₹${payment.amount.toLocaleString()} for the project "${project?.title || 'Project'}" was rejected.`,
      link: '/student/payments',
      related_id: payment.project_id,
    });

  // Fetch updated payment to return
  const { data: updatedPayment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', payment.id)
    .single();

  updatedPayment._id = updatedPayment.id;
  res.json({ message: `Refund request ${decision}`, payment: updatedPayment });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  createDeveloper,
  updateDeveloper,
  developerSetPassword,
  updateUserStatus,
  deleteUser,
  getAllProjects,
  deleteProject,
  getAllPayments,
  getAllReviews,
  deleteReview,
  sendGlobalNotification,
  processRefund,
};
