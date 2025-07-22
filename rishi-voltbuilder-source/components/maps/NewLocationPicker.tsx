"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationData } from "./types";
import { DirectAutocomplete } from "./DirectAutocomplete";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsProvider";

interface LocationPickerProps {
  onLocationSelect: (data: LocationData) => void;
  className?: string;
}

// Default center (US)
const defaultCenter = {
  lat: 37.0902,
  lng: -95.7129,
};

// Default map styles
const mapContainerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "0.375rem", // Matches the rounded-md Tailwind class
};

/**
 * New LocationPicker using the gmp-place-autocomplete Web Component
 *
 * This component combines the PlaceAutocompleteField with a GoogleMap display
 * to let users search for and select locations.
 */
export function NewLocationPicker({
  onLocationSelect,
  className = "",
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [showTestButton] = useState(process.env.NODE_ENV === "development");
  const { isLoaded } = useGoogleMaps();

  // Handle place selection from the autocomplete
  const handlePlaceSelected = (place: LocationData) => {
    setSelectedLocation(place);
    onLocationSelect(place);
  };

  // Handle test location (for development)
  const handleTestLocation = () => {
    const testLocation: LocationData = {
      id: "development-mode-place-id",
      formattedAddress: "123 Main St, San Francisco, CA 94105, USA",
      latitude: 37.7918936,
      longitude: -122.3978187,
      displayName: "Development Mode Location",
      addressComponents: [
        { longText: "123", shortText: "123", types: ["street_number"] },
        { longText: "Main St", shortText: "Main St", types: ["route"] },
        {
          longText: "Financial District",
          shortText: "Financial District",
          types: ["neighborhood"],
        },
        { longText: "San Francisco", shortText: "SF", types: ["locality"] },
        {
          longText: "San Francisco County",
          shortText: "San Francisco County",
          types: ["administrative_area_level_2"],
        },
        {
          longText: "California",
          shortText: "CA",
          types: ["administrative_area_level_1"],
        },
        { longText: "United States", shortText: "US", types: ["country"] },
        { longText: "94105", shortText: "94105", types: ["postal_code"] },
      ],
      types: ["street_address"],
    };

    setSelectedLocation(testLocation);
    onLocationSelect(testLocation);
  };

  // Center point for the map
  const center = selectedLocation
    ? { lat: selectedLocation.latitude, lng: selectedLocation.longitude }
    : defaultCenter;

  // Zoom level - higher zoom when location is selected
  const zoom = selectedLocation ? 15 : 4;

  return (
    <div className={className}>
      {/* Success banner */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
        <strong>Important Update:</strong> Our location search now uses Google's
        new Web Components (March 2025). We've implemented a simplified direct
        approach that properly displays dropdown suggestions.
      </div>

      {/* Search input */}
      <div className="mb-4 max-w-md relative">
        <DirectAutocomplete
          onPlaceSelected={handlePlaceSelected}
          placeholder="Search for addresses, businesses, or places..."
        />

        {/* Test location button - only show in development */}
        {showTestButton && (
          <Button
            variant="default"
            size="sm"
            type="button"
            className="absolute right-0 mt-1 text-xs py-1 px-2"
            onClick={handleTestLocation}
          >
            Use Test Location
          </Button>
        )}
      </div>

      {/* Map */}
      <div
        className="relative border border-input bg-muted/20 rounded-md overflow-hidden"
        style={{ height: "350px" }}
      >
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={zoom}
            options={{
              disableDefaultUI: false,
              zoomControl: true,
              streetViewControl: false,
              mapTypeControl: false,
              fullscreenControl: false,
            }}
          >
            {/* Display marker when a location is selected */}
            {selectedLocation && (
              <Marker
                position={{
                  lat: selectedLocation.latitude,
                  lng: selectedLocation.longitude,
                }}
                animation={window.google?.maps?.Animation?.DROP}
              />
            )}
          </GoogleMap>
        )}

        {/* Empty state message */}
        {!selectedLocation && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center text-muted-foreground flex flex-col items-center">
              <MapPin className="h-12 w-12 mb-3 text-muted-foreground/60" />
              <p className="text-lg">Search for a location to see the map</p>
              <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">
                Try searching for businesses, landmarks, or addresses
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
