import api from './api';
import type { ClassGroup, Student } from '../types';

export const classService = {
  getAllClassGroups: async (): Promise<ClassGroup[]> => {
    const response = await api.get('/classes/all');
    console.log('API response for getAllClassGroups:', response.data);
    return response.data;
  },

  getClassGroupById: async (id: number): Promise<ClassGroup> => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  createClassGroup: async (classData: Omit<ClassGroup, 'id'>): Promise<ClassGroup> => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  updateClassGroup: async (id: number, classData: Partial<ClassGroup>): Promise<ClassGroup> => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  deleteClassGroup: async (id: number): Promise<void> => {
    await api.delete(`/classes/${id}`);
  },

  getClassGroupByDetails: async (form: string, section: string, year: string): Promise<ClassGroup> => {
    const response = await api.get(`/classes/form/${form}/section/${section}/year/${year}`);
    return response.data;
  },

  getStudentsInClass: async (classGroupId: number): Promise<Student[]> => {
    const response = await api.get(`/classes/${classGroupId}/students`);
    return response.data;
  },

  assignClassTeacher: async (classGroupId: number, teacherId: number): Promise<ClassGroup> => {
    const response = await api.post(`/classes/${classGroupId}/assign-teacher/${teacherId}`);
    return response.data;
  }
};