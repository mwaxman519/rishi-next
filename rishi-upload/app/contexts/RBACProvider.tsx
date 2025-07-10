"use client";

import React, { createContext, useState, useEffect } from "react";
import { Permission, Role, ROLES, getUserPermissions } from "../lib/rbac";

// Interface for the RBAC context
interface RBACContextType {
  userRoles: string[];
  userPermissions: Permission[];
  isLoading: boolean;
  roles: Record<string, Role>;
}

// Create the context with a default value
export const RBACContext = createContext<RBACContextType>({
  userRoles: [],
  userPermissions: [],
  isLoading: true,
  roles: ROLES,
});

interface RBACProviderProps {
  children: React.ReactNode;
  initialRoles?: string[];
  initialPermissions?: Permission[];
}

/**
 * Provider component for Role-Based Access Control
 */
export function RBACProvider({
  children,
  initialRoles = [],
  initialPermissions = [],
}: RBACProviderProps) {
  const [userRoles, setUserRoles] = useState<string[]>(initialRoles);
  const [userPermissions, setUserPermissions] =
    useState<Permission[]>(initialPermissions);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize permissions based on roles
  useEffect(() => {
    // If initial permissions are provided, use those
    if (initialPermissions.length > 0) {
      setUserPermissions(initialPermissions);
      setIsLoading(false);
      return;
    }

    // Otherwise derive permissions from roles
    if (userRoles.length > 0) {
      const permissions = getUserPermissions(userRoles);
      setUserPermissions(permissions);
    }

    setIsLoading(false);
  }, [initialRoles, initialPermissions, userRoles]);

  // Provide the RBAC context to children
  return (
    <RBACContext.Provider
      value={{
        userRoles,
        userPermissions,
        isLoading,
        roles: ROLES,
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}
