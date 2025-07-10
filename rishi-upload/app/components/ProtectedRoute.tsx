"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { useEnhancedRBAC } from "../contexts/EnhancedRBACProvider";
import { PermissionContext } from "../lib/rbac-enhanced";

interface ProtectedRouteProps {
  children: React.ReactNode;
  permission?: string;
  permissions?: string[];
  redirectTo?: string;
  requireAuth?: boolean;
  context?: PermissionContext;
}

/**
 * A component that protects routes based on authentication and permissions
 * with organization context awareness
 *
 * @param children - The content to render if user is authenticated and has permission
 * @param permission - A single permission required to access this route
 * @param permissions - Multiple permissions required (all must be true)
 * @param redirectTo - Where to redirect if access is denied (default: /auth/login)
 * @param requireAuth - Whether to require authentication (default: true)
 * @param context - The permission context for organization-aware permission checks
 */
export function ProtectedRoute({
  children,
  permission,
  permissions,
  redirectTo = "/auth/login",
  requireAuth = true,
  context,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const {
    hasPermission,
    hasAllPermissions,
    isLoading: rbacLoading,
  } = useEnhancedRBAC();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip during initial loading
    if (isLoading || rbacLoading) return;

    // If auth is required and user is not logged in, redirect
    if (requireAuth && !user) {
      // Store the intended destination for redirecting back after login
      if (typeof window !== "undefined") {
        localStorage.setItem("redirectAfterLogin", pathname);
      }
      router.push(redirectTo);
      return;
    }

    // If user is logged in and we have permission requirements
    if (user && !isLoading) {
      // Create a merged context that includes the user's current organizational context
      const mergedContext: PermissionContext = {
        organizationId: user.organizationId,
        regionIds: user.regionIds,
        ...context,
      };

      // Check single permission if provided
      if (permission && !hasPermission(permission, mergedContext)) {
        router.push("/access-denied");
        return;
      }

      // Check multiple permissions if provided
      if (
        permissions &&
        permissions.length > 0 &&
        !hasAllPermissions(permissions, mergedContext)
      ) {
        router.push("/access-denied");
        return;
      }
    }
  }, [
    user,
    isLoading,
    rbacLoading,
    permission,
    permissions,
    redirectTo,
    requireAuth,
    router,
    pathname,
    hasPermission,
    hasAllPermissions,
    context,
  ]);

  // During initial loading, show nothing to prevent flash of wrong content
  if (isLoading || rbacLoading) {
    return null;
  }

  // Render children when authenticated and authorized
  return <>{children}</>;
}

export default ProtectedRoute;
