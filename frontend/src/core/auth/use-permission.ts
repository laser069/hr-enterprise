import { useAuthContext } from './use-auth-context';

/**
 * Hook to check if the current user has a specific permission or any of multiple permissions.
 * Permissions format: resource:action (e.g., 'employee:read', 'payroll:write')
 * Supports '*' as a wildcard for all permissions.
 */
export function usePermission() {
  const { hasPermission, hasAnyPermission, permissions, user } = useAuthContext();

  return {
    hasPermission,
    hasAnyPermission,
    allPermissions: permissions,
    userRole: user?.roleName,
    isAdmin: user?.roleName === 'Admin',
  };
}
