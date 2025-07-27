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

  downloadTemplate: async (): Promise<Blob> => {
    const response = await api.get('/students/template', {
      responseType: 'blob'
    });
    return response.data;
  },

  importStudents: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
  },

  bulkAssignSubjectsToClass: async (form: string, section: string, subjectIds: number[]): Promise<void> => {
    const response = await api.post('/students/bulk-assign-subjects', {
      form,
      section,
      subjectIds
    });
    return response.data;
  },

  // Hybrid assignment method - handles single, bulk class, and bulk custom assignments
  assignSubjects: async (assignmentData: {
    studentIds?: number[];
    subjectIds: number[];
    form?: string;
    section?: string;
    academicYear?: string;
    assignmentType: 'SINGLE' | 'BULK_CLASS' | 'BULK_CUSTOM';
  }): Promise<StudentSubject[]> => {
    const response = await api.post('/students/assign-subjects', assignmentData);
    return response.data;
  },


};