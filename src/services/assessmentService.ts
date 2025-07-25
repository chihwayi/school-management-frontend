import api from './api';
import type { Assessment, AssessmentDTO, AssessmentUpdateDTO } from '../types';

export const assessmentService = {
  recordAssessment: async (assessmentData: AssessmentDTO): Promise<Assessment> => {
    try {
      const response = await api.post('/assessments', assessmentData);
      return response.data;
    } catch (error: any) {
      console.error('Assessment recording error:', error);
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to record assessments. Please contact your administrator.');
      }
      throw error;
    }
  },

  getStudentSubjectAssessments: async (studentId: number, subjectId: number): Promise<Assessment[]> => {
    const response = await api.get(`/assessments/student/${studentId}/subject/${subjectId}`);
    return response.data;
  },

  getStudentTermAssessments: async (studentId: number, term: string, year: string): Promise<Assessment[]> => {
    const response = await api.get(`/assessments/student/${studentId}/term/${term}/year/${year}`);
    return response.data;
  },

  updateAssessment: async (id: number, updateData: AssessmentUpdateDTO): Promise<Assessment> => {
    const response = await api.put(`/assessments/${id}`, updateData);
    return response.data;
  },

  getAssessmentById: async (id: number): Promise<Assessment> => {
    const response = await api.get(`/assessments/${id}`);
    return response.data;
  },

  deleteAssessment: async (id: number): Promise<void> => {
    await api.delete(`/assessments/${id}`);
  }
};