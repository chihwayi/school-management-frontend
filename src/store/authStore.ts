import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/authService';
import type { LoginRequest, JwtResponse, SchoolInfo } from '../types';
import { ERole } from '../types';

interface AuthState {
  // State
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
  roles: ERole[];
  school: SchoolInfo | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  resetAuth: () => void;
  setSchool: (school: SchoolInfo) => void;
  clearError: () => void;
  
  // Helpers
  hasRole: (role: ERole) => boolean;
  hasAnyRole: (roles: ERole[]) => boolean;
  isAdmin: () => boolean;
  isClerk: () => boolean;
  isTeacher: () => boolean;
  isClassTeacher: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      token: null,
      username: null,
      roles: [],
      school: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          set({ isLoading: true, error: null });
          
          const response: JwtResponse = await authService.login(credentials);
          
          set({
            isAuthenticated: true,
            token: response.token,
            username: response.username,
            roles: response.roles as ERole[],
            school: response.school || null,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isAuthenticated: false,
            token: null,
            username: null,
            roles: [],
            school: null,
            isLoading: false,
            error: error.response?.data?.message || 'Login failed'
          });
          throw error;
        }
      },

      logout: () => {
        authService.logout();
        set({
          isAuthenticated: false,
          token: null,
          username: null,
          roles: [],
          school: null,
          isLoading: false,
          error: null
        });
      },
      
      resetAuth: () => {
        // Clear localStorage auth data
        localStorage.removeItem('auth-storage');
        
        set({
          isAuthenticated: false,
          token: null,
          username: null,
          roles: [],
          school: null,
          isLoading: false,
          error: null
        });
      },

      checkAuth: () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser.isAuthenticated) {
          set({
            isAuthenticated: true,
            token: currentUser.token,
            username: currentUser.username,
            roles: currentUser.roles,
            // Note: School info might need to be fetched separately
            isLoading: false
          });
        } else {
          set({
            isAuthenticated: false,
            token: null,
            username: null,
            roles: [],
            school: null,
            isLoading: false
          });
        }
      },

      setSchool: (school: SchoolInfo) => {
        set({ school });
      },

      clearError: () => {
        set({ error: null });
      },

      // Helper methods
      hasRole: (role: ERole) => {
        const { roles } = get();
        return roles.includes(role);
      },

      hasAnyRole: (rolesToCheck: ERole[]) => {
        const { roles } = get();
        return rolesToCheck.some(role => roles.includes(role));
      },

      isAdmin: () => {
        const { hasRole } = get();
        return hasRole(ERole.ROLE_ADMIN);
      },

      isClerk: () => {
        const { hasRole } = get();
        return hasRole(ERole.ROLE_CLERK);
      },

      isTeacher: () => {
        const { hasRole } = get();
        return hasRole(ERole.ROLE_TEACHER);
      },

      isClassTeacher: () => {
        const { hasRole } = get();
        return hasRole(ERole.ROLE_CLASS_TEACHER);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
        username: state.username,
        roles: state.roles,
        school: state.school
      })
    }
  )
);