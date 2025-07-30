"use client";

import React from "react";
import { useEnhancedRBAC } from "../contexts/EnhancedRBACProvider";
import { Button } from "@/components/ui/button";
import { PermissionContext } from "../lib/rbac-enhanced";

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
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function PermissionRequiredButton({
  permission,
  context,
  fallback,
  children,
  onClick,
  className,
  variant = "default",
  size = "default",
}: PermissionRequiredButtonProps) {
  const { hasPermission, isLoading } = useEnhancedRBAC();

  // During loading, don't show anything
  if (isLoading) {
    return null;
  }

  // Check if user has the required permission in the given context
  const canAccess = hasPermission(permission, context);

  if (!canAccess) {
    // If no access and no fallback, don't render anything
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

  // During loading, don't show anything
  if (isLoading) {
    return null;
  }

  // Check if user has all the required permissions in the given context
  const canAccess = hasAllPermissions(permissions, context);

  if (!canAccess) {
    // If no access and no fallback, don't render anything
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

  // During loading, don't show anything
  if (isLoading) {
    return null;
  }

  // Check if user has any of the required permissions in the given context
  const canAccess = hasSomePermissions(permissions, context);

  if (!canAccess) {
    // If no access and no fallback, don't render anything
    if (!fallback) return null;

    // Otherwise render the fallback content
    return <>{fallback}</>;
  }

  // If user has any permission, render the children
  return <>{children}</>;
}
