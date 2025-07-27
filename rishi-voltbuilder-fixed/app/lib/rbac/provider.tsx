"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { RBACUser, Resource, Permission } from ".";
import { hasPermission } from "./hasPermission";

interface RBACContextType {
  user: RBACUser | null;
  check: (resource: Resource, permission: Permission) => boolean;
  isAuthenticated: boolean;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

interface RBACProviderProps {
  user: RBACUser | null;
  children: ReactNode;
}

/**
 * Creates an RBAC provider component with the specified user
 */
export const createRBACProvider = () => {
  const RBACProvider = ({ user, children }: RBACProviderProps) => {
    const check = (resource: Resource, permission: Permission) => {
      return hasPermission(user, resource, permission);
    };

    const contextValue: RBACContextType = {
      user,
      check,
      isAuthenticated: !!user,
    };

    return (
      <RBACContext.Provider value={contextValue}>
        {children}
      </RBACContext.Provider>
    );
  };

  return RBACProvider;
};

/**
 * Hook to access RBAC functionality from components
 */
export function useRBAC() {
  const context = useContext(RBACContext);

  if (context === undefined) {
    throw new Error("useRBAC must be used within an RBACProvider");
  }

  return context;
}
