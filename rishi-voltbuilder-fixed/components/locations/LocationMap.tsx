"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { Loader2, MapPin, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Explicitly export the Location type
export interface Location {
  id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
  locationType?: string;
  status?: string;
}

interface LocationMapProps {
  locations?: Location[];
  latitude?: number;
  longitude?: number;
  selectedLocationId?: string;
  onSelectLocation?: (location: Location) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string | number;
  width?: string | number;
  zoom?: number;
  center?: { lat: number; lng: number };
  clickable?: boolean;
  showInfoWindow?: boolean;
  clusterMarkers?: boolean;
  className?: string;
  markerColor?: string;
  interactive?: boolean;
  disableDefaultUI?: boolean;
  mapId?: string;
}

/**
 * LocationMap component for displaying locations on a Google Map
 *
 * This component renders a Google Map with Advanced Markers for each location.
 * It supports selection, clustering, and customization of markers.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Location[]} props.locations - Array of location objects to display on the map
 * @param {string} props.selectedLocationId - ID of the currently selected location
 * @param {Function} props.onSelectLocation - Callback when a location is selected
 * @param {Function} props.onMapClick - Callback when the map is clicked
 * @param {string|number} props.height - Height of the map container
 * @param {string|number} props.width - Width of the map container
 * @param {number} props.zoom - Initial zoom level
 * @param {Object} props.center - Initial center point {lat, lng}
 * @param {boolean} props.clickable - Whether markers and map are clickable
 * @param {boolean} props.showInfoWindow - Whether to show info windows on click
 * @param {boolean} props.clusterMarkers - Whether to cluster nearby markers
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.markerColor - Color for the markers
 * @param {boolean} props.interactive - Whether the map is interactive
 * @param {boolean} props.disableDefaultUI - Whether to hide default UI controls
 * @param {string} props.mapId - Google Maps Map ID for Advanced Markers support
 * @returns {JSX.Element} The rendered map component
 */
