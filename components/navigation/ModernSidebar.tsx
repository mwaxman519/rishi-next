"use client";

import React, { useState, useEffect, useMemo, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Menu,
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
  CreditCard,
  CheckSquare,
  Briefcase,
  Globe,
  Search,
  MessageSquare,
  Bell,
  HelpCircle,
  Cog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useAuthorization } from "@/hooks/useAuthorization";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { OrganizationSwitcher } from "@/components/layout/OrganizationSwitcher";
import { NavItem, NAV_ITEM_TYPES } from "@shared/navigation-constants";
import { AnimatePresence, motion } from "framer-motion";

// Helper function to get the icon component from an icon name
const getIcon = (iconName: string | React.ReactNode, size: number = 20) => {
  if (React.isValidElement(iconName)) {
    return React.cloneElement(iconName as React.ReactElement, { size });
  }

  const icons: Record<string, React.ReactNode> = {
    Home: <Home size={size} />,
    LayoutDashboard: <LayoutDashboard size={size} />,
    Calendar: <Calendar size={size} />,
    User: <User size={size} />,
    Clock: <Clock size={size} />,
    FileText: <FileText size={size} />,
    Settings: <Settings size={size} />,
    Building: <Building size={size} />,
    Users: <Users size={size} />,
    Package: <Package size={size} />,
    Map: <MapPin size={size} />,
    MapPin: <MapPin size={size} />,
    BarChart: <BarChart size={size} />,
    Search: <Search size={size} />,
    MessageSquare: <MessageSquare size={size} />,
    CheckSquare: <CheckSquare size={size} />,
    Briefcase: <Briefcase size={size} />,
    Shield: <Shield size={size} />,
    Lock: <Lock size={size} />,
    Database: <Database size={size} />,
    ClipboardList: <ClipboardList size={size} />,
    GraduationCap: <GraduationCap size={size} />,
    CreditCard: <CreditCard size={size} />,
    Globe: <Globe size={size} />,
    Bell: <Bell size={size} />,
    Cog: <Cog size={size} />,
  };

  return iconName && typeof iconName === "string" ? (
    icons[iconName] || <ChevronRight size={size} />
  ) : (
    <ChevronRight size={size} />
  );
};

interface ModernSidebarProps {
  navItems?: NavItem[];
  children?: React.ReactNode;
}

