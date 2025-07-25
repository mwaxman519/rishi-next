"use client";

import { useState, useEffect, useRef } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { useGoogleMaps } from "./GoogleMapsContext";

// Separate component that only handles the marker effect
interface MarkersEffectComponentProps {
  map: google.maps.Map | null;
  locations: MapLocation[];
  selectedLocationId?: string | null;
  getMarkerColor: (location: MapLocation) => string;
  handleMarkerClick: (locationId: string) => void;
}

function MarkersEffectComponent({
  map,
  locations,
  selectedLocationId,
  getMarkerColor,
  handleMarkerClick,
}: MarkersEffectComponentProps) {
  const [markers, setMarkers] = useState<
    google.maps.marker.AdvancedMarkerElement[]
  >([]);

  // Helper to validate coordinates
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

  // This effect creates all markers when the map is loaded
  useEffect(() => {
    // Only proceed if map is ready
    if (!map || !window.google?.maps) return;

    // Make sure AdvancedMarkerElement is available
    const markerClass = window.google.maps.marker?.AdvancedMarkerElement;
    if (!markerClass) {
      console.error("AdvancedMarkerElement is not available");
      return;
    }

    // Clean up old markers first
    markers.forEach((marker) => {
      if (marker) marker.map = null;
    });

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
            { transform: "translateY(-8px)" },
            { transform: "translateY(0)" },
          ],
          {
            duration: 1000,
            iterations: Infinity,
          },
        );
      }

      // Create advanced marker
      const advancedMarker = new markerClass({
        map: map,
        position: {
          lat: location.latitude,
          lng: location.longitude,
        },
        content: pinElement,
        title: location.name,
      });

      // Add click handler
      advancedMarker.addListener("click", () => {
        handleMarkerClick(location.id);
      });

      newMarkers.push(advancedMarker);
    });

    setMarkers(newMarkers);

    // Clean up on unmount
    return () => {
      newMarkers.forEach((marker) => {
        if (marker) marker.map = null;
      });
    };
    // Remove 'markers' from dependencies to avoid infinite loop
  }, [map, locations, selectedLocationId, getMarkerColor, handleMarkerClick]);

  return null; // This component doesn't render anything
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

interface SimpleMultiLocationMapProps {
  locations: MapLocation[];
  selectedLocationId?: string | null;
  onMarkerClick?: (locationId: string) => void;
  height?: number;
  zoom?: number;
  apiKey?: string;
}

/**
 * A simplified map component that displays multiple locations as markers
 * This version focuses on reliable centering behavior
 */
export function SimpleMultiLocationMap({
  locations = [],
  selectedLocationId = null,
  onMarkerClick,
  height = 500,
  zoom = 10,
  apiKey = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg", // Default API key
}: SimpleMultiLocationMapProps) {
  // Get Google Maps context first to maintain hook order
  const { isLoaded, loadError, mapId } = useGoogleMaps();

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState<string | null>(null);

  // Container style
  const containerStyle = {
    width: "100%",
    height: `${height}px`,
  };

  // Helper to validate coordinates
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

  // Get initial center point
  const getCenter = () => {
    // First priority: selected location
    if (selectedLocationId) {
      const selectedLocation = locations.find(
        (loc) => loc.id === selectedLocationId,
      );
      if (
        selectedLocation &&
        isValidCoordinate(selectedLocation.latitude, selectedLocation.longitude)
      ) {
        return {
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        };
      }
    }

    // Second priority: average of valid locations
    const validLocations = locations.filter((loc) =>
      isValidCoordinate(loc.latitude, loc.longitude),
    );

    if (validLocations.length === 0) {
      return { lat: 39.8282, lng: -98.5795 }; // Center of US
    }

    if (validLocations.length === 1) {
      return {
        lat: validLocations[0].latitude,
        lng: validLocations[0].longitude,
      };
    }

    // Calculate average center
    const sum = validLocations.reduce(
      (acc, loc) => {
        acc.lat += loc.latitude;
        acc.lng += loc.longitude;
        return acc;
      },
      { lat: 0, lng: 0 },
    );

    return {
      lat: sum.lat / validLocations.length,
      lng: sum.lng / validLocations.length,
    };
  };

  // Handle map load - using void return type to match expected signature
  const onLoad = (mapInstance: google.maps.Map): void => {
    console.log("Map loaded");
    setMap(mapInstance);

    // If we have a selected location on initial load, zoom to it
    if (selectedLocationId) {
      const selectedLocation = locations.find(
        (loc) => loc.id === selectedLocationId,
      );
      if (
        selectedLocation &&
        isValidCoordinate(selectedLocation.latitude, selectedLocation.longitude)
      ) {
        mapInstance.setCenter({
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        });
        mapInstance.setZoom(15);
        setActiveInfoWindow(selectedLocationId);
      }
    }
    // Otherwise fit all markers in view if we have multiple
    else if (locations.length > 1) {
      fitBounds(mapInstance);
    }
  };

  // Fit map to show all markers
  const fitBounds = (mapInstance: google.maps.Map) => {
    const bounds = new google.maps.LatLngBounds();
    let hasValidCoords = false;

    locations.forEach((location) => {
      if (isValidCoordinate(location.latitude, location.longitude)) {
        bounds.extend({
          lat: location.latitude,
          lng: location.longitude,
        });
        hasValidCoords = true;
      }
    });

    if (hasValidCoords) {
      mapInstance.fitBounds(bounds);

      // Add a little padding
      google.maps.event.addListenerOnce(mapInstance, "bounds_changed", () => {
        const zoom = mapInstance.getZoom();
        if (zoom && zoom > 15) {
          mapInstance.setZoom(15);
        }
      });
    }
  };

  // Handle marker click
  const handleMarkerClick = (locationId: string) => {
    setActiveInfoWindow(locationId);

    if (onMarkerClick) {
      onMarkerClick(locationId);
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

  // Update center when selected location changes
  useEffect(() => {
    if (!map) return;

    // If there's a selected location, center on it
    if (selectedLocationId) {
      const selectedLocation = locations.find(
        (loc) => loc.id === selectedLocationId,
      );

      if (
        selectedLocation &&
        isValidCoordinate(selectedLocation.latitude, selectedLocation.longitude)
      ) {
        console.log("Centering map on:", selectedLocation.name);

        // Important: Use setCenter directly instead of panTo for more reliable positioning
        map.setCenter({
          lat: selectedLocation.latitude,
          lng: selectedLocation.longitude,
        });
        map.setZoom(15);

        // Update the active info window
        setActiveInfoWindow(selectedLocationId);
      }
    }
    // If no location is selected, fit to all markers
    else if (locations.length > 1) {
      fitBounds(map);
    }
  }, [selectedLocationId, locations, map]);

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

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={getCenter()}
      zoom={zoom}
      onLoad={onLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        mapId: mapId,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      }}
    >
      {/* Create markers using a top-level useEffect instead of inside map() */}
      {/* This effect runs only once when the map instance changes */}
      <MarkersEffectComponent
        map={map}
        locations={locations}
        selectedLocationId={selectedLocationId}
        getMarkerColor={getMarkerColor}
        handleMarkerClick={handleMarkerClick}
      />

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
                onCloseClick={() => setActiveInfoWindow(null)}
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
