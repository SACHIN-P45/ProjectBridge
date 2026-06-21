const asyncHandler = require('express-async-handler');
const Bid = require('../models/Bid');
const ProjectRequest = require('../models/ProjectRequest');
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');

// @desc Submit a bid
// @route POST /api/bids
const submitBid = asyncHandler(async (req, res) => {
  const { projectId, price, deliveryDays, proposal } = req.body;

  const project = await ProjectRequest.findById(projectId);
  if (!project || project.status !== 'open') {
    res.status(400);
    throw new Error('Project is not open for bids');
  }

  const existingBid = await Bid.findOne({ project: projectId, developer: req.user._id });
  if (existingBid) {
    res.status(400);
    throw new Error('You have already submitted a bid for this project');
  }

  const bid = await Bid.create({
    project: projectId,
    developer: req.user._id,
    price: Number(price),
    deliveryDays: Number(deliveryDays),
    proposal,
  });

  // Increment bid count
  await ProjectRequest.findByIdAndUpdate(projectId, { $inc: { bidCount: 1 } });

  // Notify student
  await Notification.create({
    user: project.student,
    type: 'bid',
    title: 'New Quotation Received',
    message: `A developer submitted a quotation for "${project.title}"`,
    link: `/student/projects/${projectId}`,
    relatedId: bid._id,
  });

  const populated = await bid.populate('developer', 'name avatar skills rating completedProjects');
  res.status(201).json(populated);
});

// @desc Get bids for a project
// @route GET /api/bids/project/:projectId
const getProjectBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ project: req.params.projectId })
    .populate('developer', 'name avatar skills rating totalReviews completedProjects githubUrl portfolioUrl bio')
    .sort({ createdAt: -1 });
  res.json(bids);
});

// @desc Accept a bid
// @route PUT /api/bids/:id/accept
const acceptBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id).populate('developer');
  if (!bid) {
    res.status(404);
    throw new Error('Bid not found');
  }

  const project = await ProjectRequest.findById(bid.project);
  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }
  if (project.student.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Accept this bid
  bid.status = 'accepted';
  await bid.save();

  // Reject all other bids
  await Bid.updateMany(
    { project: bid.project, _id: { $ne: bid._id } },
    { status: 'rejected' }
  );

  // Update project
  project.status = 'in-progress';
  project.assignedDeveloper = bid.developer._id;
  project.selectedBid = bid._id;
  await project.save();

  // Create chat room
  await Chat.findOneAndUpdate(
    { project: project._id },
    { project: project._id, student: project.student, developer: bid.developer._id },
    { upsert: true, new: true }
  );

  // Notify developer
  await Notification.create({
    user: bid.developer._id,
    type: 'bid_accepted',
    title: 'Your Bid Was Accepted! 🎉',
    message: `Your bid on "${project.title}" was accepted. Check your messages!`,
    link: `/developer/assigned`,
    relatedId: project._id,
  });

  res.json({ message: 'Bid accepted successfully', bid, project });
});

// @desc Get developer's own bids
// @route GET /api/bids/my
const getMyBids = asyncHandler(async (req, res) => {
  const bids = await Bid.find({ developer: req.user._id })
    .populate('project', 'title status budget deadline student techStack category')
    .populate({ path: 'project', populate: { path: 'student', select: 'name avatar' } })
    .sort({ createdAt: -1 });
  res.json(bids);
});

// @desc Update bid
// @route PUT /api/bids/:id
const updateBid = asyncHandler(async (req, res) => {
  const bid = await Bid.findById(req.params.id);
  if (!bid) { res.status(404); throw new Error('Bid not found'); }
  if (bid.developer.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  if (bid.status !== 'pending') {
    res.status(400); throw new Error('Cannot update a bid that is already processed');
  }
  const { price, deliveryDays, proposal } = req.body;
  if (price) bid.price = price;
  if (deliveryDays) bid.deliveryDays = deliveryDays;
  if (proposal) bid.proposal = proposal;
  await bid.save();
  res.json(bid);
});

module.exports = { submitBid, getProjectBids, acceptBid, getMyBids, updateBid };
