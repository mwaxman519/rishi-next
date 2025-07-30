"use client";

import React, { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";

import { PageLoader } from "@/components/ui/skeletons";
import SidebarLayout from "../SidebarLayout";
import MobileLayout from "./MobileLayout";
import PublicLayout from "../PublicLayout";

/**
 * App logo component that's consistent between server and client
 */
const AppLogo = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="16"
      cy="16"
      r="14"
      fill="#14b8a6"
      stroke="#0d9488"
      strokeWidth="2"
    />
    <path
      d="M10 12h4v2h-4zm6 0h4v2h-4z"
      fill="white"
    />
    <path
      d="M8 16h6v2H8zm8 0h6v2h-6z"
      fill="white"
    />
    <path
      d="M10 20h4v2h-4zm6 0h4v2h-4z"
      fill="white"
    />
    <circle
      cx="16"
      cy="8"
      r="2"
      fill="white"
    />
  </svg>
);

/**
 * Simple page title component that renders the same on server and client side
 */
const PageTitle = ({ pathname }: { pathname: string | null }) => {
  let title = "Rishi"; // Default title

  if (pathname) {
    if (pathname === "/dashboard") title = "Dashboard";
    else if (pathname.startsWith("/events")) title = "Events";
    else if (pathname.startsWith("/availability")) title = "Availability";
    else if (pathname.startsWith("/requests")) title = "Requests";
    else if (pathname.startsWith("/profile")) title = "Profile";
    else if (pathname.startsWith("/admin")) title = "Admin Portal";
    else if (pathname.startsWith("/team-schedule")) title = "Team Schedule";
    else if (pathname.startsWith("/docs")) title = "Documentation";
    else if (pathname.startsWith("/help")) title = "Help & Support";
  }

  return <span className="font-bold text-lg ml-2">{title}</span>;
};

/**
 * A bare minimal container that renders consistently for full-width pages
 */
const FullWidthLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen">{children}</div>
);

/**
 * Placeholder content that renders during SSR and initial hydration
 */
const ServerPlaceholder = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
    {/* Simple header during loading */}
    <div className="sticky top-0 z-40 flex items-center justify-between px-4 h-16 border-b bg-white dark:bg-gray-900 shadow-sm">
      <div className="flex items-center">
        <img
          src="/favicon.ico"
          alt="Rishi"
          className="h-10 w-auto object-contain max-w-[120px]"
        />
      </div>
      <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
    {/* Main content with single loading spinner */}
    <main className="flex-grow flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
    </main>
    {/* Simple footer during loading */}
    <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t z-40 shadow-lg h-16 flex items-center justify-center">
      <div className="flex gap-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"
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
  
  // State to track if we're hydrated to avoid hydration mismatch
  const [isHydrated, setIsHydrated] = useState(false);

  // Check for full-width pages like login/register
  const isFullWidthPage =
    pathname?.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/register";

  // Media query hook (only works on client side)
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Check if the URL has the unauthenticated parameter for testing
  const hasUnauthenticatedParam =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("unauthenticated") ===
        "true"
      : false;

  // Effect to set hydrated state after component mounts
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During auth loading or before hydration, show a consistent loading state
  // Use the same structure as PublicLayout to prevent hydration mismatch
  if (isLoading || !isHydrated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <main className="flex-grow flex items-center justify-center">
          <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </main>
      </div>
    );
  }

  // Special case for full-width pages - bypass all sidebar logic
  if (isFullWidthPage) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>;
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
