"use client";

import React, { ReactNode } from "react";
import { useRBAC } from "../../hooks/useRBAC";

interface PermissionGuardProps {
  /** Permission required to view the guarded content */
  permission?: string;

  /** Multiple permissions where any one is sufficient (logical OR) */
  permissionList?: string[];

  /** Specific role required to view content */
  requiredRole?: string;

  /** Whether all permissions are required vs. any one of them */
  requireAll?: boolean;

  /** Content to display if permission check passes */
  children: ReactNode;

  /** Optional content to display if permission check fails */
  fallback?: ReactNode;

  /** Whether to completely hide the component if no access */
  hideIfNoAccess?: boolean;
}

/**
 * PermissionGuard component controls visibility based on user permissions
 *
 * This component wraps content that should only be visible to users with
 * specific permissions or roles. It integrates with the RBAC context to
 * perform permission checks.
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissionList,
  requiredRole,
  requireAll = false,
  children,
  fallback = null,
  hideIfNoAccess = false,
}) => {
  const { hasPermission, userRole } = useRBAC();

  // Check if user has required role
  if (requiredRole && userRole !== requiredRole) {
    return hideIfNoAccess ? null : <>{fallback}</>;
  }

  // Check for a single permission
  if (permission && !hasPermission(permission)) {
    return hideIfNoAccess ? null : <>{fallback}</>;
  }

  // Check for multiple permissions
  if (permissionList && permissionList.length > 0) {
    if (requireAll) {
      // User must have ALL permissions
      const hasAllPermissions = permissionList.every((p) => hasPermission(p));
      if (!hasAllPermissions) {
        return hideIfNoAccess ? null : <>{fallback}</>;
      }
    } else {
      // User must have AT LEAST ONE permission
      const hasAnyPermission = permissionList.some((p) => hasPermission(p));
      if (!hasAnyPermission) {
        return hideIfNoAccess ? null : <>{fallback}</>;
      }
    }
  }

  // All checks passed, render the children
  return <>{children}</>;
};

export default PermissionGuard;
