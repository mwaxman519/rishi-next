import { useState, useEffect, useMemo } from &quot;react&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useOrganizationPermissions } from &quot;@/hooks/useOrganizationPermissions&quot;;
import {
  NavItem,
  USER_TYPES,
  NAV_ITEM_TYPES,
} from &quot;@shared/navigation-constants&quot;;
import {
  RISHI_MANAGEMENT_NAV,
  RISHI_MANAGEMENT_SECONDARY_NAV,
} from &quot;./navigation/RishiManagementNav&quot;;
import {
  CLIENT_USER_NAV,
  CLIENT_USER_SECONDARY_NAV,
} from &quot;./navigation/ClientUserNav&quot;;
import {
  BRAND_AGENT_NAV,
  BRAND_AGENT_SECONDARY_NAV,
  BRAND_AGENT_MOBILE_NAV,
} from &quot;./navigation/BrandAgentNav&quot;;
import {
  SUPER_ADMIN_NAV,
  SUPER_ADMIN_SECONDARY_NAV,
} from &quot;./navigation/SuperAdminNav&quot;;
import Sidebar from &quot;@/components/Sidebar&quot;;
import TopBar from &quot;@/components/TopBar&quot;;
import MobileNavigation from &quot;@/components/MobileNavigation&quot;;
import { hasMyAvailability } from &quot;@/utils/navigation-utils&quot;;

// Extend User type to include the properties we&apos;re using
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
    window.addEventListener(&quot;resize&quot;, checkMobile);
    return () => window.removeEventListener(&quot;resize&quot;, checkMobile);
  }, []);

  // Show loading spinner while authentication is in progress
  if (loading) {
    console.log(&quot;Navigation: Auth is still loading, showing loading state&quot;);
    return (
      <div className=&quot;flex items-center justify-center h-screen&quot;>
        <div className=&quot;animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full&quot;></div>
      </div>
    );
  }

  if (!user) {
    return null; // Return nothing if user is not authenticated
  }

  // Build navigation menu items based on user role
  // Only build once to prevent flickering
  if (!navigationBuilt) {
    console.log(&quot;Navigation: First time building navigation menu for user&quot;);

    const userWithRole = user as unknown as ExtendedUser;

    // Check for super_admin role
    const isSuperAdmin = userWithRole.role === &quot;super_admin&quot;;
    console.log(&quot;Navigation: User is super_admin =&quot;, isSuperAdmin);
    console.log(&quot;Current path:&quot;, window.location.pathname);

    // Initialize navigation arrays
    let primaryNav: NavItem[] = [];
    let secondaryNav: NavItem[] = [];

    // My Availability is now only added for Brand Agents, not globally
    // It's already included in the BRAND_AGENT_NAV constant

    if (isSuperAdmin) {
      console.log(&quot;Navigation: Building Super Admin navigation&quot;);

      // Create deep copies to ensure we don&apos;t have reference issues
      primaryNav = deepCopyNavItems(SUPER_ADMIN_NAV);
      console.log(
        &quot;Navigation: Super Admin NAV contents:&quot;,
        JSON.stringify(SUPER_ADMIN_NAV.map((item) => item.label)),
      );
      console.log(
        &quot;Navigation: Copied primaryNav contents:&quot;,
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
        (i) => i.label === &quot;Brand Agents&quot;,
      );
      if (brandAgentsSection) {
        console.log(
          &quot;Navigation: Brand Agents section found with&quot;,
          brandAgentsSection.children?.length || 0,
          &quot;children&quot;,
        );

        if (brandAgentsSection.children) {
          const availabilityItem = brandAgentsSection.children.find(
            (c) => c.label === &quot;My Availability&quot;,
          );

          if (availabilityItem) {
            console.log(
              &quot;Navigation: My Availability item found:&quot;,
              availabilityItem,
            );
          } else {
            console.error(&quot;Navigation: My Availability item is missing!&quot;);
          }
        }
      } else {
        console.error(
          &quot;Navigation: Brand Agents section is missing from Super Admin nav!&quot;,
        );
      }
    } else {
      // Regular role-based navigation
      const userType = userWithRole.userType || "&quot;;
      console.log(
        &quot;Navigation: Building regular navigation for user type:&quot;,
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
          if (userWithRole.role?.includes(&quot;client&quot;)) {
            primaryNav = deepCopyNavItems(CLIENT_USER_NAV);
            secondaryNav = deepCopyNavItems(CLIENT_USER_SECONDARY_NAV);
          } else if (userWithRole.role?.includes(&quot;agent&quot;)) {
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
      // For Brand Agents, it&apos;s already included in the BRAND_AGENT_NAV constant
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
          if (item.priority === &quot;high&quot;) {
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
      &quot;Navigation: Menu building complete, items in primary nav =&quot;,
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
    &quot;Navigation: Final navigation items sent to Sidebar:&quot;,
    JSON.stringify(builtPrimaryNav.map((item) => item.label)),
  );

  // Standard navigation layout
  return (
    <div className=&quot;navigation-container&quot;>
      <Sidebar items={builtPrimaryNav} />
      <div className=&quot;main-content&quot;>
        <TopBar items={builtSecondaryNav} />
        <div className=&quot;content-wrapper">{children}</div>
      </div>
    </div>
  );
}
