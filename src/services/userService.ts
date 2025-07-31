import api from './api';

export interface UserDTO {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PasswordResetDTO {
  username: string;
  newPassword: string;
}

export interface EmailUpdateDTO {
  username: string;
  newEmail: string;
}

export interface RoleUpdateDTO {
  username: string;
  roles: string[];
}

export interface UserRegistrationDTO {
  username: string;
  email: string;
  password: string;
  roles: string[];
}

export const userService = {
  getAllUsers: async (): Promise<UserDTO[]> => {
    const response = await api.get('/users/all');
    return response.data;
  },

  getUserByUsername: async (username: string): Promise<UserDTO> => {
    const response = await api.get(`/users/${username}`);
    return response.data;
  },

  resetPassword: async (data: PasswordResetDTO): Promise<UserDTO> => {
    const response = await api.post('/users/reset-password', data);
    return response.data;
  },

  updateEmail: async (data: EmailUpdateDTO): Promise<UserDTO> => {
    const response = await api.post('/users/update-email', data);
    return response.data;
  },

  updateRoles: async (data: RoleUpdateDTO): Promise<UserDTO> => {
    console.log('Sending role update request:', data);
    try {
      // Send roles as array, not Set
      const response = await api.post('/users/update-roles', {
        username: data.username,
        roles: data.roles
      });
      console.log('Role update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Role update error:', error);
      throw error;
    }
  },

  toggleUserStatus: async (username: string): Promise<UserDTO> => {
    const response = await api.post(`/users/toggle-status/${username}`);
    return response.data;
  },

  createUser: async (data: UserRegistrationDTO): Promise<UserDTO> => {
    const response = await api.post('/users/create', data);
    return response.data;
  }
};