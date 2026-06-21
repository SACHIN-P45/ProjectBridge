const asyncHandler = require('express-async-handler');
const Chat = require('../models/Chat');
const Message = require('../models/Message');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');

// @desc Get all chats for current user
// @route GET /api/chats
const getChats = asyncHandler(async (req, res) => {
  const query =
    req.user.role === 'student'
      ? { student: req.user._id }
      : { developer: req.user._id };

  const chats = await Chat.find(query)
    .populate('project', 'title status')
    .populate('student', 'name avatar isOnline')
    .populate('developer', 'name avatar isOnline')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

  res.json(chats);
});

// @desc Get messages for a chat
// @route GET /api/chats/:chatId/messages
const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const messages = await Message.find({ chat: req.params.chatId })
    .populate('sender', 'name avatar role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  res.json(messages.reverse());
});

// @desc Send a message (REST fallback)
// @route POST /api/chats/:chatId/messages
const sendMessage = asyncHandler(async (req, res) => {
  const { content, type = 'text' } = req.body;

  const chat = await Chat.findById(req.params.chatId);
  if (!chat) {
    res.status(404);
    throw new Error('Chat not found');
  }

  const recipientId =
    chat.student.toString() === req.user._id.toString()
      ? chat.developer.toString()
      : chat.student.toString();

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

  const message = await Message.create({
    chat: req.params.chatId,
    sender: req.user._id,
    content,
    type: req.file ? (req.file.mimetype.startsWith('image/') ? 'image' : 'file') : type,
    fileUrl,
    fileName,
    filePublicId,
    delivered: isOnline,
    deliveredAt: isOnline ? new Date() : null,
  });

  await Chat.findByIdAndUpdate(req.params.chatId, {
    lastMessage: message._id,
    lastMessageAt: new Date(),
  });

  const populated = await message.populate('sender', 'name avatar role');
  res.status(201).json(populated);
});

// @desc Mark messages as seen
// @route PUT /api/chats/:chatId/seen
const markSeen = asyncHandler(async (req, res) => {
  await Message.updateMany(
    { chat: req.params.chatId, sender: { $ne: req.user._id }, seen: false },
    { seen: true, seenAt: new Date(), delivered: true, deliveredAt: new Date() }
  );
  res.json({ message: 'Messages marked as seen' });
});

// @desc Edit a message
// @route PUT /api/chats/:chatId/messages/:messageId
const editMessage = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { chatId, messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to edit this message');
  }

  // If the receiver has already seen it, edit is allowed only within 3 minutes of seenAt
  if (message.seen && message.seenAt) {
    const elapsed = Date.now() - new Date(message.seenAt).getTime();
    if (elapsed > 3 * 60 * 1000) {
      res.status(400);
      throw new Error('Cannot edit message. 3 minutes have passed since it was read');
    }
  }

  message.content = content;
  message.isEdited = true;
  await message.save();

  const populated = await message.populate('sender', 'name avatar role');
  res.json(populated);
});

// @desc Delete a message
// @route DELETE /api/chats/:chatId/messages/:messageId
const deleteMessage = asyncHandler(async (req, res) => {
  const { chatId, messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to delete this message');
  }

  await Message.findByIdAndDelete(messageId);

  // Update last message in Chat if needed
  const chat = await Chat.findById(chatId);
  if (chat && chat.lastMessage?.toString() === messageId) {
    const prevMessage = await Message.findOne({ chat: chatId }).sort({ createdAt: -1 });
    chat.lastMessage = prevMessage ? prevMessage._id : null;
    chat.lastMessageAt = prevMessage ? prevMessage.createdAt : chat.createdAt;
    await chat.save();
  }

  res.json({ messageId, message: 'Message deleted successfully' });
});

module.exports = { getChats, getMessages, sendMessage, markSeen, editMessage, deleteMessage };
