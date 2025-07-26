"use client";

import React, { useContext, useCallback } from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { Loader2, MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { GoogleMapsContext } from "./GoogleMapsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  width: "100%",
  height: "100%",
  borderRadius: "0.375rem",
};

// Default center (US)
const defaultCenter = {
  lat: 37.0902,
  lng: -95.7129,
};

export function LocationMap({
  locations = [],
  height = "500px",
  className = "",
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
    height: typeof height === "number" ? `${height}px` : height,
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
        marker.addListener("click", () => {
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
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20 p-4 text-center">
          <div className="text-destructive mb-2">
            Failed to load Google Maps
          </div>
          <p className="text-sm text-muted-foreground">
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
              <div className="max-w-[300px] rounded-md bg-white p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedLocation.name}
                </h3>
                {selectedLocation.address && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedLocation.address}
                  </p>
                )}
                {selectedLocation.city && selectedLocation.state && (
                  <p className="text-sm text-gray-600">
                    {selectedLocation.city}, {selectedLocation.state}
                  </p>
                )}
                <div className="mt-3 flex space-x-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() =>
                      window.open(`/locations/${selectedLocation.id}`)
                    }
                  >
                    View Details
                  </Button>
                  <Button size="sm" variant="outline" onClick={onInfoClose}>
                    Close
                  </Button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}

      {/* Location count badge */}
      <div className="absolute top-4 right-4 z-10">
        <Badge
          variant="outline"
          className="bg-background/80 backdrop-blur-sm shadow-sm"
        >
          <MapPin className="w-3 h-3 mr-1" />
          {locations.length} {locations.length === 1 ? "Location" : "Locations"}
        </Badge>
      </div>
    </div>
  );
}
