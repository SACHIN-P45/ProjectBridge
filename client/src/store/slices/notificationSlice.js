import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/notifications');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markNotificationRead = createAsyncThunk('notifications/markRead', async (id) => {
  await api.put(`/notifications/${id}/read`);
  return id;
});

export const markAllNotificationsRead = createAsyncThunk('notifications/markAllRead', async () => {
  await api.put('/notifications/read-all');
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { notifications: [], unread: 0, loading: false },
  reducers: {
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.unread += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (s, a) => { s.notifications = a.payload.notifications; s.unread = a.payload.unread; })
      .addCase(markNotificationRead.fulfilled, (s, a) => {
        const n = s.notifications.find(n => n._id === a.payload);
        if (n && !n.isRead) { n.isRead = true; s.unread = Math.max(0, s.unread - 1); }
      })
      .addCase(markAllNotificationsRead.fulfilled, (s) => {
        s.notifications.forEach(n => n.isRead = true);
        s.unread = 0;
      });
  },
});

export const { addNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
