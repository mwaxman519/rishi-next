&quot;use client&quot;;

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
} from &quot;react&quot;;
import { UserRole } from &quot;@shared/schema&quot;;
import { useAuth } from &quot;../hooks/useAuth&quot;;
import {
  PermissionContext,
  hasEnhancedPermission,
  hasAllEnhancedPermissions,
  hasSomeEnhancedPermissions,
} from &quot;../lib/rbac-enhanced&quot;;
import { getAllPermissionsForRole } from &quot;../lib/rbac-enhanced&quot;;

/**
 * Enhanced RBAC Context for organization-aware permissions
 */
interface EnhancedRBACContextType {
  // Check if the user has a specific permission within context
  hasPermission: (permission: string, context?: PermissionContext) => boolean;

  // Check if the user has all of the given permissions within context
  hasAllPermissions: (
    permissions: string[],
    context?: PermissionContext,
  ) => boolean;

  // Check if the user has any of the given permissions within context
  hasSomePermissions: (
    permissions: string[],
    context?: PermissionContext,
  ) => boolean;

  // All available permissions for the current user
  permissions: string[];

  // Loading state
  isLoading: boolean;
}

// Default context value
const EnhancedRBACContext = createContext<EnhancedRBACContextType>({
  hasPermission: () => false,
  hasAllPermissions: () => false,
  hasSomePermissions: () => false,
  permissions: [],
  isLoading: true,
});

/**
 * Enhanced RBAC Provider including organization-context awareness
 * This provider uses the user context from AuthProvider and adds organization-aware
 * permission checking capabilities
 */
export function EnhancedRBACProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize permissions based on role
  useEffect(() => {
    if (user?.role) {
      // Get all available permissions for this role
      const allPermissions = getAllPermissionsForRole(user.role);
      setPermissions(allPermissions);
      setIsLoading(false);
    } else if (!authLoading) {
      // If auth is not loading but we have no user, we&apos;re not authenticated
      setPermissions([]);
      setIsLoading(false);
    }
  }, [user?.role, authLoading]);

  /**
   * Check if the user has a specific permission with context
   */
  const hasPermission = useCallback(
    (permission: string, context: PermissionContext = {}): boolean => {
      if (!user?.role) return false;

      // Include user's organization and regions in the context
      const fullContext: PermissionContext = {
        organizationId: user.organizationId,
        regionIds: user.regionIds,
        ...context,
      };

      return hasEnhancedPermission(permission, user.role, fullContext);
    },
    [user?.role, user?.organizationId, user?.regionIds],
  );

  /**
   * Check if the user has all of the specified permissions with context
   */
  const hasAllPermissions = useCallback(
    (
      permissionsToCheck: string[],
      context: PermissionContext = {},
    ): boolean => {
      if (!user?.role) return false;

      // Include user's organization and regions in the context
      const fullContext: PermissionContext = {
        organizationId: user.organizationId,
        regionIds: user.regionIds,
        ...context,
      };

      return hasAllEnhancedPermissions(
        permissionsToCheck,
        user.role,
        fullContext,
      );
    },
    [user?.role, user?.organizationId, user?.regionIds],
  );

  /**
   * Check if the user has any of the specified permissions with context
   */
  const hasSomePermissions = useCallback(
    (
      permissionsToCheck: string[],
      context: PermissionContext = {},
    ): boolean => {
      if (!user?.role) return false;

      // Include user's organization and regions in the context
      const fullContext: PermissionContext = {
        organizationId: user.organizationId,
        regionIds: user.regionIds,
        ...context,
      };

      return hasSomeEnhancedPermissions(
        permissionsToCheck,
        user.role,
        fullContext,
      );
    },
    [user?.role, user?.organizationId, user?.regionIds],
  );

  // Provide the enhanced RBAC context to children
  return (
    <EnhancedRBACContext.Provider
      value={{
        hasPermission,
        hasAllPermissions,
        hasSomePermissions,
        permissions,
        isLoading: isLoading || authLoading,
      }}
    >
      {children}
    </EnhancedRBACContext.Provider>
  );
}

/**
 * Hook for consuming the Enhanced RBAC context
 */
export function useEnhancedRBAC() {
  const context = useContext(EnhancedRBACContext);

  if (context === undefined) {
    throw new Error(
      &quot;useEnhancedRBAC must be used within a EnhancedRBACProvider&quot;,
    );
  }

  return context;
}
