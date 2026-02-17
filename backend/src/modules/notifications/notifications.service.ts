import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

// Define types locally since Prisma 7 doesn't export them directly
type Notification = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: any;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
};

enum NotificationType {
  LEAVE_APPROVED = 'LEAVE_APPROVED',
  LEAVE_REJECTED = 'LEAVE_REJECTED',
  PAYROLL_PROCESSED = 'PAYROLL_PROCESSED',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  SYSTEM = 'SYSTEM',
  ANNOUNCEMENT = 'ANNOUNCEMENT',
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const notification = await (this.prisma as any).notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data || {},
      },
    });

    this.logger.log(`Notification created for user ${data.userId}: ${data.title}`);
    return notification;
  }

  async getUserNotifications(
    userId: string,
    options: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ notifications: Notification[]; unreadCount: number; total: number }> {
    const { unreadOnly = false, limit = 20, offset = 0 } = options;

    const where = {
      userId,
      ...(unreadOnly && { read: false }),
    };

    const [notifications, unreadCount, total] = await Promise.all([
      (this.prisma as any).notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      (this.prisma as any).notification.count({
        where: { userId, read: false },
      }),
      (this.prisma as any).notification.count({
        where: { userId },
      }),
    ]);

    return { notifications, unreadCount, total };
  }

  async markAsRead(userId: string, notificationId: string): Promise<Notification> {
    const notification = await (this.prisma as any).notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return (this.prisma as any).notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await (this.prisma as any).notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    await (this.prisma as any).notification.deleteMany({
      where: {
        id: notificationId,
        userId,
      },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return (this.prisma as any).notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  // Convenience methods for creating specific notification types
  async notifyLeaveApproved(
    userId: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.LEAVE_APPROVED,
      title: 'Leave Request Approved',
      message: `Your ${leaveType} leave from ${startDate.toDateString()} to ${endDate.toDateString()} has been approved.`,
      data: { leaveType, startDate, endDate },
    });
  }

  async notifyLeaveRejected(
    userId: string,
    leaveType: string,
    startDate: Date,
    endDate: Date,
    reason?: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.LEAVE_REJECTED,
      title: 'Leave Request Update',
      message: `Your ${leaveType} leave request has been updated.${reason ? ` Reason: ${reason}` : ''}`,
      data: { leaveType, startDate, endDate, reason },
    });
  }

  async notifyPayrollProcessed(
    userId: string,
    month: string,
    year: number,
    netSalary: number,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.PAYROLL_PROCESSED,
      title: 'Payroll Processed',
      message: `Your payroll for ${month} ${year} has been processed. Net salary: $${netSalary.toLocaleString()}`,
      data: { month, year, netSalary },
    });
  }

  async notifyPerformanceReview(
    userId: string,
    reviewPeriod: string,
    reviewerName: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.PERFORMANCE_REVIEW,
      title: 'Performance Review Scheduled',
      message: `Your performance review for ${reviewPeriod} with ${reviewerName} has been scheduled.`,
      data: { reviewPeriod, reviewerName },
    });
  }

  async notifyDocumentUploaded(
    userId: string,
    documentName: string,
    category: string,
  ): Promise<Notification> {
    return this.createNotification({
      userId,
      type: NotificationType.DOCUMENT_UPLOADED,
      title: 'New Document Uploaded',
      message: `A new ${category} document "${documentName}" has been uploaded to your account.`,
      data: { documentName, category },
    });
  }
}
