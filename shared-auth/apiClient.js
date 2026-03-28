import { authStorage } from './authStorage';

export const createApiClient = ({
  axiosLib,
  baseURL,
  unauthorizedRedirectPath = '/login',
  storage = authStorage,
} = {}) => {
  const apiClient = axiosLib.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  apiClient.interceptors.request.use(
    (config) => {
      const token = storage.getToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error),
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        storage.clear();

        if (typeof window !== 'undefined' && unauthorizedRedirectPath) {
          window.location.assign(unauthorizedRedirectPath);
        }
      }

      return Promise.reject(error);
    },
  );

  return apiClient;
};
