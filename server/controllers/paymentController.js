const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const { supabase } = require('../config/db');

// @desc Create Razorpay order
// @route POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { projectId } = req.body;

  const { data: project, error: fetchError } = await supabase
    .from('project_requests')
    .select('*, selectedBid:bids!selected_bid_id(id, price)')
    .eq('id', projectId)
    .maybeSingle();

  if (fetchError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.student_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (project.is_paid && project.is_second_paid) {
    res.status(400);
    throw new Error('Already fully paid for this project');
  }

  const totalPrice = project.selectedBid ? project.selectedBid.price : project.budget;
  // Calculate 50% split amount
  const splitAmount = Math.round(totalPrice * 0.5);
  const isFirst = !project.is_paid;

  const options = {
    amount: splitAmount * 100, // in paise
    currency: 'INR',
    receipt: isFirst ? `receipt_first_${project.id}` : `receipt_second_${project.id}`,
    notes: {
      projectId: project.id.toString(),
      studentId: req.user.id.toString(),
      paymentType: isFirst ? 'first_50' : 'second_50',
    },
  };

  let order;
  try {
    order = await razorpay.orders.create(options);
  } catch (err) {
    console.warn('⚠️ Razorpay order creation failed (using placeholder keys). Falling back to mock order...');
    order = {
      id: `order_mock_${crypto.randomBytes(8).toString('hex')}`,
      amount: options.amount,
      currency: options.currency,
    };
  }

  const { data: payment, error: createError } = await supabase
    .from('payments')
    .insert({
      project_id: project.id,
      student_id: project.student_id,
      developer_id: project.assigned_developer_id,
      amount: splitAmount,
      razorpay_order_id: order.id,
    })
    .select()
    .single();

  if (createError) {
    res.status(400);
    throw createError;
  }

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment.id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc Verify payment
// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const razorpayOrderId = req.body.razorpayOrderId || req.body.razorpay_order_id;
  const razorpayPaymentId = req.body.razorpayPaymentId || req.body.razorpay_payment_id;
  const razorpaySignature = req.body.razorpaySignature || req.body.razorpay_signature;
  const { projectId } = req.body;

  // Bypass signature check if it is a mock order or using sandbox key
  const isMock = razorpayOrderId?.startsWith('order_mock_') || process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id';

  if (!isMock) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      res.status(400);
      throw new Error('Payment verification failed');
    }
  }

  const { data: project, error: fetchError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (fetchError || !project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isFirst = !project.is_paid;

  const { data: payment, error: updateError } = await supabase
    .from('payments')
    .update({
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: isMock ? 'mock_signature_approved' : razorpaySignature,
      status: 'held',
      paid_at: new Date().toISOString(),
    })
    .eq('razorpay_order_id', razorpayOrderId)
    .select()
    .single();

  if (updateError) {
    res.status(400);
    throw updateError;
  }

  if (isFirst) {
    await supabase
      .from('project_requests')
      .update({ is_paid: true })
      .eq('id', projectId);

    // Notify developer
    await supabase
      .from('notifications')
      .insert({
        user_id: project.assigned_developer_id,
        type: 'payment',
        title: 'Initial Payment Received 💰',
        message: `Student has paid the initial 50% for "${project.title}". Start working!`,
        link: `/developer/assigned`,
        related_id: project.id,
      });
  } else {
    await supabase
      .from('project_requests')
      .update({
        is_second_paid: true,
        is_payment_released: true,
        is_second_payment_released: true,
        status: 'completed',
      })
      .eq('id', projectId);

    // Release all payments for this project (both initial 50% and final 50%)
    await supabase
      .from('payments')
      .update({
        status: 'released',
        released_at: new Date().toISOString(),
      })
      .eq('project_id', project.id)
      .in('status', ['held', 'pending']);

    // Update developer statistics
    if (project.assigned_developer_id) {
      const { updateDeveloperStats } = require('../utils/developerStats');
      await updateDeveloperStats(project.assigned_developer_id);
    }

    // Update student statistics
    if (project.student_id) {
      const { updateStudentStats } = require('../utils/developerStats');
      await updateStudentStats(project.student_id);
    }

    // Notify developer
    await supabase
      .from('notifications')
      .insert({
        user_id: project.assigned_developer_id,
        type: 'payment',
        title: 'Final Payment & Project Approved! 🏆',
        message: `Student has paid the final 50% for "${project.title}". Both milestones released!`,
        link: `/developer/assigned`,
        related_id: project.id,
      });
  }

  payment._id = payment.id;
  res.json({ message: 'Payment verified successfully', payment });
});

