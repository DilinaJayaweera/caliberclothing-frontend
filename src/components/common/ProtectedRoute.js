import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const dashboardUrl = getDashboardUrl(user.role);
    return <Navigate to={dashboardUrl} replace />;
  }

  return children;
};

const getDashboardUrl = (role) => {
  switch (role) {
    case 'CEO':
      return '/ceo/dashboard';
    case 'PRODUCT_MANAGER':
      return '/product-manager/dashboard';
    case 'MERCHANDISE_MANAGER':
      return '/merchandise-manager/dashboard';
    case 'DISPATCH_OFFICER':
      return '/dispatch-officer/dashboard';
    case 'CUSTOMER':
      return '/products';
    default:
      return '/';
  }
};

export default ProtectedRoute;