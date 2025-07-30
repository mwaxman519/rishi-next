&quot;use client&quot;;

import { usePathname } from &quot;next/navigation&quot;;
import { useAuth } from &quot;../hooks/useAuth&quot;;
import ResponsiveLayout from &quot;./layout/ResponsiveLayout&quot;;
import PublicLayout from &quot;./PublicLayout&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { useState, useEffect } from &quot;react&quot;;

interface ClientSidebarLayoutProps {
  children: React.ReactNode;
}

export default function ClientSidebarLayout({
  children,
}: ClientSidebarLayoutProps) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration mismatch doesn&apos;t occur
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state while auth is being determined
  if (!isClient) {
    // Only show loading for client-side hydration, not for auth loading
    // This prevents an infinite loading state if auth is stuck
    console.log(&quot;ClientSidebarLayout: Client-side hydration in progress&quot;);
    return (
      <div className=&quot;flex items-center justify-center h-screen&quot;>
        <Loader2 className=&quot;h-10 w-10 animate-spin text-primary&quot; />
      </div>
    );
  }

  // Log auth status but continue rendering even if still loading
  // This ensures the app will render even if auth is slow
  if (loading) {
    console.log(
      &quot;ClientSidebarLayout: Auth is still loading, proceeding with null user&quot;,
    );
  }

  // Debug info for navigation
  console.log(&quot;ClientSidebarLayout Path:&quot;, pathname, &quot;User Role:&quot;, user?.role);

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
