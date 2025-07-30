"use client";

import { useAuth } from "./useAuth";
import { useState, useEffect } from "react";
import { NavItem } from "../../shared/navigation-constants";
import {
  BRAND_AGENT_NAV,
  BRAND_AGENT_MOBILE_NAV,
} from "../components/navigation/BrandAgentNav";
import { FIELD_MANAGER_NAV } from "../components/navigation/FieldManagerNav";
import { CLIENT_USER_NAV } from "../components/navigation/ClientUserNav";
import { RISHI_MANAGEMENT_NAV } from "../components/navigation/RishiManagementNav";

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
    if (role === "super_admin" || role === "internal_admin") {
      setDesktopNavItems(RISHI_MANAGEMENT_NAV);
    } else if (
      role === "internal_field_manager" ||
      role === "field_coordinator"
    ) {
      setDesktopNavItems(FIELD_MANAGER_NAV);
    } else if (role === "brand_agent") {
      setDesktopNavItems(BRAND_AGENT_NAV);
    } else if (role === "client_manager" || role === "client_user") {
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
    user?.role === "internal_admin" || user?.role === "super_admin";
  const isFieldManager =
    user?.role === "internal_field_manager" ||
    user?.role === "field_coordinator";
  const isBrandAgent = user?.role === "brand_agent";
  const isClientUser =
    user?.role === "client_manager" || user?.role === "client_user";
  const isSuperAdmin = user?.role === "super_admin";

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
