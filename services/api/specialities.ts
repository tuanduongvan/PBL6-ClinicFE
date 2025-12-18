import apiClient from './axios-config';

export interface Speciality {
  id: number;
  name: string;
  description: string;
  image?: string | null;
}

export const specialitiesAPI = {
  // Lấy tất cả chuyên khoa
  getAll: async (): Promise<Speciality[]> => {
    try {
      const response = await apiClient.get('/specialities/');
      return response.data as Speciality[];
    } catch (error) {
      console.error('Error fetching specialities:', error);
      return [];
    }
  },

  // Lấy chuyên khoa theo ID
  getById: async (id: number): Promise<Speciality | null> => {
    try {
      const response = await apiClient.get(`/specialities/${id}/`);
      return response.data as Speciality;
    } catch (error) {
      console.error('Error fetching speciality:', error);
      return null;
    }
  },
};

