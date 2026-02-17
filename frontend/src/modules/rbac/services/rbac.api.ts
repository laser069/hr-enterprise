import { apiClient } from '../../../core/api/api-client';
import type {
  Role,
  Permission,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  CreatePermissionDto,
} from '../types';

export const rbacApi = {
  // ============ Role Operations ============
  
  // Get all roles
  getRoles: async (): Promise<Role[]> => {
    return apiClient.get<Role[]>('/rbac/roles');
  },

  // Get role by ID
  getRole: async (id: string): Promise<Role> => {
    return apiClient.get<Role>(`/rbac/roles/${id}`);
  },

  // Create new role
  createRole: async (data: CreateRoleDto): Promise<Role> => {
    return apiClient.post<Role>('/rbac/roles', data);
  },

  // Update role
  updateRole: async (id: string, data: UpdateRoleDto): Promise<Role> => {
    return apiClient.patch<Role>(`/rbac/roles/${id}`, data);
  },

  // Delete role
  deleteRole: async (id: string): Promise<void> => {
    await apiClient.delete(`/rbac/roles/${id}`);
  },

  // Assign permissions to role
  assignPermissions: async (id: string, data: AssignPermissionsDto): Promise<Role> => {
    return apiClient.post<Role>(`/rbac/roles/${id}/permissions`, data);
  },

  // ============ Permission Operations ============
  
  // Get all permissions
  getPermissions: async (): Promise<Permission[]> => {
    return apiClient.get<Permission[]>('/rbac/permissions');
  },

  // Create new permission
  createPermission: async (data: CreatePermissionDto): Promise<Permission> => {
    return apiClient.post<Permission>('/rbac/permissions', data);
  },

  // Seed default roles and permissions
  seedRolesAndPermissions: async (): Promise<void> => {
    await apiClient.post('/rbac/seed');
  },
};
