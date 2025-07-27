"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { useTheme } from "next-themes";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useGoogleMaps } from "./GoogleMapsContext";

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
  width: string | number = "100%",
  height: number = 500,
) => ({
  width,
  height: `${height}px`,
  borderRadius: "0.5rem",
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
  width = "100%",
}: LocationListMapProps) {
  // Get Google Maps context first to maintain hook order
  const { isLoaded, loadError, mapId } = useGoogleMaps();
  const { resolvedTheme } = useTheme();
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(
    null,
  );
  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [center, setCenter] = useState(defaultCenter);
  const [zoom, setZoom] = useState(4);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Effect to determine theme
  useEffect(() => {
    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    setMapTheme(currentTheme);

    // Apply theme to map if it's already loaded
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

      // If there's a selected location, focus on it
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
  const applyMapStyle = (map: google.maps.Map, theme: "light" | "dark") => {
    if (theme === "dark") {
      map.setOptions({
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
          },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
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

      // Adjust zoom if it's too high after fitting
      window.google.maps.event.addListenerOnce(
        mapRef.current,
        "bounds_changed",
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

  // Fix for TypeScript error - type guard for locationType
  const getLocationTypeDisplay = (locationType: string | undefined): string => {
    return locationType ? locationType.replace(/_/g, " ") : "Unknown";
  };

  // Function to get marker color based on location
  const getMarkerColor = (location: MapLocation): string => {
    if (!location.state && !location.locationType) return "blue"; // Default

    // Color by state (for US state abbreviations)
    const stateColors: { [key: string]: string } = {
      CA: "red",
      NY: "blue",
      TX: "green",
      FL: "orange",
      IL: "purple",
      PA: "pink",
      OH: "cyan",
      GA: "yellow",
      NC: "purple",
      MI: "cyan",
    };

    // If the location has a state and we have a color for it, use that
    if (location.state && location.state in stateColors) {
      return stateColors[location.state];
    }

    // Color by location type
    if (location.locationType) {
      switch (location.locationType.toLowerCase()) {
        case "business":
        case "establishment":
          return "blue";
        case "venue":
        case "event_venue":
          return "purple";
        case "office":
        case "corporate_office":
          return "green";
        case "retail":
        case "store":
        case "retail_store":
          return "pink";
        case "warehouse":
        case "distribution_center":
          return "orange";
        case "restaurant":
          return "cyan";
        default:
          return "blue";
      }
    }

    return "blue"; // Default color
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

  // Track markers in a ref to avoid state dependencies in useEffect
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

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
      const pinElement = document.createElement("div");
      pinElement.className = "location-marker";
      pinElement.style.width = "24px";
      pinElement.style.height = "24px";
      pinElement.style.borderRadius = "50%";
      pinElement.style.backgroundColor = getMarkerColor(location);
      pinElement.style.border = "2px solid white";
      pinElement.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
      pinElement.style.cursor = "pointer";
      pinElement.title = location.name;

      // Add animation for selected marker
      if (selectedLocationId === location.id) {
        pinElement.animate(
          [
            { transform: "translateY(0)" },
            { transform: "translateY(-10px)" },
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
          lat: Number(location.latitude),
          lng: Number(location.longitude),
        },
        content: pinElement,
        title: location.name,
      });

      // Add click listener
      advancedMarker.addListener("click", () => {
        handleMarkerClick(location);
      });

      newMarkers.push(advancedMarker);
    });

    // Store markers in the ref for future cleanup instead of using state
    markersRef.current = newMarkers;

    // We can still update the state for rendering, but we don't depend on it in the effect
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
                mapTheme === "dark"
                  ? "bg-gray-800 text-white border border-gray-700"
                  : "bg-white text-gray-900"
              }`}
              style={{
                minWidth: "200px",
              }}
            >
              <h3 className="font-medium">{selectedLocation.name}</h3>
              <p
                className={`text-sm ${mapTheme === "dark" ? "text-gray-300" : "text-gray-600"}`}
              >
                {selectedLocation.address}
              </p>
              {selectedLocation.locationType && (
                <div
                  className={`text-xs mt-1 ${mapTheme === "dark" ? "text-gray-400" : "text-gray-500"}`}
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
