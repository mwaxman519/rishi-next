"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useClientOnly } from "@/hooks/useClientOnly";
import { PageLoader } from "@/components/ui/skeletons";
import SidebarLayout from "../SidebarLayout";
import MobileLayout from "./MobileLayout";
import PublicLayout from "../PublicLayout";

/**
 * App logo component that's consistent between server and client
 */
const AppLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 2C8.268 2 2 8.268 2 16C2 23.732 8.268 30 16 30C23.732 30 30 23.732 30 16C30 8.268 23.732 2 16 2Z"
      fill="#5A36CC"
    />
    <path
      d="M21 12H11C10.448 12 10 12.448 10 13V19C10 19.552 10.448 20 11 20H21C21.552 20 22 19.552 22 19V13C22 12.448 21.552 12 21 12Z"
      fill="white"
    />
    <path
      d="M12 9C12 8.448 11.552 8 11 8C10.448 8 10 8.448 10 9V11C10 11.552 10.448 12 11 12C11.552 12 12 11.552 12 11V9Z"
      fill="white"
    />
    <path
      d="M16 9C16 8.448 15.552 8 15 8C14.448 8 14 8.448 14 9V11C14 11.552 14.448 12 15 12C15.552 12 16 11.552 16 11V9Z"
      fill="white"
    />
    <path
      d="M20 9C20 8.448 19.552 8 19 8C18.448 8 18 8.448 18 9V11C18 11.552 18.448 12 19 12C19.552 12 20 11.552 20 11V9Z"
      fill="white"
    />
    <path
      d="M12 21C12 20.448 11.552 20 11 20C10.448 20 10 20.448 10 21V23C10 23.552 10.448 24 11 24C11.552 24 12 23.552 12 23V21Z"
      fill="white"
    />
    <path
      d="M16 21C16 20.448 15.552 20 15 20C14.448 20 14 20.448 14 21V23C14 23.552 14.448 24 15 24C15.552 24 16 23.552 16 23V21Z"
      fill="white"
    />
    <path
      d="M20 21C20 20.448 19.552 20 19 20C18.448 20 18 20.448 18 21V23C18 23.552 18.448 24 19 24C19.552 24 20 23.552 20 23V21Z"
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
  // Check if we're on the client side
  const mounted = useClientOnly();

  // These hooks are safe to call in all environments but will only have meaningful
  // values after hydration is complete
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  // Check for full-width pages like login/register
  const isFullWidthPage =
    pathname?.startsWith("/auth/") ||
    pathname === "/login" ||
    pathname === "/register";

  // Media query hook (only works on client side)
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Check if the URL has the unauthenticated parameter for testing
  const hasUnauthenticatedParam =
    mounted && typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("unauthenticated") ===
        "true"
      : false;

  // During server render, initial client render, or loading auth data, 
  // show a single unified loading state to prevent multiple animations
  if (!mounted || isLoading) {
    return <ServerPlaceholder>{children}</ServerPlaceholder>;
  }

  // Once fully mounted and data is loaded, render the appropriate layout

  // Special case for full-width pages
  if (isFullWidthPage) {
    return <FullWidthLayout>{children}</FullWidthLayout>;
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
