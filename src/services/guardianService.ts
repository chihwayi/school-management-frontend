import api from './api';
import type { Guardian } from '../types';

export const guardianService = {
  getGuardiansByStudent: async (studentId: number): Promise<Guardian[]> => {
    const response = await api.get(`/guardians/student/${studentId}`);
    return response.data;
  },

  addGuardianToStudent: async (studentId: number, guardianData: Omit<Guardian, 'id' | 'student'>): Promise<Guardian> => {
    const response = await api.post(`/guardians/student/${studentId}`, guardianData);
    return response.data;
  },

  updateGuardian: async (id: number, guardianData: Partial<Guardian>): Promise<Guardian> => {
    const response = await api.put(`/guardians/${id}`, guardianData);
    return response.data;
  },

  deleteGuardian: async (id: number): Promise<void> => {
    await api.delete(`/guardians/${id}`);
  },

  getGuardianById: async (id: number): Promise<Guardian> => {
    const response = await api.get(`/guardians/guardian/${id}`);
    return response.data;
  }
};