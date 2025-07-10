"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { LocationData } from "./types";
import { Loader2 } from "lucide-react";

interface GooglePlacesInputProps {
  onPlaceSelected: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

/**
 * A completely redesigned approach to Google Places Autocomplete
 * This uses a visible React-managed input connected to the Google web component
 */
export function GooglePlacesInput({
  onPlaceSelected,
  placeholder = "Search for a location",
  className = "",
}: GooglePlacesInputProps) {
  const { isLoaded, isError } = useGoogleMaps();
  const [logs, setLogs] = useState<string[]>([]);

  // Our input element reference (directly managed by React)
  const inputRef = useRef<HTMLInputElement>(null);
  // Web component container reference
  const wcContainerRef = useRef<HTMLDivElement>(null);

  // Log helper
  const addLog = (message: string) => {
    console.log(`[GooglePlaces] ${message}`);
    setLogs((prev) => [...prev, message]);
  };

  // Setup the Google Places autocomplete when the page loads
  useEffect(() => {
    // Only proceed if Google Maps is loaded and we have our elements
    if (!isLoaded || !inputRef.current || !wcContainerRef.current) {
      return;
    }

    addLog("Setting up Google Places autocomplete...");

    try {
      // Clear any existing content
      while (wcContainerRef.current.firstChild) {
        wcContainerRef.current.removeChild(wcContainerRef.current.firstChild);
      }

      // Create the web component with complete configuration
      const autocomplete = document.createElement("gmp-place-autocomplete");

      // Set the type to 'default' to allow all place types
      // @ts-ignore - TypeScript doesn't know about these properties
      autocomplete.type = "default";

      // Add additional attributes that might help with functionality
      // @ts-ignore
      autocomplete.setAttribute("auto-complete", "on");
      // @ts-ignore
      autocomplete.setAttribute("auto-focus", "true");
      // @ts-ignore
      autocomplete.setAttribute("data-full-width", "true");

      // Connect the web component to our React-managed input
      // @ts-ignore - the input property exists but TypeScript doesn't know about it
      autocomplete.input = inputRef.current;

      // Listen for place selection
      autocomplete.addEventListener("place-changed", (event: any) => {
        const place = event.detail?.place;

        if (!place) {
          addLog("No place data received");
          return;
        }

        addLog(`Selected place: ${place.displayName?.text || "Unnamed place"}`);

        // Create our standardized LocationData object
        const locationData: LocationData = {
          id: place.id || "",
          formattedAddress: place.formattedAddress || "",
          latitude: place.location?.latitude || 0,
          longitude: place.location?.longitude || 0,
          displayName: place.displayName?.text || "",
          addressComponents:
            place.addressComponents?.map((c: any) => ({
              longText: c.longText || "",
              shortText: c.shortText || "",
              types: c.types || [],
            })) || [],
          types: place.types || [],
          businessStatus: place.businessStatus,
          plusCode: place.plusCode,
        };

        // Send the location data to the parent component
        onPlaceSelected(locationData);
      });

      // Hide the web component but keep it functional
      autocomplete.style.display = "none";

      // Add to DOM
      wcContainerRef.current.appendChild(autocomplete);
      addLog("Autocomplete component initialized successfully");
    } catch (error) {
      addLog(
        `Error setting up Places autocomplete: ${(error as Error).message}`,
      );
      console.error("Google Places Autocomplete error:", error);
    }

    // Cleanup on unmount
    return () => {
      addLog("Cleaning up Places autocomplete");
      if (wcContainerRef.current) {
        while (wcContainerRef.current.firstChild) {
          wcContainerRef.current.removeChild(wcContainerRef.current.firstChild);
        }
      }
    };
  }, [isLoaded, onPlaceSelected]);

  return (
    <div className={`w-full ${className}`}>
      {/* VISIBLE SEARCH INPUT - Managed by React */}
      <div className="relative w-full">
        {isLoaded ? (
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            autoComplete="on"
            className="w-full px-4 py-2 border-2 border-blue-700 rounded-md text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontSize: "16px",
              height: "45px",
              width: "100%",
            }}
            onFocus={(e) => {
              console.log("Input focused", e.target);
              // Force a click on the input to help activate the autocomplete
              setTimeout(() => e.target.click(), 100);
            }}
          />
        ) : (
          <div className="w-full flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-md bg-gray-50 text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading places search...</span>
          </div>
        )}

        {/* Hidden container for the web component */}
        <div ref={wcContainerRef} className="hidden"></div>
      </div>

      {/* Error message */}
      {isError && (
        <p className="text-red-500 text-sm mt-1">
          Failed to load Google Maps. Please try again later.
        </p>
      )}

      {/* Debug logs (only in development) */}
      {process.env.NODE_ENV === "development" && logs.length > 0 && (
        <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-32 text-xs font-mono">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      )}
    </div>
  );
}
