"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AgentDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main dashboard which shows appropriate content based on user role
    router.replace("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Redirecting to Agent Dashboard...</p>
      </div>
    </div>
  );
}