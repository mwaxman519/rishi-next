&quot;use client&quot;;

import React, { Suspense } from &quot;react&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useMediaQuery } from &quot;@/hooks/useMediaQuery&quot;;
import { useClientOnly } from &quot;@/hooks/useClientOnly&quot;;
import { PageLoader } from &quot;@/components/ui/skeletons&quot;;
import SidebarLayout from &quot;@/components/SidebarLayout&quot;;
import MobileLayout from &quot;./MobileLayout&quot;;
import PublicLayout from &quot;@/components/PublicLayout&quot;;

/**
 * App logo component that&apos;s consistent between server and client
 */
const AppLogo = () => (
  <svg
    width=&quot;24&quot;
    height=&quot;24&quot;
    viewBox=&quot;0 0 32 32&quot;
    fill=&quot;none&quot;
    xmlns=&quot;http://www.w3.org/2000/svg&quot;
  >
    <path
      d=&quot;M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z&quot;
      fill=&quot;#5A36CC&quot;
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
 * This needs to match exactly what the client will render initially
 */
const ServerPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className=&quot;min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900&quot;>
    <div className=&quot;animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent&quot;></div>
  </div>
);

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export default function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  // These hooks are safe to call in all environments but will only have meaningful
  // values after hydration is complete
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const mounted = useClientOnly();

  // Check for full-width pages like login/register
  const isFullWidthPage =
    pathname?.startsWith(&quot;/auth/&quot;) ||
    pathname === &quot;/login&quot; ||
    pathname === &quot;/register&quot;;

  // Media query hook (only works on client side)
  const isDesktop = useMediaQuery(&quot;(min-width: 1024px)&quot;);

  // Check if the URL has the unauthenticated parameter for testing
  const hasUnauthenticatedParam =
    mounted && typeof window !== &quot;undefined&quot;
      ? new URLSearchParams(window.location.search).get(&quot;unauthenticated&quot;) ===
        &quot;true&quot;
      : false;

  // Special case for full-width pages - render immediately to avoid hydration issues
  if (isFullWidthPage) {
    return <FullWidthLayout>{children}</FullWidthLayout>;
  }

  // Force public layout if URL parameter is set
  if (hasUnauthenticatedParam) {
    return <PublicLayout>{children}</PublicLayout>;
  }

  // During server render or loading, or if not authenticated, show public layout
  // This ensures consistent rendering between server and client
  if (!mounted || loading || !user) {
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
