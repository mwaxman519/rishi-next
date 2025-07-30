&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { usePathname } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { useMediaQuery } from &quot;@/hooks/useMediaQuery&quot;;
import {
  ModernNavigationProvider,
  useNavigation,
} from &quot;../navigation/ModernNavigationProvider&quot;;
import ModernSidebar from &quot;../navigation/ModernSidebar&quot;;
import ModernMobileNavigation from &quot;../navigation/ModernMobileNavigation&quot;;

interface ModernLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the navigation context
function ModernLayoutInner({ children }: ModernLayoutProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const { navItems, isMobile } = useNavigation();
  const [mounted, setMounted] = useState(false);

  // Use effect to set mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading state if not mounted yet (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className=&quot;flex h-screen w-full items-center justify-center&quot;>
        <div className=&quot;h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent&quot;></div>
      </div>
    );
  }

  // Special case for full-width pages like login/register
  const isFullWidthPage =
    pathname?.startsWith(&quot;/auth/&quot;) ||
    pathname === &quot;/login&quot; ||
    pathname === &quot;/register&quot; ||
    pathname === &quot;/unauthorized&quot;;

  if (isFullWidthPage) {
    return <div className=&quot;min-h-screen&quot;>{children}</div>;
  }

  return (
    <>
      {/* Desktop: Sidebar layout */}
      {!isMobile ? (
        <ModernSidebar navItems={navItems}>{children}</ModernSidebar>
      ) : (
        /* Mobile: Content with top and bottom navigation */
        <div className=&quot;min-h-screen pb-20&quot;>
          {/* Mobile navigation with top header and bottom tabs */}
          <ModernMobileNavigation navItems={navItems} />

          {/* Main content area */}
          <main className=&quot;max-w-screen-xl mx-auto px-4 pt-4 pb-20&quot;>
            {children}
          </main>
        </div>
      )}
    </>
  );
}

// Main layout wrapper that provides the navigation context
export default function ModernLayout({ children }: ModernLayoutProps) {
  return (
    <ModernNavigationProvider>
      <ModernLayoutInner>{children}</ModernLayoutInner>
    </ModernNavigationProvider>
  );
}
