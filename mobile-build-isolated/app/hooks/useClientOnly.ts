"use client";

import React, { useState, useEffect, useRef } from "react";

/**
 * Returns true if code is running in a browser environment
 */
export function isClientSide(): boolean {
  return typeof window !== "undefined";
}

/**
 * Hook that returns true when the component is mounted on the client
 * Use this to prevent hydration mismatches for components that should only render on the client
 *
 * @example
 * const mounted = useClientOnly();
 * if (!mounted) return null; // or loading state
 *
 * @returns boolean indicating if the component is mounted on the client
 */
export function useClientOnly(): boolean {
  // In SSR, React will render once in Node.js (isClient = false)
  // After hydration on client, React renders again (isClient = true)
  const [isClient, setIsClient] = useState(false);

  // On mount (client only), set isClient to true
  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}
