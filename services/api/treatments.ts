import apiClient from './axios-config';
import { Treatment } from '@/types/treatment';

export const treatmentsAPI = {
  // Lấy tất cả đơn thuốc của user hiện tại
  getMyTreatments: async (): Promise<Treatment[]> => {
    try {
      const response = await apiClient.get('/treatments/');
      return response.data as Treatment[];
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return [];
    }
  },

  // Lấy đơn thuốc theo appointment ID
  getByAppointment: async (appointmentId: number): Promise<Treatment[]> => {
    try {
      const response = await apiClient.get(`/treatments/?appointment=${appointmentId}`);
      return response.data as Treatment[];
    } catch (error) {
      console.error('Error fetching treatments:', error);
      return [];
    }
  },

  // Tạo đơn thuốc mới
  create: async (data: {
    appointment_id: number;
    name: string;
    purpose: string;
    drug_id?: number | null;
    dosage?: string;
    repeat_days?: string;
    repeat_time?: string;
  }): Promise<Treatment> => {
    const response = await apiClient.post('/treatments/', data);
    return response.data as Treatment;
  },

  // Cập nhật đơn thuốc
  update: async (treatmentId: number, data: {
    name?: string;
    purpose?: string;
    drug_id?: number | null;
    dosage?: string;
    repeat_days?: string;
    repeat_time?: string;
  }): Promise<Treatment> => {
    const response = await apiClient.patch(`/treatments/${treatmentId}/`, data);
    return response.data as Treatment;
  },

  // Xóa đơn thuốc
  delete: async (treatmentId: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/treatments/${treatmentId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting treatment:', error);
      return false;
    }
  },
};

