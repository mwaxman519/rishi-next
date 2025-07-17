"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useSidebarState } from "@/hooks/useSidebarState";
import { hasPermission } from "@/lib/rbac";
import { NavItem, NAV_ITEM_TYPES } from "@shared/navigation-constants";
import {
  filterLinksByPermission,
  hasMyAvailability,
  createMyAvailabilityLink,
} from "@/utils/navigation-utils";
import {
  getNavigationForRole,
  getPlatformAdminNav,
} from "@shared/navigation-structure";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
} from "lucide-react";
// Logo is loaded directly via Image component, not imported
import { Button } from "./ui/button";
import { SafeLink } from "./ui/safe-link";
import { TopBar } from "./layout/TopBar";
import { OrganizationSwitcher } from "./layout/OrganizationSwitcher";
import { getAdminNavForRole } from "./layout/AdminPortalNav";
import {
  getSuperAdminNavigation,
  isNavItemActive,
} from "./navigation/SuperAdminNavigation";

// Helper function to format role names
const formatRoleName = (role: string): string => {
  return role
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
};

// This function is only used for TypeScript typechecking
const formatString = (str: string): string => {
  return str
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
};

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  const pathname = usePathname();
  const { user, loading, logout, loggingOut } = useAuth();
  const { checkPermission, can } = useAuthorization();
  const { sidebarCollapsed, toggleSidebar, setSidebarCollapsed } =
    useSidebarState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Skip sidebar for login/auth pages
  if (pathname?.startsWith("/auth/")) {
    return <>{children}</>;
  }

  // Don't render sidebar for unauthenticated users
  // Check for URL parameters that indicate we should force unauthenticated mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("unauthenticated") === "true") {
        console.log(
          "SidebarLayout: URL parameter indicates unauthenticated state",
        );
      }
    }
  }, []);

  // Skip rendering sidebar if the URL parameter is set
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("unauthenticated") === "true") {
      return <>{children}</>;
    }
  }

  // Special case for documentation pages
  const isDocsPage = pathname?.startsWith("/docs");

  // Place all useEffect hooks together at the top to maintain consistent ordering
  // Dispatch a custom event for the calendar component when sidebar state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Dispatch a custom event that our calendar component can listen for
      const event = new CustomEvent("sidebarStateChange", {
        detail: { collapsed: sidebarCollapsed },
      });
      window.dispatchEvent(event);
    }
  }, [sidebarCollapsed]);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const userRole = user?.role || "";

  // Check if user is a super admin - defined early to use throughout the component
  const isSuperAdmin = user?.role === "super_admin";

  // For static generation during build, provide fallback behavior
  if (typeof window === "undefined" && !user) {
    console.log(
      "### SidebarLayout STATIC GENERATION ### Providing fallback layout",
    );
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
    );
  }

  // Don't render sidebar while loading user data
  if (loading) {
    return <>{children}</>;
  }

  // Don't render sidebar if user is not authenticated
  if (!user) {
    return <>{children}</>;
  }

  console.log(
    "### SidebarLayout RENDERED ### isSuperAdmin =",
    isSuperAdmin,
    "role =",
    user?.role,
    "pathname =",
    pathname,
  );

  // Public links available to all users
  const publicLinks = [
    {
      href: "/",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    {
      href: "/docs",
      label: "Documentation",
      icon: <FileText size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
  ];

  // Links that require specific permissions
  const protectedLinks = [
    // Staff section (Rishi employees)
    {
      href: "/staff",
      label: "Staff",
      permission: null, // Temporarily removed permission for development
      icon: <Users size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Clients section (client organizations)
    {
      href: "/clients",
      label: "Clients",
      permission: null, // Temporarily removed permission for development
      icon: <Building size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Kits section (templates and instances)
    {
      href: "/kits",
      label: "Kits",
      permission: null, // Temporarily removed permission for development
      icon: <Package size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Bookings section (calendar)
    {
      href: "/bookings",
      label: "Bookings",
      permission: null, // Temporarily removed permission for development
      icon: <Calendar size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Requests section (event booking requests)
    {
      href: "/requests",
      label: "Requests",
      permission: null, // Temporarily removed permission for development
      icon: <ClipboardList size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Locations section (states, regions, venues)
    {
      href: "/locations",
      label: "Locations",
      permission: null, // Temporarily removed permission for development
      icon: <MapPin size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Regions section (states, custom regions)
    {
      href: "/regions",
      label: "Regions",
      permission: null, // Temporarily removed permission for development
      icon: <MapPin size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // My Availability has been moved to the Brand Agents section for super admin users
    // For regular users, it will still be accessible here
    // Team Availability
    {
      href: "/availability/team",
      label: "Team Calendar",
      permission: null, // Temporarily removed permission for development
      icon: <Clock size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Resources section
    {
      href: "/resources",
      label: "Resources",
      permission: null, // Temporarily removed permission for development
      icon: <GraduationCap size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Client Management
    {
      href: "/client-management",
      label: "Client Management",
      permission: null, // Temporarily removed permission for development
      icon: <Building size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Admin section (retain existing admin links)
    {
      href: "/admin",
      label: "Admin",
      permission: "view:admin",
      icon: <Settings size={20} />,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    {
      href: "/admin/rbac",
      label: "RBAC Dashboard",
      permission: "manage:roles" as Permission,
      icon: <Shield size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
    {
      href: "/admin/organization-permissions",
      label: "Org Permissions",
      permission: "manage:permissions" as Permission,
      icon: <Lock size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
    {
      href: "/admin/features",
      label: "Features",
      permission: "manage:roles" as Permission,
      icon: <Settings size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
    {
      href: "/admin/test-data",
      label: "Test Data",
      permission: "manage:roles" as Permission,
      icon: <Database size={20} />,
      type: NAV_ITEM_TYPES.SECONDARY,
    },
  ];

  // Separate links into categories for Super Admin view
  const adminLinks = protectedLinks.filter(
    (link) => link.href.startsWith("/admin") || link.label.includes("Admin"),
  );

  const regularLinks = protectedLinks.filter(
    (link) => !link.href.startsWith("/admin") && !link.label.includes("Admin"),
  );

  // Get consolidated navigation based on user role from our new unified structure

  // For user role-based navigation with proper information architecture
  console.log("USER ROLE FOR NAV:", userRole);

  // Get the appropriate navigation structure based on user role
  let roleBasedNavigation: any[] = [];
  if (userRole) {
    console.log(`Loading ${userRole} navigation structure`);
    if (userRole === "super_admin") {
      // Use the new Super Admin navigation structure
      roleBasedNavigation = getSuperAdminNavigation();
    } else {
      roleBasedNavigation = getNavigationForRole(userRole);
    }
  } else {
    console.log("No valid role found, no navigation will be loaded");
    // NO FALLBACK NAVIGATION - User must have valid role
    roleBasedNavigation = [];
  }

  console.log(
    "ROLE-BASED NAVIGATION LOADED:",
    Array.isArray(roleBasedNavigation)
      ? roleBasedNavigation.map((item) => item.label)
      : "No items",
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
      !item.path.includes("/admin") &&
      !item.label?.includes("Administration") &&
      item.label !== "Platform Administration",
  );

  // Get admin-specific navigation sections
  const adminPortalNavItems = roleBasedNavigation.filter(
    (item) =>
      item &&
      ((item.path && item.path.includes("/admin")) ||
        (item.label && item.label.includes("Administration")) ||
        item.label === "Platform Administration") &&
      item.label !== "Dashboard", // Don't include Dashboard in admin sections
  );

  // Platform Administration is a special case for super admins
  const platformAdminNavItems =
    isSuperAdmin && typeof getPlatformAdminNav === "function"
      ? getPlatformAdminNav()
      : [];

  const brandAgentLinks = [
    // Personal Dashboard section
    {
      href: "/dashboard",
      label: "Personal Dashboard",
      icon: <LayoutDashboard size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // My Availability section
    {
      href: "/availability",
      label: "My Availability",
      icon: <Clock size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Profile Management section
    {
      href: "/profile",
      label: "Profile Management",
      icon: <User size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Events section
    {
      href: "/events",
      label: "Events",
      icon: <Calendar size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Requests section
    {
      href: "/requests",
      label: "Requests",
      icon: <ClipboardList size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Availability Management section
    {
      href: "/availability/team",
      label: "Team Calendar",
      icon: <Clock size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Resources section
    {
      href: "/resources",
      label: "Resources",
      icon: <GraduationCap size={20} />,
      permission: "manage:agents" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
  ];

  const clientUserLinks = [
    // Dashboard
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      permission: "manage:clients" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Booking Management
    {
      href: "/bookings",
      label: "Booking Management",
      icon: <ClipboardList size={20} />,
      permission: "manage:clients" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Events
    {
      href: "/events",
      label: "Events",
      icon: <Calendar size={20} />,
      permission: "manage:clients" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Locations
    {
      href: "/locations",
      label: "Locations",
      icon: <MapPin size={20} />,
      permission: "manage:clients" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Analytics
    {
      href: "/analytics",
      label: "Analytics",
      icon: <BarChart size={20} />,
      permission: "manage:clients" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Time Tracking
    {
      href: "/timetracking",
      label: "Time Tracking",
      icon: <Clock size={20} />,
      permission: "manage:clients" as Permission,
      type: NAV_ITEM_TYPES.PRIMARY,
    },
    // Team
    {
      href: "/team",
      label: "Team",
      icon: <Users size={20} />,
      permission: "manage:clients" as Permission,
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

  // For super admins, don't show regular links - only public links
  // For regular users, show public links plus regular links with permissions
  // For super admins, don't add "My Availability" to the top-level
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
    // Then add public links that don't duplicate what's already in the navigation
    ...filteredPublicLinks,
    // For backward compatibility, keep showing the old links too for now
    // We'll remove this as we transition fully to the new system
    ...(isSuperAdmin
      ? []
      : filterLinksByPermission(
          regularLinks,
          user ? { id: user.id, role: user.role || "client_user" } : null,
          userRole,
          (permission: string) => {
            // Use synchronous permission check for deployment compatibility
            if (!user) return false;
            if (user.role === "super_admin") return true;
            // For deployment, allow all permissions in development
            return process.env.NODE_ENV === "development";
          },
        )),
  ];

  // Show loading spinner if authentication is still loading - AFTER all hooks are initialized
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Links array is now fully prepared for rendering

  // Special handling for docs pages - keep the main sidebar but allow custom content
  /* We'll retain the sidebar for docs pages too */

  // Standard sidebar layout
  return (
    <div className="flex h-screen overflow-hidden bg-[rgb(var(--background))]">
      {/* Desktop Sidebar - hidden on mobile */}
      <aside
        className={`hidden lg:flex sidebar h-screen flex-col transition-all duration-300 ${sidebarCollapsed ? "w-20 sidebar-collapsed" : "w-64 sidebar-expanded"}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--sidebar-border))]">
          {sidebarCollapsed ? (
            <div className="w-full flex flex-col items-center">
              <Link href="/" className="flex items-center justify-center mb-3">
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image
                    src="/favicon.ico"
                    alt="Rishi Logo"
                    width={32}
                    height={32}
                    className="object-contain w-auto h-auto"
                    style={{ objectFit: "contain" }}
                    priority
                    onError={(e) => {
                      // Fall back to another logo if this one fails
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/favicon.png";
                    }}
                  />
                </div>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                aria-label="Expand sidebar"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          ) : (
            <>
              <Link href="/" className="flex items-center overflow-hidden">
                <div className="w-8 h-8 relative flex-shrink-0">
                  <Image
                    src="/favicon.ico"
                    alt="Rishi Logo"
                    width={32}
                    height={32}
                    className="object-contain w-auto h-auto"
                    style={{ objectFit: "contain" }}
                    priority
                    onError={(e) => {
                      // Fall back to another logo if this one fails
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "/favicon.png";
                    }}
                  />
                </div>
                <span className="ml-2 text-xl font-bold text-[rgb(var(--primary))]">
                  Rishi
                </span>
              </Link>
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          )}
        </div>

        {/* Organization Switcher */}
        {!sidebarCollapsed ? (
          <div className="px-3 py-3 border-b border-[rgb(var(--sidebar-border))]">
            <div className="mb-1 text-xs font-medium text-[rgb(var(--sidebar-muted-foreground))]">
              Organization
            </div>
            <OrganizationSwitcher />
          </div>
        ) : (
          <div className="flex justify-center py-3 border-b border-[rgb(var(--sidebar-border))]">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)]"
              title="Expand sidebar to switch organizations"
            >
              <Building
                size={20}
                className="text-[rgb(var(--sidebar-muted-foreground))]"
              />
            </button>
          </div>
        )}

        {/* Navigation links */}
        <nav className="flex-grow px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {links.map((link) => {
              // Ensure we have a path by checking both href and path properties
              const linkPath = link.href || link.path || "/";
              const isActive =
                pathname === linkPath ||
                (linkPath !== "/" && pathname?.startsWith(linkPath)) ||
                (linkPath === "/" && pathname === "/dashboard"); // Special case for Dashboard

              return (
                <li key={link.id || `nav-${linkPath}-${link.label}`}>
                  <Link
                    href={linkPath}
                    className={`sidebar-item ${isActive ? "sidebar-item-active" : "sidebar-item-inactive"} ${sidebarCollapsed ? "justify-center" : ""}`}
                    title={sidebarCollapsed ? link.label : ""}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span
                      className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            })}

            {/* Field Manager Section - Only shown to Super Admins */}
            {isSuperAdmin && (
              <li className="mt-4">
                <button
                  onClick={toggleFieldManager}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? "Field Manager View" : ""}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <Briefcase
                      size={20}
                      className="flex-shrink-0 text-green-500"
                    />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? "hidden" : "opacity-100"}`}
                    >
                      Field Manager
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${fieldManagerOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${fieldManagerOpen ? "max-h-[800px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const fieldManagerNav = getNavigationForRole(
                        "internal_field_manager",
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
                            <li key={sectionId} className="mt-2">
                              <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                                {item.label}
                              </div>
                              <ul className="mt-1 space-y-1">
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || "/";
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== "/" &&
                                      pathname?.startsWith(childPath + "/"));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                            : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                                        title={
                                          sidebarCollapsed ? child.label : ""
                                        }
                                      >
                                        <span className="flex-shrink-0">
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
                          const itemPath = item.href || item.path || "/";
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== "/" &&
                              pathname?.startsWith(itemPath));
                          return (
                            <li key={`field-manager-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                    : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                } ${sidebarCollapsed ? "justify-center" : ""}`}
                                title={sidebarCollapsed ? item.label : ""}
                              >
                                <span className="flex-shrink-0">
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
              <li className="mt-1">
                <button
                  onClick={toggleBrandAgents}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? "Brand Agent View" : ""}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <User size={20} className="flex-shrink-0 text-purple-500" />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? "hidden" : "opacity-100"}`}
                    >
                      Brand Agents
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${brandAgentsOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${brandAgentsOpen ? "max-h-[800px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const brandAgentNav = getNavigationForRole("brand_agent");

                      return brandAgentNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section
                          const sectionId = `brand-agent-section-${index}`;

                          return (
                            <li key={sectionId} className="mt-2">
                              <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                                {item.label}
                              </div>
                              <ul className="mt-1 space-y-1">
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || "/";
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== "/" &&
                                      pathname?.startsWith(childPath + "/"));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                            : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                                        title={
                                          sidebarCollapsed ? child.label : ""
                                        }
                                      >
                                        <span className="flex-shrink-0">
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
                          const itemPath = item.href || item.path || "/";
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== "/" &&
                              pathname?.startsWith(itemPath));
                          return (
                            <li key={`brand-agent-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                    : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                } ${sidebarCollapsed ? "justify-center" : ""}`}
                                title={sidebarCollapsed ? item.label : ""}
                              >
                                <span className="flex-shrink-0">
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
              <li className="mt-1">
                <button
                  onClick={toggleClientUsers}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? "Client User View" : ""}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <Building
                      size={20}
                      className="flex-shrink-0 text-orange-500"
                    />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? "hidden" : "opacity-100"}`}
                    >
                      Client Users
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${clientUsersOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${clientUsersOpen ? "max-h-[800px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const clientUserNav = getNavigationForRole("client_user");

                      return clientUserNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section
                          const sectionId = `client-user-section-${index}`;

                          return (
                            <li key={sectionId} className="mt-2">
                              <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                                {item.label}
                              </div>
                              <ul className="mt-1 space-y-1">
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || "/";
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== "/" &&
                                      pathname?.startsWith(childPath + "/"));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                            : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                                        title={
                                          sidebarCollapsed ? child.label : ""
                                        }
                                      >
                                        <span className="flex-shrink-0">
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
                          const itemPath = item.href || item.path || "/";
                          // More precise active state logic to prevent multiple highlights
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== "/" &&
                              pathname?.startsWith(itemPath + "/"));
                          return (
                            <li key={`client-user-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                    : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                } ${sidebarCollapsed ? "justify-center" : ""}`}
                                title={sidebarCollapsed ? item.label : ""}
                              >
                                <span className="flex-shrink-0">
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
              <li className="mt-1">
                <button
                  onClick={toggleInternalAdmin}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? "Internal Admin View" : ""}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <UserCog size={20} className="flex-shrink-0 text-red-500" />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? "hidden" : "opacity-100"}`}
                    >
                      Internal Admin
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${internalAdminOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${internalAdminOpen ? "max-h-[800px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
                    {(() => {
                      // Use the already imported getNavigationForRole function
                      const internalAdminNav =
                        getNavigationForRole("internal_admin");

                      return internalAdminNav.map((item, index) => {
                        // Handle sections differently than regular links
                        if (
                          item.type === NAV_ITEM_TYPES.SECTION &&
                          item.children
                        ) {
                          // Create a state for this section (we'll need to refactor later for multiple sections)
                          const sectionId = `internal-admin-section-${index}`;

                          return (
                            <li key={sectionId} className="mt-2">
                              <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                                {item.label}
                              </div>
                              <ul className="mt-1 space-y-1">
                                {item.children.map((child, childIndex) => {
                                  // Ensure we have a path by checking both href and path properties
                                  const childPath =
                                    child.href || child.path || "/";
                                  // More precise active state logic to prevent multiple highlights
                                  const isActive =
                                    pathname === childPath ||
                                    (childPath !== "/" &&
                                      pathname?.startsWith(childPath + "/"));

                                  return (
                                    <li
                                      key={`${sectionId}-child-${childIndex}`}
                                    >
                                      <Link
                                        href={childPath}
                                        className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                          isActive
                                            ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                            : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                        } ${sidebarCollapsed ? "justify-center" : ""}`}
                                        title={
                                          sidebarCollapsed ? child.label : ""
                                        }
                                      >
                                        <span className="flex-shrink-0">
                                          {child.icon}
                                        </span>
                                        <span
                                          className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
                          const itemPath = item.href || item.path || "/";
                          const isActive =
                            pathname === itemPath ||
                            (itemPath !== "/" &&
                              pathname?.startsWith(itemPath));
                          return (
                            <li key={`internal-admin-link-${index}`}>
                              <Link
                                href={itemPath}
                                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                  isActive
                                    ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                    : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                } ${sidebarCollapsed ? "justify-center" : ""}`}
                                title={sidebarCollapsed ? item.label : ""}
                              >
                                <span className="flex-shrink-0">
                                  {item.icon}
                                </span>
                                <span
                                  className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
              <li className="mt-4">
                {/* Admin Header */}
                <button
                  onClick={toggleAdminPortal}
                  className={`w-full flex items-center justify-between ${sidebarCollapsed ? "justify-center" : ""} px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]`}
                  title={sidebarCollapsed ? "Administration" : ""}
                >
                  <div
                    className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}
                  >
                    <Shield size={20} className="flex-shrink-0 text-blue-500" />
                    <span
                      className={`ml-3 font-medium transition-opacity duration-300 ${sidebarCollapsed ? "hidden" : "opacity-100"}`}
                    >
                      Administration
                    </span>
                  </div>
                  {!sidebarCollapsed && (
                    <ChevronDown
                      size={18}
                      className={`transition-transform duration-200 ${adminPortalOpen ? "rotate-180" : "rotate-0"}`}
                    />
                  )}
                </button>

                {/* Admin Submenu - Combined All Admin Sections */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${adminPortalOpen ? "max-h-[1000px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
                    {/* Platform Admin Items (For Super Admins) */}
                    {isSuperAdmin && platformAdminNavItems.length > 0 && (
                      <li>
                        <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                          System
                        </div>
                        <ul className="mt-1 mb-4 space-y-1">
                          {platformAdminNavItems.map((link) => {
                            // Ensure we have a path by checking both href and path properties
                            const linkPath = link.href || link.path || "/";
                            const isActive =
                              pathname === linkPath ||
                              (linkPath !== "/" &&
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
                                      ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                      : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                  } ${sidebarCollapsed ? "justify-center" : ""}`}
                                  title={sidebarCollapsed ? link.label : ""}
                                >
                                  <span className="flex-shrink-0">
                                    {link.icon}
                                  </span>
                                  <span
                                    className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
                        <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                          {section.label}
                        </div>
                        <ul className="mt-1 mb-4 space-y-1">
                          {section.children?.map(
                            (link: any, linkIndex: number) => {
                              const isActive =
                                pathname === (link.path || link.href) ||
                                pathname?.startsWith(
                                  link.path || link.href || "",
                                );
                              return (
                                <li
                                  key={`admin-link-${sectionIndex}-${linkIndex}-${link.path || link.href || link.label}`}
                                >
                                  <Link
                                    href={link.path || link.href || "#"}
                                    className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                      isActive
                                        ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                        : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                    } ${sidebarCollapsed ? "justify-center" : ""}`}
                                    title={sidebarCollapsed ? link.label : ""}
                                  >
                                    <span className="flex-shrink-0">
                                      {link.icon}
                                    </span>
                                    <span
                                      className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
                        <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                          Admin Tools
                        </div>
                        <ul className="mt-1 mb-4 space-y-1">
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
                              const linkPath = link.href || link.path || "/";
                              const isActive =
                                pathname === linkPath ||
                                (linkPath !== "/" &&
                                  pathname?.startsWith(linkPath + "/"));
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
                                        ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                        : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                    }`}
                                  >
                                    <span className="flex-shrink-0">
                                      {link.icon}
                                    </span>
                                    <span
                                      className={`ml-3 transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 hidden" : "opacity-100"}`}
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
        <div className="mt-auto border-t border-[rgb(var(--sidebar-border))] pt-4 pb-2 px-2">
          {/* Theme toggle */}
          <div className="flex justify-between items-center mb-4 px-2">
            <span
              className={`text-sm text-[rgb(var(--muted-foreground))] transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
            >
              Dark Mode
            </span>
            <ThemeToggle />
          </div>

          {/* User profile section */}
          {user ? (
            <div className="px-2">
              <Link href="/profile" className="block">
                <div className="flex items-center mb-3 p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)] transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white flex-shrink-0 border-2 border-[rgb(var(--primary-light))]">
                    <User size={18} />
                  </div>
                  <div
                    className={`ml-3 overflow-hidden transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
                  >
                    <p className="text-sm font-medium truncate">
                      {user.username}
                    </p>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))]">
                        {(user.role || "client_user")
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Logout button */}
              <div className="mt-2">
                <Button
                  variant="default"
                  size="sm"
                  disabled={loading}
                  onClick={logout}
                  className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <LogOut
                    size={16}
                    className={sidebarCollapsed ? "" : "mr-2"}
                  />
                  {!sidebarCollapsed &&
                    (loading ? "Logging out..." : "Logout")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="px-2">
              {/* User profile section - shown when user authentication is available */}
              <SafeLink href="/auth/login" className="block">
                <div className="flex items-center mb-3 p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)] transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 flex-shrink-0">
                    <User size={18} />
                  </div>
                  <div
                    className={`ml-3 overflow-hidden transition-opacity duration-300 ${sidebarCollapsed ? "opacity-0 w-0" : "opacity-100"}`}
                  >
                    <p className="text-sm font-medium truncate">Guest User</p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] truncate">
                      Login to access your account
                    </p>
                  </div>
                </div>
              </SafeLink>

              {/* Login button only - removed Register button */}
              <div className="mt-2">
                <SafeLink href="/auth/login">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <User
                      size={16}
                      className={sidebarCollapsed ? "" : "mr-2"}
                    />
                    {!sidebarCollapsed && "Login"}
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
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* Mobile Menu Panel - Ensure it ONLY shows on mobile with lg:hidden */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[rgb(var(--sidebar-background))] shadow-lg transition-transform duration-300 transform lg:hidden
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      >
        {/* Mobile menu header */}
        <div className="flex items-center justify-between p-4 border-b border-[rgb(var(--sidebar-border))]">
          <Link href="/" className="flex items-center overflow-hidden">
            <div className="w-8 h-8 relative flex-shrink-0">
              <Image
                src="/favicon.ico"
                alt="Rishi Logo"
                width={32}
                height={32}
                className="object-contain w-auto h-auto"
                style={{ objectFit: "contain" }}
                priority
                onError={(e) => {
                  // Fall back to another logo if this one fails
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = "/favicon.png";
                }}
              />
            </div>
            <span className="ml-2 text-xl font-bold text-[rgb(var(--primary))]">
              Rishi
            </span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-1 rounded-md text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Organization Switcher - Mobile */}
        <div className="px-3 py-3 border-b border-[rgb(var(--sidebar-border))]">
          <div className="mb-1 text-xs font-medium text-[rgb(var(--sidebar-muted-foreground))]">
            Organization
          </div>
          <OrganizationSwitcher />
        </div>

        {/* Mobile Navigation links */}
        <nav className="px-2 py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
          <ul className="space-y-1">
            {links.map((link) => {
              // Ensure we have a path by checking both href and path properties
              const linkPath = link.href || link.path || "/";
              const isActive =
                pathname === linkPath ||
                (linkPath !== "/" && pathname?.startsWith(linkPath));
              return (
                <li
                  key={link.id || `mobile-nav-${link.label}-${Math.random()}`}
                >
                  <Link
                    href={linkPath}
                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                      isActive
                        ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                        : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    <span className="ml-3">{link.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Mobile Admin Section - Consolidated for clarity */}
            {(isSuperAdmin ||
              adminPortalNavItems.length > 0 ||
              platformAdminNavItems.length > 0) && (
              <li className="mt-4">
                {/* Admin Header */}
                <button
                  onClick={toggleAdminPortal}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                >
                  <div className="flex items-center">
                    <Shield size={20} className="flex-shrink-0 text-blue-500" />
                    <span className="ml-3 font-medium">Administration</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${adminPortalOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                {/* Admin Submenu - Combined All Admin Sections */}
                <div
                  className={`overflow-hidden transition-all duration-200 ${adminPortalOpen ? "max-h-[1500px] opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4">
                    {/* Platform Admin Items (For Super Admins) */}
                    {isSuperAdmin && platformAdminNavItems.length > 0 && (
                      <li className="mb-3">
                        <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                          System
                        </div>
                        <ul className="space-y-1 mb-2">
                          {platformAdminNavItems.map((link) => {
                            // Ensure we have a path by checking both href and path properties
                            const linkPath = link.href || link.path || "/";
                            const isActive =
                              pathname === linkPath ||
                              (linkPath !== "/" &&
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
                                      ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                      : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                  }`}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  <span className="flex-shrink-0">
                                    {link.icon}
                                  </span>
                                  <span className="ml-3">{link.label}</span>
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
                      <li className="mb-3">
                        <div className="px-4 py-2 text-xs font-semibold text-[rgb(var(--sidebar-muted-foreground))] uppercase tracking-wider">
                          Admin Tools
                        </div>
                        <ul className="space-y-1 mb-2">
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
                                        ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                        : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                                    }`}
                                    onClick={() => setMobileMenuOpen(false)}
                                  >
                                    <span className="flex-shrink-0">
                                      {link.icon}
                                    </span>
                                    <span className="ml-3">{link.label}</span>
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
              <li className="mt-4">
                <button
                  onClick={toggleBrandAgents}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                >
                  <div className="flex items-center">
                    <Users size={20} className="flex-shrink-0 text-green-500" />
                    <span className="ml-3 font-medium">Brand Agents</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${brandAgentsOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${brandAgentsOpen ? "max-h-96 opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
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
                        const linkPath = link.href || "/";
                        const isActive =
                          pathname === linkPath ||
                          (linkPath !== "/" && pathname?.startsWith(linkPath));
                        return (
                          <li key={`org-selector-${link.label}-${link.href}`}>
                            <Link
                              href={linkPath}
                              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                isActive
                                  ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                  : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="flex-shrink-0">{link.icon}</span>
                              <span className="ml-3">{link.label}</span>
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
              <li className="mt-4">
                <button
                  onClick={toggleClientUsers}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-md transition-colors text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                >
                  <div className="flex items-center">
                    <Building
                      size={20}
                      className="flex-shrink-0 text-amber-500"
                    />
                    <span className="ml-3 font-medium">Client Users</span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${clientUsersOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-200 ${clientUsersOpen ? "max-h-96 opacity-100 pt-2" : "max-h-0 opacity-0"}`}
                >
                  <ul className="pl-4 space-y-1">
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
                        const linkPath = link.href || "/";
                        const isActive =
                          pathname === linkPath ||
                          (linkPath !== "/" && pathname?.startsWith(linkPath));
                        return (
                          <li key={`profile-menu-${link.label}-${link.href}`}>
                            <Link
                              href={linkPath}
                              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                                isActive
                                  ? "bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))] font-medium"
                                  : "text-[rgb(var(--sidebar-foreground))] hover:bg-[rgba(var(--sidebar-accent),0.5)]"
                              }`}
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <span className="flex-shrink-0">{link.icon}</span>
                              <span className="ml-3">{link.label}</span>
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
        <div className="absolute bottom-0 left-0 right-0 border-t border-[rgb(var(--sidebar-border))] pt-4 pb-6 px-4">
          {/* Theme toggle */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-[rgb(var(--muted-foreground))]">
              Dark Mode
            </span>
            <ThemeToggle />
          </div>

          {/* User profile info - for mobile menu */}
          {user ? (
            <>
              {/* User profile card */}
              <Link href="/profile" className="block mb-3">
                <div className="flex items-center p-2 rounded-md hover:bg-[rgba(var(--sidebar-accent),0.5)] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white flex-shrink-0 border-2 border-[rgb(var(--primary-light))]">
                    <User size={18} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium truncate">
                      {user.username}
                    </p>
                    <div className="flex items-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[rgba(var(--primary),0.15)] text-[rgb(var(--primary))]">
                        {(user.role || "client_user")
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Logout button */}
              <Button
                variant="default"
                size="sm"
                disabled={loggingOut}
                onClick={async () => {
                  if (typeof logout === "function") {
                    await logout();
                  }
                }}
                className="w-full flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
              >
                <LogOut size={16} className="mr-2" />
                {loggingOut ? "Logging out..." : "Logout"}
              </Button>
            </>
          ) : (
            <SafeLink href="/auth/login">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Login
              </Button>
            </SafeLink>
          )}
        </div>
      </div>

      {/* Bottom mobile navigation bar - Only shown on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-[rgb(var(--sidebar-background))]/95 backdrop-blur-sm border-t border-[rgb(var(--sidebar-border))] lg:hidden">
        <div className="flex items-center justify-around py-2">
          {/* For super admins, show first 2 links (Dashboard, Docs) plus Admin button */}
          {/* For others, show first 5 links */}
          {links
            .slice(0, isSuperAdmin ? 2 : Math.min(links.length, 5))
            .map((link) => {
              // Ensure we have a path by checking both href and path properties
              const linkPath = link.href || link.path || "/";
              const isActive =
                pathname === linkPath ||
                (linkPath !== "/" && pathname?.startsWith(linkPath));
              return (
                <SafeLink
                  key={link.id || `footer-nav-${link.label}-${Math.random()}`}
                  href={linkPath}
                  className={`flex flex-col items-center p-2 ${
                    isActive
                      ? "text-[rgb(var(--primary))]"
                      : "text-[rgb(var(--sidebar-foreground))]"
                  }`}
                >
                  {link.icon}
                  <span className="text-xs mt-1">{link.label}</span>
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
              className="flex flex-col items-center p-2 text-purple-500"
            >
              <Shield size={20} />
              <span className="text-xs mt-1">Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col overflow-hidden pb-16 lg:pb-0 ${sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"} transition-all duration-300`}
      >
        {/* Top navigation bar with mobile menu button and organization selector */}
        <div className="sticky top-0 z-20 w-full">
          <TopBar openMobileMenu={() => setMobileMenuOpen(true)} />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">{children}</main>
      </div>
    </div>
  );
}
