import api from './api';

export const classGroupService = {
  getAllClassGroups: async () => {
    const response = await api.get('/class-groups');
    return response.data;
  },
  
  getClassGroupById: async (id: number) => {
    const response = await api.get(`/class-groups/${id}`);
    return response.data;
  }
};