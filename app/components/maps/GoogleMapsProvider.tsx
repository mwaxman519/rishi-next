"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { GoogleMapsContext } from "./types";

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";

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
    typeof window !== "undefined" && !!window.google && !!window.google.maps
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
      console.log("Maps API already loaded in provider");
      setGoogleMapsState({ isLoaded: true, isError: false });
      return;
    }

    // Don't load if we're in SSR
    if (typeof window === "undefined") {
      return;
    }

    console.log(
      "Loading Google Maps API with Web Components and Places Library...",
    );

    // Create a unique ID for the script to avoid duplicates
    const scriptId = "google-maps-script";

    // Check if script already exists
    if (document.getElementById(scriptId)) {
      console.log("Script tag already exists, waiting for it to load...");
      return;
    }

    // Load Google Maps JavaScript API with places library
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&v=weekly&libraries=places`;
    script.defer = true;
    script.async = true;

    // Handle loading success
    script.onload = () => {
      console.log("✅ Google Maps API loaded successfully in provider");
      setGoogleMapsState({ isLoaded: true, isError: false });
    };

    // Handle loading errors
    script.onerror = (e) => {
      console.error("❌ Error loading Google Maps API:", e);
      setGoogleMapsState({
        isLoaded: false,
        isError: true,
        errorMessage: "Failed to load Google Maps API",
      });
    };

    document.head.appendChild(script);

    // Poll for Google Maps API to be loaded in case the event handlers don't fire
    const checkInterval = setInterval(() => {
      if (isGoogleMapsLoaded()) {
        console.log("Maps API loaded (detected by interval check)");
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
