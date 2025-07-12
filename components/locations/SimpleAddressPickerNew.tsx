"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface SimpleAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function SimpleAddressPicker({
  onAddressSelect,
  className = "",
}: SimpleAddressPickerProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState("");
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
        "SimpleAddressPicker: Map container or Google Maps not available",
      );
      return;
    }

    console.log(
      "SimpleAddressPicker: Initializing map with location:",
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
        console.log("SimpleAddressPicker: Creating new map instance");
        mapInstance = new window.google.maps.Map(mapRef.current, mapOptions);
        setMap(mapInstance);
      } else {
        console.log("SimpleAddressPicker: Reusing existing map instance");
        mapInstance.setCenter(location);
      }

      // Create or reuse marker
      let markerInstance = marker;
      if (!markerInstance) {
        console.log("SimpleAddressPicker: Creating new marker");
        markerInstance = new window.google.maps.Marker({
          position: location,
          map: mapInstance,
          animation: window.google.maps.Animation.DROP,
        });
        setMarker(markerInstance);
      } else {
        console.log("SimpleAddressPicker: Updating existing marker");
        markerInstance.setPosition(location);
      }
    } catch (error) {
      console.error("SimpleAddressPicker: Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not display the map",
        variant: "destructive",
      });
    }
  };

  // Track when Google Maps API is loaded
  useEffect(() => {
    // Define the initialization function
    function initializeServices() {
      try {
        console.log("SimpleAddressPicker: Initializing Google services...");
        setGoogleInitialized(true);
        console.log(
          "SimpleAddressPicker: Google services initialized successfully",
        );
      } catch (error) {
        console.error(
          "SimpleAddressPicker: Error initializing Google services:",
          error,
        );
        toast({
          title: "Error",
          description: "Failed to initialize location services",
          variant: "destructive",
        });
      }
    }

    // Set up callback for script loading
    window.initGoogleMaps = () => {
      console.log("[SimpleAddressPicker] Google Maps initialized via callback");
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        "[SimpleAddressPicker] Google Maps already loaded, initializing services",
      );
      initializeServices();
      return;
    }

    // Check if script is already in document but not fully loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api"]',
    );
    if (existingScript) {
      console.log(
        "[SimpleAddressPicker] Google Maps script already exists, waiting for load",
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log("[SimpleAddressPicker] Loading Google Maps script...");
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww";
    console.log(
      "[SimpleAddressPicker] Using Google Maps API Key:",
      apiKey ? "Key found" : "Key missing",
    );
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.onerror = () => {
      console.error("[SimpleAddressPicker] Failed to load Google Maps script");
      toast({
        title: "Error",
        description: "Failed to load Google Maps service",
        variant: "destructive",
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

    // Don't search if input is empty or Google Maps isn't initialized
    if (!value.trim() || !googleInitialized || !window.google?.maps?.places) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    console.log("Fetching predictions for:", value);
    setIsLoading(true);

    // Use the AutocompleteService API
    const autocompleteOptions = {
      input: value,
      componentRestrictions: { country: "us" },
    };

    try {
      // Create an instance of AutocompleteService
      const autocompleteService =
        new window.google.maps.places.AutocompleteService();

      // Wrap the callback-style API in a Promise for cleaner code
      const getPlacePredictionsPromise = (options: any) => {
        return new Promise((resolve, reject) => {
          autocompleteService.getPlacePredictions(
            options,
            (predictions: any, status: any) => {
              if (
                status === window.google.maps.places.PlacesServiceStatus.OK &&
                predictions
              ) {
                resolve(predictions);
              } else {
                reject(new Error(`Predictions failed with status: ${status}`));
              }
            },
          );
        });
      };

      // Use the Promise-based approach for cleaner code
      getPlacePredictionsPromise(autocompleteOptions)
        .then((predictions: any) => {
          setIsLoading(false);

          if (predictions && predictions.length > 0) {
            console.log("Got predictions:", predictions.length);
            setPredictions(predictions);
            setShowDropdown(true);
          } else {
            console.log("No predictions found");
            setPredictions([]);
            setShowDropdown(false);
          }
        })
        .catch((error: any) => {
          console.error("Error fetching predictions:", error);
          setIsLoading(false);
          setPredictions([]);
          setShowDropdown(false);

          toast({
            title: "Search Error",
            description: "Could not get location suggestions",
            variant: "destructive",
          });
        });
    } catch (error) {
      console.error("Error setting up AutocompleteService:", error);
      setIsLoading(false);

      setPredictions([]);
      setShowDropdown(false);

      toast({
        title: "Search Error",
        description: "Location search is unavailable",
        variant: "destructive",
      });
    }
  };

  // Handle selection of a place
  const handlePlaceSelect = (placeId: string) => {
    console.log(
      "SimpleAddressPicker: handlePlaceSelect called with ID:",
      placeId,
    );

    // Immediately close the dropdown to give visual feedback
    setShowDropdown(false);

    // Check if the Places API is available
    if (!window.google?.maps?.places) {
      console.error("SimpleAddressPicker: ERROR - Places API not initialized");
      toast({
        title: "Error",
        description: "Location service not available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    console.log("SimpleAddressPicker: Fetching place details for ID:", placeId);

    // Parameters for fetching place details
    const placeOptions = {
      fields: [
        "name",
        "formattedAddress",
        "geometry",
        "addressComponents",
        "id",
      ],
    };

    // Add a small delay to ensure UI updates before heavy processing
    setTimeout(() => {
      try {
        // Create a PlacesService with a temporary div
        const tempDiv = document.createElement("div");
        const placesService = new window.google.maps.places.PlacesService(
          tempDiv,
        );

        // Wrap the callback-style API in a Promise for cleaner code
        const getPlaceDetailsPromise = (request: any) => {
          return new Promise((resolve, reject) => {
            placesService.getDetails(
              request,
              (placeResult: any, status: any) => {
                if (
                  status === window.google.maps.places.PlacesServiceStatus.OK &&
                  placeResult
                ) {
                  resolve(placeResult);
                } else {
                  reject(
                    new Error(`Place details failed with status: ${status}`),
                  );
                }
              },
            );
          });
        };

        // Create the request object
        const detailsRequest = {
          placeId: placeId,
          fields: [
            "name",
            "formatted_address",
            "geometry",
            "address_components",
          ],
        };

        // Use the Promise-based approach for cleaner code
        getPlaceDetailsPromise(detailsRequest)
          .then((placeResult: any) => {
            console.log(
              "SimpleAddressPicker: Successfully got place details:",
              placeResult,
            );
            setIsLoading(false);

            if (placeResult) {
              setInputValue(placeResult.formatted_address || "");

              try {
                // Extract coordinates from the place result
                const location = placeResult.geometry?.location;

                if (!location) {
                  throw new Error("Location data not available");
                }

                // Log the geometry object to see its structure
                console.log(
                  "SimpleAddressPicker: Place geometry:",
                  placeResult.geometry,
                );
                console.log(
                  "SimpleAddressPicker: Location type:",
                  typeof location,
                );

                // Get coordinates - note that lat and lng are methods in the older API
                const latitude =
                  typeof location.lat === "function"
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === "function"
                    ? location.lng()
                    : location.lng;
                console.log(
                  "SimpleAddressPicker: Using coordinates:",
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
                  "SimpleAddressPicker: Sending address data to parent component:",
                  addressData,
                );

                // Pass the data to the parent component
                onAddressSelect(addressData);

                console.log(
                  "SimpleAddressPicker: onAddressSelect function called successfully",
                );
              } catch (error) {
                console.error(
                  "SimpleAddressPicker: Error processing place data:",
                  error,
                );
                toast({
                  title: "Error",
                  description: "Failed to process location data",
                  variant: "destructive",
                });
              }
            } else {
              console.error("SimpleAddressPicker: No place details returned");
              toast({
                title: "Error",
                description: "Could not get location details",
                variant: "destructive",
              });
            }
          })
          .catch((error: any) => {
            console.error(
              "SimpleAddressPicker: Error fetching place details:",
              error,
            );
            setIsLoading(false);

            toast({
              title: "Error",
              description: "Could not get location details",
              variant: "destructive",
            });
          });
      } catch (error) {
        console.error(
          "SimpleAddressPicker: Error setting up PlacesService:",
          error,
        );
        setIsLoading(false);

        toast({
          title: "Error",
          description: "Location service is unavailable",
          variant: "destructive",
        });
      }
    }, 50); // Small delay to ensure UI responsiveness
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdownElement = document.querySelector(".locations-dropdown");
      const isClickInsideDropdown =
        dropdownElement && dropdownElement.contains(event.target as Node);

      // Only close the dropdown if clicking outside both the input and dropdown
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !isClickInsideDropdown
      ) {
        console.log("SimpleAddressPicker: Clicked outside - closing dropdown");
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`${className} relative`}>
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a location"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-9"
          disabled={!googleInitialized}
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Predictions dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg locations-dropdown">
          <ul className="py-1">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={(e) => {
                  e.preventDefault(); // Prevent default behavior
                  e.stopPropagation(); // Prevent event bubbling
                  console.log(
                    "SimpleAddressPicker: CLICKED on prediction with ID:",
                    prediction.place_id,
                  );
                  console.log(
                    "SimpleAddressPicker: Prediction object:",
                    prediction,
                  );
                  handlePlaceSelect(prediction.place_id);
                }}
                onMouseDown={(e) => {
                  // Prevent blur event on input which might close dropdown
                  e.preventDefault();
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

      {/* Map container */}
      {showMap && selectedLocation && (
        <div className="mt-4">
          <div
            ref={mapRef}
            className="w-full h-[250px] rounded-md border"
            aria-label="Map showing selected location"
          />
        </div>
      )}
    </div>
  );
}
