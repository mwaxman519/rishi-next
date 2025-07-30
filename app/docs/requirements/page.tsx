import { redirect } from "next/navigation";

// Export a dynamic route segment config to force this to be dynamically rendered
export const dynamic = "force-dynamic";

// Use standardized NextJS 15 redirect compatible implementation
export default function RedirectPage() {
  return redirect("/docs/business/requirements");
}
