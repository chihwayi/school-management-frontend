import api from './api';
import type { 
  FeePaymentDTO, 
  PaymentReceiptDTO, 
  PaymentStatusSummaryDTO,
  DailyPaymentSummaryDTO,
  StudentPaymentInfoDTO
} from '../types/feePayment';
import type { Student } from '../types';

export const feePaymentService = {
  recordPayment: async (paymentData: FeePaymentDTO): Promise<PaymentReceiptDTO> => {
    const response = await api.post('/fee-payments/record', paymentData);
    return response.data;
  },
  
  getPaymentStatusByClass: async (form: string, section: string): Promise<PaymentStatusSummaryDTO[]> => {
    const response = await api.get(`/fee-payments/status/class/${form}/${section}`);
    return response.data;
  },
  
  getDailyPaymentSummary: async (date: string): Promise<DailyPaymentSummaryDTO> => {
    const response = await api.get(`/fee-payments/daily-summary/${date}`);
    return response.data;
  },
  
  getStudentPayments: async (studentId: number, term: string, academicYear: string) => {
    const response = await api.get(`/fee-payments/student/${studentId}/term/${term}/year/${academicYear}`);
    return response.data;
  },
  
  getPaymentsByDate: async (date: string) => {
    const response = await api.get(`/fee-payments/date/${date}`);
    return response.data;
  },
  
  searchStudentsByName: async (query: string): Promise<Student[]> => {
    const response = await api.get('/fee-payments/search-students', {
      params: { query }
    });
    return response.data;
  },
  
  fixPaymentStatus: async (): Promise<string> => {
    const response = await api.post('/fee-payments/fix-payment-status');
    return response.data;
  },
  
  fixStudentPayment: async (studentName: string): Promise<string> => {
    const response = await api.get(`/fee-payments/fix-student-payment/${encodeURIComponent(studentName)}`);
    return response.data;
  }
};