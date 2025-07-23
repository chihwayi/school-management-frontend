import api from './api';
import type { Guardian } from '../types';

export const guardianService = {
  getGuardiansByStudent: async (studentId: number): Promise<Guardian[]> => {
    const response = await api.get(`/api/guardians/student/${studentId}`);
    return response.data;
  },

  addGuardianToStudent: async (studentId: number, guardianData: Omit<Guardian, 'id' | 'student'>): Promise<Guardian> => {
    const response = await api.post(`/api/guardians/student/${studentId}`, guardianData);
    return response.data;
  },

  updateGuardian: async (id: number, guardianData: Partial<Guardian>): Promise<Guardian> => {
    const response = await api.put(`/api/guardians/${id}`, guardianData);
    return response.data;
  },

  deleteGuardian: async (id: number): Promise<void> => {
    await api.delete(`/api/guardians/${id}`);
  },

  getGuardianById: async (id: number): Promise<Guardian> => {
    const response = await api.get(`/api/guardians/guardian/${id}`);
    return response.data;
  }
};