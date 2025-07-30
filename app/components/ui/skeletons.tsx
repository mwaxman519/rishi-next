"use client";

import React from "react";
import { useClientOnly } from "@/hooks/useClientOnly";

/**
 * A simple empty placeholder that renders the same on both server and client
 * Use this as a base for container elements to prevent hydration mismatches
 */
export function EmptyPlaceholder({
  className = "",
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return <div className={className}>{children}</div>;
}

/**
 * A loading spinner that's hydration-safe - only shows spinner after hydration is complete
 * During server rendering and initial hydration, it renders an empty div with the same dimensions
 */
export function LoadingSpinner({
  className = "h-10 w-10",
  wrapperClassName = "flex items-center justify-center",
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
 * A fullscreen loading spinner that's hydration-safe
 */
export function FullscreenLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingSpinner className="h-16 w-16" />
    </div>
  );
}

/**
 * A page-level loading state that's hydration-safe
 */
export function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <LoadingSpinner className="h-12 w-12" />
    </div>
  );
}
