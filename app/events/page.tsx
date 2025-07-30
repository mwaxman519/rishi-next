&quot;use client&quot;;

import { useRouter } from &quot;next/navigation&quot;;
import { useEffect } from &quot;react&quot;;

export default function EventsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to bookings page since events concept was removed
    router.replace(&quot;/bookings&quot;);
  }, [router]);

  return (
    <div className=&quot;flex items-center justify-center min-h-screen&quot;>
      <div className=&quot;text-center&quot;>
        <h1 className=&quot;text-2xl font-semibold mb-4&quot;>Redirecting...</h1>
        <p className=&quot;text-muted-foreground&quot;>
          Events functionality has been moved to Bookings management.
        </p>
      </div>
    </div>
  );
}
