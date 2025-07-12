import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import TeacherDashboard from './TeacherDashboard';
import ClassTeacherDashboard from './ClassTeacherDashboard';
import { ERole } from '../../types';

const DashboardPage: React.FC = () => {
  const { hasRole } = useAuth();

  // Determine component type first to avoid conditional hook calls
  const dashboardType = React.useMemo(() => {
    if (hasRole(ERole.ROLE_ADMIN) || hasRole(ERole.ROLE_CLERK)) {
      return 'admin';
    }
    if (hasRole(ERole.ROLE_CLASS_TEACHER)) {
      return 'class-teacher';
    }
    if (hasRole(ERole.ROLE_TEACHER)) {
      return 'teacher';
    }
    return 'admin'; // Default fallback
  }, [hasRole]);

  // Render appropriate dashboard based on determined type
  switch (dashboardType) {
    case 'class-teacher':
      return <ClassTeacherDashboard />;
    case 'teacher':
      return <TeacherDashboard />;
    case 'admin':
    default:
      return <AdminDashboard />;
  }
};

export default DashboardPage;