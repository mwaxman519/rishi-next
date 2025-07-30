"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
const DEFAULT_API_KEY = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";

interface GoogleMapsProviderProps {
  children: React.ReactNode;
  apiKey?: string;
  libraries?: string[];
}

export function GoogleMapsProvider({
  children,
  apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || DEFAULT_API_KEY,
  libraries = ["places"],
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

    // Skip loading if we're server-side rendering or API key not available
    if (typeof window === "undefined" || !apiKey) {
      return;
    }

    // Load the Google Maps script
    const loadGoogleMapsScript = () => {
      const scriptId = "google-maps-script";

      // Don't load if script already exists
      if (document.getElementById(scriptId)) {
        return;
      }

      const librariesStr = libraries.join(",");
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${librariesStr}&callback=initGoogleMaps&loading=async&v=beta`;
      script.async = true;
      // Remove defer attribute as it's not needed with async and can cause issues
      script.onerror = () => {
        const error = new Error("Failed to load Google Maps API script");
        setLoadError(error);
        toast({
          title: "Error loading maps",
          description:
            "Could not load Google Maps API. Some features may not work properly.",
          variant: "destructive",
        });
      };

      // Create global callback function
      window.initGoogleMaps = () => {
        setIsLoaded(true);
        setGoogle(window.google);
        console.log("Google Maps API loaded successfully");
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Clean up
    return () => {
      if (typeof window !== "undefined" && window.initGoogleMaps) {
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
    throw new Error("useGoogleMaps must be used within a GoogleMapsProvider");
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
