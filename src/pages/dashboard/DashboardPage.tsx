import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner  from '../../components/common/LoadingSpinner';
import { ERole } from '../../types';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, isSchoolConfigured, isLoading, hasRole } = useAuth();

  useEffect(() => {
    // This page serves as a router to appropriate dashboards
    // based on user roles
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isSchoolConfigured) {
    return <Navigate to="/setup" replace />;
  }

  // Route to appropriate dashboard based on highest role
  if (hasRole(ERole.ROLE_ADMIN)) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (hasRole(ERole.ROLE_CLERK)) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  if (hasRole(ERole.ROLE_CLASS_TEACHER)) {
    return <Navigate to="/class-teacher-dashboard" replace />;
  }

  if (hasRole(ERole.ROLE_TEACHER)) {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  // Default fallback - should not happen with proper role assignment
  return <Navigate to="/admin-dashboard" replace />;
};

export default DashboardPage;