import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingState from './LoadingState';

export default function RoleProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, role, loading, hasLoggedOut } = useAuth();

  if (loading) {
    return <LoadingState message="Restoring your secure session..." />;
  }

  if (!isAuthenticated) {
    if (hasLoggedOut) {
      return <Navigate to="/" replace />;
    }
    const loginPath = allowedRole === 'ADMIN' ? '/admin/login' : '/user/login';
    return <Navigate to={loginPath} replace />;
  }

  if (role !== allowedRole) {
    const targetPath = role === 'ADMIN' ? '/admin' : '/user';
    return <Navigate to={targetPath} replace />;
  }

  return children;
}
