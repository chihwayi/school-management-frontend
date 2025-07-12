import api from './api';
import type { Report, SubjectCommentDTO, OverallCommentDTO } from '../types';

/**
 * Service functions for interacting with the Report API endpoints.
 */
export const reportService = {

  /**
   * Generates reports for all students in a specific class group for a given term and academic year.
   * @param classGroupId The ID of the class group.
   * @param term The academic term (e.g., "Term 1").
   * @param year The academic year (e.g., "2024").
   * @returns A promise that resolves to an array of generated Report objects.
   */
  generateClassReports: async (classGroupId: number, term: string, year: string): Promise<Report[]> => {
    const response = await api.post<Report[]>(`/reports/generate/class/${classGroupId}/term/${term}/year/${year}`);
    return response.data;
  },

  /**
   * Retrieves all reports for a specific student.
   * @param studentId The ID of the student.
   * @returns A promise that resolves to an array of Report objects for the student.
   */
  getStudentReports: async (studentId: number): Promise<Report[]> => {
    const response = await api.get<Report[]>(`/reports/student/${studentId}`);
    return response.data;
  },

  /**
   * Retrieves a single report by its ID.
   * @param reportId The ID of the report.
   * @returns A promise that resolves to the Report object.
   */
  getReportById: async (reportId: number): Promise<Report> => {
    const response = await api.get<Report>(`/reports/${reportId}`);
    return response.data;
  },

  /**
   * Adds or updates a subject-specific comment on a student's report.
   * Requires the teacher to be authorized for the subject on the report.
   * @param reportId The ID of the report to comment on.
   * @param commentData The SubjectCommentDTO containing subject ID and comment.
   * @returns A promise that resolves to the updated SubjectReport object.
   */
  addSubjectComment: async (reportId: number, commentData: SubjectCommentDTO): Promise<Report> => {
    // Note: The backend returns SubjectReport, but the overall Report object
    // is often needed for UI updates. Assuming the backend updates the Report
    // and returns it or a relevant part. Adjust return type if backend differs.
    const response = await api.post<Report>(`/reports/${reportId}/subject-comment`, commentData);
    return response.data;
  },

  /**
   * Adds or updates the overall comment for a student's report.
   * Requires the teacher to be the assigned class teacher for the report's class.
   * @param reportId The ID of the report to add the overall comment to.
   * @param commentData The OverallCommentDTO containing the overall comment.
   * @returns A promise that resolves to the updated Report object.
   */
  addOverallComment: async (reportId: number, commentData: OverallCommentDTO): Promise<Report> => {
    const response = await api.post<Report>(`/reports/${reportId}/overall-comment`, commentData);
    return response.data;
  },

  /**
   * Finalizes a student's report, typically making it read-only for further modifications.
   * This action is usually performed by an Admin or Clerk.
   * @param reportId The ID of the report to finalize.
   * @returns A promise that resolves to the finalized Report object.
   */
  finalizeReport: async (reportId: number): Promise<Report> => {
    const response = await api.post<Report>(`/reports/${reportId}/finalize`);
    return response.data;
  },

  /**
   * Retrieves all reports for a specific class group, term, and academic year.
   * @param classGroupId The ID of the class group.
   * @param term The academic term (e.g., "Term 1").
   * @param year The academic year (e.g., "2024").
   * @returns A promise that resolves to an array of Report objects for the class.
   */
  getClassReports: async (classGroupId: number, term: string, year: string): Promise<Report[]> => {
    const response = await api.get<Report[]>(`/reports/class/${classGroupId}/term/${term}/year/${year}`);
    return response.data;
  },

  /**
   * Downloads a report as a PDF file.
   * @param reportId The ID of the report to download.
   * @returns A promise that resolves when the download is initiated.
   */
  downloadReport: async (reportId: number): Promise<void> => {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Get filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `report-${reportId}.pdf`;
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
