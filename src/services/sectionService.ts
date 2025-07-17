import api from './api';
import type { Section } from '../types/section';

export const sectionService = {
  getAllSections: async (): Promise<Section[]> => {
    const response = await api.get('/sections/all');
    return response.data;
  },

  getActiveSections: async (): Promise<Section[]> => {
    const response = await api.get('/sections/active');
    return response.data;
  },

  getSectionById: async (id: number): Promise<Section> => {
    const response = await api.get(`/sections/${id}`);
    return response.data;
  },

  createSection: async (section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
    const response = await api.post('/sections', section);
    return response.data;
  },

  updateSection: async (id: number, section: Omit<Section, 'id' | 'createdAt' | 'updatedAt'>): Promise<Section> => {
    const response = await api.put(`/sections/${id}`, section);
    return response.data;
  },

  deleteSection: async (id: number): Promise<void> => {
    await api.delete(`/sections/${id}`);
  }
};