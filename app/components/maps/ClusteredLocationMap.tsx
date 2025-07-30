"use client";

import React, {
  useCallback,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Loader2, MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import { GoogleMapsContext } from "./GoogleMapsContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Location point interface for the map
interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  type?: string;
  status?: string;
}

// Location stats interface for displaying count badges
interface LocationStats {
  total: number;
  byType?: Record<string, number>;
  byStatus?: Record<string, number>;
  byState?: Record<string, number>;
}

interface ClusteredLocationMapProps {
  locations: LocationPoint[];
  height?: string | number;
  className?: string;
  onMapLoad?: (map: google.maps.Map) => void;
  onMarkerClick?: (location: LocationPoint) => void;
  onViewLocationDetail?: (locationId: string) => void;
  enableFiltering?: boolean;
  onFilterChange?: (filter: {
    type?: string;
    status?: string;
    state?: string;
  }) => void;
  resetFilter?: boolean;
  mapZoom?: number;
  initialCenter?: { lat: number; lng: number };
  stats?: LocationStats;
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

// Colors for different location types
const typeColors: Record<string, string> = {
  venue: "#3b82f6", // blue
  office: "#10b981", // green
  storage: "#f59e0b", // amber
  other: "#6366f1", // indigo
  default: "#6b7280", // gray
};

// Colors for different location statuses
const statusColors: Record<string, string> = {
  active: "#10b981", // green
  pending: "#f59e0b", // amber
  rejected: "#ef4444", // red
  inactive: "#6b7280", // gray
  default: "#9ca3af", // gray
};

export function ClusteredLocationMap({
  locations = [],
  height = "500px",
  className = "",
  onMapLoad,
  onMarkerClick,
  onViewLocationDetail,
  enableFiltering = true,
  onFilterChange,
  resetFilter = false,
  mapZoom,
  initialCenter,
  stats,
}: ClusteredLocationMapProps) {
  const { theme, resolvedTheme } = useTheme();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerClustererRef = useRef<MarkerClusterer | null>(null);

  // State for managing info window
  const [selectedLocation, setSelectedLocation] =
    useState<LocationPoint | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);

  // State for filters
  const [activeFilters, setActiveFilters] = useState<{
    type?: string;
    status?: string;
    state?: string;
  }>({});

  // Get Google Maps loading state from context
  const {
    isLoaded: isMapsApiLoaded,
    loadError,
    mapId,
  } = useContext(GoogleMapsContext);

  // Custom container style with dynamic height
  const containerStyle = {
    ...mapContainerStyle,
    height: typeof height === "number" ? `${height}px` : height,
  };

  // Reset filters when resetFilter prop changes
  useEffect(() => {
    if (resetFilter) {
      setActiveFilters({});
      if (onFilterChange) {
        onFilterChange({});
      }
    }
  }, [resetFilter, onFilterChange]);

  // Handle location filtering
  const handleFilter = (
    filterType: "type" | "status" | "state",
    value: string,
  ) => {
    setActiveFilters((prev) => {
      // Toggle filter - remove if already active, add if not
      const newFilters = { ...prev };
      if (prev[filterType] === value) {
        delete newFilters[filterType];
      } else {
        newFilters[filterType] = value;
      }

      // Notify parent component of filter change
      if (onFilterChange) {
        onFilterChange(newFilters);
      }

      return newFilters;
    });
  };

