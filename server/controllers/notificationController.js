const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/db');

// @desc Get user notifications
// @route GET /api/notifications
const getNotifications = asyncHandler(async (req, res) => {
  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    res.status(400);
    throw error;
  }

  const { count: unread, error: countError } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (countError) throw countError;

  const formatted = (notifications || []).map((n) => {
    return {
      ...n,
      _id: n.id,
      user: n.user_id,
      isRead: n.is_read,
      relatedId: n.related_id,
    };
  });

  res.json({ notifications: formatted, unread: unread || 0 });
});

// @desc Mark notification as read
// @route PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id);

  if (error) {
    res.status(400);
    throw error;
  }

  res.json({ message: 'Marked as read' });
});

// @desc Mark all as read
// @route PUT /api/notifications/read-all
const markAllRead = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', req.user.id)
    .eq('is_read', false);

  if (error) {
    res.status(400);
    throw error;
  }

  res.json({ message: 'All notifications marked as read' });
});

module.exports = { getNotifications, markRead, markAllRead };
