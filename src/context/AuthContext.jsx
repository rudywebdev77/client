import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCurrentUser = useCallback(async () => {
    console.log('[AuthContext] Initializing user session check...');
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        console.log('[AuthContext] Found access token. Validating with server...');
        const data = await authService.getMe();
        if (data.success && data.user) {
          console.log('[AuthContext] Session validation successful. User logged in:', data.user.email);
          setUser(data.user);
          return;
        }
      } else {
        console.log('[AuthContext] No access token found in localStorage.');
      }
      
      // Fallback: Attempt session recovery via HTTP-only refresh token cookie if available
      try {
        console.log('[AuthContext] Access token missing or invalid. Attempting session recovery via refresh token...');
        const refreshRes = await authService.refreshToken();
        if (refreshRes.success && refreshRes.accessToken) {
          console.log('[AuthContext] Session recovered successfully via refresh token.');
          localStorage.setItem('accessToken', refreshRes.accessToken);
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            return;
          }
        }
      } catch (rErr) {
        console.error('[AuthContext] Session recovery failed:', rErr);
        const isAuthError = rErr.response && (
          rErr.response.status === 401 ||
          rErr.response.status === 403 ||
          rErr.response.status === 400
        );
        // Only clear localStorage token if it is a genuine auth rejection (4xx)
        if (isAuthError) {
          console.warn('[AuthContext] Invalid or expired refresh token. Clearing session token.');
          localStorage.removeItem('accessToken');
        } else {
          console.warn('[AuthContext] Transient error during session recovery. Retaining session token.');
        }
      }

      setUser(null);
    } catch (err) {
      console.error('[AuthContext] Error fetching current user:', err);
      
      const isAuthError = err.response && (
        err.response.status === 401 ||
        err.response.status === 403 ||
        err.response.status === 400
      );

      // If access token was invalid or expired (4xx), try silent token refresh
      if (isAuthError) {
        try {
          console.log('[AuthContext] Access token expired or rejected. Attempting recovery via refresh token...');
          const refreshRes = await authService.refreshToken();
          if (refreshRes.success && refreshRes.accessToken) {
            console.log('[AuthContext] Session recovered successfully after expired access token.');
            localStorage.setItem('accessToken', refreshRes.accessToken);
            const data = await authService.getMe();
            if (data.success && data.user) {
              setUser(data.user);
              return;
            }
          }
        } catch (rErr) {
          console.error('[AuthContext] Session recovery failed after invalid access token:', rErr);
          const isRefreshAuthError = rErr.response && (
            rErr.response.status === 401 ||
            rErr.response.status === 403 ||
            rErr.response.status === 400
          );
          if (isRefreshAuthError) {
            console.warn('[AuthContext] Refresh token expired/failed. Clearing session token.');
            localStorage.removeItem('accessToken');
          }
        }
      } else {
        console.warn('[AuthContext] Network or server error during validation. Retaining session token.');
      }
      
      setUser(null);
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
