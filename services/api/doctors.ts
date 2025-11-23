import apiClient from './axios-config';
import { Doctor } from '@/types/doctor';
import { Appointment } from '@/types/appointment'

export const doctorsAPI = {
  getAll: async (): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get('/doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Doctor | null> => {
    try {
      const response = await apiClient.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  },

  getTopDoctors: async (limit: number = 3): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get(`/doctors/top?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching top doctors:', error);
      return [];
    }
  },

  updateWorkSchedule: async (doctorId: string, schedule: any) => {
    try {
      const response = await apiClient.put(`/doctors/${doctorId}/schedule`, schedule);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  },

  getAppointments: async (doctorId: string): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },
};
