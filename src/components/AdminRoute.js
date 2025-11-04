import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const AdminRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, isAdmin, hasPermission, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner message="Checking admin privileges..." />;
  }

  if (!isAuthenticated) {
    // Redirect to login page with the return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // User is authenticated but not an admin
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    // User is admin but doesn't have the required permission
    return <Navigate to="/insufficient-permissions" replace />;
  }

  return children;
};

export default AdminRoute;
