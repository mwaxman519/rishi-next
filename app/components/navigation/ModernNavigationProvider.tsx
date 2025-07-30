&quot;use client&quot;;

import React, { useEffect, useState, createContext, useContext } from &quot;react&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { initializeNavigation } from &quot;@/navigation/NavigationItems&quot;;
import { NavItem } from &quot;@shared/navigation-constants&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useMediaQuery } from &quot;@/hooks/useMediaQuery&quot;;
import {
  SUPER_ADMIN_NAVIGATION,
  INTERNAL_ADMIN_NAVIGATION,
  FIELD_MANAGER_NAVIGATION,
  BRAND_AGENT_NAVIGATION,
  CLIENT_USER_NAVIGATION,
  getNavigationForRole,
} from &quot;@shared/navigation-structure&quot;;

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
  const isMobile = !useMediaQuery(&quot;(min-width: 1024px)&quot;);
  const [mounted, setMounted] = useState(false);

  // Update navigation items based on user role
  const updateNavigationForRole = () => {
    const userRole = user?.role || "&quot;;
    try {
      // Initialize the core navigation structure if not done already
      if (!isInitialized) {
        console.log(&quot;Initializing navigation structure...&quot;);
        initializeNavigation();
        setIsInitialized(true);
      }

      // Get role-specific navigation
      const roleNavigation = getNavigationForRole(userRole);

      // Update the state with the role-specific navigation
      setNavItems(roleNavigation || []);

      console.log(`Navigation set for role: ${userRole}`);
    } catch (error) {
      console.error(&quot;Error setting up navigation:", error);
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
