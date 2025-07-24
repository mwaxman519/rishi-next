"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

export default function DynamicPlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Search for a location",
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip server-side rendering
    if (typeof window === "undefined") return;

    // Check if we already have Google Maps loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializePlacesAutocomplete();
      setLoaded(true);
      return;
    }

    // Define a global callback function
    window.initAutocomplete = () => {
      initializePlacesAutocomplete();
      setLoaded(true);
    };

    // Handle authentication failures
    window.gm_authFailure = () => {
      console.error("Google Maps authentication failed!");
      setError(
        "Google Maps authentication failed. Your API key may be invalid or restricted.",
      );
    };

    // Get API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError("Google Maps API key is missing!");
      return;
    }

    // Load the Google Maps script via our own proxy API to avoid CSP issues
    const script = document.createElement("script");
    script.src = `/api/maps/proxy-js-api?libraries=places&callback=initAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      console.error("Error loading Google Maps script:", error);
      setError(
        "Failed to load Google Maps script. Check your internet connection and API key.",
      );
    };

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window.initAutocomplete;
      delete window.gm_authFailure;
    };
  }, []);

  const initializePlacesAutocomplete = () => {
    try {
      if (!inputRef.current) return;

      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: ["geocode", "establishment"],
        },
      );

      // Add a listener for place changes
      if (autocompleteRef.current) {
        autocompleteRef.current.addListener("place_changed", () => {
          const autocomplete = autocompleteRef.current;
          if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place && place.place_id) {
              onPlaceSelect(place);
            }
          }
        });
      }
    } catch (err) {
      console.error("Error initializing Places Autocomplete:", err);
      setError(
        `Error initializing Places Autocomplete: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={error ? "border-red-500" : ""}
        disabled={!loaded}
      />

      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}

      {!loaded && !error && (
        <div className="text-gray-500 text-sm mt-1">
          Loading Places Autocomplete...
        </div>
      )}
    </div>
  );
}

// Add TypeScript definitions
declare global {
  interface Window {
    // Use 'any' type to avoid circular reference with 'typeof google'
    google?: any;
    initAutocomplete?: () => void;
    gm_authFailure?: () => void;
  }
}
