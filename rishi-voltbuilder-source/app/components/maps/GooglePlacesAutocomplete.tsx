"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Input } from "@/components/ui/input";

interface GooglePlacesAutocompleteProps {
  apiKey: string;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Google Places Autocomplete component using the latest recommended API
 */
export function GooglePlacesAutocomplete({
  apiKey,
  onPlaceSelect,
  placeholder = "Search for a place...",
  className = "",
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps JavaScript API
  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        console.log("Google Maps Places API loaded");
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("Error loading Google Maps Places API:", err);
      });
  }, [apiKey]);

  // Initialize autocomplete when API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      console.log("Initializing Places Autocomplete");

      // Initialize the autocomplete
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: [
            "address_components",
            "geometry",
            "name",
            "formatted_address",
          ],
          types: ["establishment", "geocode"],
        },
      );

      // Store reference
      autocompleteRef.current = autocomplete;

      // Add listener for place selection
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        console.log("Place selected:", place);

        if (onPlaceSelect && place) {
          onPlaceSelect(place);
        }
      });

      console.log("Places Autocomplete initialized successfully");
    } catch (error) {
      console.error("Error initializing Places Autocomplete:", error);
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onPlaceSelect]);

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className="w-full bg-gray-800 border-gray-700 text-white"
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          Loading...
        </div>
      )}
    </div>
  );
}
