import api from './api';

export const ministryService = {
  uploadMinistryLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/ministry-logo/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getCurrentMinistryLogo: async (): Promise<string | null> => {
    try {
      const response = await api.get('/ministry-logo/current');
      return response.data;
    } catch (error) {
      return null;
    }
  }
};