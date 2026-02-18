import type { Employee } from '../../modules/employees/types';

export interface User {
  id: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  roleId?: string;
  employeeId?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  employee?: Employee;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}