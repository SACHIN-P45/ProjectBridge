const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'held', 'released', 'refunded', 'failed'],
      default: 'pending',
    },
    refundStatus: {
      type: String,
      enum: ['none', 'requested', 'approved', 'rejected'],
      default: 'none',
    },
    refundReason: { type: String, default: '' },
    paidAt: { type: Date, default: null },
    releasedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
