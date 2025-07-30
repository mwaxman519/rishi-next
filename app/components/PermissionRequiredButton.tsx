&quot;use client&quot;;

import React from &quot;react&quot;;
import { useEnhancedRBAC } from &quot;../contexts/EnhancedRBACProvider&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { PermissionContext } from &quot;../lib/rbac-enhanced&quot;;

/**
 * A button that only renders when the user has the necessary permission
 * in the specified context (organization, region, etc.).
 */
interface PermissionRequiredButtonProps {
  permission: string;
  context?: PermissionContext;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?:
    | &quot;default&quot;
    | &quot;destructive&quot;
    | &quot;outline&quot;
    | &quot;secondary&quot;
    | &quot;ghost&quot;
    | &quot;link&quot;;
  size?: &quot;default&quot; | &quot;sm&quot; | &quot;lg&quot; | &quot;icon&quot;;
}

export function PermissionRequiredButton({
  permission,
  context,
  fallback,
  children,
  onClick,
  className,
  variant = &quot;default&quot;,
  size = &quot;default&quot;,
}: PermissionRequiredButtonProps) {
  const { hasPermission, isLoading } = useEnhancedRBAC();

  // During loading, don&apos;t show anything
  if (isLoading) {
    return null;
  }

  // Check if user has the required permission in the given context
  const canAccess = hasPermission(permission, context);

  if (!canAccess) {
    // If no access and no fallback, don&apos;t render anything
    if (!fallback) return null;

    // Otherwise render the fallback content
    return <>{fallback}</>;
  }

  // If user has permission, render the button
  return (
    <Button
      onClick={onClick}
      className={className}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  );
}

/**
 * A component that only renders its children when the user has all the specified permissions
 * in the given context.
 */
interface PermissionRequiredProps {
  permissions: string[];
  context?: PermissionContext;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionRequired({
  permissions,
  context,
  fallback,
  children,
}: PermissionRequiredProps) {
  const { hasAllPermissions, isLoading } = useEnhancedRBAC();

  // During loading, don&apos;t show anything
  if (isLoading) {
    return null;
  }

  // Check if user has all the required permissions in the given context
  const canAccess = hasAllPermissions(permissions, context);

  if (!canAccess) {
    // If no access and no fallback, don&apos;t render anything
    if (!fallback) return null;

    // Otherwise render the fallback content
    return <>{fallback}</>;
  }

  // If user has permissions, render the children
  return <>{children}</>;
}

/**
 * A component that renders its children when the user has any of the specified permissions
 * in the given context.
 */
interface PermissionAnyRequiredProps {
  permissions: string[];
  context?: PermissionContext;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionAnyRequired({
  permissions,
  context,
  fallback,
  children,
}: PermissionAnyRequiredProps) {
  const { hasSomePermissions, isLoading } = useEnhancedRBAC();

  // During loading, don&apos;t show anything
  if (isLoading) {
    return null;
  }

  // Check if user has any of the required permissions in the given context
  const canAccess = hasSomePermissions(permissions, context);

  if (!canAccess) {
    // If no access and no fallback, don&apos;t render anything
    if (!fallback) return null;

    // Otherwise render the fallback content
    return <>{fallback}</>;
  }

  // If user has any permission, render the children
  return <>{children}</>;
}
