import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Notification, NotificationStats } from '../types';
import { notificationsApi } from '../services/notifications.api';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: notificationKeys.lists(),
    queryFn: () =>
      notificationsApi.getNotifications().then(res => {
        // Backend returns: { notifications: [...], unreadCount: N, total: N }
        const result = res as any;
        if (Array.isArray(result?.notifications)) return result.notifications;
        if (Array.isArray(result?.data)) return result.data;
        if (Array.isArray(result)) return result;
        return [];
      }),
    refetchInterval: 30000,
  });
}

export function useUnreadCount() {
  return useQuery<NotificationStats>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}
