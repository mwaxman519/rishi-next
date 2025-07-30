&quot;use client&quot;;

import React, { Suspense, useEffect, useState } from &quot;react&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useMediaQuery } from &quot;@/hooks/useMediaQuery&quot;;

import { PageLoader } from &quot;@/components/ui/skeletons&quot;;
import SidebarLayout from &quot;../SidebarLayout&quot;;
import MobileLayout from &quot;./MobileLayout&quot;;
import PublicLayout from &quot;../PublicLayout&quot;;

/**
 * App logo component that&apos;s consistent between server and client
 */
const AppLogo = () => (
  <svg
    width=&quot;32&quot;
    height=&quot;32&quot;
    viewBox=&quot;0 0 32 32&quot;
    fill=&quot;none&quot;
    xmlns=&quot;http://www.w3.org/2000/svg&quot;
  >
    <circle
      cx=&quot;16&quot;
      cy=&quot;16&quot;
      r=&quot;14&quot;
      fill=&quot;#14b8a6&quot;
      stroke=&quot;#0d9488&quot;
      strokeWidth=&quot;2&quot;
    />
    <path
      d=&quot;M10 12h4v2h-4zm6 0h4v2h-4z&quot;
      fill=&quot;white&quot;
    />
    <path
      d=&quot;M8 16h6v2H8zm8 0h6v2h-6z&quot;
      fill=&quot;white&quot;
    />
    <path
      d=&quot;M10 20h4v2h-4zm6 0h4v2h-4z&quot;
      fill=&quot;white&quot;
    />
    <circle
      cx=&quot;16&quot;
      cy=&quot;8&quot;
      r=&quot;2&quot;
      fill=&quot;white&quot;
    />
  </svg>
);

/**
 * Simple page title component that renders the same on server and client side
 */
const PageTitle = ({ pathname }: { pathname: string | null }) => {
  let title = &quot;Rishi&quot;; // Default title

  if (pathname) {
    if (pathname === &quot;/dashboard&quot;) title = &quot;Dashboard&quot;;
    else if (pathname.startsWith(&quot;/events&quot;)) title = &quot;Events&quot;;
    else if (pathname.startsWith(&quot;/availability&quot;)) title = &quot;Availability&quot;;
    else if (pathname.startsWith(&quot;/requests&quot;)) title = &quot;Requests&quot;;
    else if (pathname.startsWith(&quot;/profile&quot;)) title = &quot;Profile&quot;;
    else if (pathname.startsWith(&quot;/admin&quot;)) title = &quot;Admin Portal&quot;;
    else if (pathname.startsWith(&quot;/team-schedule&quot;)) title = &quot;Team Schedule&quot;;
    else if (pathname.startsWith(&quot;/docs&quot;)) title = &quot;Documentation&quot;;
    else if (pathname.startsWith(&quot;/help&quot;)) title = &quot;Help & Support&quot;;
  }

  return <span className=&quot;font-bold text-lg ml-2&quot;>{title}</span>;
};

/**
 * A bare minimal container that renders consistently for full-width pages
 */
const FullWidthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className=&quot;min-h-screen&quot;>{children}</div>
);

/**
 * Placeholder content that renders during SSR and initial hydration
 */
const ServerPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className=&quot;min-h-screen flex flex-col bg-white dark:bg-gray-900&quot;>
    {/* Simple header during loading */}
    <div className=&quot;sticky top-0 z-40 flex items-center justify-between px-4 h-16 border-b bg-white dark:bg-gray-900 shadow-sm&quot;>
      <div className=&quot;flex items-center&quot;>
        <img
          src=&quot;/favicon.ico&quot;
          alt=&quot;Rishi&quot;
          className=&quot;h-10 w-auto object-contain max-w-[120px]&quot;
        />
      </div>
      <div className=&quot;w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded&quot;></div>
    </div>
    {/* Main content with single loading spinner */}
    <main className=&quot;flex-grow flex items-center justify-center&quot;>
      <div className=&quot;animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent&quot;></div>
    </main>
    {/* Simple footer during loading */}
    <div className=&quot;sticky bottom-0 bg-white dark:bg-gray-900 border-t z-40 shadow-lg h-16 flex items-center justify-center&quot;>
      <div className=&quot;flex gap-8&quot;>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className=&quot;w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded&quot;
          ></div>
        ))}
      </div>
    </div>
  </div>
);

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  // These hooks are safe to call in all environments
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  
  // State to track if we&apos;re hydrated to avoid hydration mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  // Check for full-width pages like login/register
  const isFullWidthPage =
    pathname?.startsWith(&quot;/auth/&quot;) ||
    pathname === &quot;/login&quot; ||
    pathname === &quot;/register&quot;;

  // Media query hook (only works on client side)
  const isDesktop = useMediaQuery(&quot;(min-width: 1024px)&quot;);

  // Check if the URL has the unauthenticated parameter for testing
  const hasUnauthenticatedParam =
    typeof window !== &quot;undefined&quot;
      ? new URLSearchParams(window.location.search).get(&quot;unauthenticated&quot;) ===
        &quot;true&quot;
      : false;

  // Effect to set hydrated state after component mounts
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During auth loading or before hydration, show a consistent loading state
  // Use the same structure as PublicLayout to prevent hydration mismatch
  if (isLoading || !isHydrated) {
    return (
      <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>
        <main className=&quot;flex-grow flex items-center justify-center&quot;>
          <div className=&quot;w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded&quot;></div>
        </main>
      </div>
    );
  }

  // Special case for full-width pages - bypass all sidebar logic
  if (isFullWidthPage) {
    return <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>{children}</div>;
  }

  // Force public layout if URL parameter is set or user is not authenticated
  if (hasUnauthenticatedParam || !user) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  // For authenticated users, use responsive layouts based on screen size
  return (
    <>
      {isDesktop ? (
        <SidebarLayout>{children}</SidebarLayout>
      ) : (
        <MobileLayout>{children}</MobileLayout>
      )}
    </>
  );
}