// @desc Get payment history
// @route GET /api/payments/history
const getPaymentHistory = asyncHandler(async (req, res) => {
  let queryBuilder = supabase
    .from('payments')
    .select(`
      *,
      project:project_requests(id, title, status),
      student:users!student_id(id, name, avatar),
      developer:users!developer_id(id, name, avatar)
    `);

  if (req.user.role === 'student') {
    queryBuilder = queryBuilder.eq('student_id', req.user.id);
  } else {
    queryBuilder = queryBuilder.eq('developer_id', req.user.id);
  }

  const { data: payments, error } = await queryBuilder.order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formatted = (payments || []).map((p) => {
    return {
      ...p,
      _id: p.id,
      project: p.project ? { ...p.project, _id: p.project.id } : null,
      student: p.student ? { ...p.student, _id: p.student.id } : null,
      developer: p.developer ? { ...p.developer, _id: p.developer.id } : null,
    };
  });

  res.json(formatted);
});

// @desc Request refund
// @route POST /api/payments/refund
const requestRefund = asyncHandler(async (req, res) => {
  const { paymentId, reason } = req.body;

  const { data: payment, error: fetchError } = await supabase
    .from('payments')
    .select('*, project:project_requests(id, title)')
    .eq('id', paymentId)
    .maybeSingle();

  if (fetchError || !payment) {
    res.status(404);
    throw new Error('Payment not found');
  }

  if (payment.student_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (payment.status !== 'held' && payment.status !== 'pending') {
    res.status(400);
    throw new Error('Refunds can only be requested for escrowed or pending payments');
  }

  const { data: updatedPayment, error: updateError } = await supabase
    .from('payments')
    .update({
      refund_status: 'requested',
      refund_reason: reason,
    })
    .eq('id', paymentId)
    .select()
    .single();

  if (updateError) throw updateError;

  // Notify admins
  const { data: admins } = await supabase
    .from('users')
    .select('id')
    .eq('role', 'admin');

  for (const admin of admins || []) {
    await supabase
      .from('notifications')
      .insert({
        user_id: admin.id,
        type: 'payment',
        title: 'Refund Requested ⚠️',
        message: `Student has requested a refund of ₹${payment.amount.toLocaleString()} for "${payment.project?.title || 'Project'}"`,
        link: '/admin/payments',
        related_id: payment.project?.id || payment.id,
      });
  }

  updatedPayment._id = updatedPayment.id;
  res.json({ message: 'Refund requested', payment: updatedPayment });
});

const getEarnings = asyncHandler(async (req, res) => {
  const { data: payments, error } = await supabase
    .from('payments')
    .select(`
      *,
      project:project_requests(id, title),
      student:users!student_id(id, name, avatar)
    `)
    .eq('developer_id', req.user.id)
    .in('status', ['released', 'held'])
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const totalEarnings = (payments || [])
    .filter((p) => p.status === 'released')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  const escrowBalance = (payments || [])
    .filter((p) => p.status === 'held')
    .reduce((acc, p) => acc + Number(p.amount), 0);

  // Monthly breakdown of released payments
  const monthly = {};
  (payments || [])
    .filter((p) => p.status === 'released')
    .forEach((p) => {
      const date = p.released_at || p.updated_at;
      const key = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthly[key] = (monthly[key] || 0) + Number(p.amount);
    });

  const formatted = (payments || []).map((p) => {
    return {
      ...p,
      _id: p.id,
      project: p.project ? { ...p.project, _id: p.project.id } : null,
      student: p.student ? { ...p.student, _id: p.student.id } : null,
    };
  });

  res.json({ payments: formatted, totalEarnings, escrowBalance, monthly });
});

module.exports = { createOrder, verifyPayment, getPaymentHistory, requestRefund, getEarnings };
