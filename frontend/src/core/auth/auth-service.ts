import { apiClient } from '../api/api-client';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ChangePasswordRequest,
  User,
} from '../types/user.types';

const AUTH_BASE = '/auth';

interface LoginApiResponse {
  user?: User;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
  permissions?: string[];
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    };
    permissions: string[];
  };
  accessToken?: string; // Handle flattened case
  refreshToken?: string;
  expiresIn?: number;
}

export const authService = {

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginApiResponse>(`${AUTH_BASE}/login`, data);
    
    // Defensive extraction - handle potentially flattened or nested responses
    let tokens;
    let user;
    let permissions;

    if (response.tokens) {
      tokens = response.tokens;
      user = response.user;
      permissions = response.permissions;
    } else if (response.data?.tokens) {
      tokens = response.data.tokens;
      user = response.data.user;
      permissions = response.data.permissions;
    } else {
      // Fallback for flattened response
      tokens = response as unknown as { accessToken: string; refreshToken: string; expiresIn: number };
      user = response as unknown as User;
      permissions = [] as string[];
    }

    if (!tokens?.accessToken || !user) {
      console.error('[AuthService] Login failed: Invalid response', response);
      throw new Error('Authentication failed: Invalid server response');
    }

    const permissionObjects = (permissions || []).map((p: string) => {
      const parts = p.split(':');
      return {
        id: p,
        name: p,
        resource: parts[0] || '',
        action: parts[1] || '',
        createdAt: new Date().toISOString()
      };
    });

    const userWithRoleName = user as User & { roleName?: string };

    return {
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn || 3600,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || '', 
        lastName: user.lastName || '',
        isActive: user.isActive ?? true,
        emailVerified: user.emailVerified ?? true,
        roleId: user.roleId || '',
        role: (userWithRoleName.roleName || user.role?.name) ? { 
          id: user.roleId || '', 
          name: userWithRoleName.roleName || user.role?.name || '',
          isSystem: false,
          permissions: permissionObjects,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : undefined,
        employeeId: user.employeeId,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      },
    };
  },

  register: async (data: RegisterRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginApiResponse>(`${AUTH_BASE}/register`, data);
    
    // Defensive extraction - handle potentially flattened or nested responses
    let tokens;
    let user;
    let permissions;

    if (response.tokens) {
      tokens = response.tokens;
      user = response.user;
      permissions = response.permissions;
    } else if (response.data?.tokens) {
      tokens = response.data.tokens;
      user = response.data.user;
      permissions = response.data.permissions;
    } else {
      // Fallback for flattened response
      tokens = response as unknown as { accessToken: string; refreshToken: string; expiresIn: number };
      user = response as unknown as User;
      permissions = [] as string[];
    }

    if (!tokens?.accessToken || !user) {
      console.error('[AuthService] Registration failed: Invalid response', response);
      throw new Error('Registration failed: Invalid server response');
    }

    const permissionObjects = (permissions || []).map((p: string) => {
      const parts = p.split(':');
      return {
        id: p,
        name: p,
        resource: parts[0] || '',
        action: parts[1] || '',
        createdAt: new Date().toISOString()
      };
    });

    const userWithRoleName = user as User & { roleName?: string };

    return {
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn || 3600,
      },
      user: {
        id: user.id,
        email: user.email,
        firstName: data.firstName || user.firstName || '',
        lastName: data.lastName || user.lastName || '',
        isActive: user.isActive ?? true,
        emailVerified: false,
        roleId: user.roleId || '',
        role: (userWithRoleName.roleName || user.role?.name) ? { 
          id: user.roleId || '', 
          name: userWithRoleName.roleName || user.role?.name || '',
          isSystem: false,
          permissions: permissionObjects,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } : undefined,
        employeeId: user.employeeId,
        createdAt: user.createdAt || new Date().toISOString(),
        updatedAt: user.updatedAt || new Date().toISOString(),
      },
    };
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiClient.post(`${AUTH_BASE}/logout`, refreshToken ? { refreshToken } : undefined);
  },

  logoutAll: async (): Promise<void> => {
    return apiClient.post(`${AUTH_BASE}/logout-all`);
  },

  refresh: async (data: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<{ tokens: RefreshTokenResponse }>(`${AUTH_BASE}/refresh`, data);
    return response.tokens;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    return apiClient.post(`${AUTH_BASE}/change-password`, data);
  },

  getProfile: async () => {
    return apiClient.get(`${AUTH_BASE}/me`);
  },

  forgotPassword: (email: string) => 
    apiClient.post(`${AUTH_BASE}/forgot-password`, { email }),
  
  resetPassword: (token: string, newPassword: string) => 
    apiClient.post(`${AUTH_BASE}/reset-password`, { token, newPassword }),
  
  verifyEmail: (token: string) => 
    apiClient.get(`${AUTH_BASE}/verify-email`, { params: { token } }),
  
  resendVerification: () => 
    apiClient.post(`${AUTH_BASE}/resend-verification`),
};