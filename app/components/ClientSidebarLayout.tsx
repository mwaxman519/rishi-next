"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import ResponsiveLayout from "./layout/ResponsiveLayout";
import PublicLayout from "./PublicLayout";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ClientSidebarLayoutProps {
  children: React.ReactNode;
}

export default function ClientSidebarLayout({
  children,
}: ClientSidebarLayoutProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration mismatch doesn't occur
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while auth is being determined
  if (!isClient) {
    // Only show loading for client-side hydration, not for auth loading
    // This prevents an infinite loading state if auth is stuck
    console.log("ClientSidebarLayout: Client-side hydration in progress");
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Log auth status but continue rendering even if still loading
  // This ensures the app will render even if auth is slow
  if (loading) {
    console.log(
      "ClientSidebarLayout: Auth is still loading, proceeding with null user",
    );
  }

  // Debug info for navigation
  console.log("ClientSidebarLayout Path:", pathname, "User Role:", user?.role);

  // Decide which layout to use based on authentication state
  if (user) {
    // User is authenticated, show the responsive layout which will
    // automatically choose between mobile and desktop layouts
    return <ResponsiveLayout>{children}</ResponsiveLayout>;
  } else {
    // User is not authenticated, show public layout
    return <PublicLayout>{children}</PublicLayout>;
  }
}
