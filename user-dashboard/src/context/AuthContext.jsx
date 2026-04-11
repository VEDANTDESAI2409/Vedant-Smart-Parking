import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createAuthService } from '../../../shared-auth/authService';
import api, { authAPI } from '../services/api';
import { userAuthStorage } from '../services/api';

const AuthContext = createContext(null);

const authService = createAuthService({
  apiClient: api,
  loginEndpoint: '/auth/login',
  storage: userAuthStorage,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const session = authService.restoreSession();

    if (session.isAuthenticated) {
      setUser(session.user);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { user: userData } = await authService.login({ email, password });
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const register = async (payload) => {
    try {
      const response = await authAPI.register(payload);
      const { token, user: userData } = response.data.data;
      authService.logout();
      userAuthStorage.setToken(token);
      userAuthStorage.setUser(userData);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.errors?.[0]?.msg ||
          'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Ignore logout API failures and still clear local session.
    }

    authService.logout();
    setUser(null);
    setIsAuthenticated(false);

    if (typeof window !== 'undefined') {
      window.location.assign('/');
    }
  };

  const updateUserData = (nextData) => {
    const updatedUser = authService.updateStoredUser(nextData);
    setUser(updatedUser);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      login,
      register,
      logout,
      updateUserData,
    }),
    [user, loading, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
