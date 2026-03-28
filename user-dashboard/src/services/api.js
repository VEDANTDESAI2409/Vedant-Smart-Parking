import axios from 'axios';
import { createApiClient } from '../../../shared-auth/apiClient';

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000').replace(/\/$/, '');

const api = createApiClient({
  axiosLib: axios,
  baseURL: `${apiBaseUrl}/api`,
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

export const locationsAPI = {
  getPublic: () => api.get('/locations/public'),
  getPublicById: (id) => api.get(`/locations/public/${id}`),
};

export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export default api;
