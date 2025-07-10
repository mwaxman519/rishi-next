"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { useToast } from "@/hooks/use-toast";

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
}

export default function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Search for an address",
  defaultValue = "",
  className = "",
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
        const dummyElement = document.createElement("div");
        autocompleteRef.current = new google.maps.places.AutocompleteService();
        placesServiceRef.current = new google.maps.places.PlacesService(
          dummyElement,
        );
      } catch (error) {
        console.error("Error initializing Places services:", error);
        toast({
          title: "Error",
          description: "Failed to initialize Google Places API",
          variant: "destructive",
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
        // You can't mix 'address' with other types, so we'll use 'establishment' or 'geocode' which is more versatile
        types: ["geocode"],
        componentRestrictions: { country: "us" }, // Limit to US
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
              console.warn("Places API returned status:", status);
              setPredictions([]);
              setIsOpen(false);
              return;
            }

            // Extra validation to ensure we have a valid array
            if (!results || !Array.isArray(results) || results.length === 0) {
              console.warn("No valid predictions returned");
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
              console.warn("No valid predictions with required properties");
              setPredictions([]);
              setIsOpen(false);
              return;
            }

            // Set predictions if we have valid results
            console.log("Got predictions:", validPredictions.length);
            setPredictions(validPredictions);
            setIsOpen(true);
          } catch (callbackError) {
            console.error("Error in prediction callback:", callbackError);
            setPredictions([]);
            setIsOpen(false);
          }
        };

        // Call the API with our safer callback
        autocompleteRef.current.getPlacePredictions(request, safeCallback);
      } catch (error) {
        console.error("Error calling getPlacePredictions:", error);
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
        console.error("Places service or Google API not available");
        toast({
          title: "Service Unavailable",
          description: "Location service is not available",
          variant: "destructive",
        });
        return;
      }

      const request = {
        placeId,
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "name",
          "place_id",
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
              console.log("Place details retrieved successfully", result);

              // Additional validation to ensure result object is properly structured
              if (!result || typeof result !== "object") {
                throw new Error("Invalid place result object");
              }

              // Update the input field with the formatted address if available
              if (result.formatted_address) {
                console.log(
                  "Setting formatted address:",
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
                console.error("Place result missing geometry or location");
                toast({
                  title: "Data Error",
                  description:
                    "The selected location is missing geographic coordinates",
                  variant: "destructive",
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
                  typeof result.geometry.location.lat === "function" &&
                  typeof result.geometry.location.lng === "function" &&
                  typeof result.geometry.location.equals === "function" &&
                  typeof result.geometry.location.toJSON === "function" &&
                  typeof result.geometry.location.toUrlValue === "function";

                if (isValidLatLng) {
                  console.log("Using standard Google LatLng object");
                  onPlaceSelect(result);
                } else {
                  // Create a proper Google Maps LatLng-like object
                  console.log("Creating custom LatLng object");

                  // Get lat/lng values, applying fallbacks if needed
                  let lat = 0;
                  let lng = 0;

                  if (result.geometry.location) {
                    if (typeof result.geometry.location.lat === "function") {
                      lat = result.geometry.location.lat() as number;
                    } else if (
                      typeof result.geometry.location.lat === "number"
                    ) {
                      lat = result.geometry.location.lat;
                    } else if (result.geometry.location.lat !== undefined) {
                      const parsed = parseFloat(
                        String(result.geometry.location.lat),
                      );
                      if (!isNaN(parsed)) lat = parsed;
                    }

                    if (typeof result.geometry.location.lng === "function") {
                      lng = result.geometry.location.lng() as number;
                    } else if (
                      typeof result.geometry.location.lng === "number"
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
                        typeof other.lat === "function"
                          ? other.lat()
                          : other.lat;
                      const otherLng =
                        typeof other.lng === "function"
                          ? other.lng()
                          : other.lng;
                      return lat === otherLat && lng === otherLng;
                    },
                    toJSON: function () {
                      return { lat, lng };
                    },
                    toUrlValue: function (precision?: number) {
                      if (typeof precision === "number") {
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

                  console.log("Created custom LatLng object:", customLatLng);
                  onPlaceSelect(customResult);
                }
              } catch (callbackError) {
                console.error(
                  "Error creating custom LatLng object:",
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
                    return "0,0";
                  },
                } as google.maps.LatLng;

                const manualResult = {
                  ...result,
                  geometry: {
                    ...result.geometry,
                    location: manualLatLng,
                  },
                };

                console.log("Using manual fallback LatLng object");
                onPlaceSelect(manualResult);

                toast({
                  title: "Warning",
                  description: "Location processed with limited data",
                  variant: "default",
                });
              }
            }
            // Handle API error response
            else {
              console.error("Error fetching place details, status:", status);
              toast({
                title: "Location Error",
                description:
                  "Could not retrieve details for the selected location",
                variant: "destructive",
              });
            }
          } catch (detailsError) {
            console.error("Error processing place details:", detailsError);
            toast({
              title: "Data Error",
              description: "Could not process location data",
              variant: "destructive",
            });
          } finally {
            setIsOpen(false);
          }
        };

        // Call the API with our safer callback
        placesServiceRef.current.getDetails(request, safeCallback);
      } catch (error) {
        console.error("Exception while calling getDetails:", error);
        toast({
          title: "Service Error",
          description: "An error occurred while fetching location details",
          variant: "destructive",
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

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [inputRef]);

  if (loadError) {
    return (
      <div className={`${className} relative`}>
        <Input
          placeholder="Google Maps API failed to load"
          disabled={true}
          className="bg-red-50"
        />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => value && setPredictions.length > 0 && setIsOpen(true)}
          disabled={!isLoaded || disabled}
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Predictions dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg">
          <ul className="py-1">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => {
                  // Set the input value to the prediction immediately for better UX
                  const mainText =
                    prediction.structured_formatting.main_text || "";
                  const secondaryText =
                    prediction.structured_formatting.secondary_text || "";
                  const fullAddress = `${mainText}, ${secondaryText}`;

                  console.log("Setting value to:", fullAddress);
                  setValue(fullAddress);

                  // Force update the input field immediately
                  if (inputRef.current) {
                    inputRef.current.value = fullAddress;
                  }

                  // Then fetch the full details
                  getPlaceDetails(prediction.place_id);
                }}
                className="flex items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium">
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-muted-foreground">
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
