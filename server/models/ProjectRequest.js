const mongoose = require('mongoose');

const projectRequestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    techStack: [{ type: String }],
    budget: { type: Number, required: true },
    deadline: { type: Date, required: true },
    attachments: [
      {
        url: String,
        publicId: String,
        originalName: String,
        fileType: String,
      },
    ],
    status: {
      type: String,
      enum: ['open', 'in-progress', 'testing', 'delivered', 'completed', 'cancelled'],
      default: 'open',
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedDeveloper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    selectedBid: { type: mongoose.Schema.Types.ObjectId, ref: 'Bid', default: null },
    githubRepo: { type: String, default: '' },
    liveUrl: { type: String, default: '' },
    sourceCodeUrl: { type: String, default: '' },
    sourceCodePublicId: { type: String, default: '' },
    isPaid: { type: Boolean, default: false },
    isPaymentReleased: { type: Boolean, default: false },
    isSecondPaid: { type: Boolean, default: false },
    isSecondPaymentReleased: { type: Boolean, default: false },
    category: {
      type: String,
      enum: ['web', 'mobile', 'ml', 'data-science', 'blockchain', 'iot', 'other'],
      default: 'web',
    },
    progressUpdates: [
      {
        message: String,
        timestamp: { type: Date, default: Date.now },
        attachmentUrl: String,
      },
    ],
    bidCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

projectRequestSchema.index({ status: 1, createdAt: -1 });
projectRequestSchema.index({ student: 1 });
projectRequestSchema.index({ assignedDeveloper: 1 });

module.exports = mongoose.model('ProjectRequest', projectRequestSchema);
