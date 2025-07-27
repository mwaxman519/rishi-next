import React from "react";
import { useOrganizationPermissions } from "@/components/../hooks/useOrganizationPermissions";
import { useOrganization } from "@/components/../contexts/OrganizationProvider";
import { Loader2 } from "lucide-react";

interface OrganizationPermissionGuardProps {
  /**
   * The permission(s) required to access the guarded content
   * If an array is provided, component checks if user has ANY of these permissions (OR logic)
   */
  permissions: string | string[];

  /**
   * Optional array of permissions where ALL are required (AND logic)
   * These are checked in addition to the `permissions` prop.
   */
  requiredPermissions?: string[];

  /**
   * When true, all permissions must be satisfied (AND logic)
   * This overrides the default OR logic for the permissions array
   */
  requireAll?: boolean;

  /**
   * Optional content to display when permission is denied
   */
  fallback?: React.ReactNode;

  /**
   * Whether to render nothing when loading (defaults to showing a loader)
   */
  hideLoader?: boolean;

  /**
   * Render function allowing to pass the permission check result to children
   */
  children: React.ReactNode | ((hasPermission: boolean) => React.ReactNode);
}

/**
 * Component for guarding content based on organization-specific permissions
 * Takes the current organization context into account
 */
export function OrganizationPermissionGuard({
  permissions,
  requiredPermissions,
  requireAll = false,
  fallback,
  hideLoader = false,
  children,
}: OrganizationPermissionGuardProps) {
  const { currentOrganization } = useOrganization();
  const permissionsArray = Array.isArray(permissions)
    ? permissions
    : [permissions];

  const { isLoading, isError, isAllowed, areAllAllowed, isAnyAllowed } =
    useOrganizationPermissions([
      ...permissionsArray,
      ...(requiredPermissions || []),
    ]);

  // Loading state
  if (isLoading) {
    return hideLoader ? null : (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  // Error state - can occur when API is unavailable or user is not authenticated
  if (isError || !currentOrganization) {
    return fallback || null;
  }

  // Check required permissions first (these must always ALL be satisfied)
  const allRequiredPermissionsAllowed =
    !requiredPermissions ||
    requiredPermissions.length === 0 ||
    areAllAllowed(requiredPermissions);

  if (!allRequiredPermissionsAllowed) {
    return fallback || null;
  }

  // Then check primary permissions based on requireAll flag
  const hasPermission = requireAll
    ? areAllAllowed(permissionsArray)
    : isAnyAllowed(permissionsArray);

  if (!hasPermission) {
    return fallback || null;
  }

  // If permission is granted, render children
  if (typeof children === "function") {
    return <>{children(hasPermission)}</>;
  }

  return <>{children}</>;
}
