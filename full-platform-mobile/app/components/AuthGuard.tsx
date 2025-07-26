"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireSuperAdmin?: boolean;
}

export function AuthGuard({ 
  children, 
  requireAuth = false, 
  requireSuperAdmin = false 
}: AuthGuardProps) {
  const { user, isSuperAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        console.log("Auth required but user not authenticated, redirecting to login");
        router.push("/auth/login");
        return;
      }

      if (requireSuperAdmin && (!user || !isSuperAdmin)) {
        console.log("Super admin required but user not super admin, redirecting to login");
        router.push("/auth/login");
        return;
      }
    }
  }, [user, isSuperAdmin, loading, requireAuth, requireSuperAdmin, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-muted-foreground mb-4">Please log in to access this page</p>
          <Button onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show super admin required message
  if (requireSuperAdmin && (!user || !isSuperAdmin)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Super Admin Access Required</h2>
          <p className="text-muted-foreground mb-4">You need super admin privileges to access this page</p>
          <Button onClick={() => router.push("/auth/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}