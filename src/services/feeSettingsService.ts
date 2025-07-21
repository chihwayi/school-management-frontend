import api from './api';

export interface FeeSettings {
  id?: number;
  level: string;
  amount: number;
  academicYear: string;
  term: string;
  active: boolean;
}

export const feeSettingsService = {
  getAllFeeSettings: async (): Promise<FeeSettings[]> => {
    const response = await api.get('/fees/settings');
    return response.data;
  },

  getFeeSettingsByLevel: async (level: string): Promise<FeeSettings> => {
    const response = await api.get(`/fees/settings/${level}`);
    return response.data;
  },

  createFeeSetting: async (feeSettings: FeeSettings): Promise<FeeSettings> => {
    const response = await api.post('/fees/settings', feeSettings);
    return response.data;
  },

  updateFeeSetting: async (id: number, feeSettings: Partial<FeeSettings>): Promise<FeeSettings> => {
    const response = await api.put(`/fees/settings/${id}`, feeSettings);
    return response.data;
  },

  deleteFeeSetting: async (id: number): Promise<void> => {
    await api.delete(`/fees/settings/${id}`);
  }
};