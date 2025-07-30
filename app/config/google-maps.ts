/**
 * Google Maps API configuration
 *
 * This file centralizes the Google Maps API key configuration to avoid
 * conflicts between different components using different API keys
 */

// Use the environment variable if available, otherwise fallback to the hardcoded key
// Only use in client components with 'use client' directive
export const GOOGLE_MAPS_API_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
  "AIzaSyA3tzNS4vtTfjkVMoB7zYC35NS4lG2DI5U";

// Google Maps API configuration options
export const GOOGLE_MAPS_LIBRARIES = ["places", "marker"];
export const GOOGLE_MAPS_VERSION = "weekly";
export const GOOGLE_MAPS_ID =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || "8bb5ff3cc2e55613"; // Default Map ID for advanced markers

// Centralized Loader configuration to prevent duplicate loading errors
export const getGoogleMapsLoaderConfig = () => ({
  apiKey: GOOGLE_MAPS_API_KEY,
  version: GOOGLE_MAPS_VERSION,
  libraries: GOOGLE_MAPS_LIBRARIES,
});

// Get map options with proper Map ID for advanced markers
export const getGoogleMapsOptions = (
  theme: string | undefined,
  zoom: number = 10,
  showControls: boolean = true,
) => ({
  center: { lat: 37.0902, lng: -95.7129 }, // Default center (USA)
  zoom: zoom,
  mapTypeControl: showControls,
  streetViewControl: false,
  fullscreenControl: showControls,
  zoomControl: showControls,
  mapId: GOOGLE_MAPS_ID, // Add Map ID for advanced markers
  styles:
    theme === "dark"
      ? [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
          },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        ]
      : [],
});
