&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { useEffect } from &quot;react&quot;;
import { useAuth } from &quot;../hooks/useAuth&quot;;
import { useAuthorization } from &quot;../hooks/useAuthorization&quot;;
import { useSidebarState } from &quot;../hooks/useSidebarState&quot;;
import { Permission } from &quot;../lib/rbac&quot;;
import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import {
  filterLinksByPermission,
  hasMyAvailability,
  createMyAvailabilityLink,
} from &quot;@/utils/navigation-utils&quot;;
import {
  getNavigationForRole,
  getPlatformAdminNav,
} from &quot;@shared/navigation-structure&quot;;
import { ThemeToggle } from &quot;./ui/theme-toggle&quot;;
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  LogOut,
  User,
  Home,
  FileText,
  LayoutDashboard,
  Users,
  Calendar,
  Package,
  Settings,
  Lock,
  Shield,
  Database,
  Building,
  MapPin,
  Clock,
  BarChart,
  ClipboardList,
  GraduationCap,
  Award,
  CreditCard,
  MessageSquare,
  CheckSquare,
  Briefcase,
  UserCog,
} from &quot;lucide-react&quot;;
// Logo is loaded directly via Image component, not imported
import { Button } from &quot;./ui/button&quot;;
import { SafeLink } from &quot;./ui/safe-link&quot;;
import { TopBar } from &quot;./layout/TopBar&quot;;
import { OrganizationSwitcher } from &quot;./layout/OrganizationSwitcher&quot;;
import { getAdminNavForRole } from &quot;./layout/AdminPortalNav&quot;;
import {
  getSuperAdminNavigation,
  isNavItemActive,
} from &quot;./navigation/SuperAdminNavigation&quot;;

// Helper function to format role names
const formatRoleName = (role: string): string => {
  return role
    .replace(/_/g, &quot; &quot;)
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
};

