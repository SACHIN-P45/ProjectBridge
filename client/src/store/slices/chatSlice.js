import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchChats = createAsyncThunk('chat/fetchChats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/chats');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (chatId, { rejectWithValue }) => {
  try {
    const res = await api.get(`/chats/${chatId}/messages`);
    return { chatId, messages: res.data };
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats: [],
    activeChat: null,
    messages: {},
    loading: false,
    typingUsers: {},
  },
  reducers: {
    setActiveChat(state, action) { state.activeChat = action.payload; },
    addMessage(state, action) {
      const { chatId, message } = action.payload;
      if (!state.messages[chatId]) state.messages[chatId] = [];
      const exists = state.messages[chatId].find(m => m._id === message._id);
      if (!exists) state.messages[chatId].push(message);
    },
    setTyping(state, action) {
      const { chatId, userId, name } = action.payload;
      if (!state.typingUsers[chatId]) state.typingUsers[chatId] = {};
      state.typingUsers[chatId][userId] = name;
    },
    clearTyping(state, action) {
      const { chatId, userId } = action.payload;
      if (state.typingUsers[chatId]) delete state.typingUsers[chatId][userId];
    },
    updateLastMessage(state, action) {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) chat.lastMessage = message;
    },
    markMessagesSeen(state, action) {
      const { chatId, userId } = action.payload;
      const msgs = state.messages[chatId];
      if (msgs) {
        msgs.forEach(m => {
          const senderId = m.sender?._id || m.sender;
          if (senderId !== userId) {
            m.seen = true;
          }
        });
      }
      const chat = state.chats.find(c => c._id === chatId);
      if (chat && chat.lastMessage) {
        const lastSenderId = chat.lastMessage.sender?._id || chat.lastMessage.sender;
        if (lastSenderId !== userId) {
          chat.lastMessage.seen = true;
        }
      }
    },
    markMessagesDelivered(state, action) {
      const { chatId, recipientId } = action.payload;
      const msgs = state.messages[chatId];
      if (msgs) {
        msgs.forEach(m => {
          const senderId = m.sender?._id || m.sender;
          if (senderId !== recipientId) {
            m.delivered = true;
          }
        });
      }
      const chat = state.chats.find(c => c._id === chatId);
      if (chat && chat.lastMessage) {
        const lastSenderId = chat.lastMessage.sender?._id || chat.lastMessage.sender;
        if (lastSenderId !== recipientId) {
          chat.lastMessage.delivered = true;
        }
      }
    },
    editMessageInState(state, action) {
      const { chatId, message } = action.payload;
      const msgs = state.messages[chatId];
      if (msgs) {
        const idx = msgs.findIndex(m => m._id === message._id);
        if (idx !== -1) {
          msgs[idx] = message;
        }
      }
      const chat = state.chats.find(c => c._id === chatId);
      if (chat && chat.lastMessage?._id === message._id) {
        chat.lastMessage = message;
      }
    },
    deleteMessageInState(state, action) {
      const { chatId, messageId } = action.payload;
      const msgs = state.messages[chatId];
      if (msgs) {
        state.messages[chatId] = msgs.filter(m => m._id !== messageId);
      }
      const chat = state.chats.find(c => c._id === chatId);
      if (chat && chat.lastMessage?._id === messageId) {
        const chatMsgs = state.messages[chatId] || [];
        if (chatMsgs.length > 0) {
          chat.lastMessage = chatMsgs[chatMsgs.length - 1];
        } else {
          chat.lastMessage = null;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.fulfilled, (s, a) => { s.chats = a.payload; })
      .addCase(fetchMessages.fulfilled, (s, a) => { s.messages[a.payload.chatId] = a.payload.messages; });
  },
});

export const { setActiveChat, addMessage, setTyping, clearTyping, updateLastMessage, markMessagesSeen, markMessagesDelivered, editMessageInState, deleteMessageInState } = chatSlice.actions;
export default chatSlice.reducer;
