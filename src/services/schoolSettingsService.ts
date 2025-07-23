import api from './api';

export const schoolSettingsService = {
  getSchoolSettings: async () => {
    const response = await api.get('/api/school-settings');
    return response.data;
  },

  updateSchoolSettings: async (settings: any) => {
    const response = await api.put('/api/school-settings', settings);
    return response.data;
  },

  uploadLogo: async (file: File, type: 'school' | 'ministry') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await api.post('/api/school-settings/upload-logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  },

  uploadSignature: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/api/school-settings/upload-signature', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  }
};