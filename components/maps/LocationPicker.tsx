&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { MapPin } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { GoogleMapsProvider } from &quot;./GoogleMapsProvider&quot;;
import { GooglePlacesInput } from &quot;./GooglePlacesInput&quot;;
import { LocationMap } from &quot;./LocationMap&quot;;
import { LocationData } from &quot;./types&quot;;

interface LocationPickerProps {
  onLocationSelect: (data: LocationData) => void;
  className?: string;
}

export function LocationPicker({
  onLocationSelect,
  className = "&quot;,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [showTestButton] = useState(process.env.NODE_ENV === &quot;development&quot;);

  // Handle place selection from the autocomplete
  const handlePlaceSelected = (place: LocationData) => {
    setSelectedLocation(place);
    onLocationSelect(place);
  };

  // Handle test location (for development)
  const handleTestLocation = () => {
    const testLocation: LocationData = {
      formattedAddress: &quot;123 Main St, San Francisco, CA 94105, USA&quot;,
      addressComponents: [
        { longText: &quot;123&quot;, shortText: &quot;123&quot;, types: [&quot;street_number&quot;] },
        { longText: &quot;Main St&quot;, shortText: &quot;Main St&quot;, types: [&quot;route&quot;] },
        {
          longText: &quot;Financial District&quot;,
          shortText: &quot;Financial District&quot;,
          types: [&quot;neighborhood&quot;],
        },
        { longText: &quot;San Francisco&quot;, shortText: &quot;SF&quot;, types: [&quot;locality&quot;] },
        {
          longText: &quot;San Francisco County&quot;,
          shortText: &quot;San Francisco County&quot;,
          types: [&quot;administrative_area_level_2&quot;],
        },
        {
          longText: &quot;California&quot;,
          shortText: &quot;CA&quot;,
          types: [&quot;administrative_area_level_1&quot;],
        },
        { longText: &quot;United States&quot;, shortText: &quot;US&quot;, types: [&quot;country&quot;] },
        { longText: &quot;94105&quot;, shortText: &quot;94105&quot;, types: [&quot;postal_code&quot;] },
      ],
      latitude: 37.7918936,
      longitude: -122.3978187,
      id: &quot;development-mode-place-id&quot;,
      displayName: &quot;Development Mode Location&quot;,
      types: [&quot;street_address&quot;],
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
        <div className=&quot;mb-4 max-w-md relative&quot;>
          <GooglePlacesInput
            onPlaceSelected={(location: LocationData) => {
              // Location data is already in the correct format
              if (location) {
                handlePlaceSelected(location);
              }
            }}
            placeholder=&quot;Search for addresses, businesses, or places...&quot;
          />

          {/* Test location button - only show in development */}
          {showTestButton && (
            <Button
              variant=&quot;default&quot;
              size=&quot;sm&quot;
              type=&quot;button&quot;
              className=&quot;absolute right-0 mt-1 text-xs py-1 px-2&quot;
              onClick={handleTestLocation}
            >
              Use Test Location
            </Button>
          )}
        </div>

        {/* Map */}
        <div className=&quot;relative&quot;>
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
            <div className=&quot;absolute inset-0 flex items-center justify-center z-10 pointer-events-none&quot;>
              <div className=&quot;text-center text-muted-foreground flex flex-col items-center&quot;>
                <MapPin className=&quot;h-12 w-12 mb-3 text-muted-foreground/60&quot; />
                <p className=&quot;text-lg&quot;>Search for a location to see the map</p>
                <p className=&quot;text-sm text-muted-foreground/80 mt-1 max-w-xs">
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