// This function is only used for TypeScript typechecking
const formatString = (str: string): string => {
  return str
    .replace(/_/g, &quot; &quot;)
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
};

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { checkPermission, can } = useAuthorization();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } =
    useSidebarState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't render sidebar for unauthenticated users
  // Check for URL parameters that indicate we should force unauthenticated mode
  useEffect(() => {
    if (typeof window !== &quot;undefined&quot;) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get(&quot;unauthenticated&quot;) === &quot;true&quot;) {
        console.log(
          &quot;SidebarLayout: URL parameter indicates unauthenticated state&quot;,
        );
      }
    }
  }, []);

  // Skip rendering sidebar if the URL parameter is set
  if (typeof window !== &quot;undefined&quot;) {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get(&quot;unauthenticated&quot;) === &quot;true&quot;) {
      return <>{children}</>;
    }
  }

  // Special case for documentation pages
  const isDocsPage = pathname?.startsWith(&quot;/docs&quot;);

  // Place all useEffect hooks together at the top to maintain consistent ordering
  // Dispatch a custom event for the calendar component when sidebar state changes
  useEffect(() => {
    if (typeof window !== &quot;undefined&quot;) {
      // Dispatch a custom event that our calendar component can listen for
      const event = new CustomEvent(&quot;sidebarStateChange&quot;, {
        detail: { collapsed: sidebarCollapsed },
      });
      window.dispatchEvent(event);
    }
  }, [sidebarCollapsed]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userRole = user?.role || "&quot;;

  // Check if user is a super admin - defined early to use throughout the component
  const isSuperAdmin = user?.role === &quot;super_admin&quot;;

  // For static generation during build, provide fallback behavior
  if (typeof window === &quot;undefined&quot; && !user) {
    console.log(
      &quot;### SidebarLayout STATIC GENERATION ### Providing fallback layout&quot;,
    );
    return (
      <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>{children}</div>
    );
  }

  console.log(
    &quot;### SidebarLayout RENDERED ### isSuperAdmin =&quot;,
    isSuperAdmin,
    &quot;role =&quot;,
    user?.role,
  );

  // Public links available to all users
  const publicLinks = [
    {
      href: &quot;/&quot;,
      label: &quot;Dashboard&quot;,
      icon: <LayoutDashboard size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    {
      href: &quot;/docs&quot;,
      label: &quot;Documentation&quot;,
      icon: <FileText size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
  ];

  // Links that require specific permissions
  const protectedLinks = [
    // Staff section (Rishi employees)
    {
      href: &quot;/staff&quot;,
      label: &quot;Staff&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <Users size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Clients section (client organizations)
    {
      href: &quot;/clients&quot;,
      label: &quot;Clients&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <Building size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Kits section (templates and instances)
    {
      href: &quot;/kits&quot;,
      label: &quot;Kits&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <Package size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Bookings section (calendar)
    {
      href: &quot;/bookings&quot;,
      label: &quot;Bookings&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <Calendar size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Requests section (event booking requests)
    {
      href: &quot;/requests&quot;,
      label: &quot;Requests&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <ClipboardList size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Locations section (states, regions, venues)
    {
      href: &quot;/locations&quot;,
      label: &quot;Locations&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <MapPin size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Regions section (states, custom regions)
    {
      href: &quot;/regions&quot;,
      label: &quot;Regions&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <MapPin size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // My Availability has been moved to the Brand Agents section for super admin users
    // For regular users, it will still be accessible here
    // Team Availability
    {
      href: &quot;/availability/team&quot;,
      label: &quot;Team Calendar&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <Clock size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Resources section
    {
      href: &quot;/resources&quot;,
      label: &quot;Resources&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <GraduationCap size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Client Management
    {
      href: &quot;/client-management&quot;,
      label: &quot;Client Management&quot;,
      permission: null, // Temporarily removed permission for development
      icon: <Building size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Admin section (retain existing admin links)
    {
      href: &quot;/admin&quot;,
      label: &quot;Admin&quot;,
      permission: &quot;view:admin&quot; as Permission,
      icon: <Settings size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    {
      href: &quot;/admin/rbac&quot;,
      label: &quot;RBAC Dashboard&quot;,
      permission: &quot;manage:roles&quot; as Permission,
      icon: <Shield size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
    {
      href: &quot;/admin/organization-permissions&quot;,
      label: &quot;Org Permissions&quot;,
      permission: &quot;manage:permissions&quot; as Permission,
      icon: <Lock size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
    {
      href: &quot;/admin/features&quot;,
      label: &quot;Features&quot;,
      permission: &quot;manage:roles&quot; as Permission,
      icon: <Settings size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
    {
      href: &quot;/admin/test-data&quot;,
      label: &quot;Test Data&quot;,
      permission: &quot;manage:roles&quot; as Permission,
      icon: <Database size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
  ];

  // Separate links into categories for Super Admin view
  const adminLinks = protectedLinks.filter(
    (link) => link.href.startsWith(&quot;/admin&quot;) || link.label.includes(&quot;Admin&quot;),
  );

  const regularLinks = protectedLinks.filter(
    (link) => !link.href.startsWith(&quot;/admin&quot;) && !link.label.includes(&quot;Admin&quot;),
  );

  // Get consolidated navigation based on user role from our new unified structure

  // For user role-based navigation with proper information architecture
  console.log(&quot;USER ROLE FOR NAV:&quot;, userRole);

  // Get the appropriate navigation structure based on user role
  let roleBasedNavigation: any[] = [];
  if (userRole) {
    console.log(`Loading ${userRole} navigation structure`);
    if (userRole === &quot;super_admin&quot;) {
      // Use the new Super Admin navigation structure
      roleBasedNavigation = getSuperAdminNavigation();
    } else {
      roleBasedNavigation = getNavigationForRole(userRole);
    }
  } else {
    console.log(&quot;No valid role found, no navigation will be loaded&quot;);
    // NO FALLBACK NAVIGATION - User must have valid role
    roleBasedNavigation = [];
  }

  console.log(
    &quot;ROLE-BASED NAVIGATION LOADED:&quot;,
    Array.isArray(roleBasedNavigation)
      ? roleBasedNavigation.map((item) => item.label)
      : &quot;No items&quot;,
  );

  // Ensure we have an array even if something went wrong
  if (!Array.isArray(roleBasedNavigation)) {
    roleBasedNavigation = [];
  }

  // Filter out administration sections - we'll handle these separately
  const mainNavigationItems = roleBasedNavigation.filter(
    (item) =>
      item &&
      item.path &&
      !item.path.includes(&quot;/admin&quot;) &&
      !item.label?.includes(&quot;Administration&quot;) &&
      item.label !== &quot;Platform Administration&quot;,
  );

  // Get admin-specific navigation sections
  const adminPortalNavItems = roleBasedNavigation.filter(
    (item) =>
      item &&
      ((item.path && item.path.includes(&quot;/admin&quot;)) ||
        (item.label && item.label.includes(&quot;Administration&quot;)) ||
        item.label === &quot;Platform Administration&quot;) &&
      item.label !== &quot;Dashboard&quot;, // Don't include Dashboard in admin sections
  );

  // Platform Administration is a special case for super admins
  const platformAdminNavItems =
    isSuperAdmin && typeof getPlatformAdminNav === &quot;function&quot;
      ? getPlatformAdminNav()
      : [];

  const brandAgentLinks = [
    // Personal Dashboard section
    {
      href: &quot;/dashboard&quot;,
      label: &quot;Personal Dashboard&quot;,
      icon: <LayoutDashboard size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // My Availability section
    {
      href: &quot;/availability&quot;,
      label: &quot;My Availability&quot;,
      icon: <Clock size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Profile Management section
    {
      href: &quot;/profile&quot;,
      label: &quot;Profile Management&quot;,
      icon: <User size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Events section
    {
      href: &quot;/events&quot;,
      label: &quot;Events&quot;,
      icon: <Calendar size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Requests section
    {
      href: &quot;/requests&quot;,
      label: &quot;Requests&quot;,
      icon: <ClipboardList size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Availability Management section
    {
      href: &quot;/availability/team&quot;,
      label: &quot;Team Calendar&quot;,
      icon: <Clock size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Resources section
    {
      href: &quot;/resources&quot;,
      label: &quot;Resources&quot;,
      icon: <GraduationCap size={20} />,
      permission: &quot;manage:agents&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
  ];

  const clientUserLinks = [
    // Dashboard
    {
      href: &quot;/dashboard&quot;,
      label: &quot;Dashboard&quot;,
      icon: <LayoutDashboard size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Booking Management
    {
      href: &quot;/bookings&quot;,
      label: &quot;Booking Management&quot;,
      icon: <ClipboardList size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Events
    {
      href: &quot;/events&quot;,
      label: &quot;Events&quot;,
      icon: <Calendar size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Locations
    {
      href: &quot;/locations&quot;,
      label: &quot;Locations&quot;,
      icon: <MapPin size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Analytics
    {
      href: &quot;/analytics&quot;,
      label: &quot;Analytics&quot;,
      icon: <BarChart size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Time Tracking
    {
      href: &quot;/timetracking&quot;,
      label: &quot;Time Tracking&quot;,
      icon: <Clock size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Team
    {
      href: &quot;/team&quot;,
      label: &quot;Team&quot;,
      icon: <Users size={20} />,
      permission: &quot;manage:clients&quot; as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
  ];

  // Track whether the admin sections are expanded
  const [superAdminOpen, setSuperAdminOpen] = useState(false);
  const [adminPortalOpen, setAdminPortalOpen] = useState(false);
  const [platformAdminOpen, setPlatformAdminOpen] = useState(true); // Open by default for easy access
  const [brandAgentsOpen, setBrandAgentsOpen] = useState(false);
  const [clientUsersOpen, setClientUsersOpen] = useState(false);
  const [fieldManagerOpen, setFieldManagerOpen] = useState(false);
  const [internalAdminOpen, setInternalAdminOpen] = useState(false);

  // Toggle section functions
  const toggleSuperAdmin = () => {
    setSuperAdminOpen(!superAdminOpen);
  };

  const toggleAdminPortal = () => {
    setAdminPortalOpen(!adminPortalOpen);
  };

  const togglePlatformAdmin = () => {
    setPlatformAdminOpen(!platformAdminOpen);
  };

  const toggleBrandAgents = () => {
    setBrandAgentsOpen(!brandAgentsOpen);
  };

  const toggleClientUsers = () => {
    setClientUsersOpen(!clientUsersOpen);
  };

  const toggleFieldManager = () => {
    setFieldManagerOpen(!fieldManagerOpen);
  };

  const toggleInternalAdmin = () => {
    setInternalAdminOpen(!internalAdminOpen);
  };

  // For super admins, don&apos;t show regular links - only public links
  // For regular users, show public links plus regular links with permissions
  // For super admins, don&apos;t add &quot;My Availability&quot; to the top-level
  // Only show it in the Brand Agents section

  // Use our new unified navigation structure for primary links
  // Check if an item from role-based navigation exists in publicLinks
  const isDuplicate = (navItem: any, publicItems: any[]) => {
    return publicItems.some(
      (item) =>
        // Compare by path/href and label to identify duplicates
        ((item.href === navItem.path || item.href === navItem.href) &&
          item.label === navItem.label) ||
        // Also check if there are items with same label but different paths
        item.label === navItem.label,
    );
  };

  // Filter out any duplicates from publicLinks that already exist in role-based navigation
  const filteredPublicLinks = publicLinks.filter(
    (publicItem) =>
      !mainNavigationItems.some(
        (navItem) =>
          publicItem.href === navItem.path ||
          publicItem.href === navItem.href ||
          publicItem.label === navItem.label,
      ),
  );

  // Combine navigation items, prioritizing the unified structure
  const links = [
    // First add all items from role-based navigation
    ...mainNavigationItems,
    // Then add public links that don&apos;t duplicate what&apos;s already in the navigation
    ...filteredPublicLinks,
    // For backward compatibility, keep showing the old links too for now
    // We'll remove this as we transition fully to the new system
    ...(isSuperAdmin
      ? []
      : filterLinksByPermission(
          regularLinks,
          user ? { id: user.id, role: user.role || &quot;client_user&quot; } : null,
          userRole,
          (permission: string) => {
            // Use synchronous permission check for deployment compatibility
            if (!user) return false;
            if (user.role === &quot;super_admin&quot;) return true;
            // For deployment, allow all permissions in development
            return process.env.NODE_ENV === &quot;development&quot;;
          },
        )),
  ];

  // Show loading spinner if authentication is still loading - AFTER all hooks are initialized
  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center h-screen&quot;>
        <div className=&quot;animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full&quot;></div>
      </div>
    );
  }

  // Links array is now fully prepared for rendering

  // Special handling for docs pages - keep the main sidebar but allow custom content
  /* We'll retain the sidebar for docs pages too */

  // Standard sidebar layout
  return (
    <div className=&quot;flex h-screen overflow-hidden bg-[rgb(var(--background))]&quot;>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={`hidden lg:flex sidebar h-screen flex-col transition-all duration-300 ${sidebarCollapsed ? &quot;w-20 sidebar-collapsed&quot; : &quot;w-64 sidebar-expanded&quot;}`}
      >
        {/* Sidebar header */}
        <div className=&quot;flex items-center justify-between p-4 border-b border-[rgb(var(--sidebar-border))]&quot;>
          {sidebarCollapsed ? (
            <div className=&quot;w-full flex flex-col items-center&quot;>
              <Link href=&quot;/&quot; className=&quot;flex items-center justify-center mb-3&quot;>
                <div className=&quot;w-8 h-8 relative flex-shrink-0&quot;>
                  <Image
                    src=&quot;/favicon.png&quot;
                    alt=&quot;Rishi Logo&quot;
                    width={32}
                    height={32}
                    className=&quot;object-contain&quot;
                    priority
                  />
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className=&quot;p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                aria-label=&quot;Expand sidebar&quot;
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link href=&quot;/&quot; className=&quot;flex items-center overflow-hidden&quot;>
                <div className=&quot;w-8 h-8 relative flex-shrink-0&quot;>
                  <Image
                    src=&quot;/favicon.png&quot;
                    alt=&quot;Rishi Logo&quot;
                    width={32}
                    height={32}
                    className=&quot;object-contain&quot;
                    priority
                  />
                </div>
                <span className=&quot;ml-2 text-xl font-bold text-[rgb(var(--primary))]&quot;>
                  Rishi
                </span>
              </Link>
              <button
                onClick={toggleSidebar}
                className=&quot;p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                aria-label=&quot;Collapse sidebar&quot;
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
        </div>

        {/* Organization Switcher */}
        {!sidebarCollapsed ? (
          <div className=&quot;px-3 py-3 border-b border-[rgb(var(--sidebar-border))]&quot;>
            <div className=&quot;mb-1 text-xs font-medium text-[rgb(var(--sidebar-muted-foreground))]&quot;>
              Organization
            </div>
            <OrganizationSwitcher />
          </div>
        ) : (
          <div className=&quot;flex justify-center py-3 border-b border-[rgb(var(--sidebar-border))]&quot;>
            <button
              onClick={toggleSidebar}
              className=&quot;p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
              title=&quot;Expand sidebar to switch organizations&quot;
            >
              <Building
                size={20}
                className=&quot;text-[rgb(var(--sidebar-muted-foreground))]&quot;
              />
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className=&quot;flex-grow px-2 py-4 overflow-y-auto&quot;>
          <ul className=&quot;space-y-1&quot;>
            {links.map((link) => {
              // Ensure we have a path by checking both href and path properties
              const linkPath = link.href || link.path || &quot;/&quot;;
              const isActive =
                pathname === linkPath ||
                (linkPath !== &quot;/&quot; && pathname?.startsWith(linkPath)) ||
                (linkPath === &quot;/&quot; && pathname === &quot;/dashboard&quot;); // Special case for Dashboard

              return (
                <li key={link.id || `nav-${linkPath}-${link.label}`}>
                  <Link
                    href={linkPath}
                    className={`sidebar-item ${isActive ? &quot;sidebar-item-active&quot; : &quot;sidebar-item-inactive&quot;} ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                    title={sidebarCollapsed ? link.label : &quot;&quot;}
                  >
                    <span className=&quot;flex-shrink-0&quot;>{link.icon}</span>
                    <span
                      className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* Field Manager Section - Only shown to Super Admins */}
            {isSuperAdmin && (
              <li className=&quot;mt-4&quot;>
                <button
                  onClick={toggleFieldManager}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? &quot;Field Manager View&quot; : &quot;&quot;}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                  >
                    <Briefcase
                      size={20}
                      className=&quot;flex-shrink-0 text-green-500&quot;
                    />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? &quot;hidden&quot; : &quot;opacity-100&quot;}`}
                    >
                      Field Manager
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${fieldManagerOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${fieldManagerOpen ? &quot;max-h-[800px] opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const fieldManagerNav = getNavigationForRole(
                        &quot;internal_field_manager&quot;,
                      );

                      return fieldManagerNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section
                          const sectionId = `field-manager-section-${index}`;

                          return (
                            <li key={sectionId} className=&quot;mt-2&quot;>
                              <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                                {item.label}
                              </div>
                              <ul className=&quot;mt-1 space-y-1&quot;>
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || &quot;/&quot;;
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== &quot;/&quot; &&
                                      pathname?.startsWith(childPath + &quot;/&quot;));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                            : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                        } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                        title={
                                          sidebarCollapsed ? child.label : &quot;&quot;
                                        }
                                      >
                                        <span className=&quot;flex-shrink-0&quot;>
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                        >
                                          {child.label}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          );
                        } else {
                          // Handle regular links
                          const itemPath = item.href || item.path || &quot;/&quot;;
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== &quot;/&quot; &&
                              pathname?.startsWith(itemPath));
                          return (
                            <li key={`field-manager-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                    : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                title={sidebarCollapsed ? item.label : &quot;&quot;}
                              >
                                <span className=&quot;flex-shrink-0&quot;>
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                >
                                  {item.label}
                                </span>
                              </Link>
                            </li>
                          );
                        }
                      });
                    })()}
                  </ul>
                </div>
              </li>
            )}

            {/* Brand Agents Section - Only shown to Super Admins */}
            {isSuperAdmin && (
              <li className=&quot;mt-1&quot;>
                <button
                  onClick={toggleBrandAgents}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? &quot;Brand Agent View&quot; : &quot;&quot;}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                  >
                    <User size={20} className=&quot;flex-shrink-0 text-purple-500&quot; />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? &quot;hidden&quot; : &quot;opacity-100&quot;}`}
                    >
                      Brand Agents
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${brandAgentsOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${brandAgentsOpen ? &quot;max-h-[800px] opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const brandAgentNav = getNavigationForRole(&quot;brand_agent&quot;);

                      return brandAgentNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section
                          const sectionId = `brand-agent-section-${index}`;

                          return (
                            <li key={sectionId} className=&quot;mt-2&quot;>
                              <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                                {item.label}
                              </div>
                              <ul className=&quot;mt-1 space-y-1&quot;>
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || &quot;/&quot;;
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== &quot;/&quot; &&
                                      pathname?.startsWith(childPath + &quot;/&quot;));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                            : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                        } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                        title={
                                          sidebarCollapsed ? child.label : &quot;&quot;
                                        }
                                      >
                                        <span className=&quot;flex-shrink-0&quot;>
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                        >
                                          {child.label}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          );
                        } else {
                          // Handle regular links
                          const itemPath = item.href || item.path || &quot;/&quot;;
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== &quot;/&quot; &&
                              pathname?.startsWith(itemPath));
                          return (
                            <li key={`brand-agent-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                    : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                title={sidebarCollapsed ? item.label : &quot;&quot;}
                              >
                                <span className=&quot;flex-shrink-0&quot;>
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                >
                                  {item.label}
                                </span>
                              </Link>
                            </li>
                          );
                        }
                      });
                    })()}
                  </ul>
                </div>
              </li>
            )}

            {/* Client Users Section - Only shown to Super Admins */}
            {isSuperAdmin && (
              <li className=&quot;mt-1&quot;>
                <button
                  onClick={toggleClientUsers}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? &quot;Client User View&quot; : &quot;&quot;}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                  >
                    <Building
                      size={20}
                      className=&quot;flex-shrink-0 text-orange-500&quot;
                    />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? &quot;hidden&quot; : &quot;opacity-100&quot;}`}
                    >
                      Client Users
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${clientUsersOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${clientUsersOpen ? &quot;max-h-[800px] opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const clientUserNav = getNavigationForRole(&quot;client_user&quot;);

                      return clientUserNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section
                          const sectionId = `client-user-section-${index}`;

                          return (
                            <li key={sectionId} className=&quot;mt-2&quot;>
                              <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                                {item.label}
                              </div>
                              <ul className=&quot;mt-1 space-y-1&quot;>
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || &quot;/&quot;;
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== &quot;/&quot; &&
                                      pathname?.startsWith(childPath + &quot;/&quot;));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                            : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                        } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                        title={
                                          sidebarCollapsed ? child.label : &quot;&quot;
                                        }
                                      >
                                        <span className=&quot;flex-shrink-0&quot;>
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                        >
                                          {child.label}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          );
                        } else {
                          // Handle regular links
                          const itemPath = item.href || item.path || &quot;/&quot;;
                          // More precise active state logic to prevent multiple highlights
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== &quot;/&quot; &&
                              pathname?.startsWith(itemPath + &quot;/&quot;));
                          return (
                            <li key={`client-user-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                    : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                title={sidebarCollapsed ? item.label : &quot;&quot;}
                              >
                                <span className=&quot;flex-shrink-0&quot;>
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                >
                                  {item.label}
                                </span>
                              </Link>
                            </li>
                          );
                        }
                      });
                    })()}
                  </ul>
                </div>
              </li>
            )}

            {/* Internal Admin Section - Only shown to Super Admins */}
            {isSuperAdmin && (
              <li className=&quot;mt-1&quot;>
                <button
                  onClick={toggleInternalAdmin}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? &quot;Internal Admin View&quot; : &quot;&quot;}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                  >
                    <UserCog size={20} className=&quot;flex-shrink-0 text-red-500&quot; />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? &quot;hidden&quot; : &quot;opacity-100&quot;}`}
                    >
                      Internal Admin
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${internalAdminOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${internalAdminOpen ? &quot;max-h-[800px] opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const internalAdminNav =
                        getNavigationForRole(&quot;internal_admin&quot;);

                      return internalAdminNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section (we'll need to refactor later for multiple sections)
                          const sectionId = `internal-admin-section-${index}`;

                          return (
                            <li key={sectionId} className=&quot;mt-2&quot;>
                              <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                                {item.label}
                              </div>
                              <ul className=&quot;mt-1 space-y-1&quot;>
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || &quot;/&quot;;
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== &quot;/&quot; &&
                                      pathname?.startsWith(childPath + &quot;/&quot;));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                            : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                        } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                        title={
                                          sidebarCollapsed ? child.label : &quot;&quot;
                                        }
                                      >
                                        <span className=&quot;flex-shrink-0&quot;>
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                        >
                                          {child.label}
                                        </span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </li>
                          );
                        } else {
                          // Handle regular links
                          const itemPath = item.href || item.path || &quot;/&quot;;
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== &quot;/&quot; &&
                              pathname?.startsWith(itemPath));
                          return (
                            <li key={`internal-admin-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                    : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                title={sidebarCollapsed ? item.label : &quot;&quot;}
                              >
                                <span className=&quot;flex-shrink-0&quot;>
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                >
                                  {item.label}
                                </span>
                              </Link>
                            </li>
                          );
                        }
                      });
                    })()}
                  </ul>
                </div>
              </li>
            )}

            {/* Admin Section - Consolidated for clarity */}
            {(isSuperAdmin ||
              adminPortalNavItems.length > 0 ||
              platformAdminNavItems.length > 0) && (
              <li className=&quot;mt-4&quot;>
                {/* Admin Header */}
                <button
                  onClick={toggleAdminPortal}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? &quot;Administration&quot; : &quot;&quot;}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                  >
                    <Shield size={20} className=&quot;flex-shrink-0 text-blue-500&quot; />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? &quot;hidden&quot; : &quot;opacity-100&quot;}`}
                    >
                      Administration
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${adminPortalOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                    />
                  )}
                </button>

                {/* Admin Submenu - Combined All Admin Sections */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${adminPortalOpen ? &quot;max-h-[1000px] opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {/* Platform Admin Items (For Super Admins) */}
                    {isSuperAdmin && platformAdminNavItems.length > 0 && (
                      <li>
                        <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                          System
                        </div>
                        <ul className=&quot;mt-1 mb-4 space-y-1&quot;>
                          {platformAdminNavItems.map((link) => {
                            // Ensure we have a path by checking both href and path properties
                            const linkPath = link.href || link.path || &quot;/&quot;;
                            const isActive =
                              pathname === linkPath ||
                              (linkPath !== &quot;/&quot; &&
                                pathname?.startsWith(linkPath));
                            return (
                              <li
                                key={
                                  link.id ||
                                  `platform-admin-${link.label}-${Math.random()}`
                                }
                              >
                                <Link
                                  href={linkPath}
                                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                    isActive
                                      ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                      : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                  } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                  title={sidebarCollapsed ? link.label : &quot;&quot;}
                                >
                                  <span className=&quot;flex-shrink-0&quot;>
                                    {link.icon}
                                  </span>
                                  <span
                                    className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                  >
                                    {link.label}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    )}

                    {/* Role-Based Admin Items with unique keys */}
                    {adminPortalNavItems.map((section, sectionIndex) => (
                      <li
                        key={`admin-section-${sectionIndex}-${section.label || section.path}`}
                      >
                        <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                          {section.label}
                        </div>
                        <ul className=&quot;mt-1 mb-4 space-y-1&quot;>
                          {section.children?.map(
                            (link: any, linkIndex: number) => {
                              const isActive =
                                pathname === (link.path || link.href) ||
                                pathname?.startsWith(
                                  link.path || link.href || &quot;&quot;,
                                );
                              return (
                                <li
                                  key={`admin-link-${sectionIndex}-${linkIndex}-${link.path || link.href || link.label}`}
                                >
                                  <Link
                                    href={link.path || link.href || &quot;#&quot;}
                                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                      isActive
                                        ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                        : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                    } ${sidebarCollapsed ? &quot;justify-center&quot; : &quot;&quot;}`}
                                    title={sidebarCollapsed ? link.label : &quot;&quot;}
                                  >
                                    <span className=&quot;flex-shrink-0&quot;>
                                      {link.icon}
                                    </span>
                                    <span
                                      className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                    >
                                      {link.label}
                                    </span>
                                  </Link>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </li>
                    ))}

                    {/* Legacy Admin Links (if any) */}
                    {isSuperAdmin && adminLinks.length > 0 && (
                      <li>
                        <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                          Admin Tools
                        </div>
                        <ul className=&quot;mt-1 mb-4 space-y-1&quot;>
                          {adminLinks
                            .filter((link) => {
                              // For super admins, show all Admin links regardless of permission
                              if (isSuperAdmin) return true;
                              // For others, apply permission check
                              if (!link.permission) return true;
                              if (!user) return false;
                              return (
                                userRole && checkPermission(link.permission)
                              );
                            })
                            .map((link: any) => {
                              // Ensure we have a path by checking both href and path properties
                              const linkPath = link.href || link.path || &quot;/&quot;;
                              const isActive =
                                pathname === linkPath ||
                                (linkPath !== &quot;/&quot; &&
                                  pathname?.startsWith(linkPath + &quot;/&quot;));
                              return (
                                <li
                                  key={
                                    link.id ||
                                    `admin-link-${link.label}-${Math.random()}`
                                  }
                                >
                                  <Link
                                    href={linkPath}
                                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                      isActive
                                        ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                        : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                    }`}
                                  >
                                    <span className=&quot;flex-shrink-0&quot;>
                                      {link.icon}
                                    </span>
                                    <span
                                      className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 hidden&quot; : &quot;opacity-100&quot;}`}
                                    >
                                      {link.label}
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      </li>
                    )}
                  </ul>
                </div>
              </li>
            )}

            {/* Legacy Brand Agents and Client Users sections removed - replaced by new role-based navigation */}
          </ul>
        </nav>

        {/* Footer with theme toggle and user info */}
        <div className=&quot;mt-auto border-t border-[rgb(var(--sidebar-border))] pt-4 pb-2 px-2&quot;>
          {/* Theme toggle */}
          <div className=&quot;flex justify-between items-center mb-4 px-2&quot;>
            <span
              className={`text-sm text-[rgb(var(--muted-foreground))] transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 w-0&quot; : &quot;opacity-100&quot;}`}
            >
              Dark Mode
            </span>
            <ThemeToggle />
          </div>

          {/* User profile section */}
          {user ? (
            <div className=&quot;px-2&quot;>
              <Link href=&quot;/profile&quot; className=&quot;block&quot;>
                <div className=&quot;flex items-center mb-3 p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)] transition-colors cursor-pointer&quot;>
                  <div className=&quot;w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white flex-shrink-0 border-2 border-[rgb(var(--primary-light))]&quot;>
                    <User size={18} />
                  </div>
                  <div
                    className={`ml-3 overflow-hidden transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 w-0&quot; : &quot;opacity-100&quot;}`}
                  >
                    <p className=&quot;text-sm font-medium truncate&quot;>
                      {user.username}
                    </p>
                    <div className=&quot;flex items-center&quot;>
                      <span className=&quot;inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))]&quot;>
                        {(user.role || &quot;client_user&quot;)
                          .replace(/_/g, &quot; &quot;)
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Logout button */}
              <div className=&quot;mt-2&quot;>
                <Button
                  variant=&quot;default&quot;
                  size=&quot;sm&quot;
                  disabled={loading}
                  onClick={logout}
                  className=&quot;w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white&quot;
                >
                  <LogOut
                    size={16}
                    className={sidebarCollapsed ? &quot;&quot; : &quot;mr-2&quot;}
                  />
                  {!sidebarCollapsed &&
                    (loading ? &quot;Logging out...&quot; : &quot;Logout&quot;)}
                </Button>
              </div>
            </div>
          ) : (
            <div className=&quot;px-2&quot;>
              {/* User profile section - shown when user authentication is available */}
              <SafeLink href=&quot;/auth/login&quot; className=&quot;block&quot;>
                <div className=&quot;flex items-center mb-3 p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)] transition-colors cursor-pointer&quot;>
                  <div className=&quot;w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0&quot;>
                    <User size={18} />
                  </div>
                  <div
                    className={`ml-3 overflow-hidden transition-opacity duration-300 ${sidebarCollapsed ? &quot;opacity-0 w-0&quot; : &quot;opacity-100&quot;}`}
                  >
                    <p className=&quot;text-sm font-medium truncate&quot;>Guest User</p>
                    <p className=&quot;text-xs text-[rgb(var(--muted-foreground))] truncate&quot;>
                      Login to access your account
                    </p>
                  </div>
                </div>
              </SafeLink>

              {/* Login button only - removed Register button */}
              <div className=&quot;mt-2&quot;>
                <SafeLink href=&quot;/auth/login&quot;>
                  <Button
                    variant=&quot;default&quot;
                    size=&quot;sm&quot;
                    className=&quot;w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white&quot;
                  >
                    <User
                      size={16}
                      className={sidebarCollapsed ? &quot;&quot; : &quot;mr-2&quot;}
                    />
                    {!sidebarCollapsed && &quot;Login&quot;}
                  </Button>
                </SafeLink>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Menu Button - Only shown on mobile - moved to TopBar component */}

      {/* Mobile Menu Overlay - Only shown when mobile menu is open */}
      {mobileMenuOpen && (
        <div
          className=&quot;fixed inset-0 bg-black/50 z-40 lg:hidden&quot;
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Menu Panel - Ensure it ONLY shows on mobile with lg:hidden */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[rgb(var(--sidebar-background))] shadow-lg transition-transform duration-300 transform lg:hidden
        ${mobileMenuOpen ? &quot;translate-x-0&quot; : &quot;-translate-x-full&quot;}
      `}
      >
        {/* Mobile menu header */}
        <div className=&quot;flex items-center justify-between p-4 border-b border-[rgb(var(--sidebar-border))]&quot;>
          <Link href=&quot;/&quot; className=&quot;flex items-center overflow-hidden&quot;>
            <div className=&quot;w-8 h-8 relative flex-shrink-0&quot;>
              <Image
                src=&quot;/favicon.ico&quot;
                alt=&quot;Rishi Logo&quot;
                width={32}
                height={32}
                className=&quot;object-contain w-auto h-auto&quot;
                style={{ objectFit: &quot;contain&quot; }}
                priority
                onError={(e) => {
                  // Fall back to another logo if this one fails
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = &quot;/favicon.png&quot;;
                }}
              />
            </div>
            <span className=&quot;ml-2 text-xl font-bold text-[rgb(var(--primary))]&quot;>
              Rishi
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className=&quot;p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
            aria-label=&quot;Close menu&quot;
          >
            <X size={20} />
          </button>
        </div>

        {/* Organization Switcher - Mobile */}
        <div className=&quot;px-3 py-3 border-b border-[rgb(var(--sidebar-border))]&quot;>
          <div className=&quot;mb-1 text-xs font-medium text-[rgb(var(--sidebar-muted-foreground))]&quot;>
            Organization
          </div>
          <OrganizationSwitcher />
        </div>

        {/* Mobile Navigation links */}
        <nav className=&quot;px-2 py-4 overflow-y-auto max-h-[calc(100vh-200px)]&quot;>
          <ul className=&quot;space-y-1&quot;>
            {links.map((link) => {
              // Ensure we have a path by checking both href and path properties
              const linkPath = link.href || link.path || &quot;/&quot;;
              const isActive =
                pathname === linkPath ||
                (linkPath !== &quot;/&quot; && pathname?.startsWith(linkPath));
              return (
                <li
                  key={link.id || `mobile-nav-${link.label}-${Math.random()}`}
                >
                  <Link
                    href={linkPath}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                        : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className=&quot;flex-shrink-0&quot;>{link.icon}</span>
                    <span className=&quot;ml-3&quot;>{link.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Mobile Admin Section - Consolidated for clarity */}
            {(isSuperAdmin ||
              adminPortalNavItems.length > 0 ||
              platformAdminNavItems.length > 0) && (
              <li className=&quot;mt-4&quot;>
                {/* Admin Header */}
                <button
                  onClick={toggleAdminPortal}
                  className=&quot;w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                >
                  <div className=&quot;flex items-center&quot;>
                    <Shield size={20} className=&quot;flex-shrink-0 text-blue-500&quot; />
                    <span className=&quot;ml-3 font-medium&quot;>Administration</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${adminPortalOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                  />
                </button>

                {/* Admin Submenu - Combined All Admin Sections */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${adminPortalOpen ? &quot;max-h-[1500px] opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4&quot;>
                    {/* Platform Admin Items (For Super Admins) */}
                    {isSuperAdmin && platformAdminNavItems.length > 0 && (
                      <li className=&quot;mb-3&quot;>
                        <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                          System
                        </div>
                        <ul className=&quot;space-y-1 mb-2&quot;>
                          {platformAdminNavItems.map((link) => {
                            // Ensure we have a path by checking both href and path properties
                            const linkPath = link.href || link.path || &quot;/&quot;;
                            const isActive =
                              pathname === linkPath ||
                              (linkPath !== &quot;/&quot; &&
                                pathname?.startsWith(linkPath));
                            return (
                              <li
                                key={
                                  link.id ||
                                  `client-nav-${link.label}-${Math.random()}`
                                }
                              >
                                <Link
                                  href={linkPath}
                                  className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                    isActive
                                      ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                      : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <span className=&quot;flex-shrink-0&quot;>
                                    {link.icon}
                                  </span>
                                  <span className=&quot;ml-3&quot;>{link.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    )}

                    {/* No duplicate Role-Based Admin Items here */}

                    {/* Legacy Admin Links (if any) */}
                    {isSuperAdmin && adminLinks.length > 0 && (
                      <li className=&quot;mb-3&quot;>
                        <div className=&quot;px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider&quot;>
                          Admin Tools
                        </div>
                        <ul className=&quot;space-y-1 mb-2&quot;>
                          {adminLinks
                            .filter((link) => {
                              // For super admins, show all Admin links regardless of permission
                              if (isSuperAdmin) return true;
                              // For others, apply permission check
                              if (!link.permission) return true;
                              if (!user) return false;
                              return (
                                userRole && checkPermission(link.permission)
                              );
                            })
                            .map((link) => {
                              const isActive =
                                pathname === link.href ||
                                pathname?.startsWith(link.href);
                              return (
                                <li
                                  key={`extra-nav-${link.label}-${link.href}`}
                                >
                                  <Link
                                    href={link.href}
                                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                      isActive
                                        ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                        : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <span className=&quot;flex-shrink-0&quot;>
                                      {link.icon}
                                    </span>
                                    <span className=&quot;ml-3&quot;>{link.label}</span>
                                  </Link>
                                </li>
                              );
                            })}
                        </ul>
                      </li>
                    )}
                  </ul>
                </div>
              </li>
            )}

            {/* Mobile Brand Agents Section */}
            {isSuperAdmin && brandAgentLinks.length > 0 && (
              <li className=&quot;mt-4&quot;>
                <button
                  onClick={toggleBrandAgents}
                  className=&quot;w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                >
                  <div className=&quot;flex items-center&quot;>
                    <Users size={20} className=&quot;flex-shrink-0 text-green-500&quot; />
                    <span className=&quot;ml-3 font-medium&quot;>Brand Agents</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${brandAgentsOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${brandAgentsOpen ? &quot;max-h-96 opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {brandAgentLinks
                      .filter((link) => {
                        // For super admins, show all Brand Agent links regardless of permission
                        if (isSuperAdmin) return true;
                        // For others, apply permission check
                        if (!link.permission) return true;
                        if (!user) return false;
                        return userRole && checkPermission(link.permission);
                      })
                      .map((link) => {
                        // Use href property for navigation
                        const linkPath = link.href || &quot;/&quot;;
                        const isActive =
                          pathname === linkPath ||
                          (linkPath !== &quot;/&quot; && pathname?.startsWith(linkPath));
                        return (
                          <li key={`org-selector-${link.label}-${link.href}`}>
                            <Link
                              href={linkPath}
                              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                isActive
                                  ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                  : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className=&quot;flex-shrink-0&quot;>{link.icon}</span>
                              <span className=&quot;ml-3&quot;>{link.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </li>
            )}

            {/* Mobile Client Users Section */}
            {isSuperAdmin && clientUserLinks.length > 0 && (
              <li className=&quot;mt-4&quot;>
                <button
                  onClick={toggleClientUsers}
                  className=&quot;w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                >
                  <div className=&quot;flex items-center&quot;>
                    <Building
                      size={20}
                      className=&quot;flex-shrink-0 text-amber-500&quot;
                    />
                    <span className=&quot;ml-3 font-medium&quot;>Client Users</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${clientUsersOpen ? &quot;rotate-180&quot; : &quot;rotate-0&quot;}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${clientUsersOpen ? &quot;max-h-96 opacity-100 pt-2&quot; : &quot;max-h-0 opacity-0&quot;}`}
                >
                  <ul className=&quot;pl-4 space-y-1&quot;>
                    {clientUserLinks
                      .filter((link) => {
                        // For super admins, show all Client User links regardless of permission
                        if (isSuperAdmin) return true;
                        // For others, apply permission check
                        if (!link.permission) return true;
                        if (!user) return false;
                        return userRole && checkPermission(link.permission);
                      })
                      .map((link) => {
                        // Use href property for navigation
                        const linkPath = link.href || &quot;/&quot;;
                        const isActive =
                          pathname === linkPath ||
                          (linkPath !== &quot;/&quot; && pathname?.startsWith(linkPath));
                        return (
                          <li key={`profile-menu-${link.label}-${link.href}`}>
                            <Link
                              href={linkPath}
                              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                isActive
                                  ? &quot;bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium&quot;
                                  : &quot;text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]&quot;
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className=&quot;flex-shrink-0&quot;>{link.icon}</span>
                              <span className=&quot;ml-3&quot;>{link.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              </li>
            )}
          </ul>
        </nav>

        {/* Mobile menu footer */}
        <div className=&quot;absolute bottom-0 left-0 right-0 border-t border-[rgb(var(--sidebar-border))] pt-4 pb-6 px-4&quot;>
          {/* Theme toggle */}
          <div className=&quot;flex justify-between items-center mb-4&quot;>
            <span className=&quot;text-sm text-[rgb(var(--muted-foreground))]&quot;>
              Dark Mode
            </span>
            <ThemeToggle />
          </div>

          {/* User profile info - for mobile menu */}
          {user ? (
            <>
              {/* User profile card */}
              <Link href=&quot;/profile&quot; className=&quot;block mb-3&quot;>
                <div className=&quot;flex items-center p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)] transition-colors&quot;>
                  <div className=&quot;w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white flex-shrink-0 border-2 border-[rgb(var(--primary-light))]&quot;>
                    <User size={18} />
                  </div>
                  <div className=&quot;ml-3&quot;>
                    <p className=&quot;text-sm font-medium truncate&quot;>
                      {user.username}
                    </p>
                    <div className=&quot;flex items-center&quot;>
                      <span className=&quot;inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))]&quot;>
                        {(user.role || &quot;client_user&quot;)
                          .replace(/_/g, &quot; &quot;)
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Logout button */}
              <Button
                variant=&quot;default&quot;
                size=&quot;sm&quot;
                disabled={loading}
                onClick={async () => {
                  try {
                    // First try using the hook's logout function
                    if (typeof logout === &quot;function&quot;) {
                      await logout();
                    } else {
                      // Fallback for production if hook function is not available
                      // Direct fetch to logout endpoint
                      const response = await fetch(&quot;/api/auth/logout&quot;, {
                        method: &quot;POST&quot;,
                        headers: { &quot;Content-Type&quot;: &quot;application/json&quot; },
                      });

                      if (response.ok) {
                        // Redirect to home page or login
                        window.location.href = &quot;/&quot;;
                      }
                    }
                  } catch (error) {
                    console.error(&quot;Logout error:&quot;, error);
                    // Fallback redirect on error
                    window.location.href = &quot;/&quot;;
                  }
                }}
                className=&quot;w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white&quot;
              >
                <LogOut size={16} className=&quot;mr-2&quot; />
                {loading ? &quot;Logging out...&quot; : &quot;Logout&quot;}
              </Button>
            </>
          ) : (
            <SafeLink href=&quot;/auth/login&quot;>
              <Button
                variant=&quot;default&quot;
                size=&quot;sm&quot;
                className=&quot;w-full bg-purple-600 hover:bg-purple-700 text-white&quot;
              >
                Login
              </Button>
            </SafeLink>
          )}
        </div>
      </div>

      {/* Bottom mobile navigation bar - Only shown on mobile */}
      <div className=&quot;fixed bottom-0 left-0 right-0 z-30 bg-[rgb(var(--sidebar-background))]/95 backdrop-blur-sm border-t border-[rgb(var(--sidebar-border))] lg:hidden&quot;>
        <div className=&quot;flex items-center justify-around py-2&quot;>
          {/* For super admins, show first 2 links (Dashboard, Docs) plus Admin button */}
          {/* For others, show first 5 links */}
          {links
            .slice(0, isSuperAdmin ? 2 : Math.min(links.length, 5))
            .map((link) => {
              // Ensure we have a path by checking both href and path properties
              const linkPath = link.href || link.path || &quot;/&quot;;
              const isActive =
                pathname === linkPath ||
                (linkPath !== &quot;/&quot; && pathname?.startsWith(linkPath));
              return (
                <SafeLink
                  key={link.id || `footer-nav-${link.label}-${Math.random()}`}
                  href={linkPath}
                  className={`flex flex-col items-center p-2 ${
                    isActive
                      ? &quot;text-[rgb(var(--primary))]&quot;
                      : &quot;text-[rgb(var(--sidebar-foreground))]&quot;
                  }`}
                >
                  {link.icon}
                  <span className=&quot;text-xs mt-1&quot;>{link.label}</span>
                </SafeLink>
              );
            })}
          {/* Add super admin button to bottom nav */}
          {isSuperAdmin && (
            <button
              onClick={() => {
                setMobileMenuOpen(true);
                setSuperAdminOpen(true);
              }}
              className=&quot;flex flex-col items-center p-2 text-purple-500&quot;
            >
              <Shield size={20} />
              <span className=&quot;text-xs mt-1&quot;>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0 ${sidebarCollapsed ? &quot;lg:ml-20&quot; : &quot;lg:ml-64&quot;} transition-all duration-300`}
      >
        {/* Top navigation bar with mobile menu button and organization selector */}
        <div className=&quot;sticky top-0 z-20 w-full&quot;>
          <TopBar openMobileMenu={() => setMobileMenuOpen(true)} />
        </div>

        {/* Main content area */}
        <main className=&quot;flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
