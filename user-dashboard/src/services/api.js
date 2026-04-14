import axios from 'axios';
import { createApiClient } from '../../../shared-auth/apiClient';
import { createAuthStorage } from '../../../shared-auth/authStorage';

export const userAuthStorage = createAuthStorage('user-dashboard');

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
  storage: userAuthStorage,
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (payload) => api.post('/auth/signup', payload),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  sendOtp: (payload) => api.post('/auth/send-otp', payload),
  resendOtp: (payload) => api.post('/auth/resend-otp', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  createFirebaseSession: (payload) => api.post('/auth/firebase/session', payload),
  getAuthProfile: () => api.get('/auth/me'),
};

export const locationsAPI = {
  getNearby: (params) => api.get('/locations/nearby', { params }),
  getBlueprint: (locationId, params) => api.get(`/locations/${locationId}/slots`, { params }),
  getPublic: () => api.get('/locations/public'),
  getPublicById: (id) => api.get(`/locations/public/${id}`),
};

export const slotsAPI = {
  getAvailable: (params) => api.get('/slots/available', { params }),
  getAll: (params) => api.get('/slots', { params }),
};

export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getMine: () => api.get('/bookings/me'),
  getById: (id) => api.get(`/bookings/${id}`),
  createSmart: (data) => api.post('/bookings/create', data),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const paymentsAPI = {
  initiate: (data) => api.post('/payments/initiate', data),
  verify: (data) => api.post('/payments/verify', data),
  getAll: (params) => api.get('/payments', { params }),
};

export const usersAPI = {
  updateProfile: (id, data) => api.put(`/users/${id}`, data),
};

export default api;
