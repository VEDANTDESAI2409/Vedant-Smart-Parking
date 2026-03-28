import { authStorage } from './authStorage';

export const createAuthService = ({ apiClient, loginEndpoint }) => ({
  restoreSession() {
    const token = authStorage.getToken();
    const user = authStorage.getUser();

    if (!token || !user) {
      return { token: null, user: null, isAuthenticated: false };
    }

    return { token, user, isAuthenticated: true };
  },

  async login(credentials) {
    const response = await apiClient.post(loginEndpoint, credentials);
    const { token, user } = response.data;

    authStorage.setToken(token);
    authStorage.setUser(user);

    return { token, user };
  },

  logout() {
    authStorage.clear();
  },

  updateStoredUser(nextUserData) {
    const currentUser = authStorage.getUser() || {};
    const updatedUser = { ...currentUser, ...nextUserData };
    authStorage.setUser(updatedUser);
    return updatedUser;
  },

  getToken() {
    return authStorage.getToken();
  },

  getUser() {
    return authStorage.getUser();
  },

  isAuthenticated() {
    return !!authStorage.getToken();
  },
});
