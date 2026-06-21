const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['bid', 'bid_accepted', 'payment', 'message', 'project_update', 'review', 'general'],
      default: 'general',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
    relatedId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
