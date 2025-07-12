import api from './api';
import type { TeacherAssignmentDTO, TeacherSubjectClass } from '../types';

export const teacherAssignmentService = {
  assignTeacherToSubjectAndClass: async (assignmentData: TeacherAssignmentDTO): Promise<TeacherSubjectClass> => {
    const response = await api.post('/teacher-assignments', assignmentData);
    return response.data;
  },

  removeTeacherAssignment: async (id: number): Promise<void> => {
    await api.delete(`/teacher-assignments/${id}`);
  },

  getTeacherAssignments: async (teacherId: number): Promise<TeacherSubjectClass[]> => {
    const response = await api.get(`/teacher-assignments/teacher/${teacherId}`);
    return response.data;
  },

  getAssignmentForClass: async (subjectId: number, form: string, section: string, year: string): Promise<TeacherSubjectClass> => {
    const response = await api.get(`/teacher-assignments/subject/${subjectId}/form/${form}/section/${section}/year/${year}`);
    return response.data;
  }
};