  // Handle clearing all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    if (onFilterChange) {
      onFilterChange({});
    }
  };

  // Update map theme when global theme changes
  useEffect(() => {
    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    setMapTheme(currentTheme);

    // If map is already loaded, apply the theme style
    if (mapRef.current) {
      applyMapStyle(mapRef.current, currentTheme);
    }
  }, [resolvedTheme]);

  // Apply map style based on theme
  const applyMapStyle = (map: google.maps.Map, theme: "light" | "dark") => {
    // With mapId, we don't need to set styles - they're configured in the Google Cloud Console
    if (process.env.NODE_ENV === "development") {
      console.debug(`Using map theme: ${theme} with mapId`);
    }
  };

  // Filter markers based on active filters
  const filterMarkers = useCallback(() => {
    if (!mapLoaded || !markerClustererRef.current) return;

    // Show/hide markers based on filters
    markersRef.current.forEach((marker, index) => {
      const loc = locations[index];
      let visible = true;

      // Apply each active filter
      if (activeFilters.type && loc.type !== activeFilters.type) {
        visible = false;
      }
      if (activeFilters.status && loc.status !== activeFilters.status) {
        visible = false;
      }
      if (activeFilters.state && loc.state !== activeFilters.state) {
        visible = false;
      }

      // Set marker visibility
      marker.map = visible ? mapRef.current : null;
    });

    // Force clusterer to redraw
    markerClustererRef.current.render();
  }, [activeFilters, locations, mapLoaded]);

  // Apply filters whenever active filters change
  useEffect(() => {
    filterMarkers();
  }, [activeFilters, filterMarkers]);

  // Setup marker clusterer when map is loaded and markers change
  const setupClusterer = useCallback(() => {
    if (!mapRef.current || !mapLoaded || !window.google?.maps) return;

    // Clear existing markers
    if (markerClustererRef.current) {
      markerClustererRef.current.clearMarkers();
    }
    markersRef.current = [];

    // Create markers for each location
    const markers: google.maps.marker.AdvancedMarkerElement[] = locations
      .map((loc, index) => {
        // Skip if location has no lat/lng
        if (!loc.latitude || !loc.longitude) return null;

        // Create a marker element with appropriate styling based on location type
        const markerElement = document.createElement("div");
        const locationType = loc.type || "default";
        const markerColor = typeColors[locationType] || typeColors.default;

        markerElement.className =
          "flex items-center justify-center w-8 h-8 rounded-full shadow-lg transition-all duration-200 cursor-pointer hover:scale-110";
        markerElement.style.backgroundColor = markerColor;
        markerElement.style.color = "white";
        markerElement.style.border = "2px solid white";
        markerElement.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

        // Create the advanced marker
        const marker = new window.google.maps.marker.AdvancedMarkerElement({
          map: mapRef.current,
          position: { lat: loc.latitude, lng: loc.longitude },
          title: loc.name || `Location ${index + 1}`,
          content: markerElement,
        });

        // Add event listener for marker click
        marker.addEventListener("gmp-click", () => {
          setSelectedLocation(loc);
          setIsInfoOpen(true);
          if (onMarkerClick) onMarkerClick(loc);
        });

        return marker;
      })
      .filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

    // Save markers for future reference
    markersRef.current = markers;

    // Create a new MarkerClusterer
    if (markers.length > 0 && window.google?.maps) {
      const clustererOptions = {
        map: mapRef.current,
        markers: markers,
        algorithm: new window.google.maps.markerclusterer.SuperClusterAlgorithm(
          {
            radius: 100,
            maxZoom: 16,
          },
        ),
        renderer: {
          render: ({ count, position }) => {
            // Create a custom clusterer marker
            const clusterElement = document.createElement("div");
            clusterElement.className =
              "flex items-center justify-center rounded-full";
            clusterElement.style.width = `${Math.max(40, Math.min(60, 30 + Math.log10(count) * 10))}px`;
            clusterElement.style.height = `${Math.max(40, Math.min(60, 30 + Math.log10(count) * 10))}px`;
            clusterElement.style.backgroundColor =
              resolvedTheme === "dark" ? "#4f46e5" : "#4338ca"; // indigo
            clusterElement.style.color = "white";
            clusterElement.style.border = "3px solid white";
            clusterElement.style.boxShadow =
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            clusterElement.style.display = "flex";
            clusterElement.style.alignItems = "center";
            clusterElement.style.justifyContent = "center";
            clusterElement.style.fontWeight = "bold";
            clusterElement.style.fontSize = "14px";
            clusterElement.innerText = count.toString();

            // Create the advanced marker for the cluster
            return new window.google.maps.marker.AdvancedMarkerElement({
              map: mapRef.current,
              position,
              content: clusterElement,
            });
          },
        },
      };

      // Create the MarkerClusterer
      markerClustererRef.current = new MarkerClusterer(clustererOptions);

      // Apply filters to show/hide markers
      filterMarkers();
    }
  }, [locations, mapLoaded, onMarkerClick, resolvedTheme, filterMarkers]);

  // Map load handler
  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      setMapLoaded(true);

      // Apply theme styling to map on load
      applyMapStyle(map, mapTheme);

      // Pass the map reference to parent components if needed
      if (onMapLoad) onMapLoad(map);
    },
    [onMapLoad, mapTheme],
  );

  // Setup clusterer when map is loaded or locations change
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      setupClusterer();
    }
  }, [mapLoaded, locations, setupClusterer]);

  // Calculate appropriate center and zoom to fit all markers
  const calculateBounds = useCallback(() => {
    if (!mapRef.current || locations.length === 0) return;

    const bounds = new google.maps.LatLngBounds();

    // Include all locations in the bounds calculation
    locations.forEach((loc) => {
      bounds.extend({ lat: loc.latitude, lng: loc.longitude });
    });

    // Adjust map to fit all markers
    mapRef.current.fitBounds(bounds);

    // Don't zoom in too far for a single location
    const zoom = mapRef.current.getZoom();
    if (zoom !== undefined && zoom > 12 && locations.length <= 2) {
      mapRef.current.setZoom(12);
    }
  }, [locations]);

  // Apply bounds calculation after map is loaded
  useEffect(() => {
    if (mapRef.current && mapLoaded && locations.length > 0) {
      calculateBounds();
    }
  }, [mapLoaded, locations, calculateBounds]);

  // Create filter option lists
  const typeOptions = Array.from(
    new Set(locations.map((loc) => loc.type).filter(Boolean)),
  );
  const stateOptions = Array.from(
    new Set(locations.map((loc) => loc.state).filter(Boolean)),
  );
  const statusOptions = Array.from(
    new Set(locations.map((loc) => loc.status).filter(Boolean)),
  );

  // Sort options alphabetically
  typeOptions.sort();
  stateOptions.sort();
  statusOptions.sort();

  // Render location detail and action buttons
  const renderLocationDetail = () => {
    if (!selectedLocation) return null;

    return (
      <div className="p-4">
        <h3
          className={`text-lg font-medium ${mapTheme === "dark" ? "text-white" : "text-gray-900"}`}
        >
          {selectedLocation.name}
        </h3>

        <div className="flex flex-wrap gap-1 my-1">
          {selectedLocation.type && (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${typeColors[selectedLocation.type] || typeColors.default}20`,
                color: typeColors[selectedLocation.type] || typeColors.default,
                borderColor: `${typeColors[selectedLocation.type] || typeColors.default}40`,
              }}
            >
              {selectedLocation.type}
            </Badge>
          )}

          {selectedLocation.status && (
            <Badge
              variant="outline"
              style={{
                backgroundColor: `${statusColors[selectedLocation.status] || statusColors.default}20`,
                color:
                  statusColors[selectedLocation.status] || statusColors.default,
                borderColor: `${statusColors[selectedLocation.status] || statusColors.default}40`,
              }}
            >
              {selectedLocation.status}
            </Badge>
          )}
        </div>

        {selectedLocation.address && (
          <p
            className={`text-sm ${mapTheme === "dark" ? "text-gray-300" : "text-gray-600"} my-1`}
          >
            {selectedLocation.address}
          </p>
        )}

        {selectedLocation.city && selectedLocation.state && (
          <p
            className={`text-sm ${mapTheme === "dark" ? "text-gray-300" : "text-gray-600"} my-1`}
          >
            {selectedLocation.city}, {selectedLocation.state}
          </p>
        )}

        <p
          className={`text-xs font-mono ${mapTheme === "dark" ? "text-gray-400" : "text-gray-500"} my-1`}
        >
          {selectedLocation.latitude.toFixed(6)},{" "}
          {selectedLocation.longitude.toFixed(6)}
        </p>

        {/* Action buttons */}
        <div className="mt-3 flex space-x-2">
          <Button
            size="sm"
            variant="default"
            onClick={() =>
              onViewLocationDetail && onViewLocationDetail(selectedLocation.id)
            }
          >
            View Details
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInfoOpen(false)}
          >
            Close
          </Button>
        </div>
      </div>
    );
  };

  // Render filter badges
  const renderFilterBadges = () => {
    if (!enableFiltering) return null;

    return (
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 max-w-[70%]">
        {Object.entries(activeFilters).map(([key, value]) => (
          <Badge
            key={`${key}-${value}`}
            variant="outline"
            className="bg-background/80 backdrop-blur-sm shadow-sm cursor-pointer"
            onClick={() => handleFilter(key as "type" | "status" | "state", "")}
          >
            {key}: {value}
            <span className="ml-1 font-bold text-muted-foreground hover:text-foreground">
              ×
            </span>
          </Badge>
        ))}

        {Object.keys(activeFilters).length > 0 && (
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm shadow-sm cursor-pointer hover:bg-muted"
            onClick={clearAllFilters}
          >
            Clear All
          </Badge>
        )}
      </div>
    );
  };

  // Render filter panel
  const renderFilterPanel = () => {
    if (!enableFiltering) return null;

    return (
      <div className="absolute bottom-4 right-4 z-10 p-3 rounded-lg bg-background/80 backdrop-blur-sm shadow-md max-w-[250px] border">
        <h3 className="text-sm font-medium mb-2">Filter Locations</h3>

        {/* Type filters */}
        {typeOptions.length > 0 && (
          <div className="mb-2">
            <p className="text-xs mb-1 text-muted-foreground">By Type</p>
            <div className="flex flex-wrap gap-1">
              {typeOptions.map((type) => (
                <Badge
                  key={`type-${type}`}
                  variant={activeFilters.type === type ? "default" : "outline"}
                  className="cursor-pointer"
                  style={
                    activeFilters.type === type
                      ? {
                          backgroundColor:
                            typeColors[type] || typeColors.default,
                          color: "white",
                        }
                      : {}
                  }
                  onClick={() => handleFilter("type", type)}
                >
                  {type} {stats?.byType?.[type] && `(${stats.byType[type]})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Status filters */}
        {statusOptions.length > 0 && (
          <div className="mb-2">
            <p className="text-xs mb-1 text-muted-foreground">By Status</p>
            <div className="flex flex-wrap gap-1">
              {statusOptions.map((status) => (
                <Badge
                  key={`status-${status}`}
                  variant={
                    activeFilters.status === status ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  style={
                    activeFilters.status === status
                      ? {
                          backgroundColor:
                            statusColors[status] || statusColors.default,
                          color: "white",
                        }
                      : {}
                  }
                  onClick={() => handleFilter("status", status)}
                >
                  {status}{" "}
                  {stats?.byStatus?.[status] && `(${stats.byStatus[status]})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* State filters - only show if we have many states */}
        {stateOptions.length > 0 && stateOptions.length <= 10 && (
          <div className="mb-2">
            <p className="text-xs mb-1 text-muted-foreground">By State</p>
            <div className="flex flex-wrap gap-1">
              {stateOptions.map((state) => (
                <Badge
                  key={`state-${state}`}
                  variant={
                    activeFilters.state === state ? "default" : "outline"
                  }
                  className="cursor-pointer"
                  onClick={() => handleFilter("state", state)}
                >
                  {state}{" "}
                  {stats?.byState?.[state] && `(${stats.byState[state]})`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* State filters - dropdown for many states */}
        {stateOptions.length > 10 && (
          <div className="mb-2">
            <p className="text-xs mb-1 text-muted-foreground">By State</p>
            <select
              className="w-full h-8 rounded-md border border-input bg-background text-sm"
              value={activeFilters.state || ""}
              onChange={(e) => handleFilter("state", e.target.value)}
            >
              <option value="">All States</option>
              {stateOptions.map((state) => (
                <option key={`state-${state}`} value={state}>
                  {state}{" "}
                  {stats?.byState?.[state] && `(${stats.byState[state]})`}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    );
  };

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
      {isMapsApiLoaded && !loadError && (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={initialCenter || defaultCenter}
          zoom={mapZoom || 4}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            mapId: mapId || undefined,
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
              onCloseClick={() => setIsInfoOpen(false)}
              options={{
                pixelOffset: new window.google.maps.Size(0, -40),
                disableAutoPan: false,
              }}
            >
              <div
                className={`max-w-[300px] rounded-md ${
                  mapTheme === "dark"
                    ? "bg-gray-800 text-white border border-gray-700"
                    : "bg-white text-gray-900"
                }`}
              >
                {renderLocationDetail()}
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}

      {/* Show filter UI */}
      {enableFiltering && mapLoaded && !loadError && (
        <>
          {renderFilterBadges()}
          {renderFilterPanel()}
        </>
      )}

      {/* Loading overlay */}
      {(!isMapsApiLoaded || !mapLoaded) && !loadError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}

      {/* Stats badge - show total count */}
      {stats && (
        <div className="absolute top-4 right-4 z-10">
          <Badge
            variant="outline"
            className="bg-background/80 backdrop-blur-sm shadow-sm"
          >
            <MapPin className="w-3 h-3 mr-1" />
            {stats.total} {stats.total === 1 ? "Location" : "Locations"}
          </Badge>
        </div>
      )}
    </div>
  );
}
