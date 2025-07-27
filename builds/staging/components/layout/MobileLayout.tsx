"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [currentOrg, setCurrentOrg] = useState("Rishi Internal");

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
    "Rishi Internal",
    "Cannabis Co.",
    "Green Valley Dispensary",
    "Mountain High Events",
    "Coastal Cannabis",
  ];

  const selectOrganization = (org: string) => {
    setCurrentOrg(org);
    setOrgDropdownOpen(false);
  };

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + "/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 border-b bg-white dark:bg-gray-900 shadow-sm">
        <div className="flex items-center">
          <img
            src="/favicon.ico"
            alt="Rishi"
            className="h-10 w-auto object-contain max-w-[120px]"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Current Organization Dropdown */}
          <div className="relative">
            <button
              onClick={toggleOrgDropdown}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <Building
                size={14}
                className="text-gray-600 dark:text-gray-400"
              />
              <span className="text-xs font-medium truncate max-w-20 text-gray-700 dark:text-gray-300">
                {currentOrg}
              </span>
              <ChevronDown
                size={12}
                className={`text-gray-600 dark:text-gray-400 transition-transform ${orgDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Organization Dropdown */}
            {orgDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                <div className="py-1">
                  {organizations.map((org) => (
                    <button
                      key={org}
                      onClick={() => selectOrganization(org)}
                      className="flex items-center justify-between w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="truncate">{org}</span>
                      {currentOrg === org && (
                        <Check
                          size={14}
                          className="text-purple-600 dark:text-purple-400 flex-shrink-0 ml-2"
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
      <main className="flex-grow">{children}</main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 bg-white dark:bg-gray-900 border-t z-40 shadow-lg">
        <div className="flex justify-around items-center py-2">
          <Link
            href="/"
            className={`flex flex-col items-center p-2 rounded-lg ${isActive("/") ? "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20" : "text-gray-600 dark:text-gray-400"}`}
          >
            <Home size={20} />
            <span className="text-xs mt-1">Dashboard</span>
          </Link>
          <Link
            href="/admin"
            className={`flex flex-col items-center p-2 rounded-lg ${isActive("/admin") ? "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20" : "text-gray-600 dark:text-gray-400"}`}
          >
            <Settings size={20} />
            <span className="text-xs mt-1">Orgs</span>
          </Link>
          <Link
            href="/staff"
            className={`flex flex-col items-center p-2 rounded-lg ${isActive("/staff") ? "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20" : "text-gray-600 dark:text-gray-400"}`}
          >
            <Users size={20} />
            <span className="text-xs mt-1">Users</span>
          </Link>
          <Link
            href="/locations"
            className={`flex flex-col items-center p-2 rounded-lg ${isActive("/locations") ? "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-900/20" : "text-gray-600 dark:text-gray-400"}`}
          >
            <MapPin size={20} />
            <span className="text-xs mt-1">Locations</span>
          </Link>
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center p-2 rounded-lg ${menuOpen ? "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/20" : "text-gray-600 dark:text-gray-400"}`}
          >
            <Menu size={20} />
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </footer>

      {/* Organization Dropdown Overlay */}
      {orgDropdownOpen && (
        <div className="fixed inset-0 z-40" onClick={toggleOrgDropdown} />
      )}

      {/* Overlay Menu */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={toggleMenu}>
          <div
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l shadow-lg p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={toggleMenu}
                className="p-2 hover:bg-muted rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {/* Primary Navigation */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Navigation
                </h3>
                <Link
                  href="/bookings"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <Calendar size={18} />
                  <span>Bookings Management</span>
                </Link>
                <Link
                  href="/analytics"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <BarChart size={18} />
                  <span>Analytics & Reports</span>
                </Link>
                <Link
                  href="/inventory"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <Package size={18} />
                  <span>Kit Templates</span>
                </Link>
                <Link
                  href="/schedule"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <Clock size={18} />
                  <span>Schedule & Availability</span>
                </Link>
              </div>

              {/* Communication */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Communication
                </h3>
                <Link
                  href="/messages"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <MessageSquare size={18} />
                  <span>Messages</span>
                </Link>
                <Link
                  href="/notifications"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                </Link>
              </div>

              {/* Account */}
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Account
                </h3>
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </Link>
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <Shield size={18} />
                  <span>Organization Admin</span>
                </Link>
              </div>

              {/* Support */}
              <div className="mb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                <Link
                  href="/help"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
                  onClick={toggleMenu}
                >
                  <HelpCircle size={18} />
                  <span>Help & Support</span>
                </Link>
                <button
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 w-full text-left"
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
