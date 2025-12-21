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

  // Get current patient profile
  getMyProfile: async (): Promise<Patient | null> => {
    try {
      const response = await apiClient.get('/patients/me/');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching patient profile:', error);
      return null;
    }
  },

  update: async (data: {
    user?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      gender_id?: number | null;
      birthday?: string | null;
      address?: string | null;
      cccd?: string | null;
      ethinic_group?: string | null;
      avatar?: string | null;
    };
    user_data?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      gender_id?: number | null;
      birthday?: string | null;
      address?: string | null;
      cccd?: string | null;
      ethinic_group?: string | null;
      avatar?: string | null;
    };
    health_insurance_number?: string | null;
    occupation?: string | null;
    medical_history?: string | null;
  }): Promise<Patient> => {
    // Convert 'user' to 'user_data' to match backend serializer
    const payload: any = { ...data }
    if (payload.user && !payload.user_data) {
      payload.user_data = payload.user
      delete payload.user
    }
    const response = await apiClient.patch('/patients/me/', payload);
    return response.data.data || response.data;
  },
};
