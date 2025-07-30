"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook that watches a CSS media query and returns
 * whether it matches or not.
 *
 * @param query The CSS media query to check
 * @returns A boolean indicating whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with null which will represent "not yet determined"
  // to prevent hydration mismatch (server defaults to false, client might be true)
  const [matches, setMatches] = useState<boolean | null>(null);

  useEffect(() => {
    // Now that we're on the client, we can check the media query
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    // Define our listener that will track changes
    const handleChange = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // Add the listener to track changes
    mediaQuery.addEventListener("change", handleChange);

    // Clean up
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  // Return false during SSR to avoid hydration mismatch
  // and return the actual value once determined on the client
  return matches === null ? false : matches;
}
