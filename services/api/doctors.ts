import apiClient from './axios-config';
import { Doctor } from '@/types/doctor';
import { Appointment } from '@/types/appointment'

interface DoctorAPIResponse {
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
  specialty: string | null;
  room: string | null;
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
    id: apiDoctor.id, // User.id is number
    username: apiDoctor.user.username,
    email: apiDoctor.user.email,
    first_name: apiDoctor.user.first_name,
    last_name: apiDoctor.user.last_name,
    phone: apiDoctor.user.phone,
    avatar: apiDoctor.user.avatar || undefined,
    role: {
      id: 2,
      name: 'Doctor'
    },
    gender: {
      id: 1,
      name: 'Male' // Default, API không có gender
    },
    is_active: apiDoctor.user.is_active,
    specialization: apiDoctor.specialty || 'General Practitioner',
    experience: apiDoctor.experience || 0,
    rating: 4.5, // Default rating, API không có
    bio: apiDoctor.description || 'Experienced doctor providing quality healthcare services.',
    workSchedule: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    },
    patients: 0 // Default, API không có
  };
};

export const doctorsAPI = {
  getAll: async (): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get('/doctors');
      const apiDoctors: DoctorAPIResponse[] = response.data;
      
      // Transform API response to Doctor type
      return apiDoctors.map(transformDoctorData);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Doctor | null> => {
    try {
      const response = await apiClient.get(`/doctors/${id}`);
      const apiDoctor: DoctorAPIResponse = response.data;
      return transformDoctorData(apiDoctor);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  },

  getTopDoctors: async (limit: number = 3): Promise<Doctor[]> => {
    try {
      const response = await apiClient.get(`/doctors/top?limit=${limit}`);
      const apiDoctors: DoctorAPIResponse[] = response.data;
      return apiDoctors.map(transformDoctorData);
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
