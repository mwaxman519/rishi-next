"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TeamCalendarRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the bookings calendar which serves team calendar functionality
    router.replace("/bookings/calendar");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Redirecting to Team Calendar...</p>
      </div>
    </div>
  );
}