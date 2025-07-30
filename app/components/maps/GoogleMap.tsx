&quot;use client&quot;;

import { useEffect, useRef, useState } from &quot;react&quot;;
import { Loader } from &quot;@googlemaps/js-api-loader&quot;;

export interface MapLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationType?: string;
  state?: string;
}

interface GoogleMapProps {
  locations: MapLocation[];
  selectedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
  height?: number;
  apiKey: string;
}

/**
 * Google Maps component using the latest recommended Google Maps JavaScript API
 * This follows Google's current best practices
 */
export function GoogleMapComponent({
  locations = [],
  selectedLocationId = null,
  onMarkerClick,
  height = 500,
  apiKey,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  // Refs to store instances
  const markersRef = useRef<{
    [key: string]: google.maps.marker.AdvancedMarkerElement;
  }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  // Initialize the map
  useEffect(() => {
    if (!mapRef.current || isLoaded) return;

    console.log(&quot;Loading Google Maps API...&quot;);

    const loader = new Loader({
      apiKey,
      version: &quot;weekly&quot;,
      libraries: [&quot;places&quot;, &quot;marker&quot;],
    });

    loader
      .load()
      .then(() => {
        console.log(&quot;Google Maps API loaded&quot;);
        setIsLoaded(true);

        if (mapRef.current) {
          // Create map
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 39.8282, lng: -98.5795 }, // Default center (US)
            zoom: 4,
            mapId: &quot;DEMO_MAP_ID&quot;,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          });

          // Create info window
          const infoWindow = new google.maps.InfoWindow();
          infoWindowRef.current = infoWindow;

          setMapInstance(map);
        }
      })
      .catch((err) => {
        console.error(&quot;Error loading Google Maps:&quot;, err);
      });

    return () => {
      // Cleanup
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // Clear all markers from the map
      Object.values(markersRef.current).forEach((marker) => {
        if (marker) {
          marker.map = null;
          // Remove event listeners
          google.maps.event.clearInstanceListeners(marker);
        }
      });

      markersRef.current = {};

      // Clear map listeners
      if (mapInstance) {
        google.maps.event.clearInstanceListeners(mapInstance);
      }
    };
  }, [apiKey]);

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

  // Add markers when map is ready and locations are available
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    console.log(&quot;Adding markers to map&quot;);

    // First close any open info windows
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    // Clear existing markers and their event listeners
    Object.values(markersRef.current).forEach((marker) => {
      if (marker) {
        google.maps.event.clearInstanceListeners(marker);
        marker.map = null;
      }
    });
    markersRef.current = {};

    // Use AdvancedMarkerElement for new markers (the recommended approach)
    const { AdvancedMarkerElement } = google.maps.marker;

    // Keep track of created markers for cleanup
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    // Add markers for each location
    locations.forEach((location) => {
      if (!isValidCoordinate(location.latitude, location.longitude)) {
        console.warn(&quot;Invalid coordinates for location:&quot;, location.name);
        return;
      }

      try {
        // Create marker element
        const markerElement = document.createElement(&quot;div&quot;);
        markerElement.className = &quot;marker-pin&quot;;
        markerElement.innerHTML = `
          <div style=&quot;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${getMarkerColor(location)};
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          &quot;></div>
        `;

        // Create advanced marker
        const marker = new AdvancedMarkerElement({
          map: mapInstance,
          position: {
            lat: location.latitude,
            lng: location.longitude,
          },
          title: location.name,
          content: markerElement,
        });

        // Add click handler
        marker.addListener(&quot;click&quot;, () => {
          if (onMarkerClick) {
            onMarkerClick(location.id);
          } else {
            showInfoWindow(location, marker);
          }
        });

        // Store reference to marker
        markersRef.current[location.id] = marker;
        newMarkers.push(marker);
      } catch (error) {
        console.error(
          &quot;Error creating marker for location:&quot;,
          location.name,
          error,
        );
      }
    });

    // If there&apos;s a selected location, center on it
    if (selectedLocationId) {
      centerOnLocation(selectedLocationId);
    }
    // Otherwise fit all markers
    else if (locations.length > 1) {
      fitMapToBounds();
    }

    // Cleanup function
    return () => {
      // Clean up all markers created in this effect
      newMarkers.forEach((marker) => {
        if (marker) {
          google.maps.event.clearInstanceListeners(marker);
          marker.map = null;
        }
      });

      // Close info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [locations, mapInstance, isLoaded]);

  // Update when selected location changes
  useEffect(() => {
    // Close any existing info window first to prevent DOM issues
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }

    if (mapInstance && selectedLocationId) {
      centerOnLocation(selectedLocationId);
    }

    // Cleanup function
    return () => {
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    };
  }, [selectedLocationId, locations]);

  // Function to display info window
  const showInfoWindow = (
    location: MapLocation,
    marker: google.maps.marker.AdvancedMarkerElement,
  ) => {
    if (!infoWindowRef.current || !mapInstance) return;

    // Create content
    const content = `
      <div class=&quot;p-2 max-w-[250px]&quot;>
        <h3 class=&quot;font-medium text-sm&quot;>${location.name}</h3>
        <p class=&quot;text-xs text-gray-600&quot;>${location.address}</p>
      </div>
    `;

    // Set content and open
    infoWindowRef.current.setContent(content);
    infoWindowRef.current.open({
      map: mapInstance,
      anchor: marker,
    });
  };

  // Function to center map on a location
  const centerOnLocation = (locationId: string) => {
    if (!mapInstance) return;

    const location = locations.find((loc) => loc.id === locationId);
    if (
      !location ||
      !isValidCoordinate(location.latitude, location.longitude)
    ) {
      console.warn(&quot;Cannot center on location - invalid ID or coordinates&quot;);
      return;
    }

    console.log(&quot;Centering on location:&quot;, location.name);

    // Center and zoom
    mapInstance.setCenter({
      lat: location.latitude,
      lng: location.longitude,
    });
    mapInstance.setZoom(15);

    // Show info window
    const marker = markersRef.current[locationId];
    if (marker) {
      showInfoWindow(location, marker);
    }
  };

  // Function to fit map to all markers
  const fitMapToBounds = () => {
    if (!mapInstance) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidMarkers = false;

    locations.forEach((location) => {
      if (isValidCoordinate(location.latitude, location.longitude)) {
        bounds.extend({
          lat: location.latitude,
          lng: location.longitude,
        });
        hasValidMarkers = true;
      }
    });

    if (hasValidMarkers) {
      mapInstance.fitBounds(bounds);

      // Adjust zoom level
      google.maps.event.addListenerOnce(mapInstance, &quot;bounds_changed&quot;, () => {
        if (mapInstance) {
          const zoom = mapInstance.getZoom();
          if (zoom !== undefined && zoom > 15) {
            mapInstance.setZoom(15);
          }
        }
      });
    }
  };

  // Get marker color based on location state or type
  const getMarkerColor = (location: MapLocation): string => {
    if (!location.state && !location.locationType) return &quot;#3b82f6&quot;; // Default blue

    // Color by state
    const stateColors: { [key: string]: string } = {
      CA: &quot;#ef4444&quot;, // Red
      NY: &quot;#3b82f6&quot;, // Blue
      TX: &quot;#22c55e&quot;, // Green
      FL: &quot;#f59e0b&quot;, // Amber
      IL: &quot;#8b5cf6&quot;, // Purple
      PA: &quot;#ec4899&quot;, // Pink
      OH: &quot;#06b6d4&quot;, // Cyan
      GA: &quot;#f97316&quot;, // Orange
      NC: &quot;#8b5cf6&quot;, // Purple
      MI: &quot;#06b6d4&quot;, // Cyan
    };

    // Color by location type
    const typeColors: { [key: string]: string } = {
      business: &quot;#3b82f6&quot;, // Blue
      venue: &quot;#8b5cf6&quot;, // Purple
      office: &quot;#22c55e&quot;, // Green
      warehouse: &quot;#f59e0b&quot;, // Amber
      retail: &quot;#ec4899&quot;, // Pink
      restaurant: &quot;#06b6d4&quot;, // Cyan
      landmark: &quot;#f97316&quot;, // Orange
    };

    // Prioritize state colors
    if (location.state && location.state in stateColors) {
      return stateColors[location.state];
    }

    // Fall back to type colors
    if (location.locationType) {
      const type = location.locationType.toLowerCase().replace(&quot;_&quot;, "&quot;);
      if (type in typeColors) {
        return typeColors[type];
      }
    }

    return &quot;#3b82f6&quot;; // Default blue
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: &quot;100%&quot;,
        height: `${height}px`,
        borderRadius: &quot;0.375rem&quot;,
      }}
      className=&quot;bg-gray-900&quot;
    >
      {!isLoaded && (
        <div className=&quot;flex items-center justify-center h-full w-full text-gray-400">
          Loading map...
        </div>
      )}
    </div>
  );
}
