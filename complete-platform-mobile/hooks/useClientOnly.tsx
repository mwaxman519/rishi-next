"use client"

import { useEffect, useState } from 'react';

/**
 * Hook that returns true only after component has mounted on client side
 * Useful for preventing hydration mismatches with server-side rendering
 */
export function useClientOnly(): boolean {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}