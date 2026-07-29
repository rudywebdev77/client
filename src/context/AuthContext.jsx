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
        if (data.success) {
          setUser(data.user);
        } else {
          setUser(null);
          localStorage.removeItem('accessToken');
        }
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to retrieve user info', err);
      setUser(null);
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

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
