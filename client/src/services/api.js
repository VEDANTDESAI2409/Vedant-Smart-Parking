import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  // --- ADDED THIS LINE ---
  updateAdminProfile: (data) => api.put('/auth/admin/profile', data),
};

export const slotsAPI = {
  getAll: (params) => api.get('/slots', { params }),
  getById: (id) => api.get(`/slots/${id}`),
  create: (data) => api.post('/slots', data),
  update: (id, data) => api.put(`/slots/${id}`, data),
  delete: (id) => api.delete(`/slots/${id}`),
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
  process: (data) => api.post('/payments/process', data),
};

export const reportsAPI = {
  getDashboardStats: () => api.get('/reports/dashboard'),
  getRevenueReport: (params) => api.get('/reports/revenue', { params }),
  getOccupancyReport: (params) => api.get('/reports/occupancy', { params }),
};

export const citiesAPI = {
  getAll: () => api.get('/cities'),
  getById: (id) => api.get(`/cities/${id}`),
  create: (data) => api.post('/cities', data),
  update: (id, data) => api.put(`/cities/${id}`, data),
  delete: (id) => api.delete(`/cities/${id}`),
};

export const pincodesAPI = {
  getAll: () => api.get('/pincodes'),
  getById: (id) => api.get(`/pincodes/${id}`),
  create: (data) => api.post('/pincodes', data),
  update: (id, data) => api.put(`/pincodes/${id}`, data),
  delete: (id) => api.delete(`/pincodes/${id}`),
};

export const areasAPI = {
  getAll: () => api.get('/areas'),
  getById: (id) => api.get(`/areas/${id}`),
  create: (data) => api.post('/areas', data),
  update: (id, data) => api.put(`/areas/${id}`, data),
  delete: (id) => api.delete(`/areas/${id}`),
};

export const locationsAPI = {
  getAll: () => api.get('/locations'),
  getById: (id) => api.get(`/locations/${id}`),
  create: (data) => api.post('/locations', data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
};

export default api;