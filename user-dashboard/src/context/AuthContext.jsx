import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { createAuthService } from '../../../shared-auth/authService';
import api, { authAPI, userAuthStorage, usersAPI } from '../services/api';

const AuthContext = createContext(null);
const PENDING_BOOKING_KEY = 'user-dashboard:pending-booking';

const authService = createAuthService({
  apiClient: api,
  loginEndpoint: '/auth/login',
  storage: userAuthStorage,
});

const notifyOtpFallback = (payload) => {
  // FALLBACK REMOVED - OTP should only be sent via SMS, never displayed
  if (payload?.success === false) {
    console.error('[OTP] Failed to send OTP:', payload.message);
    return;
  }
  if (payload?.success === true) {
    console.log('[OTP] OTP sent successfully via SMS');
  }
};

const extractUserPayload = (response) =>
  response?.data?.data?.user || response?.data?.user || response?.user || null;

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

  const establishSession = ({ token, user: userData }) => {
    userAuthStorage.setToken(token);
    userAuthStorage.setUser(userData);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const refreshProfile = async () => {
    const response = await usersAPI.getProfile();
    const profileUser = extractUserPayload(response);

    if (profileUser) {
      userAuthStorage.setUser(profileUser);
      setUser(profileUser);
      setIsAuthenticated(true);
    }

    return profileUser;
  };

  const sendOtp = async (payload) => {
    const response = await authAPI.sendOtp(payload);
    notifyOtpFallback(response.data);
    return response.data;
  };

  const verifyOtp = async (payload) => {
    const response = await authAPI.verifyOtp(payload);
    return response.data;
  };

  const signup = async (payload) => {
    const response = await authAPI.register(payload);
    const session = response.data;

    if (session?.token && session?.user) {
      establishSession(session);
    }

    return session;
  };

  const login = async (payload) => {
    const response = await authAPI.login(payload);
    notifyOtpFallback(response.data);
    return response.data;
  };

  const verifyLogin = async (payload) => {
    const response = await authAPI.verifyLoginOtp(payload);
    const session = response.data;

    if (session?.token && session?.user) {
      establishSession(session);
    }

    return session;
  };

  const loginWithGoogle = async (payload) => {
    const response = await authAPI.googleLogin(payload);
    const session = response.data;

    if (session?.token && session?.user) {
      establishSession(session);
    }

    return session;
  };

  const logout = async () => {
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

  const savePendingBooking = (payload) => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(PENDING_BOOKING_KEY, JSON.stringify(payload));
  };

  const getPendingBooking = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const raw = window.localStorage.getItem(PENDING_BOOKING_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const clearPendingBooking = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.removeItem(PENDING_BOOKING_KEY);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated,
      sendOtp,
      verifyOtp,
      signup,
      login,
      verifyLogin,
      loginWithGoogle,
      logout,
      updateUserData,
      establishSession,
      refreshProfile,
      savePendingBooking,
      getPendingBooking,
      clearPendingBooking,
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
