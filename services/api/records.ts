import apiClient from './axios-config';
import { AppointmentRecord } from '@/types/record';

export const recordsAPI = {
  // Lấy tất cả hồ sơ khám của user hiện tại
  getMyRecords: async (): Promise<AppointmentRecord[]> => {
    try {
      const response = await apiClient.get('/appointment-records/');
      return response.data as AppointmentRecord[];
    } catch (error) {
      console.error('Error fetching records:', error);
      return [];
    }
  },

  // Lấy hồ sơ khám theo appointment ID
  getByAppointment: async (appointmentId: number): Promise<AppointmentRecord | null> => {
    try {
      const response = await apiClient.get(`/appointment-records/?appointment=${appointmentId}`);
      const records = response.data as AppointmentRecord[];
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Error fetching record:', error);
      return null;
    }
  },

  // Tạo hồ sơ khám mới
  create: async (data: {
    appointment_id: number;
    reason?: string;
    description?: string;
    status_before?: string;
    status_after?: string;
  }): Promise<AppointmentRecord> => {
    const response = await apiClient.post('/appointment-records/', data);
    return response.data as AppointmentRecord;
  },

  // Cập nhật hồ sơ khám
  update: async (recordId: number, data: {
    reason?: string;
    description?: string;
    status_before?: string;
    status_after?: string;
  }): Promise<AppointmentRecord> => {
    const response = await apiClient.patch(`/appointment-records/${recordId}/`, data);
    return response.data as AppointmentRecord;
  },

  // Lấy hồ sơ khám theo ID
  getById: async (recordId: number): Promise<AppointmentRecord | null> => {
    try {
      const response = await apiClient.get(`/appointment-records/${recordId}/`);
      return response.data as AppointmentRecord;
    } catch (error) {
      console.error('Error fetching record:', error);
      return null;
    }
  },
};

