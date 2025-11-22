import apiClient from './axios-config';
import { Appointment } from '@/types';

export const appointmentsAPI = {
  create: async (appointment: any): Promise<Appointment | null> => {
    try {
      const response = await apiClient.post('/appointments', appointment);
      return response.data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      throw error;
    }
  },

  getByPatient: async (patientId: string): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/appointments?patientId=${patientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  cancel: async (appointmentId: string): Promise<boolean> => {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/cancel`);
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }
  },

  update: async (appointmentId: string, data: any) => {
    try {
      const response = await apiClient.put(`/appointments/${appointmentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating appointment:', error);
      return null;
    }
  },
};
