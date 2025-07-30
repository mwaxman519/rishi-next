&quot;use client&quot;;

import { useContext } from &quot;react&quot;;
import { RBACContext } from &quot;../contexts/RBACProvider&quot;;

/**
 * Hook for accessing RBAC functionality throughout the application
 *
 * Provides access to permission checking methods and roles information
 * from the RBAC context.
 */
export function useRBAC() {
  const context = useContext(RBACContext);

  if (context === undefined) {
    throw new Error(&quot;useRBAC must be used within a RBACProvider&quot;);
  }

  return context;
}

export default useRBAC;
