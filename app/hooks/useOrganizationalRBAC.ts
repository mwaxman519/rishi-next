&quot;use client&quot;;

import { useState, useEffect, useCallback } from &quot;react&quot;;
import { useAuth } from &quot;./useAuth&quot;;
import { UserRole } from &quot;@shared/rbac-roles&quot;;
import {
  hasOrganizationalPermission,
  loadOrganizationSettings,
  getDefaultOrganizationSettings,
} from &quot;@/lib/rbac/organizational-permissions&quot;;

export function useOrganizationalRBAC(organizationId?: string) {
  const { user } = useAuth();
  const [organizationSettings, setOrganizationSettings] = useState<
    Record<string, boolean>
  >(getDefaultOrganizationSettings());
  const [isLoading, setIsLoading] = useState(true);

  // Load organization settings when organizationId changes
  useEffect(() => {
    if (organizationId && user) {
      loadSettings(organizationId);
    } else {
      setOrganizationSettings(getDefaultOrganizationSettings());
      setIsLoading(false);
    }
  }, [organizationId, user]);

  const loadSettings = async (orgId: string) => {
    try {
      setIsLoading(true);
      const settings = await loadOrganizationSettings(orgId);
      setOrganizationSettings(settings);
    } catch (error) {
      console.error(&quot;Error loading organization settings:&quot;, error);
      setOrganizationSettings(getDefaultOrganizationSettings());
    } finally {
      setIsLoading(false);
    }
  };

  const hasPermission = useCallback(
    async (permission: string, orgId?: string): Promise<boolean> => {
      if (!user) return false;

      const targetOrgId = orgId || organizationId;
      if (!targetOrgId) {
        // For non-organizational permissions, use basic role checking
        return user.role === &quot;super_admin&quot;;
      }

      return hasOrganizationalPermission({
        userRole: user.role as UserRole,
        permission,
        organizationId: targetOrgId,
        organizationSettings,
      });
    },
    [user, organizationId, organizationSettings],
  );

  const canBrandAgentsViewOrgEvents = useCallback((): boolean => {
    return organizationSettings[&quot;brand_agents_view_org_events&quot;] === true;
  }, [organizationSettings]);

  const canBrandAgentsManageAvailability = useCallback((): boolean => {
    return organizationSettings[&quot;brand_agents_manage_availability&quot;] !== false;
  }, [organizationSettings]);

  const refreshSettings = useCallback(async () => {
    if (organizationId) {
      await loadSettings(organizationId);
    }
  }, [organizationId]);

  return {
    hasPermission,
    organizationSettings,
    canBrandAgentsViewOrgEvents,
    canBrandAgentsManageAvailability,
    refreshSettings,
    isLoading,
    userRole: (user?.role as UserRole) || null,
  };
}
