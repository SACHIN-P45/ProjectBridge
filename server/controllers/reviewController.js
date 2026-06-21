const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const User = require('../models/User');
const ProjectRequest = require('../models/ProjectRequest');
const Notification = require('../models/Notification');

// @desc Submit a review
// @route POST /api/reviews
const submitReview = asyncHandler(async (req, res) => {
  const { projectId, revieweeId, rating, comment, tags } = req.body;

  const project = await ProjectRequest.findById(projectId);
  if (!project || project.status !== 'completed') {
    res.status(400);
    throw new Error('Project must be completed before reviewing');
  }

  const existing = await Review.findOne({ project: projectId, reviewer: req.user._id });
  if (existing) { res.status(400); throw new Error('You have already reviewed this project'); }

  const review = await Review.create({
    project: projectId,
    reviewer: req.user._id,
    reviewee: revieweeId,
    rating: Number(rating),
    comment,
    tags: tags || [],
  });

  // Update reviewee's average rating
  const reviews = await Review.find({ reviewee: revieweeId });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await User.findByIdAndUpdate(revieweeId, {
    rating: Math.round(avgRating * 10) / 10,
    totalReviews: reviews.length,
  });

  // Notify reviewee
  await Notification.create({
    user: revieweeId,
    type: 'review',
    title: 'New Review Received ⭐',
    message: `You received a ${rating}-star review!`,
    relatedId: review._id,
  });

  const populated = await review.populate(['reviewer', 'reviewee']);
  res.status(201).json(populated);
});

// @desc Get reviews for a developer
// @route GET /api/reviews/developer/:id
const getDeveloperReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ reviewee: req.params.id })
    .populate('reviewer', 'name avatar role')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
  res.json(reviews);
});

module.exports = { submitReview, getDeveloperReviews };
