const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');

// @desc Get user notifications
// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  res.json({ notifications, unread });
});

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ message: 'Marked as read' });
});

// @desc Mark all as read
// @route PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  res.json({ message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markRead, markAllRead };
