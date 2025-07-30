&quot;use client&quot;;

import React from &quot;react&quot;;

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * A simple layout component that doesn&apos;t modify the existing dashboard structure
 * but allows us to create a consistent container for new pages.
 * This preserves all the placeholder components for security, app health, metrics, etc.
 * Simplified to avoid webpack module resolution issues in Replit Preview.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className=&quot;min-h-screen bg-[rgb(var(--background))] text-[rgb(var(--foreground))]&quot;>
      <div className=&quot;container mx-auto px-4 sm:px-6 py-8&quot;>{children}</div>
    </div>
  );
}

// Default export for dynamic imports
export default AppLayout;
