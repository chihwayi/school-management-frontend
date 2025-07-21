import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { schoolService } from '../services/schoolService';
import type { School, SchoolConfigDTO, Theme } from '../types';

interface SchoolState {
  // State
  school: School | null;
  isConfigured: boolean;
  theme: Theme | null;
  isLoading: boolean;
  error: string | null;
  checkPerformed: boolean;
  
  // Actions
  checkSchoolConfig: () => Promise<void>;
  setupSchool: (config: SchoolConfigDTO, logo?: File, background?: File) => Promise<void>;
  updateSchool: (id: number, config: SchoolConfigDTO, logo?: File, background?: File) => Promise<void>;
  setTheme: (theme: Theme) => void;
  clearError: () => void;
  
  // Helpers
  getTheme: () => Theme | null;
  isSchoolConfigured: () => boolean;
}

export const useSchoolStore = create<SchoolState>()(
  persist(
    (set, get) => ({
      // Initial state
      school: null,
      isConfigured: false,
      theme: null,
      isLoading: false,
      error: null,
      checkPerformed: false,

      // Actions
      checkSchoolConfig: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await schoolService.getConfig();
          
          const theme = response.school ? {
            primaryColor: response.school.primaryColor,
            secondaryColor: response.school.secondaryColor,
            logoPath: response.school.logoPath,
            backgroundPath: response.school.backgroundPath
          } : null;
          
          set({
            school: response.school || null,
            isConfigured: response.configured,
            theme,
            isLoading: false,
            error: null,
            checkPerformed: true
          });
        } catch (error: any) {
          // If it's a 404 or no school found, set as not configured without error
          if (error.response?.status === 404 || error.response?.status === 500 || 
              error.response?.data?.message?.includes('not configured')) {
            // Clear any cached school data
            localStorage.removeItem('school-storage');
            
            set({
              school: null,
              isConfigured: false,
              theme: null,
              isLoading: false,
              error: null, // Don't set error for expected 404
              checkPerformed: true
            });
          } else {
            set({
              school: null,
              isConfigured: false,
              theme: null,
              isLoading: false,
              error: error.response?.data?.message || 'Failed to check school configuration',
              checkPerformed: true
            });
          }
        }
      },

      setupSchool: async (config: SchoolConfigDTO, logo?: File, background?: File) => {
        try {
          set({ isLoading: true, error: null });
          
          const school = await schoolService.setupSchool(config, logo, background);
          
          const theme: Theme = {
            primaryColor: school.primaryColor,
            secondaryColor: school.secondaryColor,
            logoPath: school.logoPath,
            backgroundPath: school.backgroundPath
          };
          
          set({
            school,
            isConfigured: true,
            theme,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to setup school'
          });
          throw error;
        }
      },

      updateSchool: async (id: number, config: SchoolConfigDTO, logo?: File, background?: File) => {
        try {
          set({ isLoading: true, error: null });
          
          const school = await schoolService.updateSchool(id, config, logo, background);
          
          const theme: Theme = {
            primaryColor: school.primaryColor,
            secondaryColor: school.secondaryColor,
            logoPath: school.logoPath,
            backgroundPath: school.backgroundPath
          };
          
          set({
            school,
            isConfigured: true,
            theme,
            isLoading: false,
            error: null
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to update school'
          });
          throw error;
        }
      },

      setTheme: (theme: Theme) => {
        set({ theme });
      },

      clearError: () => {
        set({ error: null });
      },

      // Helper methods
      getTheme: () => {
        return get().theme;
      },

      isSchoolConfigured: () => {
        return get().isConfigured;
      }
    }),
    {
      name: 'school-storage',
      partialize: (state) => ({
        school: state.school,
        isConfigured: state.isConfigured,
        theme: state.theme
      })
    }
  )
);