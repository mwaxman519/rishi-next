/**
 * Environment Indicator
 *
 * This component displays a visual indicator of the current environment
 * (development, staging) in the UI to help users identify which environment
 * they're currently using. Not shown in production.
 */

import React from "react";
import { getEnvironmentIndicator } from "../../app/config/environment";
import { useClientOnly } from "../../app/hooks/useClientOnly";

export function EnvironmentIndicator() {
  // Use our client-only hook for consistency
  const mounted = useClientOnly();

  // Don't render during SSR or if not mounted yet
  if (!mounted) {
    return null;
  }

  const indicator = getEnvironmentIndicator();

  // Don't render anything in production or if explicitly disabled
  if (!indicator.show) {
    return null;
  }

  return (
    <div
      className="fixed top-16 right-4 z-40 px-2 py-1 text-xs font-medium rounded-md shadow-sm"
      style={{
        backgroundColor: indicator.color,
        color: indicator.textColor,
      }}
    >
      {indicator.label}
    </div>
  );
}

/**
 * A more prominent environment banner for development and staging environments
 */
export function EnvironmentBanner() {
  // Use our client-only hook for consistency
  const mounted = useClientOnly();

  // Don't render during SSR or if not mounted yet
  if (!mounted) {
    return null;
  }

  const indicator = getEnvironmentIndicator();

  // Don't render anything in production or if explicitly disabled
  if (!indicator.show) {
    return null;
  }

  return (
    <div
      className="w-full text-center py-1 text-sm font-medium"
      style={{
        backgroundColor: indicator.color,
        color: indicator.textColor,
      }}
    >
      {indicator.label} ENVIRONMENT - Not for production use
    </div>
  );
}
