const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/db');

// @desc Submit a review
// @route POST /api/reviews
const submitReview = asyncHandler(async (req, res) => {
  const { projectId, revieweeId, rating, comment, tags } = req.body;

  const { data: project, error: projectError } = await supabase
    .from('project_requests')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (projectError || !project || project.status !== 'completed') {
    res.status(400);
    throw new Error('Project must be completed before reviewing');
  }

  const { data: existing, error: existError } = await supabase
    .from('reviews')
    .select('id')
    .eq('project_id', projectId)
    .eq('reviewer_id', req.user.id)
    .maybeSingle();

  if (existError) throw existError;

  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this project');
  }

  const { data: review, error: createError } = await supabase
    .from('reviews')
    .insert({
      project_id: projectId,
      reviewer_id: req.user.id,
      reviewee_id: revieweeId,
      rating: Number(rating),
      comment,
      tags: tags || [],
    })
    .select()
    .single();

  if (createError) {
    res.status(400);
    throw createError;
  }

  // Update reviewee's average rating
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewee_id', revieweeId);

  if (reviewsError) throw reviewsError;

  const totalReviews = reviews.length;
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews;
  const roundedRating = Math.round(avgRating * 10) / 10;

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({
      rating: roundedRating,
      total_reviews: totalReviews,
    })
    .eq('id', revieweeId);

  if (userUpdateError) throw userUpdateError;

  // Notify reviewee
  await supabase
    .from('notifications')
    .insert({
      user_id: revieweeId,
      type: 'review',
      title: 'New Review Received ⭐',
      message: `You received a ${rating}-star review!`,
      related_id: review.id,
    });

  const { data: populated, error: popError } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(id, name, avatar), reviewee:users!reviewee_id(id, name, avatar)')
    .eq('id', review.id)
    .single();

  if (popError) throw popError;

  const formatted = {
    ...populated,
    _id: populated.id,
    project: populated.project_id,
    reviewer: populated.reviewer ? { ...populated.reviewer, _id: populated.reviewer.id } : null,
    reviewee: populated.reviewee ? { ...populated.reviewee, _id: populated.reviewee.id } : null,
  };

  res.status(201).json(formatted);
});

// @desc Get reviews for a developer
// @route GET /api/reviews/developer/:id
const getDeveloperReviews = asyncHandler(async (req, res) => {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('*, reviewer:users!reviewer_id(id, name, avatar, role), project:project_requests(id, title)')
    .eq('reviewee_id', req.params.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formatted = (reviews || []).map((r) => {
    return {
      ...r,
      _id: r.id,
      project: r.project ? { ...r.project, _id: r.project.id } : null,
      reviewer: r.reviewer ? { ...r.reviewer, _id: r.reviewer.id } : null,
    };
  });

  res.json(formatted);
});

module.exports = { submitReview, getDeveloperReviews };
