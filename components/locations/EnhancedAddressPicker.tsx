&quot;use client&quot;;

import { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, MapPin, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Augment Window interface to add Google Maps properties
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name?: string;
}

interface EnhancedAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

/**
 * Enhanced Address Picker using modern Google Maps JS API
 * This version uses the recommended AutocompleteSuggestion and Place APIs
 */
export default function EnhancedAddressPicker({
  onAddressSelect,
  className = "&quot;,
}: EnhancedAddressPickerProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState(&quot;&quot;);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        &quot;EnhancedAddressPicker: Map container or Google Maps not available&quot;,
      );
      return;
    }

    console.log(
      &quot;EnhancedAddressPicker: Initializing map with location:&quot;,
      location,
    );

    try {
      // Set map options
      const mapOptions = {
        center: location,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      // Create or reuse map
      let mapInstance = map;
      if (!mapInstance) {
        console.log(&quot;EnhancedAddressPicker: Creating new map instance&quot;);
        mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(mapInstance);
      } else {
        console.log(&quot;EnhancedAddressPicker: Reusing existing map instance&quot;);
        mapInstance.setCenter(location);
      }

      // Create or reuse marker
      let markerInstance = marker;
      if (!markerInstance) {
        console.log(&quot;EnhancedAddressPicker: Creating new marker&quot;);
        markerInstance = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          animation: window.google.maps.Animation.DROP,
        });
        setMarker(markerInstance);
      } else {
        console.log(&quot;EnhancedAddressPicker: Updating existing marker&quot;);
        markerInstance.setPosition(location);
      }
    } catch (error) {
      console.error(&quot;EnhancedAddressPicker: Error initializing map:&quot;, error);
      toast({
        title: &quot;Map Error&quot;,
        description: &quot;Could not display the map&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Track when Google Maps API is loaded
  useEffect(() => {
    // Define the initialization function
    function initializeServices() {
      try {
        console.log(&quot;EnhancedAddressPicker: Initializing Google services...&quot;);

        // Nothing special to initialize for now

        setGoogleInitialized(true);
        console.log(
          &quot;EnhancedAddressPicker: Google services initialized successfully&quot;,
        );
      } catch (error) {
        console.error(
          &quot;EnhancedAddressPicker: Error initializing Google services:&quot;,
          error,
        );
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to initialize location services&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    // Set up callback for script loading
    window.initGoogleMaps = () => {
      console.log(
        &quot;[EnhancedAddressPicker] Google Maps initialized via callback&quot;,
      );
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        &quot;[EnhancedAddressPicker] Google Maps already loaded, initializing services&quot;,
      );
      initializeServices();
      return;
    }

    // Check if script is already in document but not fully loaded
    const existingScript = document.querySelector(
      'script[src*=&quot;maps.googleapis.com/maps/api&quot;]',
    );
    if (existingScript) {
      console.log(
        &quot;[EnhancedAddressPicker] Google Maps script already exists, waiting for load&quot;,
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log(&quot;[EnhancedAddressPicker] Loading Google Maps script...&quot;);
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || &quot;&quot;;
    const script = document.createElement(&quot;script&quot;);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.onerror = () => {
      console.error(
        &quot;[EnhancedAddressPicker] Failed to load Google Maps script&quot;,
      );
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to load Google Maps service&quot;,
        variant: &quot;destructive&quot;,
      });
    };
    document.head.appendChild(script);

    return () => {
      // Remove the global callback
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
    };
  }, [toast]);

  // Handle input changes
  const handleInputChange = (value: string) => {
    setInputValue(value);

    // Don't search if input is empty or Google Maps isn&apos;t initialized
    if (!value.trim() || !googleInitialized || !window.google?.maps?.places) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    console.log(&quot;Fetching predictions for:&quot;, value);
    setIsLoading(true);

    // Use the new AutocompleteSuggestion API
    const autocompleteOptions = {
      input: value,
      componentRestrictions: { country: &quot;us&quot; },
    };

    try {
      // Using the new recommended API approach
      window.google.maps.places.AutocompleteSuggestion.query(
        autocompleteOptions,
      )
        .then((response: any) => {
          setIsLoading(false);

          if (
            response &&
            response.suggestions &&
            response.suggestions.length > 0
          ) {
            console.log(&quot;Got predictions:&quot;, response.suggestions.length);

            // Format the predictions to match our component expectations
            const formattedPredictions = response.suggestions.map(
              (suggestion: any) => ({
                place_id: suggestion.placeId,
                structured_formatting: {
                  main_text: suggestion.formattedSuggestion.mainText,
                  secondary_text:
                    suggestion.formattedSuggestion.secondaryText || &quot;&quot;,
                },
              }),
            );

            setPredictions(formattedPredictions);
            setShowDropdown(true);
          } else {
            console.log(&quot;No predictions found&quot;);
            setPredictions([]);
            setShowDropdown(false);
          }
        })
        .catch((error: any) => {
          console.error(&quot;Error fetching predictions:&quot;, error);
          setIsLoading(false);
          setPredictions([]);
          setShowDropdown(false);

          // Fall back to traditional approach on error
          handleInputChangeFallback(value);
        });
    } catch (error) {
      console.error(&quot;Error setting up AutocompleteSuggestion:&quot;, error);
      setIsLoading(false);

      // Use fallback method if primary method fails
      handleInputChangeFallback(value);
    }
  };

  // Fallback method using the older API
  const handleInputChangeFallback = (value: string) => {
    console.log(&quot;Using fallback prediction method for:&quot;, value);

    try {
      // Create an instance of AutocompleteService as fallback
      const autocompleteService =
        new window.google.maps.places.AutocompleteService();
      const autocompleteOptions = {
        input: value,
        componentRestrictions: { country: &quot;us&quot; },
      };

      autocompleteService.getPlacePredictions(
        autocompleteOptions,
        (predictions: any, status: any) => {
          setIsLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions &&
            predictions.length > 0
          ) {
            console.log(&quot;Got fallback predictions:&quot;, predictions.length);
            setPredictions(predictions);
            setShowDropdown(true);
          } else {
            console.log(&quot;No fallback predictions found or error:&quot;, status);
            setPredictions([]);
            setShowDropdown(false);
          }
        },
      );
    } catch (error) {
      console.error(&quot;Error with fallback prediction method:&quot;, error);
      setIsLoading(false);
      setPredictions([]);
      setShowDropdown(false);

      toast({
        title: &quot;Search Error&quot;,
        description: &quot;Location search is unavailable&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Handle selection of a place
  const handlePlaceSelect = (placeId: string) => {
    console.log(
      &quot;EnhancedAddressPicker: handlePlaceSelect called with ID:&quot;,
      placeId,
    );

    // Immediately close the dropdown to give visual feedback
    setShowDropdown(false);

    // Check if the Places API is available
    if (!window.google?.maps?.places) {
      console.error(
        &quot;EnhancedAddressPicker: ERROR - Places API not initialized&quot;,
      );
      toast({
        title: &quot;Error&quot;,
        description: &quot;Location service not available&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsLoading(true);

    console.log(
      &quot;EnhancedAddressPicker: Fetching place details for ID:&quot;,
      placeId,
    );

    try {
      // Parameters for fetching place details
      const placeOptions = {
        fields: [
          &quot;name&quot;,
          &quot;formattedAddress&quot;,
          &quot;geometry&quot;,
          &quot;addressComponents&quot;,
          &quot;id&quot;,
        ],
      };

      // Add a small delay to ensure UI updates before heavy processing
      setTimeout(() => {
        // Using the new recommended Place API
        window.google.maps.places.Place.fetchById(placeId, placeOptions)
          .then((placeResult: any) => {
            console.log(
              &quot;EnhancedAddressPicker: Successfully got place details:&quot;,
              placeResult,
            );
            setIsLoading(false);

            if (placeResult) {
              setInputValue(placeResult.formattedAddress || &quot;&quot;);

              try {
                // Extract coordinates from the place result
                const location = placeResult.geometry?.location;

                if (!location) {
                  throw new Error(&quot;Location data not available&quot;);
                }

                // Get coordinates
                const latitude = location.lat; // New API returns properties, not methods
                const longitude = location.lng;
                console.log(
                  &quot;EnhancedAddressPicker: Using coordinates:&quot;,
                  latitude,
                  longitude,
                );

                // Store the coordinates for the map
                setSelectedLocation({ lat: latitude, lng: longitude });
                setShowMap(true);

                // Initialize or update the map
                setTimeout(() => {
                  initializeMap({ lat: latitude, lng: longitude });
                }, 50);

                // Prepare the data to send to parent component
                const addressData = {
                  formatted_address: placeResult.formattedAddress,
                  address_components: placeResult.addressComponents || [],
                  latitude,
                  longitude,
                  place_id: placeResult.id,
                  name: placeResult.name,
                };

                console.log(
                  &quot;EnhancedAddressPicker: Sending address data to parent component:&quot;,
                  addressData,
                );

                // Pass the data to the parent component
                onAddressSelect(addressData);

                console.log(
                  &quot;EnhancedAddressPicker: onAddressSelect function called successfully&quot;,
                );
              } catch (error) {
                console.error(
                  &quot;EnhancedAddressPicker: Error processing place data:&quot;,
                  error,
                );
                toast({
                  title: &quot;Error&quot;,
                  description: &quot;Failed to process location data&quot;,
                  variant: &quot;destructive&quot;,
                });

                // Try fallback method
                handlePlaceSelectFallback(placeId);
              }
            } else {
              console.error(&quot;EnhancedAddressPicker: No place details returned&quot;);
              toast({
                title: &quot;Error&quot;,
                description: &quot;Could not get location details&quot;,
                variant: &quot;destructive&quot;,
              });

              // Try fallback method
              handlePlaceSelectFallback(placeId);
            }
          })
          .catch((error: any) => {
            console.error(
              &quot;EnhancedAddressPicker: Error fetching place details:&quot;,
              error,
            );
            setIsLoading(false);

            // Try fallback method
            handlePlaceSelectFallback(placeId);
          });
      }, 50); // Small delay to ensure UI responsiveness
    } catch (error) {
      console.error(
        &quot;EnhancedAddressPicker: Error setting up Place API:&quot;,
        error,
      );
      setIsLoading(false);

      // Try fallback method
      handlePlaceSelectFallback(placeId);
    }
  };

  // Fallback method to get place details using older API
  const handlePlaceSelectFallback = (placeId: string) => {
    console.log(
      &quot;EnhancedAddressPicker: Using fallback method for place details:&quot;,
      placeId,
    );

    try {
      // Create a PlacesService with a temporary div
      const tempDiv = document.createElement(&quot;div&quot;);
      const placesService = new window.google.maps.places.PlacesService(
        tempDiv,
      );

      // Use getDetails to get place information
      placesService.getDetails(
        {
          placeId,
          fields: [
            &quot;name&quot;,
            &quot;formatted_address&quot;,
            &quot;geometry&quot;,
            &quot;address_components&quot;,
          ],
        },
        (placeResult: any, status: any) => {
          setIsLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            placeResult
          ) {
            console.log(
              &quot;EnhancedAddressPicker: Successfully got place details via fallback:&quot;,
              placeResult,
            );
            setInputValue(placeResult.formatted_address || &quot;&quot;);

            try {
              // Extract coordinates from the place result
              const location = placeResult.geometry?.location;

              if (!location) {
                throw new Error(&quot;Location data not available&quot;);
              }

              // Get coordinates - note that lat and lng are methods in the older API
              const latitude =
                typeof location.lat === &quot;function&quot;
                  ? location.lat()
                  : location.lat;
              const longitude =
                typeof location.lng === &quot;function&quot;
                  ? location.lng()
                  : location.lng;
              console.log(
                &quot;EnhancedAddressPicker: Using coordinates:&quot;,
                latitude,
                longitude,
              );

              // Store the coordinates for the map
              setSelectedLocation({ lat: latitude, lng: longitude });
              setShowMap(true);

              // Initialize or update the map
              setTimeout(() => {
                initializeMap({ lat: latitude, lng: longitude });
              }, 50);

              // Prepare the data to send to parent component
              const addressData = {
                formatted_address: placeResult.formatted_address,
                address_components: placeResult.address_components || [],
                latitude,
                longitude,
                place_id: placeId,
                name: placeResult.name,
              };

              console.log(
                &quot;EnhancedAddressPicker: Sending address data to parent component:&quot;,
                addressData,
              );

              // Pass the data to the parent component
              onAddressSelect(addressData);

              console.log(
                &quot;EnhancedAddressPicker: onAddressSelect function called successfully&quot;,
              );
            } catch (error) {
              console.error(
                &quot;EnhancedAddressPicker: Error processing place data:&quot;,
                error,
              );
              toast({
                title: &quot;Error&quot;,
                description: &quot;Failed to process location data&quot;,
                variant: &quot;destructive&quot;,
              });
            }
          } else {
            console.error(
              &quot;EnhancedAddressPicker: No place details returned or error:&quot;,
              status,
            );
            toast({
              title: &quot;Error&quot;,
              description: &quot;Could not get location details&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        },
      );
    } catch (error) {
      console.error(
        &quot;EnhancedAddressPicker: Error with fallback place details:&quot;,
        error,
      );
      setIsLoading(false);

      toast({
        title: &quot;Error&quot;,
        description: &quot;Location service is unavailable&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownElement = document.querySelector(&quot;.locations-dropdown&quot;);
      const isClickInsideDropdown =
        dropdownElement && dropdownElement.contains(event.target as Node);

      // Only close the dropdown if clicking outside both the input and dropdown
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !isClickInsideDropdown
      ) {
        console.log(
          &quot;EnhancedAddressPicker: Clicked outside - closing dropdown&quot;,
        );
        setShowDropdown(false);
      }
    };

    document.addEventListener(&quot;mousedown&quot;, handleClickOutside);
    return () => {
      document.removeEventListener(&quot;mousedown&quot;, handleClickOutside);
    };
  }, []);

  return (
    <div className={`${className} relative`}>
      <div className=&quot;relative&quot;>
        <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
        <Input
          ref={inputRef}
          type=&quot;text&quot;
          placeholder=&quot;Search for a location&quot;
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className=&quot;pl-9&quot;
          disabled={!googleInitialized}
        />
        {isLoading && (
          <Loader2 className=&quot;absolute right-2.5 top-2.5 h-4 w-4 animate-spin&quot; />
        )}
      </div>

      {/* Predictions dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className=&quot;absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg locations-dropdown&quot;>
          <ul className=&quot;py-1&quot;>
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  e.stopPropagation(); // Prevent event bubbling
                  console.log(
                    &quot;EnhancedAddressPicker: CLICKED on prediction with ID:&quot;,
                    prediction.place_id,
                  );
                  handlePlaceSelect(prediction.place_id);
                }}
                onMouseDown={(e) => {
                  // Prevent blur event on input which might close dropdown
                  e.preventDefault();
                }}
                className=&quot;flex items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer&quot;
              >
                <MapPin className=&quot;h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground&quot; />
                <div className=&quot;flex-1&quot;>
                  <div className=&quot;text-sm font-medium&quot;>
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Map container */}
      {showMap && selectedLocation && (
        <div className=&quot;mt-4&quot;>
          <div
            ref={mapRef}
            className=&quot;w-full h-[250px] rounded-md border&quot;
            aria-label=&quot;Map showing selected location"
          />
        </div>
      )}
    </div>
  );
}
