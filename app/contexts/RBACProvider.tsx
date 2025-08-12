"use client";

import React, { createContext, useState, useEffect } from "react";
import { Permission, Role, ROLES, getUserPermissions } from "../lib/rbac";

// Interface for the RBAC context
interface RBACContextType {
  userRoles: string[];
  userPermissions: Permission[];
  isLoading: boolean;
  roles: Record<string, Role>;
  hasPermission: (permission: string) => boolean;
  userRole?: string;
}

// Create the context with a default value
export const RBACContext = createContext<RBACContextType>({
  userRoles: [],
  userPermissions: [],
  isLoading: true,
  roles: ROLES,
  hasPermission: () => false,
  userRole: undefined,
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

  // COMPLETELY DISABLED - No useEffect to prevent infinite loop
  // Initialize static permissions without useEffect
  console.log('RBACProvider: Using static permissions - no useEffect infinite loop');
  
  // Set static values immediately without useEffect
  if (userPermissions.length === 0 && isLoading) {
    setUserPermissions([]);
    setIsLoading(false);
  }

  // hasPermission function
  const hasPermission = (permission: string) => {
    return userPermissions.includes(permission as Permission);
  };

  // Provide the RBAC context to children
  return (
    <RBACContext.Provider
      value={{
        userRoles,
        userPermissions,
        isLoading,
        roles: ROLES,
        hasPermission,
        userRole: userRoles[0],
      }}
    >
      {children}
    </RBACContext.Provider>
  );
}
