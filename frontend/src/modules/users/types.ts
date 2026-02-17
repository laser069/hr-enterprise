// User entity types
export interface User {
  id: string;
  email: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  roleId?: string;
  employeeId?: string;
  createdAt: string;
  updatedAt: string;
  role?: Role;
  employee?: Employee;
}

// Role reference (simplified)
export interface Role {
  id: string;
  name: string;
  description?: string;
}

// Employee reference (simplified)
export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employeeCode: string;
}

// DTOs for user operations
export interface CreateUserDto {
  email: string;
  password: string;
  roleId?: string;
  employeeId?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  isActive?: boolean;
  emailVerified?: boolean;
}

export interface UpdateUserRoleDto {
  roleId: string | null;
}

export interface ResetPasswordDto {
  newPassword: string;
}

// Query params
export interface GetUsersParams {
  skip?: number;
  take?: number;
  isActive?: boolean;
  roleId?: string;
}

// API response types
export interface UsersListResponse {
  data: User[];
  total: number;
  skip: number;
  take: number;
}
