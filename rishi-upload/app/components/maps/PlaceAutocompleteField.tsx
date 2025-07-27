"use client";

import React, { useRef, useEffect, useState, useId } from "react";
import { useGoogleMaps } from "./GoogleMapsProvider";
import { LocationData } from "./types";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PlaceAutocompleteFieldProps {
  onPlaceSelected: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?:
    | "default"
    | "geocode"
    | "address"
    | "establishment"
    | "regions"
    | "cities";
}

/**
 * PlaceAutocompleteField component using Google's new Web Component approach
 *
 * This component wraps the `gmp-place-autocomplete` Web Component in a React-friendly way,
 * using the new Google Maps API as of March 2025.
 */
export function PlaceAutocompleteField({
  onPlaceSelected,
  placeholder = "Search for a location",
  className = "",
  disabled = false,
  type = "default",
}: PlaceAutocompleteFieldProps) {
  const { isLoaded, isError } = useGoogleMaps();
  const autocompleteRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState("");
  const inputId = useId(); // Generate unique ID for input association

  // Debug console
  const debugConsole = {
    log: (...args: any[]) => console.log("[PlaceAutocompleteField]", ...args),
    error: (...args: any[]) =>
      console.error("[PlaceAutocompleteField]", ...args),
    warn: (...args: any[]) => console.warn("[PlaceAutocompleteField]", ...args),
  };

  // Setup autocomplete once Google Maps is loaded
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return;

    if (!isLoaded || !inputRef.current) {
      debugConsole.log(
        "Waiting for Maps API to load or input to be available...",
      );
      return;
    }

    debugConsole.log("Maps API loaded, initializing autocomplete...");
    let handlePlaceChanged: ((event: any) => void) | null = null;

    // Create the autocomplete web component if it doesn't exist
    if (!autocompleteRef.current) {
      try {
        // Check if the required APIs are available
        if (!window.google?.maps) {
          debugConsole.error("Google Maps API not loaded properly");
          throw new Error("Google Maps API not loaded");
        }

        debugConsole.log("Creating web component...");

        // Create the autocomplete element with a specific ID based on the React useId
        const autocompleteId = `place-autocomplete-${inputId}`;

        // Create the element - make sure to use the correct element name
        const autocomplete = document.createElement("gmp-place-autocomplete");
        autocomplete.id = autocompleteId;

        // Set properties
        // @ts-ignore - Web Component properties
        autocomplete.type = type;

        debugConsole.log("Connecting input to web component...");

        // Connect to input - this is the most critical part
        // @ts-ignore - Web Component properties
        autocomplete.input = inputRef.current;

        // Set additional attributes for debugging
        autocomplete.setAttribute(
          "data-input-id",
          inputRef.current.id || "unknown-input",
        );

        // Add event listener for place selection
        handlePlaceChanged = (event: any) => {
          debugConsole.log("Place changed event received", event);

          try {
            const place = event.detail?.place;
            if (!place) {
              debugConsole.warn("No place data in event");
              return;
            }

            debugConsole.log("Place selected:", place);

            // Map the Google Place object to our LocationData format
            const locationData: LocationData = {
              id: place.id,
              formattedAddress: place.formattedAddress,
              latitude: place.location?.latitude,
              longitude: place.location?.longitude,
              displayName: place.displayName?.text,
              addressComponents: place.addressComponents || [],
              types: place.types || [],
              businessStatus: place.businessStatus,
              plusCode: place.plusCode,
            };

            // Update the input value to the display name
            setInputValue(
              locationData.displayName || locationData.formattedAddress,
            );

            // Notify parent component
            onPlaceSelected(locationData);
          } catch (error) {
            debugConsole.error("Error handling place selection:", error);
          }
        };

        // Event listener registration
        debugConsole.log("Adding place-changed event listener");
        autocomplete.addEventListener("place-changed", handlePlaceChanged);

        // Handle request denied event
        autocomplete.addEventListener("request-denied", (e: any) => {
          debugConsole.error("Place request denied:", e);
        });

        // Hide the web component - it should not be visible in the UI
        // It only needs to exist in the DOM to connect to our input
        autocomplete.style.display = "none";

        document.body.appendChild(autocomplete);

        debugConsole.log(`Web component created with ID: ${autocompleteId}`);

        // Store the reference
        autocompleteRef.current = autocomplete;
      } catch (error) {
        debugConsole.error("Error creating web component:", error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (autocompleteRef.current) {
        try {
          debugConsole.log("Cleaning up web component...");

          // Remove event listeners
          if (handlePlaceChanged) {
            autocompleteRef.current.removeEventListener(
              "place-changed",
              handlePlaceChanged,
            );
          }

          // Remove from DOM
          document.body.removeChild(autocompleteRef.current);
          debugConsole.log("Web component removed");
        } catch (error) {
          debugConsole.error("Error removing web component:", error);
        }
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onPlaceSelected, type, inputId]);

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Clear input
  const clearInput = () => {
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-muted-foreground"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </svg>
        </div>

        {/* Input field */}
        <Input
          ref={inputRef}
          id={`place-input-${inputId}`}
          type="text"
          className="pl-10 pr-10 h-12 focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled || !isLoaded || isError}
          aria-label="Search for a location"
        />

        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 inline-flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={disabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
            <span className="sr-only">Clear search</span>
          </button>
        )}

        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Error message */}
      {isError && (
        <div className="mt-2 text-sm text-destructive">
          Failed to load Google Maps API. Please try again later.
        </div>
      )}
    </div>
  );
}
