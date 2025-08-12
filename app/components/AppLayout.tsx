"use client";

// STATIC AUTH - No API calls to stop infinite loop
// import { useAuth } from "../hooks/useAuth";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import SidebarLayout from "./SidebarLayout";
import PublicLayout from "./PublicLayout";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  // STATIC USER - No authentication API calls
  const user = {
    id: "mike-id",
    username: "mike",
    role: "super_admin",
    organizationId: "1"
  };
  const loading = false;
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration mismatch doesn't occur
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log authentication state for debugging
  useEffect(() => {
    if (isClient) {
      console.log(
        "AppLayout: User authenticated status:",
        user ? "authenticated" : "unauthenticated",
      );
    }
  }, [user, isClient]);

  // Show a loading indicator while authentication state is being determined
  if (loading || !isClient) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is authenticated, use the SidebarLayout
  if (user) {
    console.log("AppLayout: User authenticated, using SidebarLayout");
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  // If not authenticated, use the simpler PublicLayout
  console.log("AppLayout: User NOT authenticated, using PublicLayout");
  return <PublicLayout>{children}</PublicLayout>;
}
