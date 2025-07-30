&quot;use client&quot;;

import { useEffect, useState, useRef, useMemo, useCallback } from &quot;react&quot;;
import { useGoogleMaps } from &quot;@/hooks/useGoogleMaps&quot;;
import { Loader2, MapPin, XCircle } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { cn } from &quot;@/lib/utils&quot;;

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
  height = &quot;100%&quot;,
  width = &quot;100%&quot;,
  zoom = 10,
  center,
  clickable = true,
  showInfoWindow = true,
  clusterMarkers = false,
  className,
  markerColor = &quot;#4f46e5&quot;,
  interactive = true,
  disableDefaultUI = false,
  mapId = &quot;8f718a3abe8b23eb&quot;, // Default Map ID for Advanced Markers
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
        map.addListener(&quot;click&quot;, (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            onMapClick(event.latLng.lat(), event.latLng.lng());
          }
        });
      }

      setMapInitialized(true);
    } catch (error) {
      console.error(&quot;Error initializing map:&quot;, error);
      setMapError(&quot;Failed to initialize Google Maps&quot;);
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
          console.log(&quot;Waiting for Google Maps marker library to initialize&quot;);
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
        const markerElement = document.createElement(&quot;div&quot;);
        markerElement.className = &quot;advanced-marker&quot;;
        // Style differently if this is the selected location
        markerElement.style.backgroundColor = isSelected
          ? &quot;#ef4444&quot;
          : markerColor;
        markerElement.style.border = `2px solid ${isSelected ? &quot;#b91c1c&quot; : &quot;#312e81&quot;}`;
        markerElement.style.borderRadius = &quot;50%&quot;;
        markerElement.style.padding = isSelected ? &quot;12px&quot; : &quot;10px&quot;;
        markerElement.style.cursor = &quot;pointer&quot;;

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
          marker.addListener(&quot;gmp-click&quot;, () => {
            // Show info window if enabled
            if (
              showInfoWindow &&
              infoWindowRef.current &&
              googleMapRef.current
            ) {
              // Create info window content
              const contentString = `
                <div class=&quot;info-window p-2 max-w-xs&quot;>
                  <h3 class=&quot;font-bold text-base&quot;>${location.name}</h3>
                  <p class=&quot;text-sm text-gray-600&quot;>${location.address}</p>
                  ${location.locationType ? `<p class=&quot;text-xs text-gray-500&quot;>Type: ${location.locationType}</p>` : "&quot;}
                  ${location.status ? `<p class=&quot;text-xs text-gray-500&quot;>Status: ${location.status}</p>` : &quot;&quot;}
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
        console.error(&quot;Error creating advanced marker element:&quot;, error);

        // Set error state if the marker library is missing
        if (!window.google?.maps?.marker) {
          setMapError(
            'Advanced marker library is required but was not loaded correctly. Please check your Google Maps API configuration and ensure the &quot;marker&quot; library is included.',
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
                &quot;https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m&quot;,
            },
          );
        }
      } catch (error) {
        console.error(&quot;Error creating marker clusterer:&quot;, error);
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
          typeof location.latitude === &quot;number&quot; &&
          typeof location.longitude === &quot;number&quot;
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
          &quot;flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md&quot;,
          className,
        )}
        style={{ height, width }}
      >
        <div className=&quot;flex flex-col items-center justify-center p-4 text-center&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-2&quot; />
          <p className=&quot;text-sm text-muted-foreground&quot;>
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
          &quot;flex items-center justify-center bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md&quot;,
          className,
        )}
        style={{ height, width }}
      >
        <div className=&quot;flex flex-col items-center justify-center p-4 text-center max-w-md&quot;>
          <XCircle className=&quot;h-8 w-8 text-red-500 mb-2&quot; />
          <h3 className=&quot;text-base font-bold mb-1&quot;>Failed to load map</h3>
          <p className=&quot;text-sm text-muted-foreground&quot;>
            {loadError?.message ||
              mapError ||
              &quot;There was a problem loading Google Maps.&quot;}
          </p>
        </div>
      </div>
    );
  }

  // Main map render
  return (
    <div
      className={cn(&quot;relative rounded-md overflow-hidden&quot;, className)}
      style={{ height, width }}
    >
      {/* Map container */}
      <div
        ref={mapRef}
        className=&quot;w-full h-full&quot;
        aria-label=&quot;Map showing location markers&quot;
      />

      {/* Controls overlay (optional) */}
      {interactive && locations.length > 0 && (
        <div className=&quot;absolute bottom-4 right-4 z-10&quot;>
          <Button
            variant=&quot;secondary&quot;
            size=&quot;sm&quot;
            className=&quot;h-8 shadow-md bg-white dark:bg-gray-800&quot;
            onClick={resetMapView}
          >
            <MapPin className=&quot;mr-1 h-3.5 w-3.5&quot; />
            <span className=&quot;text-xs">Reset View</span>
          </Button>
        </div>
      )}
    </div>
  );
}

// Export the component as default export
export default LocationMap;
