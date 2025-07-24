import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOrganizationPermissions } from "@/hooks/useOrganizationPermissions";
import {
  NavItem,
  USER_TYPES,
  NAV_ITEM_TYPES,
} from "@shared/navigation-constants";
import {
  RISHI_MANAGEMENT_NAV,
  RISHI_MANAGEMENT_SECONDARY_NAV,
} from "./navigation/RishiManagementNav";
import {
  CLIENT_USER_NAV,
  CLIENT_USER_SECONDARY_NAV,
} from "./navigation/ClientUserNav";
import {
  BRAND_AGENT_NAV,
  BRAND_AGENT_SECONDARY_NAV,
  BRAND_AGENT_MOBILE_NAV,
} from "./navigation/BrandAgentNav";
import {
  SUPER_ADMIN_NAV,
  SUPER_ADMIN_SECONDARY_NAV,
} from "./navigation/SuperAdminNav";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import MobileNavigation from "@/components/MobileNavigation";
import { hasMyAvailability } from "@/utils/navigation-utils";

// Extend User type to include the properties we're using
interface ExtendedUser {
  id: string;
  name?: string;
  email?: string;
  role?: string; // For super_admin detection
  userType?: string; // To determine Rishi Management, Client User, or Brand Agent
}

interface NavigationProps {
  children?: React.ReactNode;
}

// Helper to create a deep copy of the navigation items
function deepCopyNavItems(items: NavItem[]): NavItem[] {
  return items.map((item) => {
    const newItem: NavItem = { ...item };
    if (item.children) {
      newItem.children = deepCopyNavItems(item.children);
    }
    return newItem;
  });
}

