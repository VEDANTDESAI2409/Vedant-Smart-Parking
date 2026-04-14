import axios from 'axios';
import { createApiClient } from '../../../shared-auth/apiClient';
import { createAuthStorage } from '../../../shared-auth/authStorage';

export const adminAuthStorage = createAuthStorage('admin-dashboard');

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
    '[admin-dashboard] Missing VITE_API_BASE_URL; defaulting API base to http://127.0.0.1:5000. Create a .env file from .env.example to override.',
  );
}

export const API_BASE_URL = normalizeBaseUrl(resolvedApiBaseUrl);
export const API_ROOT_URL = `${API_BASE_URL}/api`;

const api = createApiClient({
  axiosLib: axios,
  baseURL: API_ROOT_URL,
  unauthorizedRedirectPath: import.meta.env.VITE_AUTH_REDIRECT_PATH || '/login',
  storage: adminAuthStorage,
});

export const authAPI = {
  login: (credentials) => api.post('/auth/admin/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateAdminProfile: (data) => api.put('/auth/admin/profile', data),
};

export const slotsAPI = {
  getAll: (params) => api.get('/slots', { params }),
  getById: (id) => api.get(`/slots/${id}`),
  create: (data) => api.post('/slots', data),
  bulkCreate: async (data) => {
    const endpoints = [
      '/slots/bulk',
      '/slots/bulk/create',
      '/parkingslots/bulk',
      '/parkingslots/bulk/create',
    ];

    let lastError;
    for (const endpoint of endpoints) {
      try {
        // eslint-disable-next-line no-await-in-loop
        return await api.post(endpoint, data);
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 404) {
          throw error;
        }
        lastError = error;
      }
    }

    throw lastError;
  },
  update: (id, data) => api.put(`/slots/${id}`, data),
  delete: (id) => api.delete(`/slots/${id}`),
  getStats: (id) => api.get(`/slots/${id}/stats`),
  scheduleMaintenance: (id, data) => api.post(`/slots/${id}/maintenance`, data),
  getAvailable: (params) => api.get('/slots/available', { params }),
};

export const bookingsAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const vehiclesAPI = {
  getAll: (params) => api.get('/vehicles', { params }),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

export const paymentsAPI = {
  getAll: (params) => api.get('/payments', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  create: (data) => api.post('/payments', data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getOccupancyReport: (params) => api.get('/reports/occupancy', { params }),
};

export const citiesAPI = {
  getAll: (params) => api.get('/cities', { params }),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

export const pincodesAPI = {
  getAll: (params) => api.get('/pincodes', { params }),
  getById: (id) => api.get(`/pincodes/${id}`),
  create: (data) => api.post('/pincodes', data),
  update: (id, data) => api.put(`/pincodes/${id}`, data),
  delete: (id) => api.delete(`/pincodes/${id}`),
};

export const areasAPI = {
  getAll: (params) => api.get('/areas', { params }),
  getById: (id) => api.get(`/areas/${id}`),
  create: (data) => api.post('/areas', data),
  update: (id, data) => api.put(`/areas/${id}`, data),
  delete: (id) => api.delete(`/areas/${id}`),
};

export const locationsAPI = {
  getAll: (params) => api.get('/locations', { params }),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

export const importsAPI = {
  import: (type, data) => api.post(`/imports/${type}`, data),
};

export default api;
