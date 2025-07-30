&quot;use client&quot;;

import React, { useState, useCallback, useEffect } from &quot;react&quot;;
import { useTheme } from &quot;next-themes&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Loader2, MapPin, AlertTriangle } from &quot;lucide-react&quot;;
import { Loader } from &quot;@googlemaps/js-api-loader&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card } from &quot;@/components/ui/card&quot;;
import {
  getGoogleMapsLoaderConfig,
  getGoogleMapsOptions,
} from &quot;@/config/google-maps&quot;;

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
  height = &quot;100%&quot;,
  width = &quot;100%&quot;,
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
    queryKey: [&quot;/api/admin/locations&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/admin/locations&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch locations&quot;);
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
        console.error(&quot;Error loading Google Maps:&quot;, err);
        setMapError(&quot;Failed to load Google Maps. Please try again later.&quot;);
      }
    };

    loadMap();
  }, [mapLoaded, theme, zoom, showControls]);

  // Update markers when locations data changes or map is loaded
  useEffect(() => {
    if (!map || !locations || locations.length === 0) return;

    // Clear existing markers
    markers.forEach(({ marker }) => {
      if (&quot;map&quot; in marker) {
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
          &quot;marker&quot; in google.maps &&
          &quot;AdvancedMarkerElement&quot; in google.maps.marker
        ) {
          const markerElement = document.createElement(&quot;div&quot;);
          markerElement.className = &quot;marker-pin&quot;;
          markerElement.innerHTML = `
          <div class=&quot;flex items-center justify-center w-8 h-8 text-white rounded-full ${
            location.status === &quot;pending&quot;
              ? &quot;bg-amber-500&quot;
              : location.status === &quot;rejected&quot;
                ? &quot;bg-red-500&quot;
                : location.status === &quot;inactive&quot;
                  ? &quot;bg-slate-500&quot;
                  : &quot;bg-emerald-500&quot;
          } shadow-md border-2 border-white&quot;>
            <svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;>
              <path d=&quot;M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z&quot;></path>
              <circle cx=&quot;12&quot; cy=&quot;10&quot; r=&quot;3&quot;></circle>
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
                location.status === &quot;pending&quot;
                  ? &quot;#f59e0b&quot;
                  : location.status === &quot;rejected&quot;
                    ? &quot;#ef4444&quot;
                    : location.status === &quot;inactive&quot;
                      ? &quot;#94a3b8&quot;
                      : &quot;#10b981&quot;,
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: &quot;#ffffff&quot;,
              scale: 10,
            },
          });
        }

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
          <div class=&quot;p-2 max-w-[250px]&quot;>
            <h3 class=&quot;font-semibold text-sm&quot;>${location.name}</h3>
            <p class=&quot;text-xs opacity-75 truncate&quot;>${location.address}</p>
            <p class=&quot;text-xs opacity-75&quot;>${location.city}, ${location.state} ${location.zipCode}</p>
            <div class=&quot;mt-1 text-xs&quot;>
              <span class=&quot;inline-block px-1.5 py-0.5 rounded-full ${
                location.status === &quot;pending&quot;
                  ? &quot;bg-amber-100 text-amber-800&quot;
                  : location.status === &quot;rejected&quot;
                    ? &quot;bg-red-100 text-red-800&quot;
                    : location.status === &quot;inactive&quot;
                      ? &quot;bg-slate-100 text-slate-800&quot;
                      : &quot;bg-emerald-100 text-emerald-800&quot;
              }&quot;>
                ${location.status.charAt(0).toUpperCase() + location.status.slice(1)}
              </span>
            </div>
          </div>
        `,
          pixelOffset: new google.maps.Size(0, -10),
        });

        // Add click listener
        if (&quot;addListener&quot; in marker) {
          marker.addListener(&quot;click&quot;, () => {
            selectMarker(marker, location, infoWindow);
          });
        } else {
          marker.addEventListener(&quot;click&quot;, () => {
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

      // If there&apos;s only one marker, zoom out a bit
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
        if (&quot;position&quot; in marker) {
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
      <div className=&quot;flex items-center justify-center h-full w-full bg-muted/20&quot;>
        <div className=&quot;flex flex-col items-center gap-2&quot;>
          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
          <p className=&quot;text-sm text-muted-foreground&quot;>
            Loading location data...
          </p>
        </div>
      </div>
    );
  }

  if (error || mapError) {
    return (
      <div className=&quot;flex items-center justify-center h-full w-full bg-muted/10&quot;>
        <Card className=&quot;p-4 max-w-md&quot;>
          <div className=&quot;flex flex-col items-center gap-3 text-center&quot;>
            <AlertTriangle className=&quot;h-8 w-8 text-amber-500&quot; />
            <h3 className=&quot;font-semibold&quot;>Map Error</h3>
            <p className=&quot;text-sm text-muted-foreground mb-2&quot;>
              {mapError ||
                &quot;Failed to load location data. Please try again later.&quot;}
            </p>
            <Button
              variant=&quot;outline&quot;
              size=&quot;sm&quot;
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
      <div className=&quot;flex items-center justify-center h-full w-full bg-muted/10&quot;>
        <div className=&quot;flex flex-col items-center gap-2 p-4 max-w-md text-center&quot;>
          <MapPin className=&quot;h-8 w-8 text-muted-foreground/50&quot; />
          <h3 className=&quot;font-semibold&quot;>No Locations</h3>
          <p className=&quot;text-sm text-muted-foreground&quot;>
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
      className=&quot;rounded-md overflow-hidden bg-muted/10&quot;
    ></div>
  );
}

export default SimplifiedLocationMap;
