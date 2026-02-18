import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002';

class NotificationSocket {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to notification socket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from notification socket');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }
}

export const notificationSocket = new NotificationSocket();
