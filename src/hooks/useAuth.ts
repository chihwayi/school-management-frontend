import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useSchoolStore } from '../store/schoolStore';
import { ERole } from '../types';

/**
 * Custom hook for authentication state and actions
 */
export const useAuth = () => {
  const authStore = useAuthStore();
  const schoolStore = useSchoolStore();

  // Check authentication status on mount
  useEffect(() => {
    authStore.checkAuth();
    // Only check school config once when the app first loads
    if (!schoolStore.checkPerformed) {
      schoolStore.checkSchoolConfig();
    }
  }, []);

  return {
    // Auth state
    isAuthenticated: authStore.isAuthenticated,
    user: {
      username: authStore.username,
      roles: authStore.roles,
      school: authStore.school
    },
    isLoading: authStore.isLoading,
    error: authStore.error,
    
    // School state  
    school: schoolStore.school,
    isSchoolConfigured: schoolStore.isConfigured,
    theme: schoolStore.theme,
    schoolError: schoolStore.error,
    
    // Actions
    login: authStore.login,
    logout: authStore.logout,
    resetAuth: authStore.resetAuth,
    clearError: authStore.clearError,
    
    // Role helpers
    hasRole: authStore.hasRole,
    hasAnyRole: authStore.hasAnyRole,
    isAdmin: authStore.isAdmin,
    isClerk: authStore.isClerk,
    isTeacher: authStore.isTeacher,
    isClassTeacher: authStore.isClassTeacher,
  };
};

/**
 * Hook for role-based access control
 */
export const useRoleCheck = () => {
  const { hasRole, hasAnyRole, isAdmin, isClerk, isTeacher, isClassTeacher } = useAuth();

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isClerk,
    isTeacher,
    isClassTeacher,
    
    // Combined role checks
    canManageUsers: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK]),
    canManageStudents: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK]),
    canManageTeachers: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK]),
    canManageClasses: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK]),
    canManageSubjects: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK]),
    canRecordAssessments: () => hasAnyRole([ERole.ROLE_TEACHER, ERole.ROLE_CLASS_TEACHER]),
    canMarkAttendance: () => hasAnyRole([ERole.ROLE_CLASS_TEACHER]),
    canAddSubjectComments: () => hasAnyRole([ERole.ROLE_TEACHER, ERole.ROLE_CLASS_TEACHER]),
    canAddOverallComments: () => hasAnyRole([ERole.ROLE_CLASS_TEACHER]),
    canFinalizeReports: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK]),
    canViewReports: () => hasAnyRole([ERole.ROLE_ADMIN, ERole.ROLE_CLERK, ERole.ROLE_TEACHER, ERole.ROLE_CLASS_TEACHER]),
    canConfigureSchool: () => hasRole(ERole.ROLE_ADMIN),
  };
};

/**
 * Hook for protecting routes based on authentication
 */
export const useAuthGuard = () => {
  const { isAuthenticated, isSchoolConfigured } = useAuth();

  return {
    isAuthenticated,
    isSchoolConfigured,
    requiresAuth: () => isAuthenticated,
    requiresSchoolSetup: () => isAuthenticated && !isSchoolConfigured,
    shouldRedirectToLogin: () => !isAuthenticated,
    shouldRedirectToSetup: () => isAuthenticated && !isSchoolConfigured,
  };
};

/**
 * Hook for managing authentication loading states
 */
export const useAuthLoading = () => {
  const authStore = useAuthStore();
  const schoolStore = useSchoolStore();

  return {
    isAuthLoading: authStore.isLoading,
    isSchoolLoading: schoolStore.isLoading,
    isLoading: authStore.isLoading || schoolStore.isLoading,
    authError: authStore.error,
    schoolError: schoolStore.error,
    hasError: !!(authStore.error || schoolStore.error),
    clearAuthError: authStore.clearError,
    clearSchoolError: schoolStore.clearError,
    clearAllErrors: () => {
      authStore.clearError();
      schoolStore.clearError();
    }
  };
};