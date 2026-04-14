import { authStorage } from './authStorage';

export const createAuthService = ({ apiClient, loginEndpoint, storage = authStorage }) => ({
  restoreSession() {
    const token = storage.getToken();
    const user = storage.getUser();

    if (!token || !user) {
      return { token: null, user: null, isAuthenticated: false };
    }

    return { token, user, isAuthenticated: true };
  },

  async login(credentials) {
    const response = await apiClient.post(loginEndpoint, credentials);
    const { token, user } = response.data;

    storage.setToken(token);
    storage.setUser(user);

    return { token, user };
  },

  logout() {
    storage.clear();
  },

  updateStoredUser(nextUserData) {
    const currentUser = storage.getUser() || {};
    const updatedUser = { ...currentUser, ...nextUserData };
    storage.setUser(updatedUser);
    return updatedUser;
  },

  getToken() {
    return storage.getToken();
  },

  getUser() {
    return storage.getUser();
  },

  isAuthenticated() {
    return !!storage.getToken();
  },
});