export function Navigation({ children }: NavigationProps) {
  const { user, loading } = useAuth();
  const orgPermissions = useOrganizationPermissions();
  const [isMobile, setIsMobile] = useState(false);

  // Keep track of whether we already built the navigation once
  const [navigationBuilt, setNavigationBuilt] = useState(false);

  // Store the built navigation to prevent re-building on every render
  const [builtPrimaryNav, setBuiltPrimaryNav] = useState<NavItem[]>([]);
  const [builtSecondaryNav, setBuiltSecondaryNav] = useState<NavItem[]>([]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Show loading spinner while authentication is in progress
  if (loading) {
    console.log("Navigation: Auth is still loading, showing loading state");
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Return nothing if user is not authenticated
  }

  // Build navigation menu items based on user role
  // Only build once to prevent flickering
  if (!navigationBuilt) {
    console.log("Navigation: First time building navigation menu for user");

    const userWithRole = user as unknown as ExtendedUser;

    // Check for super_admin role
    const isSuperAdmin = userWithRole.role === "super_admin";
    console.log("Navigation: User is super_admin =", isSuperAdmin);
    console.log("Current path:", window.location.pathname);

    // Initialize navigation arrays
    let primaryNav: NavItem[] = [];
    let secondaryNav: NavItem[] = [];

    // My Availability is now only added for Brand Agents, not globally
    // It's already included in the BRAND_AGENT_NAV constant

    if (isSuperAdmin) {
      console.log("Navigation: Building Super Admin navigation");

      // Create deep copies to ensure we don't have reference issues
      primaryNav = deepCopyNavItems(SUPER_ADMIN_NAV);
      console.log(
        "Navigation: Super Admin NAV contents:",
        JSON.stringify(SUPER_ADMIN_NAV.map((item) => item.label)),
      );
      console.log(
        "Navigation: Copied primaryNav contents:",
        JSON.stringify(primaryNav.map((item) => item.label)),
      );

      // We no longer add My Availability to the Super Admin nav
      // It should only be in the Brand Agents section as defined in BrandAgentNav.tsx

      secondaryNav = deepCopyNavItems(SUPER_ADMIN_SECONDARY_NAV);

      // Ensure all navigation items use path instead of href
      primaryNav.forEach((item) => {
        if (item.href && !item.path) {
          item.path = item.href;
        }

        if (item.children) {
          item.children.forEach((child) => {
            if (child.href && !child.path) {
              child.path = child.href;
            }
          });
        }
      });

      secondaryNav.forEach((item) => {
        if (item.href && !item.path) {
          item.path = item.href;
        }

        if (item.children) {
          item.children.forEach((child) => {
            if (child.href && !child.path) {
              child.path = child.href;
            }
          });
        }
      });

      // Verify Brand Agents section
      const brandAgentsSection = primaryNav.find(
        (i) => i.label === "Brand Agents",
      );
      if (brandAgentsSection) {
        console.log(
          "Navigation: Brand Agents section found with",
          brandAgentsSection.children?.length || 0,
          "children",
        );

        if (brandAgentsSection.children) {
          const availabilityItem = brandAgentsSection.children.find(
            (c) => c.label === "My Availability",
          );

          if (availabilityItem) {
            console.log(
              "Navigation: My Availability item found:",
              availabilityItem,
            );
          } else {
            console.error("Navigation: My Availability item is missing!");
          }
        }
      } else {
        console.error(
          "Navigation: Brand Agents section is missing from Super Admin nav!",
        );
      }
    } else {
      // Regular role-based navigation
      const userType = userWithRole.userType || "";
      console.log(
        "Navigation: Building regular navigation for user type:",
        userType,
      );

      switch (userType) {
        case USER_TYPES.RISHI_MANAGEMENT:
          primaryNav = deepCopyNavItems(RISHI_MANAGEMENT_NAV);
          secondaryNav = deepCopyNavItems(RISHI_MANAGEMENT_SECONDARY_NAV);
          break;
        case USER_TYPES.CLIENT_USER:
          primaryNav = deepCopyNavItems(CLIENT_USER_NAV);
          secondaryNav = deepCopyNavItems(CLIENT_USER_SECONDARY_NAV);
          break;
        case USER_TYPES.BRAND_AGENT:
          primaryNav = isMobile
            ? deepCopyNavItems(BRAND_AGENT_MOBILE_NAV)
            : deepCopyNavItems(BRAND_AGENT_NAV);
          secondaryNav = deepCopyNavItems(BRAND_AGENT_SECONDARY_NAV);
          break;
        default:
          // Use role-based fallback
          if (userWithRole.role?.includes("client")) {
            primaryNav = deepCopyNavItems(CLIENT_USER_NAV);
            secondaryNav = deepCopyNavItems(CLIENT_USER_SECONDARY_NAV);
          } else if (userWithRole.role?.includes("agent")) {
            primaryNav = isMobile
              ? deepCopyNavItems(BRAND_AGENT_MOBILE_NAV)
              : deepCopyNavItems(BRAND_AGENT_NAV);
            secondaryNav = deepCopyNavItems(BRAND_AGENT_SECONDARY_NAV);
          } else {
            primaryNav = deepCopyNavItems(RISHI_MANAGEMENT_NAV);
            secondaryNav = deepCopyNavItems(RISHI_MANAGEMENT_SECONDARY_NAV);
          }
      }

      // We no longer add My Availability to every user type
      // For Brand Agents, it's already included in the BRAND_AGENT_NAV constant
    }

    // Apply permission filtering
    const filterByPermission = (items: NavItem[]): NavItem[] => {
      return items
        .map((item) => {
          // Skip permission check for super admin
          if (isSuperAdmin) {
            // Still process children recursively
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: filterByPermission(item.children),
              };
            }
            return item;
          }

          // Always include high priority items regardless of permissions
          if (item.priority === "high") {
            // Still process high-priority item children recursively
            if (item.children && item.children.length > 0) {
              return {
                ...item,
                children: filterByPermission(item.children),
              };
            }
            return item;
          }

          // If item has a permission requirement, check it
          if (item.permission && !orgPermissions.isAllowed(item.permission)) {
            return null; // Mark for filtering
          }

          // Filter children recursively
          if (item.children && item.children.length > 0) {
            const filteredChildren = filterByPermission(item.children);
            // Create a new object to avoid reference issues
            return {
              ...item,
              children: filteredChildren,
            };
          }

          return item;
        })
        .filter(Boolean) as NavItem[]; // Remove nulls
    };

    // Apply the filter
    const filteredPrimaryNav = filterByPermission(primaryNav);
    const filteredSecondaryNav = filterByPermission(secondaryNav);

    // Save the filtered navigation
    setBuiltPrimaryNav(filteredPrimaryNav);
    setBuiltSecondaryNav(filteredSecondaryNav);
    setNavigationBuilt(true);

    console.log(
      "Navigation: Menu building complete, items in primary nav =",
      filteredPrimaryNav.length,
    );
  }

  // Once we've built the navigation, always use the stored version
  // Special handling for Brand Agents on mobile
  const userWithRole = user as unknown as ExtendedUser;
  if (
    navigationBuilt &&
    userWithRole.userType === USER_TYPES.BRAND_AGENT &&
    isMobile
  ) {
    return <MobileNavigation />;
  }

  // Log the final navigation items being sent to the Sidebar
  console.log(
    "Navigation: Final navigation items sent to Sidebar:",
    JSON.stringify(builtPrimaryNav.map((item) => item.label)),
  );

  // Standard navigation layout
  return (
    <div className="navigation-container">
      <Sidebar items={builtPrimaryNav} />
      <div className="main-content">
        <TopBar items={builtSecondaryNav} />
        <div className="content-wrapper">{children}</div>
      </div>
    </div>
  );
}
