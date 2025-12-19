import apiClient from './axios-config';

export interface Notification {
  id: number;
  user: number;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const notificationsAPI = {
  // Lấy danh sách thông báo của user hiện tại
  getMyNotifications: async (): Promise<Notification[]> => {
    // Don't make API call if user is not authenticated
    if (typeof window === 'undefined') {
      return [];
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      // No token means not logged in, return empty array without making request
      return [];
    }

    try {
      const response = await apiClient.get('/notifications/');
      return response.data as Notification[];
    } catch (error: any) {
      // Ignore 401 Unauthorized errors (user not logged in)
      if (error?.response?.status === 401) {
        return [];
      }
      // Ignore network errors and aborted requests silently
      if (
        error?.code === 'ERR_CANCELED' || 
        error?.code === 'ERR_NETWORK' ||
        error?.message === 'Request aborted' || 
        error?.message === 'Network Error' ||
        error?.name === 'AbortError' ||
        error?.name === 'NetworkError'
      ) {
        // Silently return empty array for network/abort errors
        return [];
      }
      // Only log non-network errors
      if (error?.response) {
        console.error('Error fetching notifications:', error);
      }
      return [];
    }
  },

  markAsRead: async (notificationId: number): Promise<boolean> => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/`, { is_read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  markAllAsRead: async (): Promise<boolean> => {
    try {
      await apiClient.post('/notifications/mark-all-read/');
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },
};

