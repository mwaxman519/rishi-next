"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsContext";

export interface MapLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  locationType?: string;
  state?: string;
}

interface MultiLocationMapProps {
  locations: MapLocation[];
  selectedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
  height?: number;
  zoom?: number;
  apiKey?: string;
}

export function MultiLocationMap({
  locations = [],
  selectedLocationId = null,
  onMarkerClick,
  height = 500,
  zoom = 10,
  apiKey = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg", // Default API key
}: MultiLocationMapProps) {
  // Get Google Maps context first
  const { isLoaded, loadError, mapId } = useGoogleMaps();

  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapIdle, setMapIdle] = useState<boolean>(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({});
  const locationMapRef = useRef<{ [key: string]: MapLocation }>({});

  // Track if this is initial render or an update
  const initialRenderRef = useRef(true);
  const idleListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Initialize the location map
  useEffect(() => {
    // Create a map of location IDs to their data for quick lookup
    const locationMap: { [key: string]: MapLocation } = {};
    locations.forEach((location) => {
      locationMap[location.id] = location;
    });
    locationMapRef.current = locationMap;
  }, [locations]);

  // Define map container style
  const containerStyle = {
    width: "100%",
    height: `${height}px`,
  };

  // Calculate center based on selected location or average of all locations
  const getMapCenter = useCallback(() => {
    // Find selected location first as priority
    if (selectedLocationId) {
      const selectedLocation = locations.find(
        (loc) => loc.id === selectedLocationId,
      );
      console.log(
        "Finding center for selected location:",
        selectedLocationId,
        selectedLocation,
      );

      if (
        selectedLocation &&
        typeof selectedLocation.latitude === "number" &&
        typeof selectedLocation.longitude === "number" &&
        !isNaN(selectedLocation.latitude) &&
        !isNaN(selectedLocation.longitude)
      ) {
        console.log(
          "Using selected location for center:",
          selectedLocation.latitude,
          selectedLocation.longitude,
        );
        return {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        };
      }
    }

    // If no selected location or it's invalid, check all locations
    if (locations.length === 0) {
      console.log("No locations, using default center");
      return { lat: 39.8282, lng: -98.5795 }; // Center of US
    }

    // Filter to valid locations only
    const validLocations = locations.filter(
      (loc) =>
        typeof loc.latitude === "number" &&
        typeof loc.longitude === "number" &&
        !isNaN(loc.latitude) &&
        !isNaN(loc.longitude) &&
        loc.latitude >= -90 &&
        loc.latitude <= 90 &&
        loc.longitude >= -180 &&
        loc.longitude <= 180,
    );

    console.log("Valid locations count:", validLocations.length);

    // If no valid locations, use fallback
    if (validLocations.length === 0) {
      console.log("No valid locations, using default center");
      return { lat: 39.8282, lng: -98.5795 }; // Center of US
    }

    // If only one valid location, center on it
    if (validLocations.length === 1) {
      console.log(
        "Single valid location, using it for center:",
        validLocations[0].latitude,
        validLocations[0].longitude,
      );
      return {
        lat: validLocations[0].latitude,
        lng: validLocations[0].longitude,
      };
    }

    // Calculate the average center of all valid locations
    const sum = validLocations.reduce(
      (acc, loc) => {
        acc.lat += loc.latitude;
        acc.lng += loc.longitude;
        return acc;
      },
      { lat: 0, lng: 0 },
    );

    const center = {
      lat: sum.lat / validLocations.length,
      lng: sum.lng / validLocations.length,
    };

    console.log("Using average center of all locations:", center);
    return center;
  }, [locations, selectedLocationId]);

  // Validate coordinates
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

  // Handle map load - using void to match expected type signature
  const onLoad = (mapInstance: google.maps.Map): void => {
    console.log("🗺️ Map loaded");
    mapRef.current = mapInstance;
    setMap(mapInstance);

    // Setup idle listener
    idleListenerRef.current = google.maps.event.addListener(
      mapInstance,
      "idle",
      () => {
        console.log("Map is idle and ready");
        setMapIdle(true);

        // If there's a selected location, try to center on it now
        if (selectedLocationId && initialRenderRef.current) {
          const loc = locationMapRef.current[selectedLocationId];
          if (loc && isValidCoordinate(loc.latitude, loc.longitude)) {
            console.log(
              "Initial render with selection, centering on:",
              loc.name,
            );
            setTimeout(() => {
              mapInstance.setCenter({ lat: loc.latitude, lng: loc.longitude });
              mapInstance.setZoom(15);
              setActiveInfoWindow(selectedLocationId);
            }, 200);
          }
          initialRenderRef.current = false;
        }
        // Fit bounds to markers if we have multiple locations
        else if (locations.length > 1 && !selectedLocationId) {
          fitMapToBounds();
        }
      },
    );
  };

  // Fit map to contain all markers
  const fitMapToBounds = useCallback(() => {
    if (!mapRef.current) return;

    const bounds = new google.maps.LatLngBounds();
    let hasValidCoordinates = false;

    locations.forEach((location) => {
      if (isValidCoordinate(location.latitude, location.longitude)) {
        bounds.extend(
          new google.maps.LatLng(location.latitude, location.longitude),
        );
        hasValidCoordinates = true;
      }
    });

    if (hasValidCoordinates) {
      mapRef.current.fitBounds(bounds);

      // Add a small padding
      const listener = google.maps.event.addListenerOnce(
        mapRef.current,
        "bounds_changed",
        () => {
          mapRef.current?.setZoom(Math.min(15, mapRef.current.getZoom() || 15));
        },
      );

      return () => {
        google.maps.event.removeListener(listener);
      };
    }
  }, [locations]);

  // Update map when selected location changes - this is CRITICAL code
  useEffect(() => {
    // Skip if we don't have a map yet
    if (!map) {
      console.log("Map not yet loaded, will handle selection after map loads");
      return;
    }

    console.log("SELECTION CHANGED TO:", selectedLocationId);
    console.log("Map instance exists:", !!map);

    // Reset the info window
    setActiveInfoWindow(null);

    // If a location is selected...
    if (selectedLocationId) {
      // Find the location in our cached map for faster lookup
      const selectedLocation =
        locationMapRef.current[selectedLocationId] ||
        locations.find((loc) => loc.id === selectedLocationId);

      console.log("Found selected location:", selectedLocation);

      if (
        selectedLocation &&
        isValidCoordinate(selectedLocation.latitude, selectedLocation.longitude)
      ) {
        // Force-close any open info windows
        if (map) {
          // Use direct Google Maps JS API for most reliability
          const center = new google.maps.LatLng(
            selectedLocation.latitude,
            selectedLocation.longitude,
          );

          console.log(
            "⭐ Centering map on coordinates:",
            selectedLocation.latitude,
            selectedLocation.longitude,
          );

          // Execute in a microtask to ensure it happens after React rendering
          setTimeout(() => {
            if (map) {
              try {
                // First set zoom level for smoother transition
                map.setZoom(15);

                // Then center the map
                map.panTo(center);

                // Finally, show the info window with a small delay
                setTimeout(() => {
                  setActiveInfoWindow(selectedLocationId);
                  console.log("Info window should now be visible");
                }, 300);
              } catch (err) {
                console.error("Error centering map:", err);
              }
            }
          }, 100);
        }
      } else {
        console.log("Selected location has invalid coordinates");
      }
    } else if (locations.length > 1) {
      // No location selected, fit to bounds
      console.log("No location selected, fitting to bounds");
      fitMapToBounds();
    }
  }, [selectedLocationId, locations, map, fitMapToBounds]);

  // Get marker color based on location state or type
  const getMarkerColor = (location: MapLocation): string => {
    if (!location.state && !location.locationType) return "#3b82f6"; // Default blue

    // If you want to color by state
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

    // If you want to color by location type
    const typeColors: { [key: string]: string } = {
      business: "#3b82f6", // Blue
      venue: "#8b5cf6", // Purple
      office: "#22c55e", // Green
      warehouse: "#f59e0b", // Amber
      retail: "#ec4899", // Pink
      restaurant: "#06b6d4", // Cyan
      landmark: "#f97316", // Orange
    };

    // Prioritize coloring by state if available
    if (location.state && stateColors[location.state]) {
      return stateColors[location.state];
    }

    // Fall back to type-based coloring
    if (location.locationType) {
      const normalizedType = location.locationType
        .toLowerCase()
        .replace("_", "");
      return typeColors[normalizedType] || "#3b82f6"; // Default blue if type not found
    }

    return "#3b82f6"; // Default blue
  };

  // Handle marker click
  const handleMarkerClick = (locationId: string) => {
    setActiveInfoWindow(locationId);

    if (onMarkerClick) {
      onMarkerClick(locationId);
    }
  };

  // Close info window
  const handleInfoWindowClose = () => {
    setActiveInfoWindow(null);
  };

  // Handle error state
  if (loadError) {
    return (
      <div className="p-4 text-red-500">
        Error loading Google Maps: {loadError.message}
      </div>
    );
  }

  // Handle loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        Loading Google Maps...
      </div>
    );
  }

  // Create markers using a top-level useEffect
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  // This effect creates all markers when the map is loaded
  useEffect(() => {
    // Only proceed if map is ready
    if (!mapRef.current || !window.google?.maps) return;

    // Make sure AdvancedMarkerElement is available
    const markerClass = window.google.maps.marker?.AdvancedMarkerElement;
    if (!markerClass) {
      console.error("AdvancedMarkerElement is not available");
      return;
    }

    console.log("Creating markers for", locations.length, "locations");

    // Clear any existing markers
    Object.values(markersRef.current).forEach((marker) => {
      if (marker && marker.map) marker.map = null;
    });

    // Reset markers reference
    markersRef.current = {};

    // Create all markers
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    locations.forEach((location) => {
      if (!isValidCoordinate(location.latitude, location.longitude)) return;

      const markerColor = getMarkerColor(location);

      // Create pin element
      const pinElement = document.createElement("div");
      pinElement.className = "location-marker";
      pinElement.style.width = "24px";
      pinElement.style.height = "24px";
      pinElement.style.borderRadius = "50%";
      pinElement.style.backgroundColor = markerColor;
      pinElement.style.border = "2px solid white";
      pinElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      pinElement.style.cursor = "pointer";
      pinElement.title = location.name;

      // Add bounce animation for selected marker
      if (selectedLocationId === location.id) {
        pinElement.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-8px)" },
            { transform: "translateY(0)" },
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
          lat: location.latitude,
          lng: location.longitude,
        },
        content: pinElement,
        title: location.name,
      });

      // Add click listener
      advancedMarker.addListener("click", () => {
        handleMarkerClick(location.id);
      });

      // Store marker reference
      markersRef.current[location.id] = advancedMarker as any;
      newMarkers.push(advancedMarker);
    });

    setMarkers(newMarkers);

    // Clean up on unmount
    return () => {
      Object.values(markersRef.current).forEach((marker) => {
        if (marker && marker.map) marker.map = null;
      });
      markersRef.current = {};
    };
    // Remove mapRef.current from dependencies as it causes re-renders
    // isValidCoordinate and getMarkerColor are stable functions
  }, [locations, selectedLocationId, handleMarkerClick]);

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={getMapCenter()}
      zoom={zoom}
      onLoad={onLoad}
      onIdle={() => {
        console.log("Map idle event triggered");
        setMapIdle(true);
      }}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        mapId: mapId,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }], // Hide points of interest labels
          },
        ],
      }}
    >
      {/* Render info windows */}
      {locations.map((location) => (
        <div key={location.id}>
          {activeInfoWindow === location.id &&
            isValidCoordinate(location.latitude, location.longitude) && (
              <InfoWindow
                position={{
                  lat: location.latitude,
                  lng: location.longitude,
                }}
                onCloseClick={handleInfoWindowClose}
              >
                <div className="p-1 max-w-[250px]">
                  <h3 className="font-medium text-sm">{location.name}</h3>
                  <p className="text-xs text-gray-600">{location.address}</p>
                </div>
              </InfoWindow>
            )}
        </div>
      ))}
    </GoogleMap>
  );
}
