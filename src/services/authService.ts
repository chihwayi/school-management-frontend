import api from './api';
import type { LoginRequest, RegisterRequest, JwtResponse } from '../types';

export const authService = {
  login: async (loginData: LoginRequest): Promise<JwtResponse> => {
    try {
      console.log('Attempting login with:', { 
        usernameOrEmail: loginData.usernameOrEmail,
        passwordLength: loginData.password?.length 
      });
      
      const response = await api.post<JwtResponse>('/auth/login', loginData);
      
      console.log('Login response:', {
        status: response.status,
        hasToken: !!response.data.token,
        username: response.data.username,
        roles: response.data.roles
      });
      
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRoles', JSON.stringify(response.data.roles));
        localStorage.setItem('username', response.data.username);
        
        console.log('Token stored successfully:', {
          tokenLength: response.data.token.length,
          tokenPreview: response.data.token.substring(0, 20) + '...',
          username: response.data.username,
          roles: response.data.roles
        });
      } else {
        console.error('No token received in login response');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        fullError: error
      });
      
      // Log the actual error response body
      if (error.response?.data) {
        console.error('Backend error response:', error.response.data);
      }
      
      // Re-throw with more specific error message
      let errorMessage = 'An unexpected error occurred';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `Server error (${error.response.status}): ${error.response.statusText || 'Unknown error'}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  },

  register: async (registerData: RegisterRequest): Promise<any> => {
    const response = await api.post('/auth/register', registerData);
    return response.data;
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRoles');
    localStorage.removeItem('username');
  },

  checkSchoolSetup: async (): Promise<{ configured: boolean; school?: any }> => {
    const response = await api.get('/auth/check-school-setup');
    return response.data;
  },

  getCurrentUser: () => {
    const token = localStorage.getItem('authToken');
    const roles = localStorage.getItem('userRoles');
    const username = localStorage.getItem('username');
    
    if (token && roles && username) {
      return {
        token,
        roles: JSON.parse(roles),
        username,
        isAuthenticated: true
      };
    }
    
    return { isAuthenticated: false };
  }
};

