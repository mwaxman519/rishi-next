&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { MapPin } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { LocationData } from &quot;./types&quot;;
import { DirectAutocomplete } from &quot;./DirectAutocomplete&quot;;
import { GoogleMap, Marker } from &quot;@react-google-maps/api&quot;;
import { useGoogleMaps } from &quot;./GoogleMapsProvider&quot;;

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
  width: &quot;100%&quot;,
  height: &quot;350px&quot;,
  borderRadius: &quot;0.375rem&quot;, // Matches the rounded-md Tailwind class
};

/**
 * New LocationPicker using the gmp-place-autocomplete Web Component
 *
 * This component combines the PlaceAutocompleteField with a GoogleMap display
 * to let users search for and select locations.
 */
export function NewLocationPicker({
  onLocationSelect,
  className = "&quot;,
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [showTestButton] = useState(process.env.NODE_ENV === &quot;development&quot;);
  const { isLoaded } = useGoogleMaps();

  // Handle place selection from the autocomplete
  const handlePlaceSelected = (place: LocationData) => {
    setSelectedLocation(place);
    onLocationSelect(place);
  };

  // Handle test location (for development)
  const handleTestLocation = () => {
    const testLocation: LocationData = {
      id: &quot;development-mode-place-id&quot;,
      formattedAddress: &quot;123 Main St, San Francisco, CA 94105, USA&quot;,
      latitude: 37.7918936,
      longitude: -122.3978187,
      displayName: &quot;Development Mode Location&quot;,
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
      types: [&quot;street_address&quot;],
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
      <div className=&quot;mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm&quot;>
        <strong>Important Update:</strong> Our location search now uses Google's
        new Web Components (March 2025). We've implemented a simplified direct
        approach that properly displays dropdown suggestions.
      </div>

      {/* Search input */}
      <div className=&quot;mb-4 max-w-md relative&quot;>
        <DirectAutocomplete
          onPlaceSelected={handlePlaceSelected}
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
      <div
        className=&quot;relative border border-input bg-muted/20 rounded-md overflow-hidden&quot;
        style={{ height: &quot;350px&quot; }}
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
    </div>
  );
}
