/**
 * ═══════════════════════════════════════════════════════════
 * useRoles — Centralized RBAC hook for Crea Academy
 * ═══════════════════════════════════════════════════════════
 *
 * Single source of truth for the current user's roles.
 * Reads from Zustand store (populated by AuthContext on login).
 * Provides convenience booleans and permission checks.
 */

import { useCallback } from 'react';
import { useAppStore } from '@/stores/useAppStore';
import {
  hasPermission as checkPermission,
  hasRoleOrAbove,
  getHighestRole,
  type AppRole,
  type Permission,
} from '@/lib/permissions';

export function useRoles() {
  const userRoles = useAppStore((s) => s.userRoles);
  const userRolesLoaded = useAppStore((s) => s.userRolesLoaded);

  const hasPermission = useCallback(
    (permission: Permission) => checkPermission(userRoles, permission),
    [userRoles]
  );

  const hasRole = useCallback(
    (role: AppRole) => userRoles.includes(role),
    [userRoles]
  );

  const hasMinRole = useCallback(
    (minRole: AppRole) => hasRoleOrAbove(userRoles, minRole),
    [userRoles]
  );

  const canAccessPlatform = hasPermission('student.platform.access');
  const isWaitingList = userRoles.includes('waiting_list');

  return {
    roles: userRoles,
    rolesLoaded: userRolesLoaded,
    highestRole: getHighestRole(userRoles),

    // Convenience booleans
    isSuperAdmin: userRoles.includes('super_admin'),
    // Global admin access is exclusive to super_admin.
    // app_role=admin is treated as legacy and should not unlock platform admin UI.
    isAdmin: userRoles.includes('super_admin'),
    isInstructor: userRoles.some((r) => r === 'instructor' || r === 'admin' || r === 'super_admin'),
    isStudent: canAccessPlatform,
    isWaitingList,
    isWaitingListOnly: isWaitingList && !canAccessPlatform,
    canAccessPlatform,

    // Permission & role checkers
    hasPermission,
    hasRole,
    hasMinRole,
  };
}