export default function ModernSidebar({
  navItems,
  children,
}: ModernSidebarProps) {
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const { checkPermission } = useAuthorization();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch with useEffect
  useEffect(() => {
    setMounted(true);

    // Check for stored sidebar state
    const storedState = localStorage.getItem("sidebarCollapsed");
    if (storedState) {
      setSidebarCollapsed(storedState === "true");
    }

    // Dispatch a custom event that our calendar component can listen for
    if (typeof window !== "undefined") {
      const event = new CustomEvent("sidebarStateChange", {
        detail: { collapsed: sidebarCollapsed },
      });
      window.dispatchEvent(event);
    }
  }, [sidebarCollapsed]);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem("sidebarCollapsed", String(newState));
  };

  // Toggle section expanded/collapsed
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Check if a section is expanded
  const isSectionExpanded = (section: string) => {
    return expandedSections[section] ?? false;
  };

  // Prevent rendering until after client-side hydration
  if (!mounted) return null;

  // Show loading state if authentication is still loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Get appropriate navigation items based on user role - memoized for performance
  const navigationItems = useMemo((): NavItem[] => {
    // If external navItems are provided, use them
    if (navItems) return navItems;

    const userRole = user?.role || "";

    // Default navigation items that most roles should see
    let baseItems: NavItem[] = [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: <LayoutDashboard size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: "Documentation",
        path: "/docs",
        icon: <FileText size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: "Infrastructure",
        path: "/infrastructure",
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ];

    // Add role-specific items
    if (userRole === "brand_agent") {
      baseItems = [
        ...baseItems,
        {
          label: "My Schedule",
          path: "#",
          icon: <Calendar size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "My Availability",
              path: "/availability",
              icon: <Clock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Events",
              path: "/events",
              icon: <Calendar size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Requests",
              path: "/requests",
              icon: <CheckSquare size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: "Locations",
          path: "/locations",
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: "Team Calendar",
          path: "/availability/team",
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: "Resources",
          path: "/resources",
          icon: <GraduationCap size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
      ];
    }

    if (userRole === "client_user" || userRole === "client_manager") {
      baseItems = [
        ...baseItems,
        {
          label: "Staff",
          path: "/staff",
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: "Events",
          path: "/events",
          icon: <Calendar size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: "Locations",
          path: "/locations",
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: "Kits",
          path: "/kits",
          icon: <Package size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
      ];

      // Add management section for client managers
      if (userRole === "client_manager") {
        baseItems.push({
          label: "Organization",
          path: "/profile",
          icon: <Building size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        });
      }
    }

    if (userRole === "internal_field_manager") {
      baseItems = [
        ...baseItems,
        {
          label: "Field Operations",
          path: "#",
          icon: <Briefcase size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "Team Dashboard",
              path: "/admin/field-operations/dashboard",
              icon: <LayoutDashboard size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Assignment Calendar",
              path: "/admin/field-operations/calendar",
              icon: <Calendar size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: "Location Management",
          path: "/admin/locations",
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "Location Directory",
              path: "/admin/locations",
              icon: <MapPin size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Approval Queue",
              path: "/admin/locations/approval-queue",
              icon: <CheckSquare size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: "Team Management",
          path: "/admin/users",
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "Agent Directory",
              path: "/admin/users",
              icon: <Users size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Performance Reports",
              path: "/admin/users/performance",
              icon: <BarChart size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: "My Schedule",
          path: "#",
          icon: <Clock size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "My Availability",
              path: "/availability",
              icon: <Clock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "My Requests",
              path: "/requests",
              icon: <ClipboardList size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
      ];
    }

    if (userRole === "internal_admin" || userRole === "super_admin") {
      baseItems = [
        ...baseItems,
        {
          label: "Organization Management",
          path: "/admin/organizations",
          icon: <Building size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "Organization Directory",
              path: "/admin/organizations",
              icon: <Building size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Organization Settings",
              path: "/admin/organizations/settings",
              icon: <Settings size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: "User Management",
          path: "/admin/users",
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "User Directory",
              path: "/admin/users",
              icon: <Users size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Role Assignments",
              path: "/admin/users/permissions",
              icon: <Lock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: "Location Management",
          path: "/admin/locations",
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "Location Directory",
              path: "/admin/locations",
              icon: <MapPin size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Approval Queue",
              path: "/admin/locations/approval-queue",
              icon: <CheckSquare size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Location Analytics",
              path: "/admin/locations/analytics",
              icon: <BarChart size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
      ];

      // Add platform administration for super admins
      if (userRole === "super_admin") {
        baseItems.push({
          label: "Platform Administration",
          path: "/admin/platform",
          icon: <Cog size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: "Access Control",
              path: "/admin/rbac",
              icon: <Lock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Feature Management",
              path: "/admin/features",
              icon: <Cog size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "System Settings",
              path: "/admin/settings",
              icon: <Settings size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: "Organization Permissions",
              path: "/admin/organization-permissions",
              icon: <Shield size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        });
      }
    }

    return baseItems;
  }, [navItems, user?.role]);

  // Determine top Navbar visibility based on screen width and other factors
  const useTopNavigation = false; // We'll default to sidebar for desktops

  // Add unique IDs to navigation items if not present
  const processedNavItems = useMemo(() => {
    return navigationItems.map((item: NavItem, index: number) => {
      const newItem = { ...item };
      if (!newItem.id) {
        newItem.id = `nav-item-${index}`;
      }
      return newItem;
    });
  }, [navigationItems]);

  // Check if a nav item matches the current path
  const isActiveLink = (item: NavItem): boolean => {
    if (!pathname) return false;

    const itemPath = item.path || item.href;
    if (!itemPath) return false;

    // Check exact match first
    if (itemPath === pathname) return true;

    // For parent navigation items with children, only highlight if we're on an exact child path
    // This prevents multiple tabs from highlighting due to startsWith() overlap
    if (item.children && item.children.length > 0) {
      return item.children.some((child: NavItem) => {
        const childPath = child.path || child.href;
        return childPath === pathname;
      });
    }

    // For items without children, use more precise matching
    // Only match if the current path is a direct child (separated by exactly one more path segment)
    if (itemPath !== "/" && pathname.startsWith(itemPath + "/")) {
      // Count path segments to ensure we're only one level deep
      const itemSegments = itemPath
        .split("/")
        .filter((s) => s.length > 0).length;
      const currentSegments = pathname
        .split("/")
        .filter((s) => s.length > 0).length;

      // Only highlight if we're exactly one level deeper or on a direct child route
      return currentSegments <= itemSegments + 1;
    }

    return false;
  };

  // Sidebar navigation component
  const renderSidebarNavigation = () => (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform transition-all duration-300 ease-in-out",
        "bg-background border-r border-border flex flex-col",
        sidebarCollapsed ? "w-[78px]" : "w-64",
      )}
    >
      {/* Logo and collapse button */}
      <div
        className={cn(
          "flex h-16 items-center px-4 border-b border-border",
          sidebarCollapsed ? "justify-center" : "justify-between",
        )}
      >
        {!sidebarCollapsed ? (
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
                  fill="currentColor"
                />
                <path
                  d="M21 12H11C10.448 12 10 12.448 10 13V19C10 19.552 10.448 20 11 20H21C21.552 20 22 19.552 22 19V13C22 12.448 21.552 12 21 12Z"
                  fill="white"
                />
                <path
                  d="M12 9C12 8.448 11.552 8 11 8C10.448 8 10 8.448 10 9V11C10 11.552 10.448 12 11 12C11.552 12 12 11.552 12 11V9Z"
                  fill="white"
                />
                <path
                  d="M16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9V11C14 11.552 14.448 12 15 12C15.552 12 16 11.552 16 11V9Z"
                  fill="white"
                />
                <path
                  d="M20 9C20 8.448 19.552 8 19 8C18.448 8 18 8.448 18 9V11C18 11.552 18.448 12 19 12C19.552 12 20 11.552 20 11V9Z"
                  fill="white"
                />
                <path
                  d="M12 21C12 20.448 11.552 20 11 20C10.448 20 10 20.448 10 21V23C10 23.552 10.448 24 11 24C11.552 24 12 23.552 12 23V21Z"
                  fill="white"
                />
                <path
                  d="M16 21C16 20.448 15.552 20 15 20C14.448 20 14 20.448 14 21V23C14 23.552 14.448 24 15 24C15.552 24 16 23.552 16 23V21Z"
                  fill="white"
                />
                <path
                  d="M20 21C20 20.448 19.552 20 19 20C18.448 20 18 20.448 18 21V23C18 23.552 18.448 24 19 24C19.552 24 20 23.552 20 23V21Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold">Rishi</span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center justify-center">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground">
              <svg
                width="20"
                height="20"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
                  fill="currentColor"
                />
                <path
                  d="M21 12H11C10.448 12 10 12.448 10 13V19C10 19.552 10.448 20 11 20H21C21.552 20 22 19.552 22 19V13C22 12.448 21.552 12 21 12Z"
                  fill="white"
                />
                <path
                  d="M12 9C12 8.448 11.552 8 11 8C10.448 8 10 8.448 10 9V11C10 11.552 10.448 12 11 12C11.552 12 12 11.552 12 11V9Z"
                  fill="white"
                />
                <path
                  d="M16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9V11C14 11.552 14.448 12 15 12C15.552 12 16 11.552 16 11V9Z"
                  fill="white"
                />
                <path
                  d="M20 9C20 8.448 19.552 8 19 8C18.448 8 18 8.448 18 9V11C18 11.552 18.448 12 19 12C19.552 12 20 11.552 20 11V9Z"
                  fill="white"
                />
                <path
                  d="M12 21C12 20.448 11.552 20 11 20C10.448 20 10 20.448 10 21V23C10 23.552 10.448 24 11 24C11.552 24 12 23.552 12 23V21Z"
                  fill="white"
                />
                <path
                  d="M16 21C16 20.448 15.552 20 15 20C14.448 20 14 20.448 14 21V23C14 23.552 14.448 24 15 24C15.552 24 16 23.552 16 23V21Z"
                  fill="white"
                />
                <path
                  d="M20 21C20 20.448 19.552 20 19 20C18.448 20 18 20.448 18 21V23C18 23.552 18.448 24 19 24C19.552 24 20 23.552 20 23V21Z"
                  fill="white"
                />
              </svg>
            </div>
          </Link>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            "rounded-full p-2 hover:bg-muted transition-colors",
            sidebarCollapsed ? "rotate-180" : "",
          )}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Organization Switcher */}
      {!sidebarCollapsed && (
        <div className="px-3 py-3 border-b border-border">
          <OrganizationSwitcher />
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {processedNavItems.map((item) => {
            // Skip certain types if sidebar is collapsed
            if (sidebarCollapsed && item.type === NAV_ITEM_TYPES.SECONDARY)
              return null;

            const isActive = isActiveLink(item);
            const hasChildren = item.children && item.children.length > 0;
            const sectionKey = item.label.toLowerCase().replace(/\s+/g, "-");

            if (hasChildren) {
              const isExpanded = isSectionExpanded(sectionKey);

              return (
                <li key={item.id} className="mb-2">
                  <button
                    type="button"
                    onClick={() =>
                      !sidebarCollapsed && toggleSection(sectionKey)
                    }
                    className={cn(
                      "flex items-center w-full rounded-md p-2",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted",
                      sidebarCollapsed ? "justify-center" : "justify-between",
                    )}
                    aria-expanded={isExpanded}
                  >
                    <div className="flex items-center">
                      <span
                        className={cn(
                          "text-primary",
                          sidebarCollapsed &&
                            "w-6 h-6 flex items-center justify-center",
                        )}
                      >
                        {typeof item.icon === "string"
                          ? getIcon(item.icon)
                          : item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <span className="ml-3 font-medium">{item.label}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && hasChildren && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          "transition-transform duration-200",
                          isExpanded ? "transform rotate-180" : "",
                        )}
                      />
                    )}
                  </button>

                  {/* Children items */}
                  {!sidebarCollapsed && hasChildren && (
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-1 pl-4 space-y-1 overflow-hidden"
                        >
                          {item.children &&
                            item.children.map((child: NavItem) => {
                              const childIsActive = isActiveLink(child);

                              return (
                                <li
                                  key={`${item.id}-${child.id || child.label}`}
                                >
                                  <Link
                                    href={child.path || child.href || "#"}
                                    className={cn(
                                      "flex items-center rounded-md p-2",
                                      childIsActive
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted text-muted-foreground",
                                    )}
                                  >
                                    <span className="text-primary">
                                      {typeof child.icon === "string"
                                        ? getIcon(child.icon)
                                        : child.icon}
                                    </span>
                                    <span className="ml-3 text-sm">
                                      {child.label}
                                    </span>
                                  </Link>
                                </li>
                              );
                            })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  )}
                </li>
              );
            }

            // Regular navigation item without children
            return (
              <li key={item.id}>
                <Link
                  href={item.path || item.href || "#"}
                  className={cn(
                    "flex items-center rounded-md p-2",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted text-muted-foreground",
                    sidebarCollapsed && "justify-center",
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span
                    className={cn(
                      "text-primary",
                      sidebarCollapsed &&
                        "w-6 h-6 flex items-center justify-center",
                    )}
                  >
                    {typeof item.icon === "string"
                      ? getIcon(item.icon)
                      : item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className="ml-3 font-medium">{item.label}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* User section */}
      <div
        className={cn(
          "border-t border-border py-3 px-3",
          sidebarCollapsed ? "flex flex-col items-center" : "",
        )}
      >
        {!sidebarCollapsed && (
          <div className="flex items-center p-2 rounded-lg bg-muted/50 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User size={18} />
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.role
                  ?.replace(/_/g, " ")
                  .replace(/\b\w/g, (c: string) => c.toUpperCase()) || "User"}
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            "flex gap-2",
            sidebarCollapsed ? "flex-col" : "items-center justify-between",
          )}
        >
          <ThemeToggle />

          {sidebarCollapsed ? (
            <button
              onClick={() => logout && logout()}
              className="p-2 rounded-md hover:bg-muted text-muted-foreground"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={() => logout && logout()}
              className="flex items-center p-2 rounded-md hover:bg-muted text-muted-foreground"
            >
              <LogOut size={18} className="mr-2" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Main content area with appropriate padding based on sidebar state
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      {renderSidebarNavigation()}

      {/* Main content */}
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-[78px]" : "ml-64",
        )}
      >
        <div className="px-4 py-6 md:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
