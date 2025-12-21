import apiClient from './axios-config';
import {
  Rating,
  RatingListItem,
  RatingByDoctorResponse,
  CreateRatingPayload,
  UpdateRatingPayload,
} from '@/types/rating';

export interface CreateRatingPayload {
  appointment_id: number;
  rating: number;
  comment?: string;
}

export interface UpdateRatingPayload {
  rating?: number;
  comment?: string;
}

export const ratingsAPI = {
  // Lấy tất cả ratings của user hiện tại
  getAll: async (): Promise<Rating[]> => {
    try {
      const response = await apiClient.get('/ratings/');
      return response.data as Rating[];
    } catch (error) {
      console.error('Error fetching ratings:', error);
      return [];
    }
  },

  // Lấy rating theo ID
  getById: async (ratingId: number): Promise<Rating | null> => {
    try {
      const response = await apiClient.get(`/ratings/${ratingId}/`);
      return response.data as Rating;
    } catch (error) {
      console.error('Error fetching rating:', error);
      return null;
    }
  },

  // Lấy ratings theo doctor ID (kèm thống kê)
  getByDoctor: async (doctorId: number): Promise<RatingByDoctorResponse | null> => {
    try {
      const response = await apiClient.get(`/ratings/by-doctor/${doctorId}/`);
      return response.data as RatingByDoctorResponse;
    } catch (error) {
      console.error('Error fetching ratings by doctor:', error);
      return null;
    }
  },

  // Lấy rating theo appointment ID
  getByAppointment: async (appointmentId: number): Promise<Rating | null> => {
    try {
      const response = await apiClient.get(`/ratings/by-appointment/${appointmentId}/`);
      return response.data as Rating;
    } catch (error: any) {
      // 404 là bình thường nếu appointment chưa có rating
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching rating by appointment:', error);
      return null;
    }
  },

  // Tạo rating mới
  create: async (payload: CreateRatingPayload): Promise<Rating> => {
    const response = await apiClient.post('/ratings/', {
      appointment_id: payload.appointment_id,
      rating: payload.rating,
      comment: payload.comment || '',
    });
    return response.data as Rating;
  },

  // Cập nhật rating
  update: async (ratingId: number, payload: UpdateRatingPayload): Promise<Rating> => {
    const response = await apiClient.patch(`/ratings/${ratingId}/`, payload);
    return response.data as Rating;
  },

  // Xóa rating
  delete: async (ratingId: number): Promise<boolean> => {
    try {
      await apiClient.delete(`/ratings/${ratingId}/`);
      return true;
    } catch (error) {
      console.error('Error deleting rating:', error);
      return false;
    }
  },
};

