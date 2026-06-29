import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || '/api';
if (apiURL !== '/api') {
  if (apiURL.endsWith('/')) {
    apiURL = apiURL.slice(0, -1);
  }
  if (!apiURL.endsWith('/api')) {
    apiURL = apiURL + '/api';
  }
}

const api = axios.create({
  baseURL: apiURL,
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
