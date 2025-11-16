import axios from 'axios';

// ✅ Use your live Render backend URL from environment variable
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// 🟢 Wake up backend (non-blocking request)
(async () => {
  try {
    // Hit the root URL (outside `/api/`) to wake Render up
    await fetch(import.meta.env.VITE_API_URL, { method: 'GET' });
    console.log('🌐 Backend wake-up ping sent');
  } catch (err) {
    console.log('⚠️ Backend wake-up failed (likely asleep):', err.message);
  }
})();

// ✅ Axios instance setup
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

// ✅ Handle 401 errors (token expired → refresh)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const newToken = response.data.access;
        localStorage.setItem('access_token', newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, log out user
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
