import api from './api';
import type { 
  FeePaymentDTO, 
  PaymentReceiptDTO, 
  PaymentStatusSummaryDTO, 
  DailyPaymentSummaryDTO,
  FeePayment
} from '../types/feePayment';

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

  getStudentPayments: async (studentId: number, term: string, academicYear: string): Promise<FeePayment[]> => {
    const response = await api.get(`/fee-payments/student/${studentId}/term/${term}/year/${academicYear}`);
    return response.data;
  },

  getPaymentsByDate: async (date: string): Promise<FeePayment[]> => {
    const response = await api.get(`/fee-payments/date/${date}`);
    return response.data;
  }
};