import api from './api';
import type { Subject, SubjectCategory } from '../types';

export const subjectService = {
  getAllSubjects: async (): Promise<Subject[]> => {
    const response = await api.get('/subjects/all');
    return response.data;
  },

  getSubjectById: async (id: number): Promise<Subject> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  getSubjectsByCategory: async (category: SubjectCategory): Promise<Subject[]> => {
    const response = await api.get(`/subjects/category/${category}`);
    return response.data;
  },

  getSubjectsByLevel: async (level: string): Promise<Subject[]> => {
    const response = await api.get(`/subjects/level/${level}`);
    return response.data;
  },

  createSubject: async (subjectData: Omit<Subject, 'id'>): Promise<Subject> => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  updateSubject: async (id: number, subjectData: Partial<Subject>): Promise<Subject> => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  deleteSubject: async (id: number): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },

  getTeachersBySubject: async (subjectId: number) => {
    const response = await api.get(`/subjects/${subjectId}/teachers`);
    return response.data;
  },

  getStudentsBySubject: async (subjectId: number) => {
    const response = await api.get(`/subjects/${subjectId}/students`);
    return response.data;
  },

  getClassesBySubject: async (subjectId: number) => {
    const response = await api.get(`/subjects/${subjectId}/classes`);
    return response.data;
  }
};