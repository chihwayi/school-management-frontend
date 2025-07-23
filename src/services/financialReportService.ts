import api from './api';
import type { 
  FinancialReportDTO, 
  FeePayment, 
  StudentPaymentHistoryDTO, 
  PaymentTrendDTO,
  ClassComparisonDTO,
  AuditLogDTO
} from '../types/feePayment';

export const financialReportService = {
  generateFinancialReport: async (
    term: string, 
    academicYear: string, 
    startDate: string, 
    endDate: string
  ): Promise<FinancialReportDTO> => {
    const response = await api.get('/financial-reports/generate', {
      params: { term, academicYear, startDate, endDate }
    });
    return response.data;
  },
  
  // Student payment history report
  getStudentPaymentHistory: async (studentId?: number): Promise<StudentPaymentHistoryDTO[]> => {
    const url = studentId ? 
      `/financial-reports/student-payment-history/${studentId}` : 
      '/financial-reports/student-payment-history';
    const response = await api.get(url);
    return response.data;
  },
  
  // Payment trends over time
  getPaymentTrends: async (startDate: string, endDate: string): Promise<PaymentTrendDTO[]> => {
    const response = await api.get('/financial-reports/payment-trends', {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  // Class comparison report
  getClassComparison: async (academicYear: string): Promise<ClassComparisonDTO[]> => {
    const response = await api.get('/financial-reports/class-comparison', {
      params: { academicYear }
    });
    return response.data;
  },
  
  // Outstanding payments report
  getOutstandingPayments: async (term: string, academicYear: string): Promise<FeePayment[]> => {
    try {
      const response = await api.get('/financial-reports/outstanding-payments', {
        params: { term, academicYear }
      });
      return response.data || [];
    } catch (error) {
      console.error('Error getting outstanding payments:', error);
      return [];
    }
  },
  
  // Payment audit logs
  getPaymentAuditLogs: async (startDate: string, endDate: string): Promise<AuditLogDTO[]> => {
    const response = await api.get('/financial-reports/audit-logs', {
      params: { startDate, endDate }
    });
    return response.data;
  },
  
  // Export all payments to Excel
  exportAllPaymentsToExcel: async (term: string, academicYear: string): Promise<Blob> => {
    const response = await api.get('/financial-reports/export/all-payments', {
      params: { term, academicYear },
      responseType: 'blob'
    });
    return response.data;
  },
  
  // Export student payment history to Excel
  exportStudentPaymentHistory: async (studentId: number): Promise<Blob> => {
    const response = await api.get(`/financial-reports/export/student-history/${studentId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};