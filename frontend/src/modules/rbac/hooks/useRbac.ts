import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacApi } from '../services/rbac.api';
import type {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  CreatePermissionDto,
} from '../types';

// Query keys
export const rbacKeys = {
  all: ['rbac'] as const,
  roles: () => [...rbacKeys.all, 'roles'] as const,
  role: (id: string) => [...rbacKeys.roles(), id] as const,
  permissions: () => [...rbacKeys.all, 'permissions'] as const,
  permission: (id: string) => [...rbacKeys.permissions(), id] as const,
};

// ============ Role Hooks ============

export function useRoles() {
  return useQuery({
    queryKey: rbacKeys.roles(),
    queryFn: () => rbacApi.getRoles(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: rbacKeys.role(id),
    queryFn: () => rbacApi.getRole(id),
    enabled: !!id,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => rbacApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleDto }) =>
      rbacApi.updateRole(id, data),
    onSuccess: (_: unknown, variables: { id: string; data: UpdateRoleDto }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.role(variables.id) });
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rbacApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}

export function useAssignPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignPermissionsDto }) =>
      rbacApi.assignPermissions(id, data),
    onSuccess: (_: unknown, variables: { id: string; data: AssignPermissionsDto }) => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.role(variables.id) });
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
    },
  });
}

// ============ Permission Hooks ============

export function usePermissions() {
  return useQuery({
    queryKey: rbacKeys.permissions(),
    queryFn: () => rbacApi.getPermissions(),
  });
}

export function useCreatePermission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePermissionDto) => rbacApi.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() });
    },
  });
}

export function useSeedRolesAndPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => rbacApi.seedRolesAndPermissions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rbacKeys.roles() });
      queryClient.invalidateQueries({ queryKey: rbacKeys.permissions() });
    },
  });
}