export function LocationMap({
  locations = [],
  latitude,
  longitude,
  selectedLocationId,
  onSelectLocation,
  onMapClick,
  height = "100%",
  width = "100%",
  zoom = 10,
  center,
  clickable = true,
  showInfoWindow = true,
  clusterMarkers = false,
  className,
  markerColor = "#4f46e5",
  interactive = true,
  disableDefaultUI = false,
  mapId = "8f718a3abe8b23eb", // Default Map ID for Advanced Markers
}: LocationMapProps) {
  // Use our custom hook to access Google Maps context
  const { isLoaded, loadError } = useGoogleMaps();

  // Refs for Google Maps objects
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markerClustererRef = useRef<any | null>(null);

  // Internal component state
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);

  // Calculate the default center based on locations, single lat/lng, or provided center
  const defaultCenter = useMemo(() => {
    if (center) {
      return center;
    }

    // If single latitude and longitude are provided, use those
    if (latitude !== undefined && longitude !== undefined) {
      return { lat: latitude, lng: longitude };
    }

    if (locations.length === 0) {
      // Default to United States if no locations
      return { lat: 39.8283, lng: -98.5795 };
    }

    // If we have a selected location, center on that
    if (selectedLocationId) {
      const selected = locations.find((loc) => loc.id === selectedLocationId);
      if (selected) {
        return { lat: selected.latitude, lng: selected.longitude };
      }
    }

    // Calculate center based on all location coordinates
    let sumLat = 0;
    let sumLng = 0;
    locations.forEach((location) => {
      sumLat += location.latitude;
      sumLng += location.longitude;
    });

    return {
      lat: sumLat / locations.length,
      lng: sumLng / locations.length,
    };
  }, [locations, center, selectedLocationId, latitude, longitude]);

  /**
   * Initialize the map once Google Maps is loaded
   * This effect runs when the Google Maps API is loaded and creates the map instance
   */
  useEffect(() => {
    // Only proceed if Google Maps is loaded and map container is mounted
    if (!isLoaded || !mapRef.current) return;

    try {
      /**
       * Create a new map instance with all necessary options
       *
       * @property {Object} center - Initial map center coordinates {lat, lng}
       * @property {number} zoom - Initial zoom level (higher = more zoomed in)
       * @property {boolean} mapTypeControl - Show/hide map type selector (satellite, roadmap)
       * @property {boolean} streetViewControl - Show/hide Street View pegman
       * @property {boolean} zoomControl - Show/hide zoom controls
       * @property {boolean} fullscreenControl - Show/hide fullscreen button
       * @property {boolean} clickableIcons - Whether built-in POIs are clickable
       * @property {string} mapId - Required for Advanced Markers (registered in Google Cloud Console)
       * @property {boolean} draggable - Whether map can be dragged/panned
       * @property {boolean} scrollwheel - Whether zooming with mouse wheel is enabled
       * @property {boolean} disableDefaultUI - Master switch for all UI controls
       */
      const mapOptions: google.maps.MapOptions = {
        center: defaultCenter,
        zoom: zoom,
        mapTypeControl: !disableDefaultUI,
        streetViewControl: !disableDefaultUI && interactive,
        zoomControl: !disableDefaultUI && interactive,
        fullscreenControl: !disableDefaultUI,
        clickableIcons: clickable && interactive,
        // Add Map ID to enable Advanced Markers - REQUIRED for modern markers
        mapId: mapId,
        draggable: interactive,
        scrollwheel: interactive,
        disableDefaultUI: disableDefaultUI,
      };

      const map = new google.maps.Map(mapRef.current, mapOptions);
      googleMapRef.current = map;

      // Create info window for showing location details
      infoWindowRef.current = new google.maps.InfoWindow();

      // Add click event listener to the map if onMapClick is provided
      if (onMapClick && clickable && interactive) {
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMapClick(event.latLng.lat(), event.latLng.lng());
          }
        });
      }

      setMapInitialized(true);
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError("Failed to initialize Google Maps");
    }

    return () => {
      // Clean up map and references when component unmounts
      if (googleMapRef.current) {
        // Remove event listeners
        google.maps.event.clearInstanceListeners(googleMapRef.current);
      }

      // Clear markers
      if (markersRef.current) {
        markersRef.current.forEach((marker) => {
          if (marker) {
            google.maps.event.clearInstanceListeners(marker);
            if (marker.setMap) marker.setMap(null);
          }
        });
        markersRef.current = [];
      }

      // Close and clear info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      // Clear marker clusterer
      if (markerClustererRef.current) {
        if (markerClustererRef.current.clearMarkers) {
          markerClustererRef.current.clearMarkers();
        }
        markerClustererRef.current = null;
      }
    };
  }, [
    isLoaded,
    defaultCenter,
    zoom,
    clickable,
    onMapClick,
    disableDefaultUI,
    interactive,
    mapId,
  ]);

  // Update markers whenever locations change
  useEffect(() => {
    if (!mapInitialized || !googleMapRef.current || !window.google?.maps)
      return;

    // Clear existing markers
    if (markersRef.current && markersRef.current.length > 0) {
      markersRef.current.forEach((marker) => {
        if (marker) {
          google.maps.event.clearInstanceListeners(marker);
          if (marker instanceof google.maps.Marker) {
            marker.setMap(null);
          } else if (marker.map) {
            marker.map = null;
          }
        }
      });
      markersRef.current = [];
    }

    // Clear existing marker clusterer
    if (markerClustererRef.current) {
      if (markerClustererRef.current.clearMarkers) {
        markerClustererRef.current.clearMarkers();
      }
      markerClustererRef.current = null;
    }

    // Add new markers for each location or single lat/lng
    const newMarkers: any[] = [];

    // Create locations array from props (either array or single lat/lng)
    const locationsToRender = locations.length > 0 
      ? locations 
      : (latitude !== undefined && longitude !== undefined)
        ? [{ id: 'single-location', name: 'Location', address: '', latitude, longitude }]
        : [];

    locationsToRender.forEach((location) => {
      const isSelected = location.id === selectedLocationId;
      const position = { lat: location.latitude, lng: location.longitude };
      let marker: any = null;

      try {
        /**
         * Check if the marker library is loaded and available
         * Advanced Markers require the marker library to be included in the Google Maps script
         */
        if (!window.google?.maps?.marker) {
          console.log("Waiting for Google Maps marker library to initialize");
          // Can't use continue here, return from this location iteration
          return;
        }

        /**
         * Create a custom marker element (div) for styling
         * This demonstrates the power of Advanced Markers - fully customizable HTML/CSS styling
         *
         * Unlike legacy markers which only supported images, Advanced Markers
         * allow for rich styling and interactive elements
         */
        const markerElement = document.createElement("div");
        markerElement.className = "advanced-marker";
        // Style differently if this is the selected location
        markerElement.style.backgroundColor = isSelected
          ? "#ef4444"
          : markerColor;
        markerElement.style.border = `2px solid ${isSelected ? "#b91c1c" : "#312e81"}`;
        markerElement.style.borderRadius = "50%";
        markerElement.style.padding = isSelected ? "12px" : "10px";
        markerElement.style.cursor = "pointer";

        /**
         * Create the advanced marker using the modern Google Maps Marker API
         *
         * @property {google.maps.Map} map - The map instance to add this marker to
         * @property {Object} position - The lat/lng position for this marker
         * @property {string} title - The marker tooltip text (for accessibility)
         * @property {HTMLElement} content - The custom HTML element to use as the marker
         */
        marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: googleMapRef.current,
          position,
          title: location.name, // Used for tooltip and accessibility
          content: markerElement, // Custom marker element
        });

        // Add click event listener for marker using 'gmp-click' for Advanced Markers
        if (marker) {
          // Use the recommended 'gmp-click' event for Advanced Markers
          marker.addListener("gmp-click", () => {
            // Show info window if enabled
            if (
              showInfoWindow &&
              infoWindowRef.current &&
              googleMapRef.current
            ) {
              // Create info window content
              const contentString = `
                <div class="info-window p-2 max-w-xs">
                  <h3 class="font-bold text-base">${location.name}</h3>
                  <p class="text-sm text-gray-600">${location.address}</p>
                  ${location.locationType ? `<p class="text-xs text-gray-500">Type: ${location.locationType}</p>` : ""}
                  ${location.status ? `<p class="text-xs text-gray-500">Status: ${location.status}</p>` : ""}
                </div>
              `;

              infoWindowRef.current.setContent(contentString);
              infoWindowRef.current.open({
                anchor: marker,
                map: googleMapRef.current,
              });
            }

            // Call the onSelectLocation callback if provided
            if (onSelectLocation) {
              onSelectLocation(location);
            }
          });

          newMarkers.push(marker);
        }
      } catch (error) {
        console.error("Error creating advanced marker element:", error);

        // Set error state if the marker library is missing
        if (!window.google?.maps?.marker) {
          setMapError(
            'Advanced marker library is required but was not loaded correctly. Please check your Google Maps API configuration and ensure the "marker" library is included.',
          );
        }
      }
    });

    // Store the new markers
    markersRef.current = newMarkers;

    // Handle clustering if enabled
    if (clusterMarkers && newMarkers.length > 1 && window.google?.maps) {
      try {
        // Import MarkerClusterer dynamically if available
        if (window.MarkerClusterer) {
          markerClustererRef.current = new window.MarkerClusterer(
            googleMapRef.current,
            newMarkers,
            {
              imagePath:
                "https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m",
            },
          );
        }
      } catch (error) {
        console.error("Error creating marker clusterer:", error);
      }
    }

    // Update map viewport based on locations
    if (googleMapRef.current) {
      if (selectedLocationId && locations.length > 0) {
        // Center on selected location if one is specified
        const selectedLocation = locations.find(
          (loc) => loc.id === selectedLocationId,
        );
        if (selectedLocation) {
          googleMapRef.current.setCenter({
            lat: selectedLocation.latitude,
            lng: selectedLocation.longitude,
          });

          if (locations.length === 1) {
            googleMapRef.current.setZoom(14);
          }
        }
      } else if (locations.length > 1) {
        // If multiple locations, fit bounds to show all
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((location) => {
          bounds.extend({ lat: location.latitude, lng: location.longitude });
        });
        googleMapRef.current.fitBounds(bounds);
      }
    }
  }, [
    locations,
    latitude,
    longitude,
    mapInitialized,
    selectedLocationId,
    markerColor,
    showInfoWindow,
    onSelectLocation,
    clusterMarkers,
  ]);

  // Reset map view function
  const resetMapView = useCallback(() => {
    if (mapInitialized && googleMapRef.current) {
      if (locations.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        locations.forEach((location) => {
          bounds.extend({ lat: location.latitude, lng: location.longitude });
        });
        googleMapRef.current.fitBounds(bounds);
      } else if (locations.length === 1 && locations[0]) {
        const location = locations[0];
        if (
          typeof location.latitude === "number" &&
          typeof location.longitude === "number"
        ) {
          googleMapRef.current.setCenter({
            lat: location.latitude,
            lng: location.longitude,
          });
          googleMapRef.current.setZoom(14);
        }
      } else {
        googleMapRef.current.setCenter(defaultCenter);
        googleMapRef.current.setZoom(zoom);
      }

      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }
    }
  }, [locations, mapInitialized, defaultCenter, zoom]);

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md",
          className,
        )}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading Google Maps...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || mapError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md",
          className,
        )}
        style={{ height, width }}
      >
        <div className="flex flex-col items-center justify-center p-4 text-center max-w-md">
          <XCircle className="h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-base font-bold mb-1">Failed to load map</h3>
          <p className="text-sm text-muted-foreground">
            {loadError?.message ||
              mapError ||
              "There was a problem loading Google Maps."}
          </p>
        </div>
      </div>
    );
  }

  // Main map render
  return (
    <div
      className={cn("relative rounded-md overflow-hidden", className)}
      style={{ height, width }}
    >
      {/* Map container */}
      <div
        ref={mapRef}
        className="w-full h-full"
        aria-label="Map showing location markers"
      />

      {/* Controls overlay (optional) */}
      {interactive && locations.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 shadow-md bg-white dark:bg-gray-800"
            onClick={resetMapView}
          >
            <MapPin className="mr-1 h-3.5 w-3.5" />
            <span className="text-xs">Reset View</span>
          </Button>
        </div>
      )}
    </div>
  );
}

// Export the component as default export
export default LocationMap;
