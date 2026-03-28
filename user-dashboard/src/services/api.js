import axios from 'axios';
import { createApiClient } from '../../../shared-auth/apiClient';

const normalizeBaseUrl = (value) => String(value || '').replace(/\/+$/, '');

const resolvedApiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV
    ? 'http://127.0.0.1:5000'
    : typeof window !== 'undefined'
      ? window.location.origin
      : 'http://127.0.0.1:5000');

if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.warn(
    '[user-dashboard] Missing VITE_API_BASE_URL; defaulting API base to http://127.0.0.1:5000. Create a .env file from .env.example to override.',
  );
}

const api = createApiClient({
  axiosLib: axios,
  baseURL: `${normalizeBaseUrl(resolvedApiBaseUrl)}/api`,
  unauthorizedRedirectPath: import.meta.env.VITE_AUTH_REDIRECT_PATH || '/',
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (payload) => api.post('/auth/register', payload),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const slotsAPI = {
  getAvailable: (params) => api.get('/slots/available', { params }),
  getAll: (params) => api.get('/slots', { params }),
};

export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export default api;
