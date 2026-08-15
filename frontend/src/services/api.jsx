import axios from 'axios';

// ✅ Use environment variable for backend URL (supports both local and deployed)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ✅ Axios instance setup
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ✅ Add auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 errors (token expired/invalid → clear session & redirect)
// NOTE: The backend issues a single 30-day JWT and has no refresh-token
// endpoint, so on a 401 we simply log the user out instead of attempting a
// refresh that does not exist.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Don't redirect when the 401 comes from the login attempt itself,
      // otherwise the Login page can never show its error message.
      const isLoginRequest = (originalRequest.url || '').includes('/api/auth/login');

      if (!isLoginRequest) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
