import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ERole } from '../../types';
import LoadingSpinner from './LoadingSpinner';
import { ROUTES } from '../../constants';

interface ProtectedRouteProps {
  element: React.ReactElement;
  requiresAuth?: boolean;
  requiresSchoolSetup?: boolean;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  requiresAuth = true,
  requiresSchoolSetup = true,
  roles = []
}) => {
  const {
    isAuthenticated,
    isSchoolConfigured,
    isLoading,
    hasAnyRole,
    user
  } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (requiresSchoolSetup && isAuthenticated && !isSchoolConfigured) {
    return <Navigate to={ROUTES.SETUP} replace />;
  }

  if (roles.length > 0 && !hasAnyRole(roles as ERole[])) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return element;
};

export default ProtectedRoute;
