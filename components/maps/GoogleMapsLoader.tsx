"use client";

import React from "react";
import { LoadScript } from "@react-google-maps/api";

// List of libraries we need to load
const libraries = ["places"] as ("places" | "drawing" | "geometry")[];

interface GoogleMapsLoaderProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that loads the Google Maps API script
 * This ensures it's only loaded once and properly managed
 */
export function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  // The API key is hardcoded here for simplicity, but in a production environment
  // it should be stored in environment variables
  const apiKey = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      libraries={libraries}
      loadingElement={
        <div className="flex items-center justify-center w-full h-full min-h-[300px] bg-muted/20">
          <div className="animate-pulse text-center">
            <div className="h-6 w-24 bg-primary/20 rounded mb-2 mx-auto"></div>
            <div className="h-4 w-32 bg-muted-foreground/20 rounded mx-auto"></div>
          </div>
        </div>
      }
    >
      {children}
    </LoadScript>
  );
}
