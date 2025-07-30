&quot;use client&quot;;

import { useAuth } from &quot;./useAuth&quot;;
import { useState, useEffect } from &quot;react&quot;;
import { NavItem } from &quot;../../shared/navigation-constants&quot;;
import {
  BRAND_AGENT_NAV,
  BRAND_AGENT_MOBILE_NAV,
} from &quot;../components/navigation/BrandAgentNav&quot;;
import { FIELD_MANAGER_NAV } from &quot;../components/navigation/FieldManagerNav&quot;;
import { CLIENT_USER_NAV } from &quot;../components/navigation/ClientUserNav&quot;;
import { RISHI_MANAGEMENT_NAV } from &quot;../components/navigation/RishiManagementNav&quot;;

/**
 * Navigation hook that provides role-based navigation items
 * for both desktop and mobile views
 */
export function useNavigation() {
  const { user } = useAuth();
  const [mobileNavItems, setMobileNavItems] = useState<NavItem[]>(
    BRAND_AGENT_MOBILE_NAV,
  );
  const [desktopNavItems, setDesktopNavItems] = useState<NavItem[]>([]);

  // Update navigation items when user role changes
  useEffect(() => {
    // Default to brand agent if no user
    if (!user || !user.role) {
      setDesktopNavItems(BRAND_AGENT_NAV);
      setMobileNavItems(BRAND_AGENT_MOBILE_NAV);
      return;
    }

    const role = user.role.toLowerCase();

    // Set desktop navigation based on role
    if (role === &quot;super_admin&quot; || role === &quot;internal_admin&quot;) {
      setDesktopNavItems(RISHI_MANAGEMENT_NAV);
    } else if (
      role === &quot;internal_field_manager&quot; ||
      role === &quot;field_coordinator&quot;
    ) {
      setDesktopNavItems(FIELD_MANAGER_NAV);
    } else if (role === &quot;brand_agent&quot;) {
      setDesktopNavItems(BRAND_AGENT_NAV);
    } else if (role === &quot;client_manager&quot; || role === &quot;client_user&quot;) {
      setDesktopNavItems(CLIENT_USER_NAV);
    } else {
      // Default to brand agent
      setDesktopNavItems(BRAND_AGENT_NAV);
    }

    // For now, always use brand agent mobile nav but this could be customized
    setMobileNavItems(BRAND_AGENT_MOBILE_NAV);
  }, [user]);

  // Helper functions to determine user type for navigation
  const isRishiManagement =
    user?.role === &quot;internal_admin&quot; || user?.role === &quot;super_admin&quot;;
  const isFieldManager =
    user?.role === &quot;internal_field_manager&quot; ||
    user?.role === &quot;field_coordinator&quot;;
  const isBrandAgent = user?.role === &quot;brand_agent&quot;;
  const isClientUser =
    user?.role === &quot;client_manager&quot; || user?.role === &quot;client_user&quot;;
  const isSuperAdmin = user?.role === &quot;super_admin&quot;;

  return {
    mobileNavItems,
    desktopNavItems,
    isRishiManagement,
    isFieldManager,
    isBrandAgent,
    isClientUser,
    isSuperAdmin,
  };
}
