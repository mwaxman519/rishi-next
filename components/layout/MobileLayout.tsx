&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import {
  Menu,
  X,
  Home,
  Settings,
  Users,
  MapPin,
  Building,
  Calendar,
  BarChart,
  FileText,
  Package,
  User,
  Clock,
  MessageSquare,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronDown,
  Check,
} from &quot;lucide-react&quot;;
import { ThemeToggle } from &quot;@/components/ui/theme-toggle&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState(&quot;Rishi Internal&quot;);

  // Close menus on route changes
  useEffect(() => {
    setMenuOpen(false);
    setOrgDropdownOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setOrgDropdownOpen(false); // Close org dropdown when opening main menu
  };

  const toggleOrgDropdown = () => {
    setOrgDropdownOpen(!orgDropdownOpen);
    setMenuOpen(false); // Close main menu when opening org dropdown
  };

  const organizations = [
    &quot;Rishi Internal&quot;,
    &quot;Cannabis Co.&quot;,
    &quot;Green Valley Dispensary&quot;,
    &quot;Mountain High Events&quot;,
    &quot;Coastal Cannabis&quot;,
  ];

  const selectOrganization = (org: string) => {
    setCurrentOrg(org);
    setOrgDropdownOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + &quot;/&quot;);
  };

  return (
    <div className=&quot;flex flex-col min-h-screen bg-white dark:bg-gray-900&quot;>
      {/* Mobile Header */}
      <header className=&quot;sticky top-0 z-40 flex items-center justify-between px-4 h-16 border-b bg-white dark:bg-gray-900 shadow-sm&quot;>
        <div className=&quot;flex items-center&quot;>
          <img
            src=&quot;/favicon.ico&quot;
            alt=&quot;Rishi&quot;
            className=&quot;h-10 w-auto object-contain max-w-[120px]&quot;
          />
        </div>
        <div className=&quot;flex items-center gap-2&quot;>
          {/* Current Organization Dropdown */}
          <div className=&quot;relative&quot;>
            <button
              onClick={toggleOrgDropdown}
              className=&quot;flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors&quot;
            >
              <Building
                size={14}
                className=&quot;text-gray-600 dark:text-gray-400&quot;
              />
              <span className=&quot;text-xs font-medium truncate max-w-20 text-gray-700 dark:text-gray-300&quot;>
                {currentOrg}
              </span>
              <ChevronDown
                size={12}
                className={`text-gray-600 dark:text-gray-400 transition-transform ${orgDropdownOpen ? &quot;rotate-180&quot; : "&quot;}`}
              />
            </button>

            {/* Organization Dropdown */}
            {orgDropdownOpen && (
              <div className=&quot;absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50&quot;>
                <div className=&quot;py-1&quot;>
                  {organizations.map((org) => (
                    <button
                      key={org}
                      onClick={() => selectOrganization(org)}
                      className=&quot;flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700&quot;
                    >
                      <span className=&quot;truncate&quot;>{org}</span>
                      {currentOrg === org && (
                        <Check
                          size={14}
                          className=&quot;text-purple-600 dark:text-purple-400 flex-shrink-0 ml-2&quot;
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className=&quot;flex-grow&quot;>{children}</main>

      {/* Bottom Navigation */}
      <footer className=&quot;sticky bottom-0 bg-white dark:bg-gray-900 border-t z-40 shadow-lg&quot;>
        <div className=&quot;flex justify-around items-center py-2&quot;>
          <Link
            href=&quot;/&quot;
            className={`flex flex-col items-center p-2 rounded-lg ${isActive(&quot;/&quot;) ? &quot;text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20&quot; : &quot;text-gray-600 dark:text-gray-400&quot;}`}
          >
            <Home size={20} />
            <span className=&quot;text-xs mt-1&quot;>Dashboard</span>
          </Link>
          <Link
            href=&quot;/admin&quot;
            className={`flex flex-col items-center p-2 rounded-lg ${isActive(&quot;/admin&quot;) ? &quot;text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20&quot; : &quot;text-gray-600 dark:text-gray-400&quot;}`}
          >
            <Settings size={20} />
            <span className=&quot;text-xs mt-1&quot;>Orgs</span>
          </Link>
          <Link
            href=&quot;/staff&quot;
            className={`flex flex-col items-center p-2 rounded-lg ${isActive(&quot;/staff&quot;) ? &quot;text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20&quot; : &quot;text-gray-600 dark:text-gray-400&quot;}`}
          >
            <Users size={20} />
            <span className=&quot;text-xs mt-1&quot;>Users</span>
          </Link>
          <Link
            href=&quot;/locations&quot;
            className={`flex flex-col items-center p-2 rounded-lg ${isActive(&quot;/locations&quot;) ? &quot;text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20&quot; : &quot;text-gray-600 dark:text-gray-400&quot;}`}
          >
            <MapPin size={20} />
            <span className=&quot;text-xs mt-1&quot;>Locations</span>
          </Link>
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center p-2 rounded-lg ${menuOpen ? &quot;text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20&quot; : &quot;text-gray-600 dark:text-gray-400&quot;}`}
          >
            <Menu size={20} />
            <span className=&quot;text-xs mt-1&quot;>More</span>
          </button>
        </div>
      </footer>

      {/* Organization Dropdown Overlay */}
      {orgDropdownOpen && (
        <div className=&quot;fixed inset-0 z-40&quot; onClick={toggleOrgDropdown} />
      )}

      {/* Overlay Menu */}
      {menuOpen && (
        <div className=&quot;fixed inset-0 bg-black/50 z-50&quot; onClick={toggleMenu}>
          <div
            className=&quot;fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l shadow-lg p-4&quot;
            onClick={(e) => e.stopPropagation()}
          >
            <div className=&quot;flex justify-between items-center mb-6&quot;>
              <h2 className=&quot;text-lg font-semibold&quot;>Menu</h2>
              <button
                onClick={toggleMenu}
                className=&quot;p-2 hover:bg-muted rounded-lg&quot;
              >
                <X size={20} />
              </button>
            </div>
            <nav className=&quot;space-y-1&quot;>
              {/* Primary Navigation */}
              <div className=&quot;mb-4&quot;>
                <h3 className=&quot;text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3&quot;>
                  Navigation
                </h3>
                <Link
                  href=&quot;/bookings&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <Calendar size={18} />
                  <span>Bookings Management</span>
                </Link>
                <Link
                  href=&quot;/analytics&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <BarChart size={18} />
                  <span>Analytics & Reports</span>
                </Link>
                <Link
                  href=&quot;/inventory&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <Package size={18} />
                  <span>Kit Templates</span>
                </Link>
                <Link
                  href=&quot;/schedule&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <Clock size={18} />
                  <span>Schedule & Availability</span>
                </Link>
              </div>

              {/* Communication */}
              <div className=&quot;mb-4&quot;>
                <h3 className=&quot;text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3&quot;>
                  Communication
                </h3>
                <Link
                  href=&quot;/messages&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
                </Link>
                <Link
                  href=&quot;/notifications&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </Link>
              </div>

              {/* Account */}
              <div className=&quot;mb-4&quot;>
                <h3 className=&quot;text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3&quot;>
                  Account
                </h3>
                <Link
                  href=&quot;/profile&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
                <Link
                  href=&quot;/settings&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <Link
                  href=&quot;/admin&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <Shield size={18} />
                  <span>Organization Admin</span>
                </Link>
              </div>

              {/* Support */}
              <div className=&quot;mb-4 border-t border-gray-200 dark:border-gray-700 pt-4&quot;>
                <Link
                  href=&quot;/help&quot;
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100&quot;
                  onClick={toggleMenu}
                >
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </Link>
                <button
                  className=&quot;flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 w-full text-left"
                  onClick={toggleMenu}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
