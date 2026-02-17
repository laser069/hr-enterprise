import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import { NotificationsService } from './notifications.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket {
  id: string;
  userId?: string;
  handshake: {
    auth?: { token?: string };
    query?: { token?: string };
  };
  join: (room: string) => void;
  disconnect: () => void;
  emit: (event: string, data?: any) => void;
}

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket server initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Get token from handshake auth or query
      const token =
        client.handshake.auth?.token ||
        client.handshake.query?.token;

      if (!token) {
        this.logger.warn('Connection attempt without token');
        client.disconnect();
        return;
      }

      // Verify token
      const payload = await this.jwtService.verifyAsync(token as string, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      client.userId = payload.sub;

      // Join user-specific room
      client.join(`user:${payload.sub}`);

      this.logger.log(`Client connected: ${client.id}, User: ${payload.sub}`);

      // Send unread count on connection
      const unreadCount = await this.notificationsService.getUnreadCount(payload.sub);
      client.emit('unread-count', { count: unreadCount });
    } catch (error) {
      this.logger.error(`Connection failed: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(client: AuthenticatedSocket, payload: { notificationId: string }) {
    if (!client.userId) return;

    try {
      await this.notificationsService.markAsRead(client.userId, payload.notificationId);
      client.emit('marked-as-read', { notificationId: payload.notificationId });
      
      // Update unread count
      const unreadCount = await this.notificationsService.getUnreadCount(client.userId);
      this.server.to(`user:${client.userId}`).emit('unread-count', { count: unreadCount });
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'An error occurred' });
    }
  }

  @SubscribeMessage('mark-all-as-read')
  async handleMarkAllAsRead(client: AuthenticatedSocket) {
    if (!client.userId) return;

    try {
      await this.notificationsService.markAllAsRead(client.userId);
      this.server.to(`user:${client.userId}`).emit('unread-count', { count: 0 });
      client.emit('all-marked-as-read');
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'An error occurred' });
    }
  }

  @SubscribeMessage('get-notifications')
  async handleGetNotifications(
    client: AuthenticatedSocket,
    payload: { limit?: number; offset?: number },
  ) {
    if (!client.userId) return;

    try {
      const result = await this.notificationsService.getUserNotifications(
        client.userId,
        payload,
      );
      client.emit('notifications', result);
    } catch (error: any) {
      client.emit('error', { message: error?.message || 'An error occurred' });
    }
  }

  // Method to send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    
    // Update unread count
    const unreadCount = await this.notificationsService.getUnreadCount(userId);
    this.server.to(`user:${userId}`).emit('unread-count', { count: unreadCount });
  }

  // Method to broadcast to all connected clients
  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }
}
