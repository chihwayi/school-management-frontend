import api from './api';

export interface SignatureData {
  id: number;
  signatureUrl: string;
  teacherName: string;
  role: string;
  uploadedAt?: string;
}

export const signatureService = {
  uploadSignature: async (file: File): Promise<SignatureData> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/signatures/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getMySignature: async (): Promise<SignatureData | null> => {
    try {
      const response = await api.get('/signatures/my-signature');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getPrincipalSignature: async (): Promise<SignatureData | null> => {
    try {
      const response = await api.get('/signatures/principal');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getClassTeacherSignature: async (form: string, section: string): Promise<SignatureData | null> => {
    try {
      const response = await api.get(`/signatures/class-teacher/${form}/${section}`);
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getSubjectTeacherSignature: async (subjectId: number, form: string, section: string): Promise<SignatureData | null> => {
    try {
      const response = await api.get(`/signatures/subject-teacher/${subjectId}/${form}/${section}`);
      return response.data;
    } catch (error) {
      return null;
    }
  }
};