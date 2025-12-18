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
    try {
      const response = await apiClient.get('/notifications/');
      return response.data as Notification[];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Đánh dấu thông báo là đã đọc
  markAsRead: async (notificationId: number): Promise<boolean> => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/`, { is_read: true });
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Đánh dấu tất cả thông báo là đã đọc
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

