"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  ModernNavigationProvider,
  useNavigation,
} from "@/components/navigation/ModernNavigationProvider";
import ModernSidebar from "@/components/navigation/ModernSidebar";
import ModernMobileNavigation from "@/components/navigation/ModernMobileNavigation";

interface ModernLayoutProps {
  children: React.ReactNode;
}

// Inner component that uses the navigation context
function ModernLayoutInner({ children }: ModernLayoutProps) {
  const { user, isLoading } = useAuth();
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
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Special case for full-width pages like login/register
  const isFullWidthPage =
    pathname?.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/unauthorized";

  if (isFullWidthPage) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <>
      {/* Desktop: Sidebar layout */}
      {!isMobile ? (
        <ModernSidebar navItems={navItems}>{children}</ModernSidebar>
      ) : (
        /* Mobile: Content with top and bottom navigation */
        <div className="min-h-screen pb-20">
          {/* Mobile navigation with top header and bottom tabs */}
          <ModernMobileNavigation navItems={navItems} />

          {/* Main content area */}
          <main className="max-w-screen-xl mx-auto px-4 pt-4 pb-20">
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
