"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import { initializeNavigation } from "@/navigation/NavigationItems";
import { NavItem } from "@/shared/navigation-constants";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  SUPER_ADMIN_NAVIGATION,
  INTERNAL_ADMIN_NAVIGATION,
  FIELD_MANAGER_NAVIGATION,
  BRAND_AGENT_NAVIGATION,
  CLIENT_USER_NAVIGATION,
  getNavigationForRole,
} from "@/shared/navigation-structure";

interface NavigationContextValue {
  navItems: NavItem[];
  isInitialized: boolean;
  isMobile: boolean;
  updateNavigationItems: (items: NavItem[]) => void;
}

export const NavigationContext = createContext<NavigationContextValue>({
  navItems: [],
  isInitialized: false,
  isMobile: false,
  updateNavigationItems: () => {},
});

export const useNavigation = () => useContext(NavigationContext);

interface ModernNavigationProviderProps {
  children: React.ReactNode;
}

export function ModernNavigationProvider({
  children,
}: ModernNavigationProviderProps) {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();
  const pathname = usePathname();
  const isMobile = !useMediaQuery("(min-width: 1024px)");
  const [mounted, setMounted] = useState(false);

  // Update navigation items based on user role
  const updateNavigationForRole = () => {
    const userRole = user?.role || "";
    try {
      // Initialize the core navigation structure if not done already
      if (!isInitialized) {
        console.log("Initializing navigation structure...");
        initializeNavigation();
        setIsInitialized(true);
      }

      // Get role-specific navigation
      const roleNavigation = getNavigationForRole(userRole);

      // Update the state with the role-specific navigation
      setNavItems(roleNavigation || []);

      console.log(`Navigation set for role: ${userRole}`);
    } catch (error) {
      console.error("Error setting up navigation:", error);
    }
  };

  // Update navigation items manually (for testing or specific overrides)
  const updateNavigationItems = (items: NavItem[]) => {
    setNavItems(items);
  };

  // Initialize navigation on mount and when user changes
  useEffect(() => {
    setMounted(true);
    updateNavigationForRole();
  }, [user?.role, isInitialized]);

  // Close mobile menu on route changes
  useEffect(() => {
    // This can be used to track route changes for analytics or other purposes
  }, [pathname]);

  // Return null during SSR to prevent hydration mismatch
  if (!mounted) return <>{children}</>;

  return (
    <NavigationContext.Provider
      value={{
        navItems,
        isInitialized,
        isMobile,
        updateNavigationItems,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
}
