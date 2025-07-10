"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Users,
  LayoutDashboard,
  MapPin,
  LogOut,
  Menu,
  FileText,
  Settings,
  Package,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button, buttonVariants } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavigationItem[];
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    roles: ["user", "admin", "super_admin"],
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: <Calendar className="h-5 w-5" />,
    roles: ["user", "admin", "super_admin"],
  },
  {
    title: "Locations",
    href: "/locations",
    icon: <MapPin className="h-5 w-5" />,
    roles: ["user", "admin", "super_admin"],
    submenu: [
      {
        title: "All Locations",
        href: "/locations",
        icon: <MapPin className="h-4 w-4" />,
      },
      {
        title: "My Favorites",
        href: "/locations/favorites",
        icon: <MapPin className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Kit Management",
    href: "/kits",
    icon: <Package className="h-5 w-5" />,
    roles: ["user", "admin", "super_admin"],
    submenu: [
      {
        title: "Templates",
        href: "/kits/templates",
        icon: <Package className="h-4 w-4" />,
      },
      {
        title: "Kit Instances",
        href: "/kits/instances",
        icon: <Package className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Users",
    href: "/users",
    icon: <Users className="h-5 w-5" />,
    roles: ["admin", "super_admin"],
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <FileText className="h-5 w-5" />,
    roles: ["admin", "super_admin"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="h-5 w-5" />,
    roles: ["user", "admin", "super_admin"],
  },
];

interface NavigationItemProps extends React.HTMLAttributes<HTMLLIElement> {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  userRole?: string;
}

function NavigationItem({
  item,
  isActive,
  isCollapsed,
  userRole = "user",
  className,
  ...props
}: NavigationItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Only show items that the user has permission to see
  if (item.roles && !item.roles.includes(userRole)) {
    return null;
  }

  // If this item has a submenu
  if (item.submenu && item.submenu.length > 0) {
    return (
      <li className={cn(className)} {...props}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <div
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "group relative flex w-full cursor-pointer justify-between px-3 py-2",
                isActive &&
                  "bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary",
              )}
            >
              <div className="flex items-center">
                {item.icon}
                {!isCollapsed && (
                  <span className="ml-3 text-sm">{item.title}</span>
                )}
              </div>
              <div
                className={cn(
                  "transition-transform",
                  isOpen ? "rotate-90" : "",
                )}
              >
                <ChevronRight className="h-4 w-4" />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="ml-4 mt-1 space-y-1">
              {item.submenu.map((subItem) => (
                <li key={subItem.href}>
                  <Link
                    href={subItem.href}
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "group flex w-full items-center px-3 py-2 text-sm",
                      isActive &&
                        subItem.href === usePathname() &&
                        "bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary",
                    )}
                  >
                    {subItem.icon}
                    {!isCollapsed && (
                      <span className="ml-3 text-sm">{subItem.title}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </CollapsibleContent>
        </Collapsible>
      </li>
    );
  }

  return (
    <li className={cn(className)} {...props}>
      <Link
        href={item.href}
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "group relative flex w-full items-center justify-start px-3 py-2",
          isActive &&
            "bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary",
        )}
      >
        {item.icon}
        {!isCollapsed && <span className="ml-3 text-sm">{item.title}</span>}
      </Link>
    </li>
  );
}

interface SideNavigationProps {
  className?: string;
  userRole?: string;
}

export function SideNavigation({
  className,
  userRole = "user",
}: SideNavigationProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="z-50 block lg:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="p-2">
            <ul className="space-y-1">
              {navigationItems.map((item) => (
                <NavigationItem
                  key={item.href}
                  item={item}
                  isActive={pathname === item.href}
                  isCollapsed={false}
                  userRole={userRole}
                />
              ))}
              <li>
                <Link
                  href="/api/auth/signout"
                  className={cn(
                    buttonVariants({ variant: "ghost" }),
                    "group flex w-full items-center justify-start px-3 py-2 text-red-500 hover:text-red-600",
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  <span className="ml-3 text-sm">Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div
        className={cn(
          "hidden border-r bg-card px-3 py-3 lg:flex lg:flex-col",
          isCollapsed ? "lg:w-20" : "lg:w-64",
          className,
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <span className="text-lg font-semibold">Rishi Workforce</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Toggle sidebar"
            className="ml-auto h-8 w-8"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
        <nav className="space-y-1">
          <ul className="space-y-1">
            {navigationItems.map((item) => (
              <NavigationItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
                isCollapsed={isCollapsed}
                userRole={userRole}
              />
            ))}
          </ul>
          <div className="mt-auto pt-4">
            <Link
              href="/api/auth/signout"
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "group flex w-full items-center justify-start px-3 py-2 text-red-500 hover:text-red-600",
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isCollapsed && <span className="ml-3 text-sm">Logout</span>}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
