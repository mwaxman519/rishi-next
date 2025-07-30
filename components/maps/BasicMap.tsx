"use client";

import { useEffect, useRef } from "react";
import { LoadScript } from "@react-google-maps/api";

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
      typeof lat === "number" &&
      typeof lng === "number" &&
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
      console.log("Initializing map...");

      // Create map instance
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 39.8282, lng: -98.5795 }, // Default center (US)
        zoom: 4,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
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

      // If there's a selected location, center on it
      if (selectedLocationId) {
        centerOnLocation(selectedLocationId);
      }
      // Otherwise fit all markers in view
      else if (locations.length > 1) {
        fitMapToBounds();
      }

      console.log("Map initialized successfully");
    } catch (error) {
      console.error("Error initializing map:", error);
    }
  };

  // Function to add markers to the map
  const addMarkers = () => {
    if (!mapInstanceRef.current) return;

    console.log("Adding markers for", locations.length, "locations");

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => {
      marker.setMap(null);
    });
    markersRef.current = {};

    // Add new markers
    locations.forEach((location) => {
      if (!isValidCoordinate(location.latitude, location.longitude)) {
        console.log(
          "Skipping location with invalid coordinates:",
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
          strokeColor: "#ffffff",
          strokeWeight: 2,
          scale: 10,
        },
        animation:
          selectedLocationId === location.id
            ? google.maps.Animation.BOUNCE
            : undefined,
      });

      // Add click event
      marker.addListener("click", () => {
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
      <div class="p-2 max-w-[250px]">
        <h3 class="font-medium text-sm">${location.name}</h3>
        <p class="text-xs text-gray-600">${location.address}</p>
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
      console.warn("Cannot center on location - invalid ID or coordinates");
      return;
    }

    console.log("Centering on location:", location.name);

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
        "bounds_changed",
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
    if (!location.state && !location.locationType) return "#3b82f6"; // Default blue

    // Color by state
    const stateColors: { [key: string]: string } = {
      CA: "#ef4444", // Red
      NY: "#3b82f6", // Blue
      TX: "#22c55e", // Green
      FL: "#f59e0b", // Amber
      IL: "#8b5cf6", // Purple
      PA: "#ec4899", // Pink
      OH: "#06b6d4", // Cyan
      GA: "#f97316", // Orange
      NC: "#8b5cf6", // Purple
      MI: "#06b6d4", // Cyan
    };

    // Color by location type
    const typeColors: { [key: string]: string } = {
      business: "#3b82f6", // Blue
      venue: "#8b5cf6", // Purple
      office: "#22c55e", // Green
      warehouse: "#f59e0b", // Amber
      retail: "#ec4899", // Pink
      restaurant: "#06b6d4", // Cyan
      landmark: "#f97316", // Orange
    };

    // Prioritize state colors
    if (location.state && stateColors[location.state]) {
      return stateColors[location.state];
    }

    // Fall back to type colors
    if (location.locationType) {
      const type = location.locationType.toLowerCase().replace("_", "");
      if (typeColors[type]) {
        return typeColors[type];
      }
    }

    return "#3b82f6"; // Default blue
  };

  // Initialize map when component mounts
  useEffect(() => {
    const initializeOnLoad = () => {
      if (window.google && window.google.maps) {
        initializeMap();
      } else {
        console.log("Google Maps not yet loaded, waiting...");
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
      console.log("Locations changed, updating markers");
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
      console.log("Selected location changed to:", selectedLocationId);
      centerOnLocation(selectedLocationId);
    }
  }, [selectedLocationId]);

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      onLoad={() => console.log("Google Maps script loaded")}
    >
      <div
        ref={mapRef}
        style={{
          width: "100%",
          height: `${height}px`,
          borderRadius: "0.375rem", // rounded-md
        }}
        className="relative bg-gray-900"
      />
    </LoadScript>
  );
}
