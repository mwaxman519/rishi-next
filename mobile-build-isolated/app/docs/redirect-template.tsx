import { redirect } from "next/navigation";

// Use standardized NextJS 15 redirect compatible implementation
export default function RedirectPage() {
  // Cannot use redirect inside the body of a server component
  // Should be inside a function that is called during render
  return redirect("TARGET_URL");
}
