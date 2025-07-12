import api from './api';
import type { FinancialReportDTO } from '../types/feePayment';

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
  }
};