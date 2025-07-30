&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;

export default function TeamCalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the bookings calendar which serves team calendar functionality
    router.replace(&quot;/bookings/calendar&quot;);
  }, [router]);

  return (
    <div className=&quot;flex items-center justify-center min-h-screen&quot;>
      <div className=&quot;text-center&quot;>
        <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto&quot;></div>
        <p className=&quot;mt-2 text-muted-foreground&quot;>Redirecting to Team Calendar...</p>
      </div>
    </div>
  );
}