import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

// Thunks
export const fetchDashboardStats = createAsyncThunk('admin/fetchStats', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/stats');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/users');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createDeveloper = createAsyncThunk('admin/createDeveloper', async (devData, { rejectWithValue }) => {
  try {
    const res = await api.post('/admin/developers', devData);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateUserStatus = createAsyncThunk('admin/updateUserStatus', async ({ userId, isActive }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/admin/users/${userId}/status`, { isActive });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteUser = createAsyncThunk('admin/deleteUser', async (userId, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/users/${userId}`);
    return userId;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllProjects = createAsyncThunk('admin/fetchProjects', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/projects');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteProject = createAsyncThunk('admin/deleteProject', async (projectId, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/projects/${projectId}`);
    return projectId;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllPayments = createAsyncThunk('admin/fetchPayments', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/payments');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchAllReviews = createAsyncThunk('admin/fetchReviews', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/admin/reviews');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteReview = createAsyncThunk('admin/deleteReview', async (reviewId, { rejectWithValue }) => {
  try {
    await api.delete(`/admin/reviews/${reviewId}`);
    return reviewId;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const sendGlobalNotification = createAsyncThunk('admin/sendNotification', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/admin/notifications', data);
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    stats: null,
    users: [],
    projects: [],
    payments: [],
    reviews: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearAdminError(state) { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Users
      .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(createDeveloper.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index].isActive = action.payload.isActive;
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload);
      })

      // Projects
      .addCase(fetchAllProjects.pending, (state) => { state.loading = true; })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p._id !== action.payload);
      })

      // Payments
      .addCase(fetchAllPayments.pending, (state) => { state.loading = true; })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload;
      })

      // Reviews
      .addCase(fetchAllReviews.pending, (state) => { state.loading = true; })
      .addCase(fetchAllReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r._id !== action.payload);
      });
  }
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
