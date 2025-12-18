import apiClient from './axios-config';
import { Appointment } from '@/types/appointment';

// Helper function to transform backend appointment to frontend format
const transformAppointment = (data: any): Appointment => {
  // Combine date and time into ISO datetime string
  const dateTime = data.date && data.time 
    ? `${data.date}T${data.time.length === 5 ? data.time + ':00' : data.time}`
    : undefined;

  return {
    ...data,
    dateTime,
    duration: data.duration || 30, // Default 30 minutes if not provided
  };
};

export const appointmentsAPI = {
  // Lấy danh sách khung giờ trống từ Backend
  getAvailableSlots: async (doctorId: string | number, date: string): Promise<string[]> => {
    try {
      const response = await apiClient.get('/appointments/available-slots/', {
        params: {
          doctor_id: doctorId,
          date: date, // YYYY-MM-DD
          slot_duration: 30,
        },
      });
      return response.data.slots;
    } catch (error) {
      console.error('Error fetching slots:', error);
      return [];
    }
  },

  // Tạo lịch hẹn mới (bệnh nhân)
  create: async (appointment: {
    doctor_id: number | string | undefined;
    date: string;
    time: string;
    notes?: string;
  }): Promise<Appointment> => {
    const response = await apiClient.post('/appointments/', appointment);
    return transformAppointment(response.data);
  },

  // Lấy tất cả lịch hẹn của user hiện tại (bệnh nhân hoặc bác sĩ)
  getMyAppointments: async (): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get('/appointments/');
      const appointments = Array.isArray(response.data) ? response.data : [];
      return appointments.map(transformAppointment);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },

  // Bệnh nhân hủy lịch
  cancel: async (appointmentId: number): Promise<boolean> => {
    try {
      await apiClient.patch(`/appointments/${appointmentId}/cancel/`);
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }
  },

  // Bác sĩ xác nhận lịch (ACCEPTED)
  confirm: async (appointmentId: number): Promise<Appointment | null> => {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/confirm/`);
      return transformAppointment(response.data);
    } catch (error) {
      console.error('Error confirming appointment:', error);
      throw error;
    }
  },

  // Bác sĩ từ chối lịch (REJECTED)
  reject: async (appointmentId: number): Promise<Appointment | null> => {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/reject/`);
      return transformAppointment(response.data);
    } catch (error) {
      console.error('Error rejecting appointment:', error);
      throw error;
    }
  },

  // Đổi lịch hẹn (Reschedule)
  reschedule: async (appointmentId: number, data: {
    date: string;
    time: string;
  }): Promise<Appointment | null> => {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/reschedule/`, data);
      return transformAppointment(response.data);
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  },

  // Hoàn thành lịch hẹn (Complete)
  complete: async (appointmentId: number, recordData?: {
    reason?: string;
    description?: string;
    status_before?: string;
    status_after?: string;
  }): Promise<Appointment | null> => {
    try {
      const response = await apiClient.patch(`/appointments/${appointmentId}/complete/`, recordData || {});
      return transformAppointment(response.data.appointment || response.data);
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },
};