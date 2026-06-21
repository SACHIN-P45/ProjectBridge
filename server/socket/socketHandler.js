const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    // User comes online
    socket.on('user_online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;
      await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });

      // Update all messages where recipient is this user to delivered = true
      try {
        const userChats = await Chat.find({ $or: [{ student: userId }, { developer: userId }] });
        const chatIds = userChats.map(c => c._id);
        
        await Message.updateMany(
          { chat: { $in: chatIds }, sender: { $ne: userId }, delivered: false },
          { delivered: true, deliveredAt: new Date() }
        );

        chatIds.forEach(chatId => {
          socket.to(chatId.toString()).emit('messages_delivered', { chatId, recipientId: userId });
        });
      } catch (err) {
        console.error('Error marking local messages delivered on online:', err);
      }

      io.emit('online_users', Array.from(onlineUsers.keys()));
      console.log(`✅ User online: ${userId}`);
    });

    // Join chat room
    socket.on('join_room', (chatId) => {
      socket.join(chatId);
      console.log(`📥 Socket ${socket.id} joined room ${chatId}`);
    });

    // Leave chat room
    socket.on('leave_room', (chatId) => {
      socket.leave(chatId);
    });

    // Send message — message is already saved via REST API
    // Socket is only used to push the saved message to the other user in real-time
    socket.on('send_message', async (data) => {
      try {
        const { chatId, senderId, message } = data;

        if (!message) return;

        // Relay message to everyone in the room EXCEPT the sender
        // (sender already sees it via REST API response + local Redux dispatch)
        socket.to(chatId).emit('receive_message', message);

        // Send notification to the other user if they are online
        const chat = await Chat.findById(chatId).populate('student developer');
        if (!chat) return;

        const receiverId =
          chat.student._id.toString() === senderId
            ? chat.developer._id.toString()
            : chat.student._id.toString();

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('notification', {
            _id: new Date().getTime().toString(),
            type: 'message',
            title: 'New Message',
            message: `New message in your project chat`,
            createdAt: new Date().toISOString(),
            isRead: false,
          });
        }
      } catch (error) {
        console.error('Send message relay error:', error);
      }
    });

    // Typing indicator
    socket.on('typing', (data) => {
      socket.to(data.chatId).emit('typing', { userId: data.userId, name: data.name, chatId: data.chatId });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.chatId).emit('stop_typing', { userId: data.userId, chatId: data.chatId });
    });

    // Edit / Delete message relay
    socket.on('edit_message', (data) => {
      socket.to(data.chatId).emit('message_edited', data);
    });

    socket.on('delete_message', (data) => {
      socket.to(data.chatId).emit('message_deleted', data);
    });

    // Mark messages as seen
    socket.on('message_seen', async (data) => {
      try {
        const { chatId, userId } = data;
        await Message.updateMany(
          { chat: chatId, sender: { $ne: userId }, seen: false },
          { seen: true, seenAt: new Date(), delivered: true, deliveredAt: new Date() }
        );
        socket.to(chatId).emit('messages_seen', { chatId, userId });
      } catch (error) {
        console.error('Mark seen error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, {
          isOnline: false,
          lastSeen: new Date(),
        });
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`❌ User offline: ${socket.userId}`);
      }
    });
  });
};

module.exports = { socketHandler, onlineUsers };
