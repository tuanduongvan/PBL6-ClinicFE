import apiClient from './axios-config';
import { Patient } from '@/types/patient';

export const patientsAPI = {
  getAll: async (): Promise<Patient[]> => {
    try {
      const response = await apiClient.get('/patients');
      return response.data;
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Patient | null> => {
    try {
      const response = await apiClient.get(`/patients/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  update: async (data: Partial<Patient>): Promise<Patient> => {
    const response = await apiClient.patch('/patients/me/', data);
    return response.data.data;
  },
};
