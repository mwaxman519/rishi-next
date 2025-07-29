"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

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

    console.log("Loading Google Maps API...");

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "marker"],
    });

    loader
      .load()
      .then(() => {
        console.log("Google Maps API loaded");
        setIsLoaded(true);

        if (mapRef.current) {
          // Create map
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 39.8282, lng: -98.5795 }, // Default center (US)
            zoom: 4,
            mapId: "DEMO_MAP_ID",
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
        console.error("Error loading Google Maps:", err);
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

  // Add markers when map is ready and locations are available
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;

    console.log("Adding markers to map");

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
        console.warn("Invalid coordinates for location:", location.name);
        return;
      }

      try {
        // Create marker element
        const markerElement = document.createElement("div");
        markerElement.className = "marker-pin";
        markerElement.innerHTML = `
          <div style="
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: ${getMarkerColor(location)};
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>
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
        marker.addListener("click", () => {
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
          "Error creating marker for location:",
          location.name,
          error,
        );
      }
    });

    // If there's a selected location, center on it
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
      <div class="p-2 max-w-[250px]">
        <h3 class="font-medium text-sm">${location.name}</h3>
        <p class="text-xs text-gray-600">${location.address}</p>
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
      console.warn("Cannot center on location - invalid ID or coordinates");
      return;
    }

    console.log("Centering on location:", location.name);

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
      google.maps.event.addListenerOnce(mapInstance, "bounds_changed", () => {
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
    if (location.state && location.state in stateColors) {
      return stateColors[location.state];
    }

    // Fall back to type colors
    if (location.locationType) {
      const type = location.locationType.toLowerCase().replace("_", "");
      if (type in typeColors) {
        return typeColors[type];
      }
    }

    return "#3b82f6"; // Default blue
  };

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: `${height}px`,
        borderRadius: "0.375rem",
      }}
      className="bg-gray-900"
    >
      {!isLoaded && (
        <div className="flex items-center justify-center h-full w-full text-gray-400">
          Loading map...
        </div>
      )}
    </div>
  );
}
