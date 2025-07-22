"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminAddNewLocationRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the admin add location page
    router.push("/admin/locations/add");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">
        Redirecting to new location page...
      </p>
    </div>
  );
}
