import { redirect } from &quot;next/navigation&quot;;

// Export a dynamic route segment config to force this to be dynamically rendered
export const dynamic = &quot;force-dynamic&quot;;

// Use standardized NextJS 15 redirect compatible implementation
export default function RedirectPage() {
  return redirect(&quot;/docs&quot;);
}
