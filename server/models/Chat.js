const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
    lastMessageAt: { type: Date, default: Date.now },
    unreadStudent: { type: Number, default: 0 },
    unreadDeveloper: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chatSchema.index({ project: 1 }, { unique: true });

module.exports = mongoose.model('Chat', chatSchema);
