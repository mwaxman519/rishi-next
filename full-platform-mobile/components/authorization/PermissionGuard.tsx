"use client";

import { ReactNode } from "react";
import { useAuthorization } from "@/components/../hooks/useAuthorization";
import { Permission } from "@/components/../lib/rbac";

interface PermissionGuardProps {
  /**
   * The children to render if the user has the required permissions
   */
  children: ReactNode;

  /**
   * The permission required to view this component
   */
  permission?: Permission;

  /**
   * Array of permissions where any one permission grants access
   */
  anyPermissions?: Permission[];

  /**
   * Component to render when the user does not have permission
   * If not provided, nothing will be rendered
   */
  fallback?: ReactNode;
}

/**
 * Component that only renders its children if the current user
 * has the specified permission(s)
 */
export default function PermissionGuard({
  children,
  permission,
  anyPermissions,
  fallback = null,
}: PermissionGuardProps) {
  const { checkPermission, checkAnyPermission } = useAuthorization();

  // If no permissions specified, always render children
  if (!permission && !anyPermissions) {
    return <>{children}</>;
  }

  // Check permissions
  const hasAccess =
    // Check single permission if provided
    (permission && checkPermission(permission)) ||
    // Check any permissions if provided
    (anyPermissions &&
      anyPermissions.length > 0 &&
      checkAnyPermission(anyPermissions));

  // Render children if user has access, otherwise render fallback
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
