&quot;use client&quot;;

import React, { useState, useEffect, useMemo, memo } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
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
} from &quot;lucide-react&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useAuthorization } from &quot;@/hooks/useAuthorization&quot;;
import { ThemeToggle } from &quot;@/components/ui/theme-toggle&quot;;
import { OrganizationSwitcher } from &quot;@/components/layout/OrganizationSwitcher&quot;;
import { NavItem, NAV_ITEM_TYPES } from &quot;@shared/navigation-constants&quot;;
import { AnimatePresence, motion } from &quot;framer-motion&quot;;

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

  return iconName && typeof iconName === &quot;string&quot; ? (
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
    const storedState = localStorage.getItem(&quot;sidebarCollapsed&quot;);
    if (storedState) {
      setSidebarCollapsed(storedState === &quot;true&quot;);
    }

    // Dispatch a custom event that our calendar component can listen for
    if (typeof window !== &quot;undefined&quot;) {
      const event = new CustomEvent(&quot;sidebarStateChange&quot;, {
        detail: { collapsed: sidebarCollapsed },
      });
      window.dispatchEvent(event);
    }
  }, [sidebarCollapsed]);

  // Toggle sidebar collapsed state
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(&quot;sidebarCollapsed&quot;, String(newState));
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
      <div className=&quot;flex items-center justify-center h-screen&quot;>
        <div className=&quot;h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent&quot;></div>
      </div>
    );
  }

  // Get appropriate navigation items based on user role - memoized for performance
  const navigationItems = useMemo((): NavItem[] => {
    // If external navItems are provided, use them
    if (navItems) return navItems;

    const userRole = user?.role || "&quot;;

    // Default navigation items that most roles should see
    let baseItems: NavItem[] = [
      {
        label: &quot;Dashboard&quot;,
        path: &quot;/dashboard&quot;,
        icon: <LayoutDashboard size={20} />,
        type: NAV_ITEM_TYPES.PRIMARY,
      },
      {
        label: &quot;Documentation&quot;,
        path: &quot;/docs&quot;,
        icon: <FileText size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
      {
        label: &quot;Infrastructure&quot;,
        path: &quot;/infrastructure&quot;,
        icon: <Database size={20} />,
        type: NAV_ITEM_TYPES.SECONDARY,
      },
    ];

    // Add role-specific items
    if (userRole === &quot;brand_agent&quot;) {
      baseItems = [
        ...baseItems,
        {
          label: &quot;My Schedule&quot;,
          path: &quot;#&quot;,
          icon: <Calendar size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;My Availability&quot;,
              path: &quot;/availability&quot;,
              icon: <Clock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Events&quot;,
              path: &quot;/events&quot;,
              icon: <Calendar size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Requests&quot;,
              path: &quot;/requests&quot;,
              icon: <CheckSquare size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: &quot;Locations&quot;,
          path: &quot;/locations&quot;,
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: &quot;Team Calendar&quot;,
          path: &quot;/availability/team&quot;,
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: &quot;Resources&quot;,
          path: &quot;/resources&quot;,
          icon: <GraduationCap size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
      ];
    }

    if (userRole === &quot;client_user&quot; || userRole === &quot;client_manager&quot;) {
      baseItems = [
        ...baseItems,
        {
          label: &quot;Staff&quot;,
          path: &quot;/staff&quot;,
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: &quot;Events&quot;,
          path: &quot;/events&quot;,
          icon: <Calendar size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: &quot;Locations&quot;,
          path: &quot;/locations&quot;,
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
        {
          label: &quot;Kits&quot;,
          path: &quot;/kits&quot;,
          icon: <Package size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        },
      ];

      // Add management section for client managers
      if (userRole === &quot;client_manager&quot;) {
        baseItems.push({
          label: &quot;Organization&quot;,
          path: &quot;/profile&quot;,
          icon: <Building size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
        });
      }
    }

    if (userRole === &quot;internal_field_manager&quot;) {
      baseItems = [
        ...baseItems,
        {
          label: &quot;Field Operations&quot;,
          path: &quot;#&quot;,
          icon: <Briefcase size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;Team Dashboard&quot;,
              path: &quot;/admin/field-operations/dashboard&quot;,
              icon: <LayoutDashboard size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Assignment Calendar&quot;,
              path: &quot;/admin/field-operations/calendar&quot;,
              icon: <Calendar size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: &quot;Location Management&quot;,
          path: &quot;/admin/locations&quot;,
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;Location Directory&quot;,
              path: &quot;/admin/locations&quot;,
              icon: <MapPin size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Approval Queue&quot;,
              path: &quot;/admin/locations/approval-queue&quot;,
              icon: <CheckSquare size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: &quot;Team Management&quot;,
          path: &quot;/admin/users&quot;,
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;Agent Directory&quot;,
              path: &quot;/admin/users&quot;,
              icon: <Users size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Performance Reports&quot;,
              path: &quot;/admin/users/performance&quot;,
              icon: <BarChart size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: &quot;My Schedule&quot;,
          path: &quot;#&quot;,
          icon: <Clock size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;My Availability&quot;,
              path: &quot;/availability&quot;,
              icon: <Clock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;My Requests&quot;,
              path: &quot;/requests&quot;,
              icon: <ClipboardList size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
      ];
    }

    if (userRole === &quot;internal_admin&quot; || userRole === &quot;super_admin&quot;) {
      baseItems = [
        ...baseItems,
        {
          label: &quot;Organization Management&quot;,
          path: &quot;/admin/organizations&quot;,
          icon: <Building size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;Organization Directory&quot;,
              path: &quot;/admin/organizations&quot;,
              icon: <Building size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Organization Settings&quot;,
              path: &quot;/admin/organizations/settings&quot;,
              icon: <Settings size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: &quot;User Management&quot;,
          path: &quot;/admin/users&quot;,
          icon: <Users size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;User Directory&quot;,
              path: &quot;/admin/users&quot;,
              icon: <Users size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Role Assignments&quot;,
              path: &quot;/admin/users/permissions&quot;,
              icon: <Lock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
        {
          label: &quot;Location Management&quot;,
          path: &quot;/admin/locations&quot;,
          icon: <MapPin size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;Location Directory&quot;,
              path: &quot;/admin/locations&quot;,
              icon: <MapPin size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Approval Queue&quot;,
              path: &quot;/admin/locations/approval-queue&quot;,
              icon: <CheckSquare size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Location Analytics&quot;,
              path: &quot;/admin/locations/analytics&quot;,
              icon: <BarChart size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
          ],
        },
      ];

      // Add platform administration for super admins
      if (userRole === &quot;super_admin&quot;) {
        baseItems.push({
          label: &quot;Platform Administration&quot;,
          path: &quot;/admin/platform&quot;,
          icon: <Cog size={20} />,
          type: NAV_ITEM_TYPES.PRIMARY,
          children: [
            {
              label: &quot;Access Control&quot;,
              path: &quot;/admin/rbac&quot;,
              icon: <Lock size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Feature Management&quot;,
              path: &quot;/admin/features&quot;,
              icon: <Cog size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;System Settings&quot;,
              path: &quot;/admin/settings&quot;,
              icon: <Settings size={20} />,
              type: NAV_ITEM_TYPES.PRIMARY,
            },
            {
              label: &quot;Organization Permissions&quot;,
              path: &quot;/admin/organization-permissions&quot;,
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

    // For parent navigation items with children, only highlight if we&apos;re on an exact child path
    // This prevents multiple tabs from highlighting due to startsWith() overlap
    if (item.children && item.children.length > 0) {
      return item.children.some((child: NavItem) => {
        const childPath = child.path || child.href;
        return childPath === pathname;
      });
    }

    // For items without children, use more precise matching
    // Only match if the current path is a direct child (separated by exactly one more path segment)
    if (itemPath !== &quot;/&quot; && pathname.startsWith(itemPath + &quot;/&quot;)) {
      // Count path segments to ensure we&apos;re only one level deep
      const itemSegments = itemPath
        .split(&quot;/&quot;)
        .filter((s) => s.length > 0).length;
      const currentSegments = pathname
        .split(&quot;/&quot;)
        .filter((s) => s.length > 0).length;

      // Only highlight if we&apos;re exactly one level deeper or on a direct child route
      return currentSegments <= itemSegments + 1;
    }

    return false;
  };

  // Sidebar navigation component
  const renderSidebarNavigation = () => (
    <div
      className={cn(
        &quot;fixed inset-y-0 left-0 z-30 w-64 transform transition-all duration-300 ease-in-out&quot;,
        &quot;bg-background border-r border-border flex flex-col&quot;,
        sidebarCollapsed ? &quot;w-[78px]&quot; : &quot;w-64&quot;,
      )}
    >
      {/* Logo and collapse button */}
      <div
        className={cn(
          &quot;flex h-16 items-center px-4 border-b border-border&quot;,
          sidebarCollapsed ? &quot;justify-center&quot; : &quot;justify-between&quot;,
        )}
      >
        {!sidebarCollapsed ? (
          <Link href=&quot;/&quot; className=&quot;flex items-center gap-2&quot;>
            <div className=&quot;flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground&quot;>
              <svg
                width=&quot;20&quot;
                height=&quot;20&quot;
                viewBox=&quot;0 0 32 32&quot;
                fill=&quot;none&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
              >
                <path
                  d=&quot;M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z&quot;
                  fill=&quot;currentColor&quot;
                />
                <path
                  d=&quot;M21 12H11C10.448 12 10 12.448 10 13V19C10 19.552 10.448 20 11 20H21C21.552 20 22 19.552 22 19V13C22 12.448 21.552 12 21 12Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M12 9C12 8.448 11.552 8 11 8C10.448 8 10 8.448 10 9V11C10 11.552 10.448 12 11 12C11.552 12 12 11.552 12 11V9Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9V11C14 11.552 14.448 12 15 12C15.552 12 16 11.552 16 11V9Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M20 9C20 8.448 19.552 8 19 8C18.448 8 18 8.448 18 9V11C18 11.552 18.448 12 19 12C19.552 12 20 11.552 20 11V9Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M12 21C12 20.448 11.552 20 11 20C10.448 20 10 20.448 10 21V23C10 23.552 10.448 24 11 24C11.552 24 12 23.552 12 23V21Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M16 21C16 20.448 15.552 20 15 20C14.448 20 14 20.448 14 21V23C14 23.552 14.448 24 15 24C15.552 24 16 23.552 16 23V21Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M20 21C20 20.448 19.552 20 19 20C18.448 20 18 20.448 18 21V23C18 23.552 18.448 24 19 24C19.552 24 20 23.552 20 23V21Z&quot;
                  fill=&quot;white&quot;
                />
              </svg>
            </div>
            <span className=&quot;text-lg font-semibold&quot;>Rishi</span>
          </Link>
        ) : (
          <Link href=&quot;/&quot; className=&quot;flex items-center justify-center&quot;>
            <div className=&quot;flex items-center justify-center w-8 h-8 rounded-md bg-primary text-primary-foreground&quot;>
              <svg
                width=&quot;20&quot;
                height=&quot;20&quot;
                viewBox=&quot;0 0 32 32&quot;
                fill=&quot;none&quot;
                xmlns=&quot;http://www.w3.org/2000/svg&quot;
              >
                <path
                  d=&quot;M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z&quot;
                  fill=&quot;currentColor&quot;
                />
                <path
                  d=&quot;M21 12H11C10.448 12 10 12.448 10 13V19C10 19.552 10.448 20 11 20H21C21.552 20 22 19.552 22 19V13C22 12.448 21.552 12 21 12Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M12 9C12 8.448 11.552 8 11 8C10.448 8 10 8.448 10 9V11C10 11.552 10.448 12 11 12C11.552 12 12 11.552 12 11V9Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9V11C14 11.552 14.448 12 15 12C15.552 12 16 11.552 16 11V9Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M20 9C20 8.448 19.552 8 19 8C18.448 8 18 8.448 18 9V11C18 11.552 18.448 12 19 12C19.552 12 20 11.552 20 11V9Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M12 21C12 20.448 11.552 20 11 20C10.448 20 10 20.448 10 21V23C10 23.552 10.448 24 11 24C11.552 24 12 23.552 12 23V21Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M16 21C16 20.448 15.552 20 15 20C14.448 20 14 20.448 14 21V23C14 23.552 14.448 24 15 24C15.552 24 16 23.552 16 23V21Z&quot;
                  fill=&quot;white&quot;
                />
                <path
                  d=&quot;M20 21C20 20.448 19.552 20 19 20C18.448 20 18 20.448 18 21V23C18 23.552 18.448 24 19 24C19.552 24 20 23.552 20 23V21Z&quot;
                  fill=&quot;white&quot;
                />
              </svg>
            </div>
          </Link>
        )}

        <button
          onClick={toggleSidebar}
          className={cn(
            &quot;rounded-full p-2 hover:bg-muted transition-colors&quot;,
            sidebarCollapsed ? &quot;rotate-180&quot; : &quot;&quot;,
          )}
          aria-label={sidebarCollapsed ? &quot;Expand sidebar&quot; : &quot;Collapse sidebar&quot;}
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Organization Switcher */}
      {!sidebarCollapsed && (
        <div className=&quot;px-3 py-3 border-b border-border&quot;>
          <OrganizationSwitcher />
        </div>
      )}

      {/* Navigation Links */}
      <div className=&quot;flex-1 overflow-y-auto py-4 px-3&quot;>
        <ul className=&quot;space-y-1&quot;>
          {processedNavItems.map((item) => {
            // Skip certain types if sidebar is collapsed
            if (sidebarCollapsed && item.type === NAV_ITEM_TYPES.SECONDARY)
              return null;

            const isActive = isActiveLink(item);
            const hasChildren = item.children && item.children.length > 0;
            const sectionKey = item.label.toLowerCase().replace(/\s+/g, &quot;-&quot;);

            if (hasChildren) {
              const isExpanded = isSectionExpanded(sectionKey);

              return (
                <li key={item.id} className=&quot;mb-2&quot;>
                  <button
                    type=&quot;button&quot;
                    onClick={() =>
                      !sidebarCollapsed && toggleSection(sectionKey)
                    }
                    className={cn(
                      &quot;flex items-center w-full rounded-md p-2&quot;,
                      isActive
                        ? &quot;bg-primary/10 text-primary&quot;
                        : &quot;hover:bg-muted&quot;,
                      sidebarCollapsed ? &quot;justify-center&quot; : &quot;justify-between&quot;,
                    )}
                    aria-expanded={isExpanded}
                  >
                    <div className=&quot;flex items-center&quot;>
                      <span
                        className={cn(
                          &quot;text-primary&quot;,
                          sidebarCollapsed &&
                            &quot;w-6 h-6 flex items-center justify-center&quot;,
                        )}
                      >
                        {typeof item.icon === &quot;string&quot;
                          ? getIcon(item.icon)
                          : item.icon}
                      </span>
                      {!sidebarCollapsed && (
                        <span className=&quot;ml-3 font-medium&quot;>{item.label}</span>
                      )}
                    </div>
                    {!sidebarCollapsed && hasChildren && (
                      <ChevronDown
                        size={16}
                        className={cn(
                          &quot;transition-transform duration-200&quot;,
                          isExpanded ? &quot;transform rotate-180&quot; : &quot;&quot;,
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
                          animate={{ height: &quot;auto&quot;, opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className=&quot;mt-1 pl-4 space-y-1 overflow-hidden&quot;
                        >
                          {item.children &&
                            item.children.map((child: NavItem) => {
                              const childIsActive = isActiveLink(child);

                              return (
                                <li
                                  key={`${item.id}-${child.id || child.label}`}
                                >
                                  <Link
                                    href={child.path || child.href || &quot;#&quot;}
                                    className={cn(
                                      &quot;flex items-center rounded-md p-2&quot;,
                                      childIsActive
                                        ? &quot;bg-primary/10 text-primary&quot;
                                        : &quot;hover:bg-muted text-muted-foreground&quot;,
                                    )}
                                  >
                                    <span className=&quot;text-primary&quot;>
                                      {typeof child.icon === &quot;string&quot;
                                        ? getIcon(child.icon)
                                        : child.icon}
                                    </span>
                                    <span className=&quot;ml-3 text-sm&quot;>
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
                  href={item.path || item.href || &quot;#&quot;}
                  className={cn(
                    &quot;flex items-center rounded-md p-2&quot;,
                    isActive
                      ? &quot;bg-primary/10 text-primary&quot;
                      : &quot;hover:bg-muted text-muted-foreground&quot;,
                    sidebarCollapsed && &quot;justify-center&quot;,
                  )}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span
                    className={cn(
                      &quot;text-primary&quot;,
                      sidebarCollapsed &&
                        &quot;w-6 h-6 flex items-center justify-center&quot;,
                    )}
                  >
                    {typeof item.icon === &quot;string&quot;
                      ? getIcon(item.icon)
                      : item.icon}
                  </span>
                  {!sidebarCollapsed && (
                    <span className=&quot;ml-3 font-medium&quot;>{item.label}</span>
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
          &quot;border-t border-border py-3 px-3&quot;,
          sidebarCollapsed ? &quot;flex flex-col items-center&quot; : &quot;&quot;,
        )}
      >
        {!sidebarCollapsed && (
          <div className=&quot;flex items-center p-2 rounded-lg bg-muted/50 mb-3&quot;>
            <div className=&quot;w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary&quot;>
              <User size={18} />
            </div>
            <div className=&quot;ml-3 overflow-hidden&quot;>
              <p className=&quot;font-medium truncate&quot;>
                {user?.email?.split(&quot;@&quot;)[0] || &quot;User&quot;}
              </p>
              <p className=&quot;text-xs text-muted-foreground truncate&quot;>
                {user?.role
                  ?.replace(/_/g, &quot; &quot;)
                  .replace(/\b\w/g, (c: string) => c.toUpperCase()) || &quot;User&quot;}
              </p>
            </div>
          </div>
        )}

        <div
          className={cn(
            &quot;flex gap-2&quot;,
            sidebarCollapsed ? &quot;flex-col&quot; : &quot;items-center justify-between&quot;,
          )}
        >
          <ThemeToggle />

          {sidebarCollapsed ? (
            <button
              onClick={() => logout && logout()}
              className=&quot;p-2 rounded-md hover:bg-muted text-muted-foreground&quot;
              aria-label=&quot;Logout&quot;
            >
              <LogOut size={18} />
            </button>
          ) : (
            <button
              onClick={() => logout && logout()}
              className=&quot;flex items-center p-2 rounded-md hover:bg-muted text-muted-foreground&quot;
            >
              <LogOut size={18} className=&quot;mr-2&quot; />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Main content area with appropriate padding based on sidebar state
  return (
    <div className=&quot;flex h-screen overflow-hidden&quot;>
      {/* Sidebar for desktop */}
      {renderSidebarNavigation()}

      {/* Main content */}
      <main
        className={cn(
          &quot;flex-1 overflow-y-auto transition-all duration-300 ease-in-out&quot;,
          sidebarCollapsed ? &quot;ml-[78px]&quot; : &quot;ml-64&quot;,
        )}
      >
        <div className=&quot;px-4 py-6 md:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
