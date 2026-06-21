const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest', required: true },
    developer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true },
    deliveryDays: { type: Number, required: true },
    proposal: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

bidSchema.index({ project: 1, developer: 1 }, { unique: true });

module.exports = mongoose.model('Bid', bidSchema);
