const { supabase } = require('../config/db');

const onlineUsers = new Map(); // userId -> socketId

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    // User comes online
    socket.on('user_online', async (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.userId = userId;

      try {
        await supabase
          .from('users')
          .update({ is_online: true, last_seen: new Date().toISOString() })
          .eq('id', userId);

        // Update all messages where recipient is this user to delivered = true
        const { data: userChats } = await supabase
          .from('chats')
          .select('id')
          .or(`student_id.eq.${userId},developer_id.eq.${userId}`);

        const chatIds = (userChats || []).map((c) => c.id);

        if (chatIds.length > 0) {
          await supabase
            .from('messages')
            .update({
              delivered: true,
              delivered_at: new Date().toISOString(),
            })
            .in('chat_id', chatIds)
            .neq('sender_id', userId)
            .eq('delivered', false);

          chatIds.forEach((chatId) => {
            socket.to(chatId).emit('messages_delivered', { chatId, recipientId: userId });
          });
        }
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
        const { data: chat, error } = await supabase
          .from('chats')
          .select('*')
          .eq('id', chatId)
          .maybeSingle();

        if (error || !chat) return;

        const receiverId =
          chat.student_id === senderId
            ? chat.developer_id
            : chat.student_id;

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
        await supabase
          .from('messages')
          .update({
            seen: true,
            seen_at: new Date().toISOString(),
            delivered: true,
            delivered_at: new Date().toISOString(),
          })
          .eq('chat_id', chatId)
          .neq('sender_id', userId)
          .eq('seen', false);

        socket.to(chatId).emit('messages_seen', { chatId, userId });
      } catch (error) {
        console.error('Mark seen error:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        try {
          await supabase
            .from('users')
            .update({
              is_online: false,
              last_seen: new Date().toISOString(),
            })
            .eq('id', socket.userId);
        } catch (err) {
          console.error('Error setting user offline on disconnect:', err);
        }
        io.emit('online_users', Array.from(onlineUsers.keys()));
        console.log(`❌ User offline: ${socket.userId}`);
      }
    });
  });
};

module.exports = { socketHandler, onlineUsers };
