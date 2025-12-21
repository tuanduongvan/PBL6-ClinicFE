import apiClient from './axios-config';
import { Drug } from '@/types/treatment';

export const drugsAPI = {
  // Lấy tất cả thuốc
  getAll: async (): Promise<Drug[]> => {
    try {
      const response = await apiClient.get('/drugs/');
      return response.data as Drug[];
    } catch (error: any) {
      // Silently handle 404 - drugs API endpoint not implemented yet
      if (error.response?.status === 404) {
        // Endpoint not available yet, return empty array
        return [];
      }
      console.error('Error fetching drugs:', error);
      return [];
    }
  },

  // Tìm kiếm thuốc theo tên
  search: async (query: string): Promise<Drug[]> => {
    try {
      const response = await apiClient.get('/drugs/', {
        params: { search: query },
      });
      return response.data as Drug[];
    } catch (error: any) {
      // Silently handle 404 - drugs API endpoint not implemented yet
      if (error.response?.status === 404) {
        return [];
      }
      console.error('Error searching drugs:', error);
      return [];
    }
  },

  // Lấy thuốc theo ID
  getById: async (drugId: number): Promise<Drug | null> => {
    try {
      const response = await apiClient.get(`/drugs/${drugId}/`);
      return response.data as Drug;
    } catch (error: any) {
      // Silently handle 404 - drugs API endpoint not implemented yet
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching drug:', error);
      return null;
    }
  },
};

