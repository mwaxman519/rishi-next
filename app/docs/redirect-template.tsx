import { redirect } from &quot;next/navigation&quot;;

// Use standardized NextJS 15 redirect compatible implementation
export default function RedirectPage() {
  // Cannot use redirect inside the body of a server component
  // Should be inside a function that is called during render
  return redirect(&quot;TARGET_URL&quot;);
}
