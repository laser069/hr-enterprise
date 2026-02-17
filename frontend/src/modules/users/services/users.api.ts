import { apiClient } from '../../../core/api/api-client';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  UpdateUserRoleDto,
  ResetPasswordDto,
  GetUsersParams,
  UsersListResponse,
} from '../types';

export const usersApi = {
  // Get all users with pagination
  getUsers: async (params?: GetUsersParams): Promise<UsersListResponse> => {
    return apiClient.get<UsersListResponse>('/users', { params });
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/users/me');
  },

  // Get user by ID
  getUser: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  // Create new user
  createUser: async (data: CreateUserDto): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}`, data);
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },

  // Reset user password
  resetPassword: async (id: string, data: ResetPasswordDto): Promise<User> => {
    return apiClient.post<User>(`/users/${id}/reset-password`, data);
  },

  // Assign role to user
  assignRole: async (id: string, data: UpdateUserRoleDto): Promise<User> => {
    return apiClient.patch<User>(`/users/${id}/role`, data);
  },
};
