&quot;use client&quot;;

import { useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { Loader2 } from &quot;lucide-react&quot;;

export default function AdminAddNewLocationRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the admin add location page
    router.push(&quot;/admin/locations/add&quot;);
  }, [router]);

  return (
    <div className=&quot;flex flex-col items-center justify-center min-h-[60vh]&quot;>
      <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-4&quot; />
      <p className=&quot;text-muted-foreground&quot;>
        Redirecting to new location page...
      </p>
    </div>
  );
}
