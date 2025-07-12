import api from './api';
import type { Attendance } from '../types';

export const attendanceService = {
  markAttendance: async (studentId: number, date: string, present: boolean): Promise<Attendance> => {
    const response = await api.post('/attendance', null, {
      params: { studentId, date, present }
    });
    return response.data;
  },

  getAttendanceByStudent: async (studentId: number): Promise<Attendance[]> => {
    const response = await api.get(`/attendance/student/${studentId}`);
    return response.data;
  },

  getAttendanceByDate: async (date: string): Promise<Attendance[]> => {
    const response = await api.get(`/attendance/date/${date}`);
    return response.data;
  }
};