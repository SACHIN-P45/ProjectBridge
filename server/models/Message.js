const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, default: '' },
    type: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text',
    },
    fileUrl: { type: String, default: '' },
    fileName: { type: String, default: '' },
    filePublicId: { type: String, default: '' },
    delivered: { type: Boolean, default: false },
    deliveredAt: { type: Date, default: null },
    seen: { type: Boolean, default: false },
    seenAt: { type: Date, default: null },
    isEdited: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.index({ chat: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
