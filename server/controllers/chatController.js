const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/db');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc Get all chats for current user
// @route GET /api/chats
const getChats = asyncHandler(async (req, res) => {
  let queryBuilder = supabase
    .from('chats')
    .select(`
      *,
      project:project_requests(id, title, status),
      student:users!student_id(id, name, avatar, is_online),
      developer:users!developer_id(id, name, avatar, is_online),
      lastMessage:messages!last_message_id(id, content, type, file_url, file_name, created_at, sender_id)
    `);

  if (req.user.role === 'student') {
    queryBuilder = queryBuilder.eq('student_id', req.user.id);
  } else {
    queryBuilder = queryBuilder.eq('developer_id', req.user.id);
  }

  const { data: chats, error } = await queryBuilder.order('last_message_at', { ascending: false });

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedChats = (chats || []).map((c) => {
    return {
      ...c,
      _id: c.id,
      project: c.project ? { ...c.project, _id: c.project.id } : null,
      student: c.student ? { ...c.student, _id: c.student.id, isOnline: c.student.is_online } : null,
      developer: c.developer ? { ...c.developer, _id: c.developer.id, isOnline: c.developer.is_online } : null,
      lastMessage: c.lastMessage
        ? {
            ...c.lastMessage,
            _id: c.lastMessage.id,
            sender: c.lastMessage.sender_id,
          }
        : null,
      lastMessageAt: c.last_message_at,
      unreadStudent: c.unread_student,
      unreadDeveloper: c.unread_developer,
    };
  });

  res.json(formattedChats);
});

// @desc Get messages for a chat
// @route GET /api/chats/:chatId/messages
const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const from = (Number(page) - 1) * Number(limit);
  const to = from + Number(limit) - 1;

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*, sender:users(id, name, avatar, role)')
    .eq('chat_id', req.params.chatId)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    res.status(400);
    throw error;
  }

  const formattedMessages = (messages || []).map((m) => {
    return {
      ...m,
      _id: m.id,
      chat: m.chat_id,
      fileUrl: m.file_url,
      fileName: m.file_name,
      filePublicId: m.file_public_id,
      isEdited: m.is_edited,
      sender: m.sender ? { ...m.sender, _id: m.sender.id } : null,
    };
  });

  res.json(formattedMessages.reverse());
});

// @desc Send a message (REST fallback)
// @route POST /api/chats/:chatId/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'text' } = req.body;

  const { data: chat, error: fetchChatError } = await supabase
    .from('chats')
    .select('*')
    .eq('id', req.params.chatId)
    .maybeSingle();

  if (fetchChatError || !chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const recipientId =
    chat.student_id === req.user.id
      ? chat.developer_id
      : chat.student_id;

  const { onlineUsers } = require('../socket/socketHandler');
  const isOnline = onlineUsers && onlineUsers.has(recipientId);

  let fileUrl = '';
  let fileName = '';
  let filePublicId = '';

  if (req.file) {
    const resourceType = req.file.mimetype.startsWith('image/') ? 'image' : 'raw';
    const result = await uploadToCloudinary(req.file.buffer, 'chat-files', resourceType, req.file.originalname);
    fileUrl = result.secure_url;
    fileName = req.file.originalname;
    filePublicId = result.public_id;
  }

  const { data: message, error: createError } = await supabase
    .from('messages')
    .insert({
      chat_id: req.params.chatId,
      sender_id: req.user.id,
      content,
      type: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'file') : type,
      file_url: fileUrl,
      file_name: fileName,
      file_public_id: filePublicId,
      delivered: isOnline,
      delivered_at: isOnline ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (createError) {
    res.status(400);
    throw createError;
  }

  await supabase
    .from('chats')
    .update({
      last_message_id: message.id,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', req.params.chatId);

  const { data: populated, error: popError } = await supabase
    .from('messages')
    .select('*, sender:users(id, name, avatar, role)')
    .eq('id', message.id)
    .single();

  if (popError) throw popError;

  const formatted = {
    ...populated,
    _id: populated.id,
    chat: populated.chat_id,
    fileUrl: populated.file_url,
    fileName: populated.file_name,
    filePublicId: populated.file_public_id,
    sender: populated.sender ? { ...populated.sender, _id: populated.sender.id } : null,
  };

  res.status(201).json(formatted);
});

// @desc Mark messages as seen
// @route PUT /api/chats/:chatId/seen
const markSeen = asyncHandler(async (req, res) => {
  const { error } = await supabase
    .from('messages')
    .update({
      seen: true,
      seen_at: new Date().toISOString(),
      delivered: true,
      delivered_at: new Date().toISOString(),
    })
    .eq('chat_id', req.params.chatId)
    .neq('sender_id', req.user.id)
    .eq('seen', false);

  if (error) {
    res.status(400);
    throw error;
  }

  res.json({ message: 'Messages marked as seen' });
});

// @desc Edit a message
// @route PUT /api/chats/:chatId/messages/:messageId
const editMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { messageId } = req.params;

  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .maybeSingle();

  if (fetchError || !message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.sender_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to edit this message');
  }

  // If the receiver has already seen it, edit is allowed only within 3 minutes of seen_at
  if (message.seen && message.seen_at) {
    const elapsed = Date.now() - new Date(message.seen_at).getTime();
    if (elapsed > 3 * 60 * 1000) {
      res.status(400);
      throw new Error('Cannot edit message. 3 minutes have passed since it was read');
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from('messages')
    .update({
      content,
      is_edited: true,
    })
    .eq('id', messageId)
    .select('*, sender:users(id, name, avatar, role)')
    .single();

  if (updateError) {
    res.status(400);
    throw updateError;
  }

  const formatted = {
    ...updated,
    _id: updated.id,
    chat: updated.chat_id,
    isEdited: updated.is_edited,
    sender: updated.sender ? { ...updated.sender, _id: updated.sender.id } : null,
  };

  res.json(formatted);
});

// @desc Delete a message
// @route DELETE /api/chats/:chatId/messages/:messageId
const deleteMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;

  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .maybeSingle();

  if (fetchError || !message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.sender_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }

  const { error: deleteError } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId);

  if (deleteError) {
    res.status(400);
    throw deleteError;
  }

  // Update last message in Chat if needed
  const { data: chat } = await supabase
    .from('chats')
    .select('*')
    .eq('id', chatId)
    .maybeSingle();

  if (chat && chat.last_message_id === messageId) {
    const { data: prevMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(1);

    const prevMessage = prevMessages && prevMessages[0];

    await supabase
      .from('chats')
      .update({
        last_message_id: prevMessage ? prevMessage.id : null,
        last_message_at: prevMessage ? prevMessage.created_at : chat.created_at,
      })
      .eq('id', chatId);
  }

  res.json({ messageId, message: 'Message deleted successfully' });
});

module.exports = { getChats, getMessages, sendMessage, markSeen, editMessage, deleteMessage };
