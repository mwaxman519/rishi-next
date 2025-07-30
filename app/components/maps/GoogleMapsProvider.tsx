&quot;use client&quot;;

import React, { createContext, useContext, useEffect, useState } from &quot;react&quot;;
import { GoogleMapsContext } from &quot;./types&quot;;

// Google Maps API key
const GOOGLE_MAPS_API_KEY = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;

// Create context for Google Maps API status
const GoogleMapsAPIContext = createContext<GoogleMapsContext>({
  isLoaded: false,
  isError: false,
});

/**
 * Hook to access Google Maps API loading status
 */
export function useGoogleMaps() {
  return useContext(GoogleMapsAPIContext);
}

/**
 * Check if Google Maps API is loaded
 */
function isGoogleMapsLoaded(): boolean {
  return (
    typeof window !== &quot;undefined&quot; && !!window.google && !!window.google.maps
  );
}

/**
 * Provider component for loading Google Maps JavaScript API
 */
export function GoogleMapsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [googleMapsState, setGoogleMapsState] = useState<GoogleMapsContext>({
    isLoaded: isGoogleMapsLoaded(),
    isError: false,
  });

  useEffect(() => {
    // If already loaded, no need to load again
    if (isGoogleMapsLoaded()) {
      console.log(&quot;Maps API already loaded in provider&quot;);
      setGoogleMapsState({ isLoaded: true, isError: false });
      return;
    }

    // Don't load if we&apos;re in SSR
    if (typeof window === &quot;undefined&quot;) {
      return;
    }

    console.log(
      &quot;Loading Google Maps API with Web Components and Places Library...&quot;,
    );

    // Create a unique ID for the script to avoid duplicates
    const scriptId = &quot;google-maps-script&quot;;

    // Check if script already exists
    if (document.getElementById(scriptId)) {
      console.log(&quot;Script tag already exists, waiting for it to load...&quot;);
      return;
    }

    // Load Google Maps JavaScript API with places library
    const script = document.createElement(&quot;script&quot;);
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places`;
    script.defer = true;
    script.async = true;

    // Handle loading success
    script.onload = () => {
      console.log(&quot;✅ Google Maps API loaded successfully in provider&quot;);
      setGoogleMapsState({ isLoaded: true, isError: false });
    };

    // Handle loading errors
    script.onerror = (e) => {
      console.error(&quot;❌ Error loading Google Maps API:&quot;, e);
      setGoogleMapsState({
        isLoaded: false,
        isError: true,
        errorMessage: &quot;Failed to load Google Maps API&quot;,
      });
    };

    document.head.appendChild(script);

    // Poll for Google Maps API to be loaded in case the event handlers don&apos;t fire
    const checkInterval = setInterval(() => {
      if (isGoogleMapsLoaded()) {
        console.log(&quot;Maps API loaded (detected by interval check)&quot;);
        setGoogleMapsState({ isLoaded: true, isError: false });
        clearInterval(checkInterval);
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);

      // Don't remove the script tag as it needs to stay loaded
      // for the maps to work throughout the application lifetime
    };
  }, []);

  return (
    <GoogleMapsAPIContext.Provider value={googleMapsState}>
      {children}
    </GoogleMapsAPIContext.Provider>
  );
}
