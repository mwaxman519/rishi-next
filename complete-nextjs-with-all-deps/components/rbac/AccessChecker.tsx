"use client";

import React, { useContext } from "react";
import { RBACContext } from "@/components/../contexts/RBACProvider";
import { Permission } from "@/components/../lib/rbac";

interface AccessCheckerProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Component to conditionally render content based on user permissions
 * Use this to protect UI elements based on user's access rights
 */
export function AccessChecker({
  permission,
  fallback = null,
  children,
}: AccessCheckerProps) {
  const { hasPermission } = useContext(RBACContext);

  // If the user has the required permission, render the children
  if (hasPermission(permission)) {
    return <>{children}</>;
  }

  // Otherwise, render the fallback (if provided)
  return <>{fallback}</>;
}

interface AccessDeniedProps {
  message?: string;
  className?: string;
}

/**
 * Component to display when access is denied
 */
export function AccessDenied({
  message = "You don't have permission to access this resource",
  className = "",
}: AccessDeniedProps) {
  return (
    <div
      className={`bg-red-50 border border-red-200 text-red-800 rounded-md p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Access Denied</h3>
          <div className="mt-1 text-sm text-red-700">{message}</div>
        </div>
      </div>
    </div>
  );
}

interface RequirePermissionProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to restrict access to a route or content based on permissions
 */
export function RequirePermission({
  permission,
  children,
  fallback = <AccessDenied />,
}: RequirePermissionProps) {
  return (
    <AccessChecker permission={permission} fallback={fallback}>
      {children}
    </AccessChecker>
  );
}

interface PermissionGuardProps {
  permissions: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component to guard content based on multiple permissions
 * Can require all permissions or any permission
 */
export function PermissionGuard({
  permissions,
  requireAll = false,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission } = useContext(RBACContext);

  const hasAccess = requireAll
    ? permissions.every((permission) => hasPermission(permission))
    : permissions.some((permission) => hasPermission(permission));

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
