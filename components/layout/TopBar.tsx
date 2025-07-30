"use client";

import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/contexts/OrganizationProvider";
import { OrganizationSelector } from "@/components/organization/OrganizationSelector";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellIcon, InfoIcon, Menu, Building } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  openMobileMenu?: () => void;
}

export function TopBar({ openMobileMenu = () => {} }: TopBarProps) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const pathname = usePathname();

  // Define a safe handler to handle empty props
  const handleMenuClick = () => {
    if (typeof openMobileMenu === "function") {
      openMobileMenu();
    }
  };

  // Break down pathname to display breadcrumb
  const pathSegments = pathname
    ? pathname
        .split("/")
        .filter(Boolean)
        .map((segment, index, array) => {
          // Create the full path up to this segment
          const fullPath = "/" + array.slice(0, index + 1).join("/");
          return {
            name:
              segment.charAt(0).toUpperCase() +
              segment.slice(1).replace(/-/g, " "),
            path: fullPath,
          };
        })
    : [];

  return (
    <div className="flex items-center justify-between h-14 px-3 bg-[rgb(var(--background))] border-b border-[rgb(var(--border))]">
      {/* Left section: Menu button and Organization Info */}
      <div className="flex items-center gap-2">
        {/* Mobile menu button - always shown on mobile */}
        <Button
          onClick={handleMenuClick}
          variant="default"
          size="icon"
          className="h-9 w-9 lg:hidden flex items-center justify-center rounded-md mr-1 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))] text-white shadow-sm"
          aria-label="Open menu"
          style={{ backgroundColor: "rgb(var(--primary))", color: "white" }}
        >
          <Menu size={22} />
        </Button>

        {/* Desktop organization selector */}
        {user && (
          <div className="hidden lg:block">
            <OrganizationSelector />
          </div>
        )}

        {/* Mobile organization display */}
        {user && currentOrganization && (
          <div className="lg:hidden flex items-center gap-2 px-2 py-1 rounded-md bg-muted">
            <Building size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-32">
              {currentOrganization.name}
            </span>
          </div>
        )}
      </div>

      {/* Right section: User actions */}
      <div className="flex items-center gap-2">
        {/* Mobile theme toggle */}
        <div className="lg:hidden">
          <ThemeToggle />
        </div>

        {/* Documentation Link - always visible on desktop */}
        <a
          href="/docs"
          className="hidden md:flex items-center px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Documentation
        </a>

        {/* Desktop theme toggle */}
        <div className="hidden lg:block">
          <ThemeToggle />
        </div>

        {user && (
          <>
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-full"
                >
                  <BellIcon className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[rgb(var(--primary))]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="py-2 px-3">
                  <h3 className="font-medium text-sm">Notifications</h3>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    You have no new notifications
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-xs py-1.5">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help & Info - hidden on mobile to save space */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full hidden md:flex"
            >
              <InfoIcon className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
