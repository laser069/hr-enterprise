export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
export type NotificationCategory = 'LEAVE' | 'PAYROLL' | 'PERFORMANCE' | 'SYSTEM' | 'RECRUITMENT';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationStats {
  unreadCount: number;
  count: number;
}
