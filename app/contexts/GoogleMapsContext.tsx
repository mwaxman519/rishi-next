&quot;use client&quot;;

import React, { createContext, useContext, useEffect, useState } from &quot;react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Define context types
interface GoogleMapsContextValue {
  isLoaded: boolean;
  loadError: Error | null;
  google: typeof google | null;
}

const GoogleMapsContext = createContext<GoogleMapsContextValue>({
  isLoaded: false,
  loadError: null,
  google: null,
});

// Default Google Maps API key - should be overridden by environment variable
const DEFAULT_API_KEY = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;

interface GoogleMapsProviderProps {
  children: React.ReactNode;
  apiKey?: string;
  libraries?: string[];
}

export function GoogleMapsProvider({
  children,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEFAULT_API_KEY,
  libraries = [&quot;places&quot;],
}: GoogleMapsProviderProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);
  const [google, setGoogle] = useState<typeof globalThis.google | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if Google Maps script is already loaded
    if (window.google) {
      setIsLoaded(true);
      setGoogle(window.google);
      return;
    }

    // Skip loading if we&apos;re server-side rendering or API key not available
    if (typeof window === &quot;undefined&quot; || !apiKey) {
      return;
    }

    // Load the Google Maps script
    const loadGoogleMapsScript = () => {
      const scriptId = &quot;google-maps-script&quot;;

      // Don't load if script already exists
      if (document.getElementById(scriptId)) {
        return;
      }

      const librariesStr = libraries.join(&quot;,&quot;);
      const script = document.createElement(&quot;script&quot;);
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesStr}&callback=initGoogleMaps&loading=async&v=beta`;
      script.async = true;
      // Remove defer attribute as it&apos;s not needed with async and can cause issues
      script.onerror = () => {
        const error = new Error(&quot;Failed to load Google Maps API script&quot;);
        setLoadError(error);
        toast({
          title: &quot;Error loading maps&quot;,
          description:
            &quot;Could not load Google Maps API. Some features may not work properly.&quot;,
          variant: &quot;destructive&quot;,
        });
      };

      // Create global callback function
      window.initGoogleMaps = () => {
        setIsLoaded(true);
        setGoogle(window.google);
        console.log(&quot;Google Maps API loaded successfully&quot;);
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Clean up
    return () => {
      if (typeof window !== &quot;undefined&quot; && window.initGoogleMaps) {
        // Use delete operator to completely remove the property
        delete window.initGoogleMaps;
      }
    };
  }, [apiKey, libraries, toast]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError, google }}>
      {children}
    </GoogleMapsContext.Provider>
  );
}

// Custom hook to use Google Maps context
export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error(&quot;useGoogleMaps must be used within a GoogleMapsProvider&quot;);
  }
  return context;
}

// Add TypeScript global types for window object
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}
