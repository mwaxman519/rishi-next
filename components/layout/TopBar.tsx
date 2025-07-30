&quot;use client&quot;;

import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useOrganization } from &quot;@/contexts/OrganizationProvider&quot;;
import { OrganizationSelector } from &quot;@/components/organization/OrganizationSelector&quot;;
import { ThemeToggle } from &quot;@/components/ui/theme-toggle&quot;;
import Link from &quot;next/link&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { BellIcon, InfoIcon, Menu, Building } from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { Button } from &quot;@/components/ui/button&quot;;

interface TopBarProps {
  openMobileMenu?: () => void;
}

export function TopBar({ openMobileMenu = () => {} }: TopBarProps) {
  const { user } = useAuth();
  const { currentOrganization } = useOrganization();
  const pathname = usePathname();

  // Define a safe handler to handle empty props
  const handleMenuClick = () => {
    if (typeof openMobileMenu === &quot;function&quot;) {
      openMobileMenu();
    }
  };

  // Break down pathname to display breadcrumb
  const pathSegments = pathname
    ? pathname
        .split(&quot;/&quot;)
        .filter(Boolean)
        .map((segment, index, array) => {
          // Create the full path up to this segment
          const fullPath = &quot;/&quot; + array.slice(0, index + 1).join(&quot;/&quot;);
          return {
            name:
              segment.charAt(0).toUpperCase() +
              segment.slice(1).replace(/-/g, &quot; &quot;),
            path: fullPath,
          };
        })
    : [];

  return (
    <div className=&quot;flex items-center justify-between h-14 px-3 bg-[rgb(var(--background))] border-b border-[rgb(var(--border))]&quot;>
      {/* Left section: Menu button and Organization Info */}
      <div className=&quot;flex items-center gap-2&quot;>
        {/* Mobile menu button - always shown on mobile */}
        <Button
          onClick={handleMenuClick}
          variant=&quot;default&quot;
          size=&quot;icon&quot;
          className=&quot;h-9 w-9 lg:hidden flex items-center justify-center rounded-md mr-1 bg-[rgb(var(--primary))] hover:bg-[rgb(var(--primary))] text-white shadow-sm&quot;
          aria-label=&quot;Open menu&quot;
          style={{ backgroundColor: &quot;rgb(var(--primary))&quot;, color: &quot;white&quot; }}
        >
          <Menu size={22} />
        </Button>

        {/* Desktop organization selector */}
        {user && (
          <div className=&quot;hidden lg:block&quot;>
            <OrganizationSelector />
          </div>
        )}

        {/* Mobile organization display */}
        {user && currentOrganization && (
          <div className=&quot;lg:hidden flex items-center gap-2 px-2 py-1 rounded-md bg-muted&quot;>
            <Building size={16} className=&quot;text-muted-foreground&quot; />
            <span className=&quot;text-sm font-medium truncate max-w-32&quot;>
              {currentOrganization.name}
            </span>
          </div>
        )}
      </div>

      {/* Right section: User actions */}
      <div className=&quot;flex items-center gap-2&quot;>
        {/* Mobile theme toggle */}
        <div className=&quot;lg:hidden&quot;>
          <ThemeToggle />
        </div>

        {/* Documentation Link - always visible on desktop */}
        <a
          href=&quot;/docs&quot;
          className=&quot;hidden md:flex items-center px-3 py-1.5 text-sm font-medium rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors&quot;
        >
          Documentation
        </a>

        {/* Desktop theme toggle */}
        <div className=&quot;hidden lg:block&quot;>
          <ThemeToggle />
        </div>

        {user && (
          <>
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant=&quot;ghost&quot;
                  size=&quot;icon&quot;
                  className=&quot;relative h-9 w-9 rounded-full&quot;
                >
                  <BellIcon className=&quot;h-5 w-5&quot; />
                  <span className=&quot;absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-[rgb(var(--primary))]&quot; />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align=&quot;end&quot; className=&quot;w-64&quot;>
                <div className=&quot;py-2 px-3&quot;>
                  <h3 className=&quot;font-medium text-sm&quot;>Notifications</h3>
                  <p className=&quot;text-xs text-[rgb(var(--muted-foreground))]&quot;>
                    You have no new notifications
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className=&quot;cursor-pointer text-xs py-1.5&quot;>
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help & Info - hidden on mobile to save space */}
            <Button
              variant=&quot;ghost&quot;
              size=&quot;icon&quot;
              className=&quot;h-9 w-9 rounded-full hidden md:flex&quot;
            >
              <InfoIcon className=&quot;h-5 w-5&quot; />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
