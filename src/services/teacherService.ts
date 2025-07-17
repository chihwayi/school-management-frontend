import api from './api';
import type { Teacher, TeacherRegistrationDTO, TeacherSubjectClass, ClassGroup } from '../types';

export const teacherService = {
  getAllTeachers: async (): Promise<Teacher[]> => {
    const response = await api.get('/teachers/all?includeUser=true');
    
    // Fix circular reference by extracting only needed data
    const cleanTeachers = response.data.map((teacher: any) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      employeeId: teacher.employeeId,
      user: teacher.user ? {
        id: teacher.user.id,
        username: teacher.user.username,
        email: teacher.user.email,
        enabled: teacher.user.enabled,
        roles: teacher.user.roles
      } : null
    }));
    
    return cleanTeachers;
  },

  getTeacherById: async (id: number): Promise<Teacher> => {
    try {
      const response = await api.get(`/teachers/${id}`);
      
      // Fix circular reference by extracting only needed data
      const teacher = response.data;
      const cleanTeacher = {
        id: teacher.id,
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        employeeId: teacher.employeeId,
        user: teacher.user ? {
          id: teacher.user.id,
          username: teacher.user.username,
          email: teacher.user.email,
          enabled: teacher.user.enabled,
          roles: teacher.user.roles
        } : null,
        subjectClassAssignments: teacher.subjectClassAssignments,
        supervisedClasses: teacher.supervisedClasses
      };
      
      return cleanTeacher;
    } catch (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }
  },

  createTeacher: async (teacherData: TeacherRegistrationDTO): Promise<Teacher> => {
    const response = await api.post('/teachers', teacherData);
    return response.data;
  },

  updateTeacher: async (id: number, teacherData: Partial<Teacher>): Promise<Teacher> => {
    const response = await api.put(`/teachers/${id}`, teacherData);
    return response.data;
  },

  deleteTeacher: async (id: number): Promise<void> => {
    await api.delete(`/teachers/${id}`);
  },

  getCurrentTeacher: async (): Promise<Teacher> => {
    const response = await api.get('/teachers/current');
    return response.data;
  },

  getAssignedSubjectsAndClasses: async (): Promise<TeacherSubjectClass[]> => {
    const response = await api.get('/teachers/subjects/assigned');
    return response.data;
  },

  getSupervisedClasses: async (): Promise<ClassGroup[]> => {
    const response = await api.get('/teachers/class-teacher-assignments');
    return response.data;
  },

  assignTeacher: async (assignmentData: any): Promise<void> => {
    await api.post('/teachers/assignments', assignmentData);
  }
};