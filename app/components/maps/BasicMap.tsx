&quot;use client&quot;;

import { useEffect, useRef } from &quot;react&quot;;
import { LoadScript } from &quot;@react-google-maps/api&quot;;

export interface BasicMapLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationType?: string;
  state?: string;
}

interface BasicMapProps {
  locations: BasicMapLocation[];
  selectedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
  height?: number;
  apiKey: string;
}

/**
 * A super simple map component using direct Google Maps JavaScript API
 */
export function BasicMap({
  locations = [],
  selectedLocationId = null,
  onMarkerClick,
  height = 500,
  apiKey,
}: BasicMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const isInitializedRef = useRef<boolean>(false);

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

  // Function to initialize the map
  const initializeMap = () => {
    if (!mapRef.current || isInitializedRef.current) return;

    try {
      console.log(&quot;Initializing map...&quot;);

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 39.8282, lng: -98.5795 }, // Default center (US)
        zoom: 4,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: &quot;poi&quot;,
            elementType: &quot;labels&quot;,
            stylers: [{ visibility: &quot;off&quot; }],
          },
        ],
      });

      // Create info window
      const infoWindow = new google.maps.InfoWindow();

      // Save references
      mapInstanceRef.current = map;
      infoWindowRef.current = infoWindow;
      isInitializedRef.current = true;

      // Add markers for all locations
      addMarkers();

      // If there&apos;s a selected location, center on it
      if (selectedLocationId) {
        centerOnLocation(selectedLocationId);
      }
      // Otherwise fit all markers in view
      else if (locations.length > 1) {
        fitMapToBounds();
      }

      console.log(&quot;Map initialized successfully&quot;);
    } catch (error) {
      console.error(&quot;Error initializing map:&quot;, error);
    }
  };

  // Function to add markers to the map
  const addMarkers = () => {
    if (!mapInstanceRef.current) return;

    console.log(&quot;Adding markers for&quot;, locations.length, &quot;locations&quot;);

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = {};

    // Add new markers
    locations.forEach((location) => {
      if (!isValidCoordinate(location.latitude, location.longitude)) {
        console.log(
          &quot;Skipping location with invalid coordinates:&quot;,
          location.name,
        );
        return;
      }

      const markerColor = getMarkerColor(location);

      const marker = new google.maps.Marker({
        position: {
          lat: location.latitude,
          lng: location.longitude,
        },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: &quot;#ffffff&quot;,
          strokeWeight: 2,
          scale: 10,
        },
        animation:
          selectedLocationId === location.id
            ? google.maps.Animation.BOUNCE
            : undefined,
      });

      // Add click event
      marker.addListener(&quot;click&quot;, () => {
        if (onMarkerClick) {
          onMarkerClick(location.id);
        } else {
          showInfoWindow(location, marker);
        }
      });

      // Store reference
      markersRef.current[location.id] = marker;
    });
  };

  // Function to show info window for a location
  const showInfoWindow = (
    location: BasicMapLocation,
    marker: google.maps.Marker,
  ) => {
    if (!infoWindowRef.current) return;

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
      map: mapInstanceRef.current,
      anchor: marker,
    });
  };

  // Function to center map on a specific location
  const centerOnLocation = (locationId: string) => {
    if (!mapInstanceRef.current) return;

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
    mapInstanceRef.current.setCenter({
      lat: location.latitude,
      lng: location.longitude,
    });
    mapInstanceRef.current.setZoom(15);

    // Show info window
    const marker = markersRef.current[locationId];
    if (marker) {
      showInfoWindow(location, marker);
    }

    // Update marker animations
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setAnimation(
        id === locationId ? google.maps.Animation.BOUNCE : null,
      );
    });
  };

  // Function to fit map to all markers
  const fitMapToBounds = () => {
    if (!mapInstanceRef.current || Object.keys(markersRef.current).length === 0)
      return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidMarkers = false;

    Object.values(markersRef.current).forEach((marker) => {
      const position = marker.getPosition();
      if (position) {
        bounds.extend(position);
        hasValidMarkers = true;
      }
    });

    if (hasValidMarkers) {
      mapInstanceRef.current.fitBounds(bounds);

      // Adjust zoom level to avoid excessive zooming
      google.maps.event.addListenerOnce(
        mapInstanceRef.current,
        &quot;bounds_changed&quot;,
        () => {
          if (mapInstanceRef.current) {
            const zoom = mapInstanceRef.current.getZoom();
            if (zoom && zoom > 15) {
              mapInstanceRef.current.setZoom(15);
            }
          }
        },
      );
    }
  };

  // Get marker color based on location state or type
  const getMarkerColor = (location: BasicMapLocation): string => {
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
    if (location.state && stateColors[location.state]) {
      return stateColors[location.state];
    }

    // Fall back to type colors
    if (location.locationType) {
      const type = location.locationType.toLowerCase().replace(&quot;_&quot;, "&quot;);
      if (typeColors[type]) {
        return typeColors[type];
      }
    }

    return &quot;#3b82f6&quot;; // Default blue
  };

  // Initialize map when component mounts
  useEffect(() => {
    const initializeOnLoad = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        console.log(&quot;Google Maps not yet loaded, waiting...&quot;);
        setTimeout(initializeOnLoad, 100);
      }
    };

    initializeOnLoad();

    // Cleanup
    return () => {
      Object.values(markersRef.current).forEach((marker) => {
        marker.setMap(null);
      });
      markersRef.current = {};
      isInitializedRef.current = false;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (isInitializedRef.current) {
      console.log(&quot;Locations changed, updating markers&quot;);
      addMarkers();

      if (selectedLocationId) {
        centerOnLocation(selectedLocationId);
      } else if (locations.length > 1) {
        fitMapToBounds();
      }
    }
  }, [locations]);

  // Update map when selected location changes
  useEffect(() => {
    if (isInitializedRef.current && selectedLocationId) {
      console.log(&quot;Selected location changed to:&quot;, selectedLocationId);
      centerOnLocation(selectedLocationId);
    }
  }, [selectedLocationId]);

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      onLoad={() => console.log(&quot;Google Maps script loaded&quot;)}
    >
      <div
        ref={mapRef}
        style={{
          width: &quot;100%&quot;,
          height: `${height}px`,
          borderRadius: &quot;0.375rem&quot;, // rounded-md
        }}
        className=&quot;relative bg-gray-900"
      />
    </LoadScript>
  );
}
