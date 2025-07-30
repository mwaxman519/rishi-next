&quot;use client&quot;;

import React, { useContext, useCallback } from &quot;react&quot;;
import { GoogleMap, InfoWindow } from &quot;@react-google-maps/api&quot;;
import { Loader2, MapPin } from &quot;lucide-react&quot;;
import { useTheme } from &quot;next-themes&quot;;
import { GoogleMapsContext } from &quot;./GoogleMapsContext&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;

interface LocationMapProps {
  locations: Array<{
    latitude: number;
    longitude: number;
    name: string;
    address?: string;
    city?: string;
    state?: string;
  }>;
  height?: string | number;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
  selectedLocation?: any;
  isInfoOpen?: boolean;
  onInfoClose?: () => void;
  onMarkerClick?: (location: any) => void;
}

// Default map styles
const mapContainerStyle = {
  width: &quot;100%&quot;,
  height: &quot;100%&quot;,
  borderRadius: &quot;0.375rem&quot;,
};

// Default center (US)
const defaultCenter = {
  lat: 37.0902,
  lng: -95.7129,
};

export function LocationMap({
  locations = [],
  height = &quot;500px&quot;,
  className = "&quot;,
  onMapLoad,
  selectedLocation,
  isInfoOpen = false,
  onInfoClose = () => {},
  onMarkerClick,
}: LocationMapProps) {
  const { theme, resolvedTheme } = useTheme();
  const { isLoaded, loadError, mapId } = useContext(GoogleMapsContext);

  // Custom container style with dynamic height
  const containerStyle = {
    ...mapContainerStyle,
    height: typeof height === &quot;number&quot; ? `${height}px` : height,
  };

  // Handle map load
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      if (onMapLoad) onMapLoad(map);

      // Create markers for all locations
      locations.forEach((location) => {
        if (!location.latitude || !location.longitude) return;

        const marker = new google.maps.Marker({
          position: { lat: location.latitude, lng: location.longitude },
          map,
          title: location.name,
        });

        // Add click event to marker
        marker.addListener(&quot;click&quot;, () => {
          if (onMarkerClick) onMarkerClick(location);
        });
      });

      // If there are markers, fit bounds
      if (locations.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((location) => {
          if (location.latitude && location.longitude) {
            bounds.extend({ lat: location.latitude, lng: location.longitude });
          }
        });
        map.fitBounds(bounds);

        // Don't zoom in too far for a single location
        const zoom = map.getZoom();
        if (zoom !== undefined && zoom > 12 && locations.length <= 2) {
          map.setZoom(12);
        }
      }
    },
    [locations, onMapLoad, onMarkerClick],
  );

  return (
    <div
      className={`relative border border-input bg-muted/20 rounded-md overflow-hidden ${className}`}
      style={{ height: containerStyle.height }}
    >
      {/* Display error message if Google Maps failed to load */}
      {loadError && (
        <div className=&quot;absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20 p-4 text-center&quot;>
          <div className=&quot;text-destructive mb-2&quot;>
            Failed to load Google Maps
          </div>
          <p className=&quot;text-sm text-muted-foreground&quot;>
            Please refresh the page and try again
          </p>
        </div>
      )}

      {/* Only render GoogleMap when Maps API is fully loaded */}
      {isLoaded && !loadError ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={4}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            mapId: mapId || null,
          }}
          onLoad={handleMapLoad}
        >
          {/* Info window for the currently selected location */}
          {isInfoOpen && selectedLocation && (
            <InfoWindow
              position={{
                lat: selectedLocation.latitude,
                lng: selectedLocation.longitude,
              }}
              onCloseClick={onInfoClose}
            >
              <div className=&quot;max-w-[300px] rounded-md bg-white p-4&quot;>
                <h3 className=&quot;text-lg font-medium text-gray-900&quot;>
                  {selectedLocation.name}
                </h3>
                {selectedLocation.address && (
                  <p className=&quot;text-sm text-gray-600 mt-1&quot;>
                    {selectedLocation.address}
                  </p>
                )}
                {selectedLocation.city && selectedLocation.state && (
                  <p className=&quot;text-sm text-gray-600&quot;>
                    {selectedLocation.city}, {selectedLocation.state}
                  </p>
                )}
                <div className=&quot;mt-3 flex space-x-2&quot;>
                  <Button
                    size=&quot;sm&quot;
                    variant=&quot;default&quot;
                    onClick={() =>
                      window.open(`/locations/${selectedLocation.id}`)
                    }
                  >
                    View Details
                  </Button>
                  <Button size=&quot;sm&quot; variant=&quot;outline&quot; onClick={onInfoClose}>
                    Close
                  </Button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <div className=&quot;absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-2&quot; />
          <p className=&quot;text-sm text-muted-foreground&quot;>Loading map...</p>
        </div>
      )}

      {/* Location count badge */}
      <div className=&quot;absolute top-4 right-4 z-10&quot;>
        <Badge
          variant=&quot;outline&quot;
          className=&quot;bg-background/80 backdrop-blur-sm shadow-sm&quot;
        >
          <MapPin className=&quot;w-3 h-3 mr-1&quot; />
          {locations.length} {locations.length === 1 ? &quot;Location&quot; : &quot;Locations"}
        </Badge>
      </div>
    </div>
  );
}
