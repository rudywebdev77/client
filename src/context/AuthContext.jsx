import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        const data = await authService.getMe();
        if (data.success && data.user) {
          setUser(data.user);
          return;
        }
      }
      
      // Fallback: Attempt session recovery via HTTP-only refresh token cookie if available
      try {
        const refreshRes = await authService.refreshToken();
        if (refreshRes.success && refreshRes.accessToken) {
          localStorage.setItem('accessToken', refreshRes.accessToken);
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            return;
          }
        }
      } catch (rErr) {
        // Refresh token failed or cookie unavailable
      }

      setUser(null);
      localStorage.removeItem('accessToken');
    } catch (err) {
      // If getMe failed (e.g. 401 token expired), attempt session recovery via refresh token
      try {
        const refreshRes = await authService.refreshToken();
        if (refreshRes.success && refreshRes.accessToken) {
          localStorage.setItem('accessToken', refreshRes.accessToken);
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            return;
          }
        }
      } catch (rErr) {
        // Refresh token recovery failed
      }
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signupUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.signup(userData);
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign up failed. Please try again.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  };

  const logoutUser = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout request failed on server', err);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        setUser,
        signupUser,
        loginUser,
        logoutUser,
        refreshUser: fetchCurrentUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
