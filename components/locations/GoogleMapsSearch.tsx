&quot;use client&quot;;

import { useRef, useState, useEffect, useCallback } from &quot;react&quot;;
import { Loader2, MapPin, Search } from &quot;lucide-react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { useStates } from &quot;@/hooks/useStates&quot;;
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from &quot;@react-google-maps/api&quot;;

// Default map center (United States)
const DEFAULT_CENTER = { lat: 37.0902, lng: -95.7129 };

// Google Maps API libraries to load
const LIBRARIES = [&quot;places&quot;] as const;

// Container style for the map
const CONTAINER_STYLE = {
  width: &quot;100%&quot;,
  height: &quot;300px&quot;,
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
    id: &quot;google-map-script&quot;,
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "&quot;,
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
          console.error(&quot;Autocomplete reference is null or undefined&quot;);
          return;
        }

        autocompleteRef.current = autocomplete;

        // Add listener for place selection with error handling
        autocomplete.addListener(&quot;place_changed&quot;, () => {
          try {
            if (!autocompleteRef.current) {
              console.error(&quot;Autocomplete reference lost&quot;);
              return;
            }

            const place = autocompleteRef.current.getPlace();

            // Validate place object before proceeding
            if (!place || typeof place !== &quot;object&quot;) {
              console.error(&quot;Invalid place object returned&quot;, place);
              toast({
                title: &quot;Selection Error&quot;,
                description: &quot;The selected location data is invalid&quot;,
                variant: &quot;destructive&quot;,
              });
              return;
            }

            handlePlaceSelection(place);
          } catch (listenerError) {
            console.error(&quot;Error in place_changed listener:&quot;, listenerError);
            toast({
              title: &quot;Place Selection Error&quot;,
              description: &quot;Failed to process the selected location&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        });
      } catch (error) {
        console.error(&quot;Error setting up autocomplete:&quot;, error);
        toast({
          title: &quot;Setup Error&quot;,
          description: &quot;Failed to initialize address search&quot;,
          variant: &quot;destructive&quot;,
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
        console.error(&quot;Place object is null or undefined&quot;);
        toast({
          title: &quot;Selection Error&quot;,
          description: &quot;No place data was returned&quot;,
          variant: &quot;destructive&quot;,
        });
        return;
      }

      // Validate geometry data
      if (!place.geometry || !place.geometry.location) {
        console.error(&quot;Place has no geometry or location:&quot;, place);
        toast({
          title: &quot;No details available&quot;,
          description: &quot;Please select a location from the dropdown list&quot;,
          variant: &quot;destructive&quot;,
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
          console.error(&quot;Error centering map:&quot;, mapError);
          // Continue despite map centering error
        }
      }

      // Extract location data and pass to parent
      const locationData = extractLocationData(place);

      // Only proceed if we have a valid location
      if (locationData.address1 && locationData.city) {
        findStateIdAndComplete(locationData, place);
      } else {
        console.warn(&quot;Incomplete location data extracted:&quot;, locationData);
        toast({
          title: &quot;Incomplete Location&quot;,
          description:
            &quot;The selected location is missing essential address information&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    } catch (error) {
      console.error(&quot;Error handling place selection:&quot;, error);
      toast({
        title: &quot;Processing Error&quot;,
        description: &quot;Failed to process the selected location&quot;,
        variant: &quot;destructive&quot;,
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
            status === &quot;OK&quot; &&
            results &&
            Array.isArray(results) &&
            results.length > 0
          ) {
            // Validate result
            const firstResult = results[0];

            if (!firstResult || typeof firstResult !== &quot;object&quot;) {
              throw new Error(&quot;Invalid geocoding result structure&quot;);
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
            console.warn(&quot;Geocoding API returned status:&quot;, status);
            toast({
              title: &quot;Geocoding failed&quot;,
              description: `Could not find address for this location: ${status}`,
              variant: &quot;destructive&quot;,
            });
          }
        } catch (callbackError) {
          console.error(&quot;Error processing geocoding result:&quot;, callbackError);
          toast({
            title: &quot;Geocoding error&quot;,
            description: &quot;An error occurred while processing the location data&quot;,
            variant: &quot;destructive&quot;,
          });
        }
      });
    } catch (error) {
      console.error(&quot;Geocoding failed with exception:&quot;, error);
      toast({
        title: &quot;Geocoding error&quot;,
        description: &quot;The geocoding service failed to process your request&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Extract location data from Google API result
  function extractLocationData(
    place: google.maps.places.PlaceResult,
  ): LocationData {
    const locationData: LocationData = {
      address1: &quot;&quot;,
      city: &quot;&quot;,
      state: &quot;&quot;,
      stateId: &quot;&quot;,
      zipcode: &quot;&quot;,
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
          component.types.includes(&quot;street_number&quot;),
        )?.long_name || &quot;&quot;;

      const route =
        place.address_components.find((component) =>
          component.types.includes(&quot;route&quot;),
        )?.long_name || &quot;&quot;;

      // Combine street number and route for address1
      locationData.address1 =
        streetNumber && route
          ? `${streetNumber} ${route}`
          : place.formatted_address?.split(&quot;,&quot;)[0] || &quot;&quot;;

      // Get city (locality)
      locationData.city =
        place.address_components.find((component) =>
          component.types.includes(&quot;locality&quot;),
        )?.long_name || &quot;&quot;;

      // If no locality, try administrative_area_level_2 (county)
      if (!locationData.city) {
        locationData.city =
          place.address_components.find((component) =>
            component.types.includes(&quot;administrative_area_level_2&quot;),
          )?.long_name || &quot;&quot;;
      }

      // Get state (administrative_area_level_1)
      const stateComponent = place.address_components.find((component) =>
        component.types.includes(&quot;administrative_area_level_1&quot;),
      );
      locationData.state = stateComponent?.long_name || &quot;&quot;;

      // Get ZIP code (postal_code)
      locationData.zipcode =
        place.address_components.find((component) =>
          component.types.includes(&quot;postal_code&quot;),
        )?.long_name || &quot;&quot;;
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
        console.warn(&quot;No address components in place object&quot;);
        onLocationSelect(locationData);
        return;
      }

      const stateComponent = place.address_components.find((component) =>
        component.types.includes(&quot;administrative_area_level_1&quot;),
      );

      const stateAbbreviation = stateComponent?.short_name || &quot;&quot;;

      if (!stateAbbreviation) {
        console.warn(&quot;No state abbreviation found in address&quot;);
        onLocationSelect(locationData);
        return;
      }

      console.log(&quot;Found state abbreviation:&quot;, stateAbbreviation);

      // Use our local states data to get the state ID
      const stateId = findStateIdByAbbreviation(stateAbbreviation);

      if (stateId) {
        console.log(&quot;Found state ID:&quot;, stateId);
        locationData.stateId = stateId;
      } else {
        console.warn(&quot;No state ID found for abbreviation:&quot;, stateAbbreviation);
      }

      // Always proceed with the location selection
      onLocationSelect(locationData);
    } catch (error) {
      console.error(&quot;Error in findStateIdAndComplete:&quot;, error);
      // Continue with the process anyway, even without the state ID
      onLocationSelect(locationData);
    }
  }

  // Check if API failed to load
  if (loadError) {
    return (
      <div className=&quot;space-y-4&quot;>
        <div className=&quot;text-red-500 p-4 border border-red-200 rounded-md bg-red-50&quot;>
          <p className=&quot;font-medium&quot;>Error loading Google Maps</p>
          <p className=&quot;text-sm mt-2&quot;>{loadError.message}</p>
          <p className=&quot;text-sm mt-2&quot;>
            Please check your Google Maps API key configuration or try manual
            entry instead.
          </p>
          <Button
            variant=&quot;outline&quot;
            onClick={onToggleManualEntry}
            className=&quot;mt-4 w-full&quot;
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
      <div className=&quot;flex items-center justify-center p-6&quot;>
        <Loader2 className=&quot;h-6 w-6 animate-spin text-primary mr-2&quot; />
        <p>Loading Google Maps...</p>
      </div>
    );
  }

  return (
    <div className=&quot;space-y-4&quot;>
      {/* Search input with autocomplete */}
      <div className=&quot;relative&quot;>
        <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400&quot; />
        <Autocomplete
          onLoad={onAutocompleteLoad}
          options={{
            types: [&quot;address&quot;, &quot;establishment&quot;],
            fields: [
              &quot;address_components&quot;,
              &quot;formatted_address&quot;,
              &quot;geometry&quot;,
              &quot;name&quot;,
              &quot;place_id&quot;,
            ],
          }}
        >
          <Input
            ref={inputRef}
            type=&quot;text&quot;
            placeholder=&quot;Search for a location or enter an address...&quot;
            className=&quot;pl-8 w-full&quot;
          />
        </Autocomplete>
      </div>

      {/* Toggle to manual entry button */}
      <Button
        variant=&quot;outline&quot;
        onClick={onToggleManualEntry}
        type=&quot;button&quot;
        className=&quot;w-full&quot;
      >
        Enter Address Manually
      </Button>

      {/* Google Map */}
      <div className=&quot;w-full&quot;>
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
        <Card className=&quot;mt-4&quot;>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-start space-x-3&quot;>
              <div className=&quot;flex-shrink-0 mt-1&quot;>
                <MapPin className=&quot;h-5 w-5 text-primary&quot; />
              </div>
              <div>
                <div className=&quot;font-medium&quot;>
                  {selectedPlace.name ||
                    selectedPlace.formatted_address.split(&quot;,&quot;)[0]}
                </div>
                <div className=&quot;text-sm text-gray-600 dark:text-gray-400 mt-1">
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
