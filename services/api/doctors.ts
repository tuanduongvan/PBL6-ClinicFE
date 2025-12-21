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
  average_rating?: number | null;
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
    rating: apiDoctor.average_rating || undefined,
    patients: 0,
    average_rating: apiDoctor.average_rating || null,
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

  getMyProfile: async (): Promise<Doctor | null> => {
    try {
      const response = await apiClient.get('/doctors/my-profile/');
      // Response format: { success: true, data: {...} }
      const responseData = response.data;
      const apiDoctor: DoctorAPIResponse = responseData.data || responseData;
      return transformDoctorData(apiDoctor);
    } catch (error: any) {
      console.error('Error fetching my doctor profile:', error);
      // Nếu 404, có nghĩa là chưa có doctor profile
      if (error.response?.status === 404) {
        return null;
      }
      return null;
    }
  },

  updateMyProfile: async (data: {
    user?: {
      first_name?: string;
      last_name?: string;
      phone?: string;
      gender_id?: number | null;
      avatar?: string | null;
    };
    specialty?: number | null;
    price?: number;
    experience?: number | null;
    credentiaUrl?: string | null;
    description?: string | null;
    currentWorkplace?: string | null;
  }): Promise<Doctor | null> => {
    try {
      // Prepare payload - backend expects nested user data
      const payload: any = {};
      
      if (data.user) {
        payload.user = { ...data.user };
        // The update method in DoctorSerializer sets attributes directly on user,
        // so we can pass gender_id directly
      }

      // Doctor-specific fields
      if (data.specialty !== undefined) payload.specialty = data.specialty;
      if (data.price !== undefined) payload.price = data.price;
      if (data.experience !== undefined) payload.experience = data.experience;
      if (data.credentiaUrl !== undefined) payload.credentiaUrl = data.credentiaUrl;
      if (data.description !== undefined) payload.description = data.description;
      // Note: currentWorkplace is not in the Doctor model, it might be stored elsewhere
      // For now, we'll skip it or handle it separately if needed

      // Use the new endpoint that allows doctors to update their own profile
      const response = await apiClient.patch('/doctors/my-profile/', payload);
      const responseData = response.data;
      const apiDoctor: DoctorAPIResponse = responseData.data || responseData;
      return transformDoctorData(apiDoctor);
    } catch (error: any) {
      console.error('Error updating doctor profile:', error);
      throw error;
    }
  },
};