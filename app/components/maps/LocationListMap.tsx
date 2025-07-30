&quot;use client&quot;;

import React, { useRef, useEffect, useState, useCallback } from &quot;react&quot;;
import { GoogleMap, InfoWindow } from &quot;@react-google-maps/api&quot;;
import { useTheme } from &quot;next-themes&quot;;
import { MarkerClusterer } from &quot;@googlemaps/markerclusterer&quot;;
import { useGoogleMaps } from &quot;./GoogleMapsContext&quot;;

// Fix for TypeScript errors with the Google Maps API
declare global {
  interface Window {
    google: any;
  }
}

export interface MapLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationType?: string;
  state?: string;
}

interface LocationListMapProps {
  locations: MapLocation[];
  selectedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
  apiKey: string;
  height?: number;
  width?: string | number;
}

// We no longer need to define libraries here as they are handled in GoogleMapsContext

// Map Container Style
const getContainerStyle = (
  width: string | number = &quot;100%&quot;,
  height: number = 500,
) => ({
  width,
  height: `${height}px`,
  borderRadius: &quot;0.5rem&quot;,
});

// Default Map Center (US)
const defaultCenter = {
  lat: 39.8282,
  lng: -98.5795,
};

export function LocationListMap({
  locations = [],
  selectedLocationId = null,
  onMarkerClick,
  apiKey,
  height = 500,
  width = &quot;100%&quot;,
}: LocationListMapProps) {
  // Get Google Maps context first to maintain hook order
  const { isLoaded, loadError, mapId } = useGoogleMaps();
  const { resolvedTheme } = useTheme();
  const [mapTheme, setMapTheme] = useState<&quot;light&quot; | &quot;dark&quot;>(&quot;light&quot;);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(4);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Effect to determine theme
  useEffect(() => {
    const currentTheme = resolvedTheme === &quot;dark&quot; ? &quot;dark&quot; : &quot;light&quot;;
    setMapTheme(currentTheme);

    // Apply theme to map if it&apos;s already loaded
    if (mapRef.current && window.google?.maps) {
      applyMapStyle(mapRef.current, currentTheme);
    }
  }, [resolvedTheme]);

  // Effect to select location based on selectedLocationId
  useEffect(() => {
    if (selectedLocationId) {
      const location = locations.find((loc) => loc.id === selectedLocationId);
      if (
        location &&
        isValidCoordinate(location.latitude, location.longitude)
      ) {
        const latLng = {
          lat: Number(location.latitude),
          lng: Number(location.longitude),
        };

        if (mapRef.current) {
          // Center map on the selected location
          setCenter(latLng);
          setZoom(15);
          mapRef.current.panTo(latLng);
          mapRef.current.setZoom(15);
        }

        // Show info window for this location
        setSelectedLocation(location);
        setInfoOpen(true);
      }
    } else {
      // If no location is selected, fit map to all markers
      if (mapRef.current && locations.length > 0) {
        fitMapToBounds();
      }

      // Close any open info window
      setInfoOpen(false);
      setSelectedLocation(null);
    }
  }, [selectedLocationId, locations]);

  // Map Load Handler
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Apply theme styling to map on load
      if (map && window.google?.maps) {
        applyMapStyle(map, mapTheme);
      }

      // If there are locations, fit the map to show all of them
      if (locations.length > 0) {
        fitMapToBounds();
      }

      // If there&apos;s a selected location, focus on it
      if (selectedLocationId) {
        const location = locations.find((loc) => loc.id === selectedLocationId);
        if (
          location &&
          isValidCoordinate(location.latitude, location.longitude)
        ) {
          const latLng = {
            lat: Number(location.latitude),
            lng: Number(location.longitude),
          };
          map.panTo(latLng);
          map.setZoom(15);
          setSelectedLocation(location);
          setInfoOpen(true);
        }
      }
    },
    [locations, mapTheme, selectedLocationId],
  );

  // Apply Map Styling Based on Theme
  const applyMapStyle = (map: google.maps.Map, theme: &quot;light&quot; | &quot;dark&quot;) => {
    if (theme === &quot;dark&quot;) {
      map.setOptions({
        styles: [
          { elementType: &quot;geometry&quot;, stylers: [{ color: &quot;#242f3e&quot; }] },
          {
            elementType: &quot;labels.text.stroke&quot;,
            stylers: [{ color: &quot;#242f3e&quot; }],
          },
          { elementType: &quot;labels.text.fill&quot;, stylers: [{ color: &quot;#746855&quot; }] },
          {
            featureType: &quot;administrative.locality&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#d59563&quot; }],
          },
          {
            featureType: &quot;poi&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#d59563&quot; }],
          },
          {
            featureType: &quot;poi.park&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#263c3f&quot; }],
          },
          {
            featureType: &quot;poi.park&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#6b9a76&quot; }],
          },
          {
            featureType: &quot;road&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#38414e&quot; }],
          },
          {
            featureType: &quot;road&quot;,
            elementType: &quot;geometry.stroke&quot;,
            stylers: [{ color: &quot;#212a37&quot; }],
          },
          {
            featureType: &quot;road&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#9ca5b3&quot; }],
          },
          {
            featureType: &quot;road.highway&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#746855&quot; }],
          },
          {
            featureType: &quot;road.highway&quot;,
            elementType: &quot;geometry.stroke&quot;,
            stylers: [{ color: &quot;#1f2835&quot; }],
          },
          {
            featureType: &quot;road.highway&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#f3d19c&quot; }],
          },
          {
            featureType: &quot;transit&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#2f3948&quot; }],
          },
          {
            featureType: &quot;transit.station&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#d59563&quot; }],
          },
          {
            featureType: &quot;water&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#17263c&quot; }],
          },
          {
            featureType: &quot;water&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#515c6d&quot; }],
          },
          {
            featureType: &quot;water&quot;,
            elementType: &quot;labels.text.stroke&quot;,
            stylers: [{ color: &quot;#17263c&quot; }],
          },
        ],
      });
    } else {
      map.setOptions({ styles: [] }); // Reset to default light theme
    }
  };

  // Function to fit map to all markers
  const fitMapToBounds = () => {
    if (!mapRef.current || !window.google || locations.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();

    // Add all valid locations to bounds
    locations.forEach((location) => {
      if (isValidCoordinate(location.latitude, location.longitude)) {
        bounds.extend({
          lat: Number(location.latitude),
          lng: Number(location.longitude),
        });
      }
    });

    // If bounds are not empty, fit map to them
    if (!bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds);

      // Adjust zoom if it&apos;s too high after fitting
      window.google.maps.event.addListenerOnce(
        mapRef.current,
        &quot;bounds_changed&quot;,
        () => {
          if (mapRef.current && mapRef.current.getZoom() > 15) {
            mapRef.current.setZoom(15);
          }
        },
      );
    }
  };

  // Function to validate coordinates
  const isValidCoordinate = (lat?: number, lng?: number): boolean => {
    return (
      typeof lat === &quot;number&quot; &&
      typeof lng === &quot;number&quot; &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    );
  };

  // Fix for TypeScript error - type guard for locationType
  const getLocationTypeDisplay = (locationType: string | undefined): string => {
    return locationType ? locationType.replace(/_/g, &quot; &quot;) : &quot;Unknown&quot;;
  };

  // Function to get marker color based on location
  const getMarkerColor = (location: MapLocation): string => {
    if (!location.state && !location.locationType) return &quot;blue&quot;; // Default

    // Color by state (for US state abbreviations)
    const stateColors: { [key: string]: string } = {
      CA: &quot;red&quot;,
      NY: &quot;blue&quot;,
      TX: &quot;green&quot;,
      FL: &quot;orange&quot;,
      IL: &quot;purple&quot;,
      PA: &quot;pink&quot;,
      OH: &quot;cyan&quot;,
      GA: &quot;yellow&quot;,
      NC: &quot;purple&quot;,
      MI: &quot;cyan&quot;,
    };

    // If the location has a state and we have a color for it, use that
    if (location.state && location.state in stateColors) {
      return stateColors[location.state];
    }

    // Color by location type
    if (location.locationType) {
      switch (location.locationType.toLowerCase()) {
        case &quot;business&quot;:
        case &quot;establishment&quot;:
          return &quot;blue&quot;;
        case &quot;venue&quot;:
        case &quot;event_venue&quot;:
          return &quot;purple&quot;;
        case &quot;office&quot;:
        case &quot;corporate_office&quot;:
          return &quot;green&quot;;
        case &quot;retail&quot;:
        case &quot;store&quot;:
        case &quot;retail_store&quot;:
          return &quot;pink&quot;;
        case &quot;warehouse&quot;:
        case &quot;distribution_center&quot;:
          return &quot;orange&quot;;
        case &quot;restaurant&quot;:
          return &quot;cyan&quot;;
        default:
          return &quot;blue&quot;;
      }
    }

    return &quot;blue&quot;; // Default color
  };

  // Handler for marker clicks
  const handleMarkerClick = (location: MapLocation) => {
    // If the parent supplied a click handler, call it
    if (onMarkerClick) {
      onMarkerClick(location.id);
    } else {
      // Otherwise handle internally
      setSelectedLocation(location);
      setInfoOpen(true);

      // Center the map on the selected location if coordinates are valid
      if (
        mapRef.current &&
        isValidCoordinate(location.latitude, location.longitude)
      ) {
        const latLng = {
          lat: Number(location.latitude),
          lng: Number(location.longitude),
        };
        mapRef.current.panTo(latLng);
        mapRef.current.setZoom(15);
      }
    }
  };

  // Handle error state
  if (loadError) {
    return (
      <div className=&quot;p-4 text-red-500&quot;>
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className=&quot;flex items-center justify-center h-full&quot;>
        Loading Google Maps...
      </div>
    );
  }

  // Create markers using a top-level useEffect
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  // Track markers in a ref to avoid state dependencies in useEffect
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  // This effect creates all markers when the map is loaded
  useEffect(() => {
    // Only proceed if map is ready
    if (!mapRef.current || !window.google?.maps) return;

    // Make sure AdvancedMarkerElement is available
    const markerClass = window.google.maps.marker?.AdvancedMarkerElement;
    if (!markerClass) {
      console.error(&quot;AdvancedMarkerElement is not available&quot;);
      return;
    }

    console.log(&quot;Creating markers for&quot;, locations.length, &quot;locations&quot;);

    // Clean up previous markers
    const cleanupMarkers = () => {
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => {
          if (marker) marker.map = null;
        });
        markersRef.current = [];
      }
    };

    cleanupMarkers();

    // Create all markers
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    locations.forEach((location) => {
      if (!isValidCoordinate(location.latitude, location.longitude)) return;

      // Create pin element
      const pinElement = document.createElement(&quot;div&quot;);
      pinElement.className = &quot;location-marker&quot;;
      pinElement.style.width = &quot;24px&quot;;
      pinElement.style.height = &quot;24px&quot;;
      pinElement.style.borderRadius = &quot;50%&quot;;
      pinElement.style.backgroundColor = getMarkerColor(location);
      pinElement.style.border = &quot;2px solid white&quot;;
      pinElement.style.boxShadow = &quot;0 2px 6px rgba(0,0,0,0.3)&quot;;
      pinElement.style.cursor = &quot;pointer&quot;;
      pinElement.title = location.name;

      // Add animation for selected marker
      if (selectedLocationId === location.id) {
        pinElement.animate(
          [
            { transform: &quot;translateY(0)&quot; },
            { transform: &quot;translateY(-10px)&quot; },
            { transform: &quot;translateY(0)&quot; },
          ],
          {
            duration: 1000,
            iterations: Infinity,
          },
        );
      }

      // Create the advanced marker
      const advancedMarker = new markerClass({
        map: mapRef.current,
        position: {
          lat: Number(location.latitude),
          lng: Number(location.longitude),
        },
        content: pinElement,
        title: location.name,
      });

      // Add click listener
      advancedMarker.addListener(&quot;click&quot;, () => {
        handleMarkerClick(location);
      });

      newMarkers.push(advancedMarker);
    });

    // Store markers in the ref for future cleanup instead of using state
    markersRef.current = newMarkers;

    // We can still update the state for rendering, but we don&apos;t depend on it in the effect
    setMarkers(newMarkers);

    // Clean up on unmount using the ref
    return () => {
      if (markersRef.current && markersRef.current.length > 0) {
        markersRef.current.forEach((marker) => {
          if (marker) marker.map = null;
        });
        markersRef.current = [];
      }
    };
    // Remove mapRef.current and other stable functions from dependencies to avoid re-renders
  }, [locations, selectedLocationId, handleMarkerClick]);

  return (
    <GoogleMap
      mapContainerStyle={getContainerStyle(width, height)}
      center={center}
      zoom={zoom}
      onLoad={onMapLoad}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: false,
        fullscreenControl: true,
        mapId: mapId,
      }}
    >
      {/* Render info window for selected location */}
      {infoOpen &&
        selectedLocation &&
        isValidCoordinate(
          selectedLocation.latitude,
          selectedLocation.longitude,
        ) && (
          <InfoWindow
            position={{
              lat: Number(selectedLocation.latitude),
              lng: Number(selectedLocation.longitude),
            }}
            onCloseClick={() => setInfoOpen(false)}
            options={{
              pixelOffset: new window.google.maps.Size(0, -40),
              disableAutoPan: false,
            }}
          >
            <div
              className={`max-w-xs p-2 rounded-md ${
                mapTheme === &quot;dark&quot;
                  ? &quot;bg-gray-800 text-white border border-gray-700&quot;
                  : &quot;bg-white text-gray-900&quot;
              }`}
              style={{
                minWidth: &quot;200px&quot;,
              }}
            >
              <h3 className=&quot;font-medium&quot;>{selectedLocation.name}</h3>
              <p
                className={`text-sm ${mapTheme === &quot;dark&quot; ? &quot;text-gray-300&quot; : &quot;text-gray-600&quot;}`}
              >
                {selectedLocation.address}
              </p>
              {selectedLocation.locationType && (
                <div
                  className={`text-xs mt-1 ${mapTheme === &quot;dark&quot; ? &quot;text-gray-400&quot; : &quot;text-gray-500&quot;}`}
                >
                  Type: {getLocationTypeDisplay(selectedLocation.locationType)}
                </div>
              )}
            </div>
          </InfoWindow>
        )}
    </GoogleMap>
  );
}
