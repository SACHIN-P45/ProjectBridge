const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'ProjectRequest', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

reviewSchema.index({ project: 1, reviewer: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
