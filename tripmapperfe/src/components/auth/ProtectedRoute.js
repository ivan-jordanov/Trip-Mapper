import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const location = useLocation();
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'loading:', loading);

  if (loading) {
    return null; 
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <React.Fragment>{children}</React.Fragment>;
};

export default ProtectedRoute;
