"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useStates } from "@/hooks/useStates";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

// Default map center (United States)
const DEFAULT_CENTER = { lat: 37.0902, lng: -95.7129 };

// Google Maps API libraries to load
const LIBRARIES = ["places"] as const;

// Container style for the map
const CONTAINER_STYLE = {
  width: "100%",
  height: "300px",
};

// Map Options
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
};

interface LocationData {
  address1: string;
  address2?: string;
  city: string;
  state: string;
  stateId: string;
  zipcode: string;
  name?: string;
  latitude?: number;
  longitude?: number;
}

interface GoogleMapsSearchProps {
  onLocationSelect: (location: LocationData) => void;
  onToggleManualEntry: () => void;
}

export default function GoogleMapsSearch({
  onLocationSelect,
  onToggleManualEntry,
}: GoogleMapsSearchProps) {
  // Google Maps API loader
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  // Refs and state
  const mapRef = useRef<google.maps.Map | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  const { toast } = useToast();

  // Initialize map
  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Initialize autocomplete with error handling
  const onAutocompleteLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      try {
        if (!autocomplete) {
          console.error("Autocomplete reference is null or undefined");
          return;
        }

        autocompleteRef.current = autocomplete;

        // Add listener for place selection with error handling
        autocomplete.addListener("place_changed", () => {
          try {
            if (!autocompleteRef.current) {
              console.error("Autocomplete reference lost");
              return;
            }

            const place = autocompleteRef.current.getPlace();

            // Validate place object before proceeding
            if (!place || typeof place !== "object") {
              console.error("Invalid place object returned", place);
              toast({
                title: "Selection Error",
                description: "The selected location data is invalid",
                variant: "destructive",
              });
              return;
            }

            handlePlaceSelection(place);
          } catch (listenerError) {
            console.error("Error in place_changed listener:", listenerError);
            toast({
              title: "Place Selection Error",
              description: "Failed to process the selected location",
              variant: "destructive",
            });
          }
        });
      } catch (error) {
        console.error("Error setting up autocomplete:", error);
        toast({
          title: "Setup Error",
          description: "Failed to initialize address search",
          variant: "destructive",
        });
      }
    },
    [toast],
  );

  // Handle place selection from autocomplete with enhanced error handling
  const handlePlaceSelection = (place: google.maps.places.PlaceResult) => {
    try {
      // Validate place object
      if (!place) {
        console.error("Place object is null or undefined");
        toast({
          title: "Selection Error",
          description: "No place data was returned",
          variant: "destructive",
        });
        return;
      }

      // Validate geometry data
      if (!place.geometry || !place.geometry.location) {
        console.error("Place has no geometry or location:", place);
        toast({
          title: "No details available",
          description: "Please select a location from the dropdown list",
          variant: "destructive",
        });
        return;
      }

      // Store place data
      setSelectedPlace(place);

      // Set marker position
      setMarker(place.geometry.location);

      // Center map on the selected place
      if (mapRef.current) {
        try {
          if (place.geometry.viewport) {
            mapRef.current.fitBounds(place.geometry.viewport);
          } else {
            mapRef.current.setCenter(place.geometry.location);
            mapRef.current.setZoom(17);
          }
        } catch (mapError) {
          console.error("Error centering map:", mapError);
          // Continue despite map centering error
        }
      }

      // Extract location data and pass to parent
      const locationData = extractLocationData(place);

      // Only proceed if we have a valid location
      if (locationData.address1 && locationData.city) {
        findStateIdAndComplete(locationData, place);
      } else {
        console.warn("Incomplete location data extracted:", locationData);
        toast({
          title: "Incomplete Location",
          description:
            "The selected location is missing essential address information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error handling place selection:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process the selected location",
        variant: "destructive",
      });
    }
  };

  // Map click handler with enhanced error handling
  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!event.latLng) return;

    setMarker(event.latLng);

    try {
      // Reverse geocode the clicked location
      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location: event.latLng }, (results, status) => {
        try {
          if (
            status === "OK" &&
            results &&
            Array.isArray(results) &&
            results.length > 0
          ) {
            // Validate result
            const firstResult = results[0];

            if (!firstResult || typeof firstResult !== "object") {
              throw new Error("Invalid geocoding result structure");
            }

            setSelectedPlace(firstResult);

            // Extract location data and pass to parent
            const locationData = extractLocationData(firstResult);
            findStateIdAndComplete(locationData, firstResult);

            // Center map on the clicked location
            if (mapRef.current && event.latLng) {
              mapRef.current.setCenter(event.latLng);
            }
          } else {
            console.warn("Geocoding API returned status:", status);
            toast({
              title: "Geocoding failed",
              description: `Could not find address for this location: ${status}`,
              variant: "destructive",
            });
          }
        } catch (callbackError) {
          console.error("Error processing geocoding result:", callbackError);
          toast({
            title: "Geocoding error",
            description: "An error occurred while processing the location data",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Geocoding failed with exception:", error);
      toast({
        title: "Geocoding error",
        description: "The geocoding service failed to process your request",
        variant: "destructive",
      });
    }
  };

  // Extract location data from Google API result
  function extractLocationData(
    place: google.maps.places.PlaceResult,
  ): LocationData {
    const locationData: LocationData = {
      address1: "",
      city: "",
      state: "",
      stateId: "",
      zipcode: "",
    };

    // Get name if available
    if (place.name) {
      locationData.name = place.name;
    }

    // Extract address components
    if (place.address_components) {
      // Get street number and route for address1
      const streetNumber =
        place.address_components.find((component) =>
          component.types.includes("street_number"),
        )?.long_name || "";

      const route =
        place.address_components.find((component) =>
          component.types.includes("route"),
        )?.long_name || "";

      // Combine street number and route for address1
      locationData.address1 =
        streetNumber && route
          ? `${streetNumber} ${route}`
          : place.formatted_address?.split(",")[0] || "";

      // Get city (locality)
      locationData.city =
        place.address_components.find((component) =>
          component.types.includes("locality"),
        )?.long_name || "";

      // If no locality, try administrative_area_level_2 (county)
      if (!locationData.city) {
        locationData.city =
          place.address_components.find((component) =>
            component.types.includes("administrative_area_level_2"),
          )?.long_name || "";
      }

      // Get state (administrative_area_level_1)
      const stateComponent = place.address_components.find((component) =>
        component.types.includes("administrative_area_level_1"),
      );
      locationData.state = stateComponent?.long_name || "";

      // Get ZIP code (postal_code)
      locationData.zipcode =
        place.address_components.find((component) =>
          component.types.includes("postal_code"),
        )?.long_name || "";
    }

    // Get coordinates
    if (place.geometry?.location) {
      locationData.latitude = place.geometry.location.lat();
      locationData.longitude = place.geometry.location.lng();
    }

    return locationData;
  }

  // Use our states data hook
  const {
    states,
    loading: statesLoading,
    findStateIdByAbbreviation,
  } = useStates();

  // Find state ID by abbreviation and complete selection process
  function findStateIdAndComplete(
    locationData: LocationData,
    place: google.maps.places.PlaceResult,
  ) {
    try {
      // Find the state abbreviation from address components
      if (!place.address_components) {
        console.warn("No address components in place object");
        onLocationSelect(locationData);
        return;
      }

      const stateComponent = place.address_components.find((component) =>
        component.types.includes("administrative_area_level_1"),
      );

      const stateAbbreviation = stateComponent?.short_name || "";

      if (!stateAbbreviation) {
        console.warn("No state abbreviation found in address");
        onLocationSelect(locationData);
        return;
      }

      console.log("Found state abbreviation:", stateAbbreviation);

      // Use our local states data to get the state ID
      const stateId = findStateIdByAbbreviation(stateAbbreviation);

      if (stateId) {
        console.log("Found state ID:", stateId);
        locationData.stateId = stateId;
      } else {
        console.warn("No state ID found for abbreviation:", stateAbbreviation);
      }

      // Always proceed with the location selection
      onLocationSelect(locationData);
    } catch (error) {
      console.error("Error in findStateIdAndComplete:", error);
      // Continue with the process anyway, even without the state ID
      onLocationSelect(locationData);
    }
  }

  // Check if API failed to load
  if (loadError) {
    return (
      <div className="space-y-4">
        <div className="text-red-500 p-4 border border-red-200 rounded-md bg-red-50">
          <p className="font-medium">Error loading Google Maps</p>
          <p className="text-sm mt-2">{loadError.message}</p>
          <p className="text-sm mt-2">
            Please check your Google Maps API key configuration or try manual
            entry instead.
          </p>
          <Button
            variant="outline"
            onClick={onToggleManualEntry}
            className="mt-4 w-full"
          >
            Enter Address Manually
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search input with autocomplete */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
        <Autocomplete
          onLoad={onAutocompleteLoad}
          options={{
            types: ["address", "establishment"],
            fields: [
              "address_components",
              "formatted_address",
              "geometry",
              "name",
              "place_id",
            ],
          }}
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for a location or enter an address..."
            className="pl-8 w-full"
          />
        </Autocomplete>
      </div>

      {/* Toggle to manual entry button */}
      <Button
        variant="outline"
        onClick={onToggleManualEntry}
        type="button"
        className="w-full"
      >
        Enter Address Manually
      </Button>

      {/* Google Map */}
      <div className="w-full">
        <GoogleMap
          mapContainerStyle={CONTAINER_STYLE}
          center={DEFAULT_CENTER}
          zoom={4}
          onLoad={onMapLoad}
          onClick={handleMapClick}
          options={MAP_OPTIONS}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>
      </div>

      {/* Selected place information */}
      {selectedPlace && selectedPlace.formatted_address && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">
                  {selectedPlace.name ||
                    selectedPlace.formatted_address.split(",")[0]}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedPlace.formatted_address}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
