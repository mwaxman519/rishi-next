"use client";

import { useContext } from "react";
import { RBACContext } from "../contexts/RBACProvider";

/**
 * Hook for accessing RBAC functionality throughout the application
 *
 * Provides access to permission checking methods and roles information
 * from the RBAC context.
 */
export function useRBAC() {
  const context = useContext(RBACContext);

  if (context === undefined) {
    throw new Error("useRBAC must be used within a RBACProvider");
  }

  return context;
}

export default useRBAC;
