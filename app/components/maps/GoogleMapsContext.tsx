&quot;use client&quot;;

import React, { createContext, useState, useEffect } from &quot;react&quot;;
import { Loader } from &quot;@googlemaps/js-api-loader&quot;;

// Define context shape
interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | null;
  google: typeof google | null;
  mapId: string | null;
}

// Create context with default values
export const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: null,
  google: null,
  mapId: null,
});

// Maps Configuration
const GOOGLE_MAPS_API_URL = &quot;https://maps.googleapis.com/maps/api/js&quot;;
const DEFAULT_MAP_ID = &quot;rishi_default_map&quot;;

interface GoogleMapsProviderProps {
  children: React.ReactNode;
  mapId?: string;
}

export const GoogleMapsProvider: React.FC<GoogleMapsProviderProps> = ({
  children,
  mapId = DEFAULT_MAP_ID,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [googleMapsInstance, setGoogleMapsInstance] = useState<
    typeof google | null
  >(null);

  useEffect(() => {
    // Skip if already loaded or failed
    if (isLoaded || loadError) return;

    // If window.google is already defined, don&apos;t load again
    if (window.google?.maps) {
      setIsLoaded(true);
      setGoogleMapsInstance(window.google);
      return;
    }

    // Check if the loader script is already in the document
    if (
      document.querySelector('script[src*=&quot;maps.googleapis.com/maps/api/js&quot;]')
    ) {
      console.warn(
        &quot;Google Maps script tag already exists - waiting for it to load&quot;,
      );

      // Set up event listener to detect when Google Maps loads
      const checkGoogleMapsLoaded = () => {
        if (window.google?.maps) {
          setIsLoaded(true);
          setGoogleMapsInstance(window.google);
          clearInterval(checkInterval);
        }
      };

      const checkInterval = setInterval(checkGoogleMapsLoaded, 100);
      return () => clearInterval(checkInterval);
    }

    // Otherwise create a new loader instance and load the API
    try {
      // Create a script tag and load the Google Maps API
      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "&quot;,
        version: &quot;weekly&quot;,
        libraries: [&quot;places&quot;, &quot;marker&quot;],
      });

      // Load the API
      loader
        .load()
        .then(() => {
          if (process.env.NODE_ENV === &quot;development&quot;) {
            console.debug(&quot;Google Maps API loaded successfully&quot;);
          }
          setIsLoaded(true);
          setGoogleMapsInstance(window.google);
        })
        .catch((error) => {
          console.error(&quot;Error loading Google Maps API:&quot;, error);
          setLoadError(error);
        });
    } catch (error) {
      console.error(&quot;Error setting up Google Maps loader:", error);
      setLoadError(error instanceof Error ? error : new Error(String(error)));
    }

    // Clean up
    return () => {
      // No cleanup needed for Google Maps API as it&apos;s loaded globally
    };
  }, [isLoaded, loadError]);

  // Context value
  const contextValue: GoogleMapsContextType = {
    isLoaded,
    loadError,
    google: googleMapsInstance,
    mapId,
  };

  return (
    <GoogleMapsContext.Provider value={contextValue}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
