import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 8000
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  try {
    const stored = localStorage.getItem('railnexus-store');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
  } catch {
    // localStorage not available (SSR) — skip
  }
  return config;
});

// Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Session expired — clear auth and redirect (but not for demo tokens)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('railnexus-store');
        const { state } = JSON.parse(stored || '{}');
        // Don't redirect if using demo token
        if (state?.token !== 'demo-token') {
          localStorage.removeItem('railnexus-store');
          window.location.href = '/login';
          return Promise.reject(error);
        }
      } catch {
        // ignore
      }
    }

    // Network error or server unreachable — attach a friendly message
    if (!error.response) {
      error.friendlyMessage =
        'Cannot reach the server. Make sure the backend is running on port 5000.';
    }

    return Promise.reject(error);
  }
);

export default api;
