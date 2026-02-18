import { useState, useEffect, type ReactNode } from 'react';
import type { User } from '../types/user.types';
import { authService } from './auth-service';
import { AuthContext } from './auth-context-def';
import { useContext } from 'react';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface ProfileResponse {
  user: User;
  permissions: string[];
}

export interface AuthContextType {
  user: User | null;
  permissions: string[];
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const data = await authService.getProfile() as ProfileResponse;
      setUser(data.user);
      setPermissions(data.permissions || []);
      
      // Attempt to connect socket if possible
      try {
        const { notificationSocket } = await import('../../modules/notifications/services/notifications.socket');
        notificationSocket.connect(localStorage.getItem('accessToken')!);
      } catch (err) {
        console.warn('Socket connection deferred or failed:', err);
      }
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('accessToken', data.tokens.accessToken);
    localStorage.setItem('refreshToken', data.tokens.refreshToken);
    setUser(data.user);
    // Assuming backend returns permissions under role or as a separate field
    const perms = data.user.role?.permissions?.map((p: any) => p.name) || [];
    setPermissions(perms);
    
    try {
      const { notificationSocket } = await import('../../modules/notifications/services/notifications.socket');
      notificationSocket.connect(data.tokens.accessToken);
    } catch (err) {
       console.warn('Socket connection failed after login:', err);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      try {
        const { notificationSocket } = await import('../../modules/notifications/services/notifications.socket');
        notificationSocket.disconnect();
      } catch {}
      setUser(null);
      setPermissions([]);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission) || permissions.includes('*');
  };

  const hasAnyPermission = (perms: string[]): boolean => {
    return perms.some((p) => hasPermission(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
