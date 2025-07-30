&quot;use client&quot;;

import { useState, useEffect, useRef, useCallback } from &quot;react&quot;;
import { Search, Loader2, MapPin } from &quot;lucide-react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { useGoogleMaps } from &quot;@/contexts/GoogleMapsContext&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
}

export default function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = &quot;Search for an address&quot;,
  defaultValue = "&quot;,
  className = &quot;&quot;,
  disabled = false,
}: PlacesAutocompleteProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(
    null,
  );
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null,
  );
  const { toast } = useToast();

  // Initialize autocomplete service
  useEffect(() => {
    if (isLoaded && google) {
      try {
        // Create a dummy element for the PlacesService (it needs a DOM element)
        const dummyElement = document.createElement(&quot;div&quot;);
        autocompleteRef.current = new google.maps.places.AutocompleteService();
        placesServiceRef.current = new google.maps.places.PlacesService(
          dummyElement,
        );
      } catch (error) {
        console.error(&quot;Error initializing Places services:&quot;, error);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to initialize Google Places API&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }
  }, [isLoaded, google, toast]);

  // Handle input changes and fetch predictions with better error handling
  const handleInputChange = useCallback(
    (value: string) => {
      setValue(value);

      if (!value.trim() || !autocompleteRef.current || !google) {
        setPredictions([]);
        setIsOpen(false);
        return;
      }

      setIsSearching(true);

      const request = {
        input: value,
        // You can&apos;t mix 'address' with other types, so we'll use 'establishment' or 'geocode' which is more versatile
        types: [&quot;geocode&quot;],
        componentRestrictions: { country: &quot;us&quot; }, // Limit to US
      };

      try {
        // Wrap the callback in a try-catch to handle potential json parsing errors
        const safeCallback = (
          results: google.maps.places.AutocompletePrediction[] | null,
          status: google.maps.places.PlacesServiceStatus,
        ) => {
          try {
            setIsSearching(false);

            // Handle error cases explicitly
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
              console.warn(&quot;Places API returned status:&quot;, status);
              setPredictions([]);
              setIsOpen(false);
              return;
            }

            // Extra validation to ensure we have a valid array
            if (!results || !Array.isArray(results) || results.length === 0) {
              console.warn(&quot;No valid predictions returned&quot;);
              setPredictions([]);
              setIsOpen(false);
              return;
            }

            // Verify each prediction has required properties before using it
            const validPredictions = results.filter(
              (prediction) =>
                prediction &&
                prediction.place_id &&
                prediction.structured_formatting &&
                prediction.structured_formatting.main_text &&
                prediction.structured_formatting.secondary_text,
            );

            if (validPredictions.length === 0) {
              console.warn(&quot;No valid predictions with required properties&quot;);
              setPredictions([]);
              setIsOpen(false);
              return;
            }

            // Set predictions if we have valid results
            console.log(&quot;Got predictions:&quot;, validPredictions.length);
            setPredictions(validPredictions);
            setIsOpen(true);
          } catch (callbackError) {
            console.error(&quot;Error in prediction callback:&quot;, callbackError);
            setPredictions([]);
            setIsOpen(false);
          }
        };

        // Call the API with our safer callback
        autocompleteRef.current.getPlacePredictions(request, safeCallback);
      } catch (error) {
        console.error(&quot;Error calling getPlacePredictions:&quot;, error);
        setIsSearching(false);
        setPredictions([]);
        setIsOpen(false);
      }
    },
    [google],
  );

  // Update the input value directly
  const updateInputValue = useCallback((text: string) => {
    setValue(text);
  }, []);

  // Get details for a selected place with enhanced error handling
  const getPlaceDetails = useCallback(
    (placeId: string) => {
      if (!placesServiceRef.current || !google) {
        console.error(&quot;Places service or Google API not available&quot;);
        toast({
          title: &quot;Service Unavailable&quot;,
          description: &quot;Location service is not available&quot;,
          variant: &quot;destructive&quot;,
        });
        return;
      }

      const request = {
        placeId,
        fields: [
          &quot;address_components&quot;,
          &quot;formatted_address&quot;,
          &quot;geometry&quot;,
          &quot;name&quot;,
          &quot;place_id&quot;,
        ],
      };

      try {
        // Wrap the callback in a try-catch to handle potential json parsing errors
        const safeCallback = (
          result: google.maps.places.PlaceResult | null,
          status: google.maps.places.PlacesServiceStatus,
        ) => {
          try {
            // Handle successful response
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              result
            ) {
              console.log(&quot;Place details retrieved successfully&quot;, result);

              // Additional validation to ensure result object is properly structured
              if (!result || typeof result !== &quot;object&quot;) {
                throw new Error(&quot;Invalid place result object&quot;);
              }

              // Update the input field with the formatted address if available
              if (result.formatted_address) {
                console.log(
                  &quot;Setting formatted address:&quot;,
                  result.formatted_address,
                );
                setValue(result.formatted_address);

                // Force update the input field directly for immediate feedback
                if (inputRef.current) {
                  inputRef.current.value = result.formatted_address;
                }
              }

              // Verify we have location data - if not, we need to handle this case
              if (!result.geometry || !result.geometry.location) {
                console.error(&quot;Place result missing geometry or location&quot;);
                toast({
                  title: &quot;Data Error&quot;,
                  description:
                    &quot;The selected location is missing geographic coordinates&quot;,
                  variant: &quot;destructive&quot;,
                });
                return;
              }

              // Create a type-safe version of the PlaceResult object
              try {
                // For this version, we ensure we have a consistent LatLng object
                // that satisfies all the required properties

                // Check if we have a valid Google LatLng object
                const isValidLatLng =
                  result.geometry.location &&
                  typeof result.geometry.location.lat === &quot;function&quot; &&
                  typeof result.geometry.location.lng === &quot;function&quot; &&
                  typeof result.geometry.location.equals === &quot;function&quot; &&
                  typeof result.geometry.location.toJSON === &quot;function&quot; &&
                  typeof result.geometry.location.toUrlValue === &quot;function&quot;;

                if (isValidLatLng) {
                  console.log(&quot;Using standard Google LatLng object&quot;);
                  onPlaceSelect(result);
                } else {
                  // Create a proper Google Maps LatLng-like object
                  console.log(&quot;Creating custom LatLng object&quot;);

                  // Get lat/lng values, applying fallbacks if needed
                  let lat = 0;
                  let lng = 0;

                  if (result.geometry.location) {
                    if (typeof result.geometry.location.lat === &quot;function&quot;) {
                      lat = result.geometry.location.lat() as number;
                    } else if (
                      typeof result.geometry.location.lat === &quot;number&quot;
                    ) {
                      lat = result.geometry.location.lat;
                    } else if (result.geometry.location.lat !== undefined) {
                      const parsed = parseFloat(
                        String(result.geometry.location.lat),
                      );
                      if (!isNaN(parsed)) lat = parsed;
                    }

                    if (typeof result.geometry.location.lng === &quot;function&quot;) {
                      lng = result.geometry.location.lng() as number;
                    } else if (
                      typeof result.geometry.location.lng === &quot;number&quot;
                    ) {
                      lng = result.geometry.location.lng;
                    } else if (result.geometry.location.lng !== undefined) {
                      const parsed = parseFloat(
                        String(result.geometry.location.lng),
                      );
                      if (!isNaN(parsed)) lng = parsed;
                    }
                  }

                  // Create a complete LatLng-compatible object
                  const customLatLng = {
                    lat: function () {
                      return lat;
                    },
                    lng: function () {
                      return lng;
                    },
                    equals: function (other: any) {
                      if (!other) return false;
                      const otherLat =
                        typeof other.lat === &quot;function&quot;
                          ? other.lat()
                          : other.lat;
                      const otherLng =
                        typeof other.lng === &quot;function&quot;
                          ? other.lng()
                          : other.lng;
                      return lat === otherLat && lng === otherLng;
                    },
                    toJSON: function () {
                      return { lat, lng };
                    },
                    toUrlValue: function (precision?: number) {
                      if (typeof precision === &quot;number&quot;) {
                        return `${lat.toFixed(precision)},${lng.toFixed(precision)}`;
                      }
                      return `${lat},${lng}`;
                    },
                  };

                  // Clone the result object but replace the location with our custom implementation
                  const customResult = {
                    ...result,
                    geometry: {
                      ...result.geometry,
                      location: customLatLng as google.maps.LatLng,
                    },
                  };

                  console.log(&quot;Created custom LatLng object:&quot;, customLatLng);
                  onPlaceSelect(customResult);
                }
              } catch (callbackError) {
                console.error(
                  &quot;Error creating custom LatLng object:&quot;,
                  callbackError,
                );

                // Last resort - create a fully manual object
                const manualLatLng = {
                  lat: function () {
                    return 0;
                  },
                  lng: function () {
                    return 0;
                  },
                  equals: function () {
                    return false;
                  },
                  toJSON: function () {
                    return { lat: 0, lng: 0 };
                  },
                  toUrlValue: function () {
                    return &quot;0,0&quot;;
                  },
                } as google.maps.LatLng;

                const manualResult = {
                  ...result,
                  geometry: {
                    ...result.geometry,
                    location: manualLatLng,
                  },
                };

                console.log(&quot;Using manual fallback LatLng object&quot;);
                onPlaceSelect(manualResult);

                toast({
                  title: &quot;Warning&quot;,
                  description: &quot;Location processed with limited data&quot;,
                  variant: &quot;default&quot;,
                });
              }
            }
            // Handle API error response
            else {
              console.error(&quot;Error fetching place details, status:&quot;, status);
              toast({
                title: &quot;Location Error&quot;,
                description:
                  &quot;Could not retrieve details for the selected location&quot;,
                variant: &quot;destructive&quot;,
              });
            }
          } catch (detailsError) {
            console.error(&quot;Error processing place details:&quot;, detailsError);
            toast({
              title: &quot;Data Error&quot;,
              description: &quot;Could not process location data&quot;,
              variant: &quot;destructive&quot;,
            });
          } finally {
            setIsOpen(false);
          }
        };

        // Call the API with our safer callback
        placesServiceRef.current.getDetails(request, safeCallback);
      } catch (error) {
        console.error(&quot;Exception while calling getDetails:&quot;, error);
        toast({
          title: &quot;Service Error&quot;,
          description: &quot;An error occurred while fetching location details&quot;,
          variant: &quot;destructive&quot;,
        });
        setIsOpen(false);
      }
    },
    [google, onPlaceSelect, setValue, toast],
  );

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener(&quot;mousedown&quot;, handleClickOutside);

    return () => {
      document.removeEventListener(&quot;mousedown&quot;, handleClickOutside);
    };
  }, [inputRef]);

  if (loadError) {
    return (
      <div className={`${className} relative`}>
        <Input
          placeholder=&quot;Google Maps API failed to load&quot;
          disabled={true}
          className=&quot;bg-red-50&quot;
        />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className=&quot;relative&quot;>
        <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
        <Input
          ref={inputRef}
          type=&quot;text&quot;
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value && setPredictions.length > 0 && setIsOpen(true)}
          disabled={!isLoaded || disabled}
          className=&quot;pl-9&quot;
        />
        {isSearching && (
          <Loader2 className=&quot;absolute right-2.5 top-2.5 h-4 w-4 animate-spin&quot; />
        )}
      </div>

      {/* Predictions dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className=&quot;absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg&quot;>
          <ul className=&quot;py-1&quot;>
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => {
                  // Set the input value to the prediction immediately for better UX
                  const mainText =
                    prediction.structured_formatting.main_text || &quot;&quot;;
                  const secondaryText =
                    prediction.structured_formatting.secondary_text || &quot;&quot;;
                  const fullAddress = `${mainText}, ${secondaryText}`;

                  console.log(&quot;Setting value to:&quot;, fullAddress);
                  setValue(fullAddress);

                  // Force update the input field immediately
                  if (inputRef.current) {
                    inputRef.current.value = fullAddress;
                  }

                  // Then fetch the full details
                  getPlaceDetails(prediction.place_id);
                }}
                className=&quot;flex items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer&quot;
              >
                <MapPin className=&quot;h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground&quot; />
                <div className=&quot;flex-1&quot;>
                  <div className=&quot;text-sm font-medium&quot;>
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground">
                    {prediction.structured_formatting.secondary_text}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
