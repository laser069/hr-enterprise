// Role types
export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
  _count?: {
    users: number;
    permissions: number;
  };
}

// Permission types
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Role-Permission mapping
export interface RolePermission {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
}

// DTOs for role operations
export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface AssignPermissionsDto {
  permissionIds: string[];
}

// DTOs for permission operations
export interface CreatePermissionDto {
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
}

// API response types
export interface RolesListResponse {
  data: Role[];
  total: number;
}

export interface PermissionsListResponse {
  data: Permission[];
  total: number;
}
