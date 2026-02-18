import { apiClient } from '../../../core/api/api-client';
import type { PaginatedResponse } from '../../../core/api/api-client';
import type { Notification, NotificationStats } from '../types';

export const notificationsApi = {
  getNotifications: (params?: Record<string, unknown>): Promise<PaginatedResponse<Notification>> => {
    return apiClient.getPaginated<Notification>('/notifications', { params });
  },

  getUnreadCount: (): Promise<NotificationStats> => {
    return apiClient.get<NotificationStats>('/notifications/unread-count');
  },

  markAsRead: (id: string): Promise<void> => {
    return apiClient.post(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<void> => {
    return apiClient.post('/notifications/read-all');
  },

  deleteNotification: (id: string): Promise<void> => {
    return apiClient.delete(`/notifications/${id}`);
  },
};
