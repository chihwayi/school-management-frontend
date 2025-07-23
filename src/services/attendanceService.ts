import api from './api';
import type { Attendance } from '../types';

export const attendanceService = {
  markAttendance: async (studentId: number, date: string, present: boolean): Promise<Attendance> => {
    // The API endpoint already includes /api in the baseURL, so we don't need to include it again
    try {
      console.log('Marking attendance with data:', { studentId, date, present });
      // Remove the /api prefix since it's already in the baseURL
      const response = await api.post('/attendance', { studentId, date, present });
      return response.data;
    } catch (error) {
      console.error('Error in markAttendance:', error);
      throw error;
    }
  },

  getAttendanceByStudent: async (studentId: number): Promise<Attendance[]> => {
    try {
      // Remove the /api prefix since it's already in the baseURL
      const response = await api.get(`/attendance/student/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAttendanceByStudent:', error);
      return [];
    }
  },

  getAttendanceByDate: async (date: string): Promise<Attendance[]> => {
    try {
      // Remove the /api prefix since it's already in the baseURL
      const response = await api.get(`/attendance/date/${date}`);
      return response.data;
    } catch (error) {
      console.error('Error in getAttendanceByDate:', error);
      return [];
    }
  }
};