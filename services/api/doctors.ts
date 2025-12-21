import apiClient from './axios-config';
import { Doctor } from '@/types/doctor';
import { Appointment } from '@/types/appointment';

// Kiểu dữ liệu đúng với API backend /api/doctors/
export interface DoctorAPIResponse {
  id: number;
  user: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    avatar: string | null;
    role: number;
    date_joined: string;
    is_active: boolean;
  };
  specialty: number | null;
  specialty_name?: string | null;
  room: number | null;
  price: number;
  experience: number | null;
  credentiaUrl: string | null;
  verificationStatus: string;
  is_available: boolean;
  created_at: string;
  description: string | null;
}

const transformDoctorData = (apiDoctor: DoctorAPIResponse): Doctor => {
  return {
    id: apiDoctor.id,
    user: apiDoctor.user,
    specialty: apiDoctor.specialty,
    room: apiDoctor.room,
    price: apiDoctor.price,
    experience: apiDoctor.experience,
    credentiaUrl: apiDoctor.credentiaUrl,
    verificationStatus: apiDoctor.verificationStatus,
    is_available: apiDoctor.is_available,
    created_at: apiDoctor.created_at,
    description: apiDoctor.description,

    // Giá trị mặc định phục vụ hiển thị UI
    specialization: apiDoctor.specialty_name || undefined,
    rating: 4.5,
    patients: 0,
  };
};

export const doctorsApi = {
  getAll: async (): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get('/doctors/');
      const apiDoctors: DoctorAPIResponse[] = response.data;
      return apiDoctors.map(transformDoctorData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Doctor | null> => {
    try {
      const response = await apiClient.get(`/doctors/${id}/`);
      const apiDoctor: DoctorAPIResponse = response.data;
      return transformDoctorData(apiDoctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  },

  getTopDoctors: async (limit: number = 3): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get(`/doctors/top/?limit=${limit}`);
      const apiDoctors: DoctorAPIResponse[] = response.data;
      return apiDoctors.map(transformDoctorData);
    } catch (error) {
      console.error('Error fetching top doctors:', error);
      return [];
    }
  },

  updateWorkSchedule: async (doctorId: string, schedule: any) => {
    try {
      const response = await apiClient.put(`/doctors/${doctorId}/schedule/`, schedule);
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      return null;
    }
  },

  getAppointments: async (doctorId: string): Promise<Appointment[]> => {
    try {
      const response = await apiClient.get(`/doctors/${doctorId}/appointments/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  },
};