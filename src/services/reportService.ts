import api from './api';

export const reportService = {
  getStudentReports: async (studentId: number) => {
    const response = await api.get(`/api/reports/student/${studentId}`);
    return response.data;
  },
  
  getReportById: async (reportId: number) => {
    const response = await api.get(`/api/reports/${reportId}`);
    return response.data;
  },
  
  getReportsByFormAndSection: async (form: string, section: string, term: string, year: string) => {
    const response = await api.get(`/api/reports/class/form/${form}/section/${section}/term/${term}/year/${year}`);
    return response.data;
  },
  
  getClassReports: async (classId: number, term: string, year: string) => {
    const response = await api.get(`/api/reports/class/${classId}/term/${term}/year/${year}`);
    return response.data;
  },
  
  generateClassReports: async (classId: number, term: string, year: string) => {
    const response = await api.post(`/api/reports/generate/class/${classId}/term/${term}/year/${year}`);
    return response.data;
  },
  
  addSubjectComment: async (reportId: number, subjectId: number, comment: string) => {
    const response = await api.post(`/api/reports/${reportId}/subject-comment`, {
      subjectId,
      comment
    });
    return response.data;
  },
  
  addOverallComment: async (reportId: number, comment: string) => {
    const response = await api.post(`/api/reports/${reportId}/overall-comment`, {
      comment
    });
    return response.data;
  },
  
  finalizeReport: async (reportId: number) => {
    const response = await api.post(`/api/reports/${reportId}/finalize`);
    return response.data;
  }
};