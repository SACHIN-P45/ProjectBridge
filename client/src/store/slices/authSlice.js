import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const storedUser = localStorage.getItem('pb_user');
const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: localStorage.getItem('pb_token') || null,
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login', data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (formData, { rejectWithValue }) => {
  try {
    const res = await api.put('/auth/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Profile update failed');
  }
});

// Called after OAuth redirect — user+token come from URL params, no API call needed
export const oauthLogin = (userData) => (dispatch) => {
  dispatch(authSlice.actions.setOAuthUser(userData));
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('pb_token');
      localStorage.removeItem('pb_user');
    },
    clearError(state) { state.error = null; },
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem('pb_user', JSON.stringify(action.payload));
    },
    setOAuthUser(state, action) {
      const { token, ...user } = action.payload;
      state.user = { ...user, token };
      state.token = token;
      localStorage.setItem('pb_token', token);
      localStorage.setItem('pb_user', JSON.stringify({ ...user, token }));
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleFulfilled = (state, action) => {
      state.loading = false;
      if (action.payload.token) {
        state.user = action.payload;
        state.token = action.payload.token;
        localStorage.setItem('pb_token', action.payload.token);
        localStorage.setItem('pb_user', JSON.stringify(action.payload));
      }
    };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, handleFulfilled)
      .addCase(registerUser.rejected, handleRejected)
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, handleFulfilled)
      .addCase(loginUser.rejected, handleRejected)
      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('pb_user', JSON.stringify({ ...state.user, ...action.payload }));
      })
      .addCase(updateProfile.rejected, handleRejected);
  },
});

export const { logout, clearError, setUser, setOAuthUser } = authSlice.actions;
export default authSlice.reducer;
