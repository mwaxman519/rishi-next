"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EventsRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to bookings page since events concept was removed
    router.replace("/bookings");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Redirecting...</h1>
        <p className="text-muted-foreground">
          Events functionality has been moved to Bookings management.
        </p>
      </div>
    </div>
  );
}
