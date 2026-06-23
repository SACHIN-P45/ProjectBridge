import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const isAuthRoute = err.config?.url && (
        err.config.url.includes('/auth/login') ||
        err.config.url.includes('/auth/register') ||
        err.config.url.includes('/auth/verify-email')
      );
      if (!isAuthRoute) {
        localStorage.removeItem('pb_token');
        localStorage.removeItem('pb_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
