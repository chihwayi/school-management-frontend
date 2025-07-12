import api from './api';
import type { Student, StudentRegistrationDTO, StudentUpdateDTO, StudentSubject, PromotionToALevelDTO, Subject } from '../types';

export const studentService = {
  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get('/students/all');
    return response.data;
  },

  getStudentById: async (id: number): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  createStudent: async (studentData: StudentRegistrationDTO): Promise<Student> => {
    const response = await api.post('/students/create', studentData);
    return response.data;
  },

  updateStudent: async (id: number, studentData: StudentUpdateDTO): Promise<Student> => {
    const response = await api.put(`/students/${id}`, studentData);
    return response.data;
  },

  deleteStudent: async (id: number): Promise<void> => {
    await api.delete(`/students/${id}`);
  },

  getStudentsByClass: async (form: string, section: string): Promise<Student[]> => {
    const response = await api.get(`/students/form/${form}/section/${section}`);
    return response.data;
  },

  assignSubjectToStudent: async (studentId: number, subjectId: number): Promise<StudentSubject> => {
    const response = await api.post(`/students/${studentId}/assign-subject/${subjectId}`);
    return response.data;
  },

  removeSubjectFromStudent: async (studentId: number, subjectId: number): Promise<void> => {
    await api.delete(`/students/${studentId}/remove-subject/${subjectId}`);
  },

  getStudentSubjects: async (studentId: number): Promise<Subject[]> => {
    const response = await api.get(`/students/${studentId}/subjects`);
    return response.data;
  },

  advanceStudentsToNextForm: async (studentIds: number[]): Promise<Student[]> => {
    const response = await api.post('/students/batch/advance-form', studentIds);
    return response.data;
  },

  promoteStudentsToALevel: async (promotionData: PromotionToALevelDTO): Promise<Student[]> => {
    const response = await api.post('/students/batch/promote-to-a-level', promotionData);
    return response.data;
  }
};