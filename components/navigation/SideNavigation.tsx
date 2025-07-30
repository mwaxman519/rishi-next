&quot;use client&quot;;

import * as React from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
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
} from &quot;lucide-react&quot;;

import { cn } from &quot;@/lib/utils&quot;;
import { Button, buttonVariants } from &quot;@/components/ui/button&quot;;
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from &quot;@/components/ui/sheet&quot;;
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from &quot;@/components/ui/collapsible&quot;;

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: NavigationItem[];
  roles?: string[];
}

const navigationItems: NavigationItem[] = [
  {
    title: &quot;Dashboard&quot;,
    href: &quot;/dashboard&quot;,
    icon: <LayoutDashboard className=&quot;h-5 w-5&quot; />,
    roles: [&quot;user&quot;, &quot;admin&quot;, &quot;super_admin&quot;],
  },
  {
    title: &quot;Bookings&quot;,
    href: &quot;/bookings&quot;,
    icon: <Calendar className=&quot;h-5 w-5&quot; />,
    roles: [&quot;user&quot;, &quot;admin&quot;, &quot;super_admin&quot;],
  },
  {
    title: &quot;Locations&quot;,
    href: &quot;/locations&quot;,
    icon: <MapPin className=&quot;h-5 w-5&quot; />,
    roles: [&quot;user&quot;, &quot;admin&quot;, &quot;super_admin&quot;],
    submenu: [
      {
        title: &quot;All Locations&quot;,
        href: &quot;/locations&quot;,
        icon: <MapPin className=&quot;h-4 w-4&quot; />,
      },
      {
        title: &quot;My Favorites&quot;,
        href: &quot;/locations/favorites&quot;,
        icon: <MapPin className=&quot;h-4 w-4&quot; />,
      },
    ],
  },
  {
    title: &quot;Kit Management&quot;,
    href: &quot;/kits&quot;,
    icon: <Package className=&quot;h-5 w-5&quot; />,
    roles: [&quot;user&quot;, &quot;admin&quot;, &quot;super_admin&quot;],
    submenu: [
      {
        title: &quot;Templates&quot;,
        href: &quot;/kits/templates&quot;,
        icon: <Package className=&quot;h-4 w-4&quot; />,
      },
      {
        title: &quot;Kit Instances&quot;,
        href: &quot;/kits/instances&quot;,
        icon: <Package className=&quot;h-4 w-4&quot; />,
      },
    ],
  },
  {
    title: &quot;Users&quot;,
    href: &quot;/users&quot;,
    icon: <Users className=&quot;h-5 w-5&quot; />,
    roles: [&quot;admin&quot;, &quot;super_admin&quot;],
  },
  {
    title: &quot;Reports&quot;,
    href: &quot;/reports&quot;,
    icon: <FileText className=&quot;h-5 w-5&quot; />,
    roles: [&quot;admin&quot;, &quot;super_admin&quot;],
  },
  {
    title: &quot;Settings&quot;,
    href: &quot;/settings&quot;,
    icon: <Settings className=&quot;h-5 w-5&quot; />,
    roles: [&quot;user&quot;, &quot;admin&quot;, &quot;super_admin&quot;],
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
  userRole = &quot;user&quot;,
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
                buttonVariants({ variant: &quot;ghost&quot; }),
                &quot;group relative flex w-full cursor-pointer justify-between px-3 py-2&quot;,
                isActive &&
                  &quot;bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary&quot;,
              )}
            >
              <div className=&quot;flex items-center&quot;>
                {item.icon}
                {!isCollapsed && (
                  <span className=&quot;ml-3 text-sm&quot;>{item.title}</span>
                )}
              </div>
              <div
                className={cn(
                  &quot;transition-transform&quot;,
                  isOpen ? &quot;rotate-90&quot; : "&quot;,
                )}
              >
                <ChevronRight className=&quot;h-4 w-4&quot; />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className=&quot;ml-4 mt-1 space-y-1&quot;>
              {item.submenu.map((subItem) => (
                <li key={subItem.href}>
                  <Link
                    href={subItem.href}
                    className={cn(
                      buttonVariants({ variant: &quot;ghost&quot; }),
                      &quot;group flex w-full items-center px-3 py-2 text-sm&quot;,
                      isActive &&
                        subItem.href === usePathname() &&
                        &quot;bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary&quot;,
                    )}
                  >
                    {subItem.icon}
                    {!isCollapsed && (
                      <span className=&quot;ml-3 text-sm&quot;>{subItem.title}</span>
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
          buttonVariants({ variant: &quot;ghost&quot; }),
          &quot;group relative flex w-full items-center justify-start px-3 py-2&quot;,
          isActive &&
            &quot;bg-accent text-accent-foreground font-medium before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-primary&quot;,
        )}
      >
        {item.icon}
        {!isCollapsed && <span className=&quot;ml-3 text-sm&quot;>{item.title}</span>}
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
  userRole = &quot;user&quot;,
}: SideNavigationProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Navigation */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant=&quot;outline&quot;
            size=&quot;icon&quot;
            className=&quot;z-50 block lg:hidden&quot;
          >
            <Menu className=&quot;h-5 w-5&quot; />
            <span className=&quot;sr-only&quot;>Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side=&quot;left&quot; className=&quot;p-0&quot;>
          <SheetHeader className=&quot;border-b p-4&quot;>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className=&quot;p-2&quot;>
            <ul className=&quot;space-y-1&quot;>
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
                  href=&quot;/api/auth/signout&quot;
                  className={cn(
                    buttonVariants({ variant: &quot;ghost&quot; }),
                    &quot;group flex w-full items-center justify-start px-3 py-2 text-red-500 hover:text-red-600&quot;,
                  )}
                >
                  <LogOut className=&quot;h-5 w-5&quot; />
                  <span className=&quot;ml-3 text-sm&quot;>Logout</span>
                </Link>
              </li>
            </ul>
          </nav>
        </SheetContent>
      </Sheet>

      {/* Desktop Navigation */}
      <div
        className={cn(
          &quot;hidden border-r bg-card px-3 py-3 lg:flex lg:flex-col&quot;,
          isCollapsed ? &quot;lg:w-20&quot; : &quot;lg:w-64&quot;,
          className,
        )}
      >
        <div className=&quot;mb-4 flex items-center justify-between&quot;>
          {!isCollapsed && (
            <div className=&quot;flex items-center&quot;>
              <span className=&quot;text-lg font-semibold&quot;>Rishi Workforce</span>
            </div>
          )}
          <Button
            variant=&quot;ghost&quot;
            size=&quot;icon&quot;
            aria-label=&quot;Toggle sidebar&quot;
            className=&quot;ml-auto h-8 w-8&quot;
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className=&quot;h-4 w-4&quot; />
            ) : (
              <ChevronLeft className=&quot;h-4 w-4&quot; />
            )}
          </Button>
        </div>
        <nav className=&quot;space-y-1&quot;>
          <ul className=&quot;space-y-1&quot;>
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
          <div className=&quot;mt-auto pt-4&quot;>
            <Link
              href=&quot;/api/auth/signout&quot;
              className={cn(
                buttonVariants({ variant: &quot;ghost&quot; }),
                &quot;group flex w-full items-center justify-start px-3 py-2 text-red-500 hover:text-red-600&quot;,
              )}
            >
              <LogOut className=&quot;h-5 w-5&quot; />
              {!isCollapsed && <span className=&quot;ml-3 text-sm">Logout</span>}
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
