import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const createPaymentOrder = createAsyncThunk('payment/createOrder', async (projectId, { rejectWithValue }) => {
  try {
    const res = await api.post('/payments/create-order', { projectId });
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchPaymentHistory = createAsyncThunk('payment/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/payments/history');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchEarnings = createAsyncThunk('payment/fetchEarnings', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/payments/earnings');
    return res.data;
  } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: { order: null, history: [], earnings: null, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending, (s) => { s.loading = true; })
      .addCase(createPaymentOrder.fulfilled, (s, a) => { s.loading = false; s.order = a.payload; })
      .addCase(createPaymentOrder.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchPaymentHistory.fulfilled, (s, a) => { s.history = a.payload; })
      .addCase(fetchEarnings.fulfilled, (s, a) => { s.earnings = a.payload; });
  },
});

export default paymentSlice.reducer;
