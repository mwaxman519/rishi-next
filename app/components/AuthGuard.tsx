&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useAuth } from &quot;@/hooks/useAuth&quot;;
import { Button } from &quot;@/components/ui/button&quot;;

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
        console.log(&quot;Auth required but user not authenticated, redirecting to login&quot;);
        router.push(&quot;/auth/login&quot;);
        return;
      }

      if (requireSuperAdmin && (!user || !isSuperAdmin)) {
        console.log(&quot;Super admin required but user not super admin, redirecting to login&quot;);
        router.push(&quot;/auth/login&quot;);
        return;
      }
    }
  }, [user, isSuperAdmin, loading, requireAuth, requireSuperAdmin, router]);

  // Show loading state
  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <div className=&quot;text-center&quot;>
          <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4&quot;></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (requireAuth && !user) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <div className=&quot;text-center&quot;>
          <h2 className=&quot;text-xl font-semibold mb-2&quot;>Authentication Required</h2>
          <p className=&quot;text-muted-foreground mb-4&quot;>Please log in to access this page</p>
          <Button onClick={() => router.push(&quot;/auth/login&quot;)}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Show super admin required message
  if (requireSuperAdmin && (!user || !isSuperAdmin)) {
    return (
      <div className=&quot;flex items-center justify-center min-h-screen&quot;>
        <div className=&quot;text-center&quot;>
          <h2 className=&quot;text-xl font-semibold mb-2&quot;>Super Admin Access Required</h2>
          <p className=&quot;text-muted-foreground mb-4&quot;>You need super admin privileges to access this page</p>
          <Button onClick={() => router.push(&quot;/auth/login&quot;)}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
}