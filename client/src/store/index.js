import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import chatReducer from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import paymentReducer from './slices/paymentSlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    projects: projectReducer,
    chat: chatReducer,
    notifications: notificationReducer,
    payment: paymentReducer,
    admin: adminReducer,
  },
});

export default store;
