import apiClient from './axios-config';
import { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/login/', credentials);
      const data = response.data;

      if (data.tokens?.access) {
        localStorage.setItem('authToken', data.tokens.access);
      }

      return data;
    } catch (error: any) {

      const errData = error.response?.data;

      if (errData?.errors) {
        return {
          message: errData.message || 'Login failed!',
          errors: errData.errors
        };
      }
      return {
        success: false,
        message: errData?.message || 'Login failed'
      };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post('/auth/signup/', credentials);
      if (response.data.tokens?.access) {
        localStorage.setItem('authToken', response.data.tokens.access);
      }
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
      };
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
};
