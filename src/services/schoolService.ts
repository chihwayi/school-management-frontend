import api from './api';
import type { School, SchoolConfigDTO } from '../types';

export const schoolService = {
  getConfig: async (): Promise<{ configured: boolean; school?: School }> => {
    const response = await api.get('/school/config');
    return response.data;
  },

  setupSchool: async (schoolConfig: SchoolConfigDTO, logo?: File, background?: File): Promise<School> => {
    const formData = new FormData();
    
    // Create a blob for the JSON data
    const configBlob = new Blob([JSON.stringify(schoolConfig)], {
      type: 'application/json'
    });
    formData.append('schoolConfig', configBlob);
    
    if (logo) {
      formData.append('logo', logo);
    }
    
    if (background) {
      formData.append('background', background);
    }

    const response = await api.post('/school/setup', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  updateSchool: async (id: number, schoolConfig: SchoolConfigDTO, logo?: File, background?: File): Promise<School> => {
    const formData = new FormData();
    
    // Create a blob for the JSON data
    const configBlob = new Blob([JSON.stringify(schoolConfig)], {
      type: 'application/json'
    });
    formData.append('schoolConfig', configBlob);
    
    if (logo) {
      formData.append('logo', logo);
    }
    
    if (background) {
      formData.append('background', background);
    }

    const response = await api.put(`/school/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }
};