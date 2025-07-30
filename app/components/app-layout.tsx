"use client";

import React from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * A simple layout component that doesn't modify the existing dashboard structure
 * but allows us to create a consistent container for new pages.
 * This preserves all the placeholder components for security, app health, metrics, etc.
 * Simplified to avoid webpack module resolution issues in Replit Preview.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]">
      <div className="container mx-auto px-4 sm:px-6 py-8">{children}</div>
    </div>
  );
}

// Default export for dynamic imports
export default AppLayout;
