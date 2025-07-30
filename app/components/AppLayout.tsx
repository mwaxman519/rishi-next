&quot;use client&quot;;

import { useAuth } from &quot;../hooks/useAuth&quot;;
import { useState, useEffect } from &quot;react&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import SidebarLayout from &quot;./SidebarLayout&quot;;
import PublicLayout from &quot;./PublicLayout&quot;;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { user, loading } = useAuth();
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration mismatch doesn&apos;t occur
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Log authentication state for debugging
  useEffect(() => {
    if (isClient) {
      console.log(
        &quot;AppLayout: User authenticated status:&quot;,
        user ? &quot;authenticated&quot; : &quot;unauthenticated&quot;,
      );
    }
  }, [user, isClient]);

  // Show a loading indicator while authentication state is being determined
  if (loading || !isClient) {
    return (
      <div className=&quot;flex items-center justify-center h-screen&quot;>
        <Loader2 className=&quot;h-10 w-10 animate-spin text-primary&quot; />
      </div>
    );
  }

  // If the user is authenticated, use the SidebarLayout
  if (user) {
    console.log(&quot;AppLayout: User authenticated, using SidebarLayout&quot;);
    return <SidebarLayout>{children}</SidebarLayout>;
  }

  // If not authenticated, use the simpler PublicLayout
  console.log(&quot;AppLayout: User NOT authenticated, using PublicLayout&quot;);
  return <PublicLayout>{children}</PublicLayout>;
}
