"use client";

import React, { useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleMapsProvider } from "./GoogleMapsProvider";
import { GooglePlacesInput } from "./GooglePlacesInput";
import { LocationMap } from "./LocationMap";
import { LocationData } from "./types";

interface LocationPickerProps {
  onLocationSelect: (data: LocationData) => void;
  className?: string;
}

export function LocationPicker({
  onLocationSelect,
  className = "",
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [showTestButton] = useState(process.env.NODE_ENV === "development");

  // Handle place selection from the autocomplete
  const handlePlaceSelected = (place: LocationData) => {
    setSelectedLocation(place);
    onLocationSelect(place);
  };

  // Handle test location (for development)
  const handleTestLocation = () => {
    const testLocation: LocationData = {
      formattedAddress: "123 Main St, San Francisco, CA 94105, USA",
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
      latitude: 37.7918936,
      longitude: -122.3978187,
      id: "development-mode-place-id",
      displayName: "Development Mode Location",
      types: ["street_address"],
      businessStatus: null,
      plusCode: null,
    };

    setSelectedLocation(testLocation);
    onLocationSelect(testLocation);
  };

  return (
    <div className={className}>
      <GoogleMapsProvider>
        {/* Search input */}
        <div className="mb-4 max-w-md relative">
          <GooglePlacesInput
            onPlaceSelected={(location: LocationData) => {
              // Location data is already in the correct format
              if (location) {
                handlePlaceSelected(location);
              }
            }}
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
        <div className="relative">
          <LocationMap
            location={
              selectedLocation
                ? {
                    latitude: selectedLocation.latitude,
                    longitude: selectedLocation.longitude,
                    name: selectedLocation.displayName,
                    address: selectedLocation.formattedAddress,
                  }
                : null
            }
            height={350}
          />

          {/* Empty state message - displayed outside LocationMap */}
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
      </GoogleMapsProvider>
    </div>
  );
}
