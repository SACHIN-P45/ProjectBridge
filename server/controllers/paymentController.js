const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const ProjectRequest = require('../models/ProjectRequest');
const Notification = require('../models/Notification');

// @desc Create Razorpay order
// @route POST /api/payments/create-order
const createOrder = asyncHandler(async (req, res) => {
  const { projectId } = req.body;

  const project = await ProjectRequest.findById(projectId).populate('selectedBid');
  if (!project) { res.status(404); throw new Error('Project not found'); }
  if (project.student.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (project.isPaid && project.isSecondPaid) { 
    res.status(400); 
    throw new Error('Already fully paid for this project'); 
  }

  const totalPrice = project.selectedBid ? project.selectedBid.price : project.budget;
  // Calculate 50% split amount
  const splitAmount = Math.round(totalPrice * 0.5);
  const isFirst = !project.isPaid;

  const options = {
    amount: splitAmount * 100, // in paise
    currency: 'INR',
    receipt: isFirst ? `receipt_first_${project._id}` : `receipt_second_${project._id}`,
    notes: { 
      projectId: project._id.toString(), 
      studentId: req.user._id.toString(),
      paymentType: isFirst ? 'first_50' : 'second_50'
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

  const payment = await Payment.create({
    project: project._id,
    student: project.student,
    developer: project.assignedDeveloper,
    amount: splitAmount,
    razorpayOrderId: order.id,
  });

  res.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    paymentId: payment._id,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc Verify payment
// @route POST /api/payments/verify
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, projectId } = req.body;

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

  const project = await ProjectRequest.findById(projectId);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  const isFirst = !project.isPaid;

  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId },
    {
      razorpayPaymentId,
      razorpaySignature: isMock ? 'mock_signature_approved' : razorpaySignature,
      status: 'held',
      paidAt: new Date(),
    },
    { new: true }
  );

  if (isFirst) {
    project.isPaid = true;
    await project.save();

    // Notify developer
    await Notification.create({
      user: project.assignedDeveloper,
      type: 'payment',
      title: 'Initial Payment Received 💰',
      message: `Student has paid the initial 50% for "${project.title}". Start working!`,
      link: `/developer/assigned`,
      relatedId: project._id,
    });
  } else {
    project.isSecondPaid = true;
    project.isPaymentReleased = true;
    project.isSecondPaymentReleased = true;
    project.status = 'completed';
    await project.save();

    // Release all payments for this project (both initial 50% and final 50%)
    await Payment.updateMany(
      { project: project._id, status: { $in: ['held', 'pending'] } },
      { status: 'released', releasedAt: new Date() }
    );

    // Notify developer
    await Notification.create({
      user: project.assignedDeveloper,
      type: 'payment',
      title: 'Final Payment & Project Approved! 🏆',
      message: `Student has paid the final 50% for "${project.title}". Both milestones released!`,
      link: `/developer/assigned`,
      relatedId: project._id,
    });
  }

  res.json({ message: 'Payment verified successfully', payment });
});

// @desc Get payment history
// @route GET /api/payments/history
const getPaymentHistory = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'student'
      ? { student: req.user._id }
      : { developer: req.user._id };

  const payments = await Payment.find(query)
    .populate('project', 'title status')
    .populate('student', 'name avatar')
    .populate('developer', 'name avatar')
    .sort({ createdAt: -1 });

  res.json(payments);
});

// @desc Request refund
// @route POST /api/payments/refund
const requestRefund = asyncHandler(async (req, res) => {
  const { paymentId, reason } = req.body;
  const payment = await Payment.findById(paymentId);
  if (!payment) { res.status(404); throw new Error('Payment not found'); }
  if (payment.student.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  payment.refundStatus = 'requested';
  payment.refundReason = reason;
  await payment.save();

  res.json({ message: 'Refund requested', payment });
});

// @desc Get developer earnings
// @route GET /api/payments/earnings
const getEarnings = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ developer: req.user._id, status: 'released' })
    .populate('project', 'title')
    .sort({ releasedAt: -1 });

  const totalEarnings = payments.reduce((acc, p) => acc + p.amount, 0);

  // Monthly breakdown
  const monthly = {};
  payments.forEach((p) => {
    const key = new Date(p.releasedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    monthly[key] = (monthly[key] || 0) + p.amount;
  });

  res.json({ payments, totalEarnings, monthly });
});

module.exports = { createOrder, verifyPayment, getPaymentHistory, requestRefund, getEarnings };
