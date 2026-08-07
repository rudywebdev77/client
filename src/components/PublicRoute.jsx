import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (user) {
    // Authenticated users should never access public auth routes (/login, /signup, etc.)
    // Direct them to their respective role dashboard
    let target = '/';
    if (user.role === 'admin') {
      target = '/admin';
    } else if (user.role === 'staff') {
      target = '/staff';
    } else if (user.role === 'client') {
      target = '/client';
    }

    return <Navigate to={target} replace />;
  }

  return children;
};
