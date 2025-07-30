"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MapPin, AlertTriangle } from "lucide-react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getGoogleMapsLoaderConfig,
  getGoogleMapsOptions,
} from "@/config/google-maps";

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  locationType: string;
  status: string;
}

interface SimplifiedLocationMapProps {
  selectedLocationId?: string | null;
  onSelectLocation?: (locationId: string) => void;
  height?: string;
  width?: string;
  zoom?: number;
  showControls?: boolean;
  apiKey?: string;
}

export function SimplifiedLocationMap({
  selectedLocationId = null,
  onSelectLocation,
  height = "100%",
  width = "100%",
  zoom = 10,
  showControls = true,
}: SimplifiedLocationMapProps) {
  const { theme } = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<
    Array<{
      marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
      location: Location;
      infoWindow?: google.maps.InfoWindow;
    }>
  >([]);
  const [selectedMarker, setSelectedMarker] = useState<{
    marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
    location: Location;
    infoWindow?: google.maps.InfoWindow;
  } | null>(null);

  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch locations data
  const {
    data: locations,
    isLoading,
    error,
  } = useQuery<Location[]>({
    queryKey: ["/api/admin/locations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/locations");
      if (!res.ok) {
        throw new Error("Failed to fetch locations");
      }
      return res.json();
    },
  });

  // Initialize Google Maps
  useEffect(() => {
    if (!mapContainerRef.current || mapLoaded) return;

    const loadMap = async () => {
      try {
        const loader = new Loader(getGoogleMapsLoaderConfig());

        await loader.load();

        // Create the map with options from our centralized config
        const mapOptions = getGoogleMapsOptions(theme, zoom, showControls);

        const newMap = new google.maps.Map(mapContainerRef.current, mapOptions);
        setMap(newMap);
        setMapLoaded(true);
        setMapError(null);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setMapError("Failed to load Google Maps. Please try again later.");
      }
    };

    loadMap();
  }, [mapLoaded, theme, zoom, showControls]);

  // Update markers when locations data changes or map is loaded
  useEffect(() => {
    if (!map || !locations || locations.length === 0) return;

    // Clear existing markers
    markers.forEach(({ marker }) => {
      if ("map" in marker) {
        marker.setMap(null);
      }
    });

    // Create bounds to fit all markers
    const bounds = new google.maps.LatLngBounds();

    // Create markers for each location
    const newMarkers = locations
      .map((location) => {
        if (!location.latitude || !location.longitude) return null;

        const position = {
          lat: parseFloat(String(location.latitude)),
          lng: parseFloat(String(location.longitude)),
        };

        // Add position to bounds
        bounds.extend(position);

        // Create marker
        let marker;

        // Try to use Advanced Marker, fall back to regular Marker if not available
        if (
          "marker" in google.maps &&
          "AdvancedMarkerElement" in google.maps.marker
        ) {
          const markerElement = document.createElement("div");
          markerElement.className = "marker-pin";
          markerElement.innerHTML = `
          <div class="flex items-center justify-center w-8 h-8 text-white rounded-full ${
            location.status === "pending"
              ? "bg-amber-500"
              : location.status === "rejected"
                ? "bg-red-500"
                : location.status === "inactive"
                  ? "bg-slate-500"
                  : "bg-emerald-500"
          } shadow-md border-2 border-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `;

          marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position,
            content: markerElement,
            title: location.name,
          });
        } else {
          // Fallback to standard marker
          marker = new google.maps.Marker({
            map,
            position,
            title: location.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor:
                location.status === "pending"
                  ? "#f59e0b"
                  : location.status === "rejected"
                    ? "#ef4444"
                    : location.status === "inactive"
                      ? "#94a3b8"
                      : "#10b981",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: 10,
            },
          });
        }

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class="p-2 max-w-[250px]">
            <h3 class="font-semibold text-sm">${location.name}</h3>
            <p class="text-xs opacity-75 truncate">${location.address}</p>
            <p class="text-xs opacity-75">${location.city}, ${location.state} ${location.zipCode}</p>
            <div class="mt-1 text-xs">
              <span class="inline-block px-1.5 py-0.5 rounded-full ${
                location.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : location.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : location.status === "inactive"
                      ? "bg-slate-100 text-slate-800"
                      : "bg-emerald-100 text-emerald-800"
              }">
                ${location.status.charAt(0).toUpperCase() + location.status.slice(1)}
              </span>
            </div>
          </div>
        `,
          pixelOffset: new google.maps.Size(0, -10),
        });

        // Add click listener
        if ("addListener" in marker) {
          marker.addListener("click", () => {
            selectMarker(marker, location, infoWindow);
          });
        } else {
          marker.addEventListener("click", () => {
            selectMarker(marker, location, infoWindow);
          });
        }

        return { marker, location, infoWindow };
      })
      .filter(Boolean) as Array<{
      marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker;
      location: Location;
      infoWindow: google.maps.InfoWindow;
    }>;

    setMarkers(newMarkers);

    // If we have markers, fit the map to them
    if (newMarkers.length > 0) {
      map.fitBounds(bounds);

      // If there's only one marker, zoom out a bit
      if (newMarkers.length === 1) {
        map.setZoom(Math.min(14, map.getZoom() || 14));
      }
    }

    // If we have a selected location ID, select that marker
    if (selectedLocationId) {
      const markerToSelect = newMarkers.find(
        (m) => m.location.id === selectedLocationId,
      );
      if (markerToSelect) {
        selectMarker(
          markerToSelect.marker,
          markerToSelect.location,
          markerToSelect.infoWindow,
        );
      }
    }
  }, [map, locations, selectedLocationId]);

  // Function to select a marker and open its info window
  const selectMarker = useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement | google.maps.Marker,
      location: Location,
      infoWindow?: google.maps.InfoWindow,
    ) => {
      // Close any previously open info window
      if (selectedMarker?.infoWindow) {
        selectedMarker.infoWindow.close();
      }

      // Set the selected marker
      setSelectedMarker({ marker, location, infoWindow });

      // Open the info window
      if (infoWindow && map) {
        if ("position" in marker) {
          infoWindow.open({
            map,
            anchor: marker,
            shouldFocus: false,
          });
        } else {
          // For AdvancedMarkerElement
          infoWindow.open(map);
          infoWindow.setPosition(marker.position as google.maps.LatLng);
        }
      }

      // Call the onSelectLocation callback if provided
      if (onSelectLocation) {
        onSelectLocation(location.id);
      }
    },
    [map, selectedMarker, onSelectLocation],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/20">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading location data...
          </p>
        </div>
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/10">
        <Card className="p-4 max-w-md">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <h3 className="font-semibold">Map Error</h3>
            <p className="text-sm text-muted-foreground mb-2">
              {mapError ||
                "Failed to load location data. Please try again later."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMapLoaded(false);
                setMapError(null);
              }}
            >
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-muted/10">
        <div className="flex flex-col items-center gap-2 p-4 max-w-md text-center">
          <MapPin className="h-8 w-8 text-muted-foreground/50" />
          <h3 className="font-semibold">No Locations</h3>
          <p className="text-sm text-muted-foreground">
            No location data is currently available to display on the map.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width }}
      className="rounded-md overflow-hidden bg-muted/10"
    ></div>
  );
}

export default SimplifiedLocationMap;
