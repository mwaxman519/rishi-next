&quot;use client&quot;;

import React from &quot;react&quot;;
import { useClientOnly } from &quot;@/hooks/useClientOnly&quot;;

/**
 * A simple empty placeholder that renders the same on both server and client
 * Use this as a base for container elements to prevent hydration mismatches
 */
export function EmptyPlaceholder({
  className = "&quot;,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

/**
 * A loading spinner that&apos;s hydration-safe - only shows spinner after hydration is complete
 * During server rendering and initial hydration, it renders an empty div with the same dimensions
 */
export function LoadingSpinner({
  className = &quot;h-10 w-10&quot;,
  wrapperClassName = &quot;flex items-center justify-center&quot;,
}: {
  className?: string;
  wrapperClassName?: string;
}) {
  const mounted = useClientOnly();

  return (
    <div className={wrapperClassName}>
      {mounted ? (
        <div
          className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${className}`}
        />
      ) : (
        <div className={className} />
      )}
    </div>
  );
}

/**
 * A fullscreen loading spinner that&apos;s hydration-safe
 */
export function FullscreenLoader() {
  return (
    <div className=&quot;fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm&quot;>
      <LoadingSpinner className=&quot;h-16 w-16&quot; />
    </div>
  );
}

/**
 * A page-level loading state that&apos;s hydration-safe
 */
export function PageLoader() {
  return (
    <div className=&quot;flex h-screen w-full items-center justify-center&quot;>
      <LoadingSpinner className=&quot;h-12 w-12" />
    </div>
  );
}
