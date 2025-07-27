"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
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

interface FixedAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function FixedAddressPicker({
  onAddressSelect,
  className = "",
}: FixedAddressPickerProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteElementRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        "FixedAddressPicker: Map container or Google Maps not available",
      );
      return;
    }

    console.log(
      "FixedAddressPicker: Initializing map with location:",
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
      if (!mapInstanceRef.current) {
        console.log("FixedAddressPicker: Creating new map instance");
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log("FixedAddressPicker: Reusing existing map instance");
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log("FixedAddressPicker: Creating new marker");
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log("FixedAddressPicker: Updating existing marker");
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error("FixedAddressPicker: Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not display the map",
        variant: "destructive",
      });
    }
  };

  // Initialize Google Maps and set up PlaceAutocompleteElement
  useEffect(() => {
    // Define the initialization function
    function initializeServices() {
      try {
        console.log("FixedAddressPicker: Initializing Google services...");

        if (autocompleteContainerRef.current && window.google?.maps?.places) {
          // Check if PlaceAutocompleteElement is available
          if (window.google.maps.places.PlaceAutocompleteElement) {
            // Create configuration for the element - using only supported properties
            const config = {
              // The PlaceAutocompleteElement doesn't accept fields directly
              // We'll need to extract the fields from the place after selection
              types: ["address", "establishment", "geocode"],
              componentRestrictions: { country: "us" },
            };

            // Create the element
            const autocompleteElement =
              new window.google.maps.places.PlaceAutocompleteElement(config);
            autocompleteElementRef.current = autocompleteElement;

            // Add the element to the DOM
            autocompleteContainerRef.current.appendChild(autocompleteElement);

            // Add styling to match the app
            autocompleteElement.style.width = "100%";

            // After creating the element, find its input and add styles
            setTimeout(() => {
              const shadowRoot = autocompleteElement.shadowRoot;
              if (shadowRoot) {
                // Try to apply styles to the shadow DOM
                const style = document.createElement("style");
                style.textContent = `
                  :host {
                    --gmpx-color-primary: var(--primary);
                    --gmpx-font-family-regular: var(--font-sans);
                    width: 100%;
                  }
                  .input {
                    width: 100%;
                    padding: 8px 12px 8px 36px !important;
                    font-size: 14px;
                    border-radius: 6px;
                    border: 1px solid var(--input, hsl(var(--input)));
                    background-color: var(--background, hsl(var(--background)));
                    color: var(--foreground, hsl(var(--foreground)));
                    height: 40px;
                    outline: none;
                  }
                  .input:focus {
                    outline: none;
                    ring: 2px solid var(--ring, hsl(var(--ring)));
                  }
                `;
                shadowRoot.appendChild(style);
              }
            }, 100);

            // Add the search icon
            const iconContainer = document.createElement("div");
            iconContainer.className =
              "absolute left-2.5 top-2.5 z-10 pointer-events-none";
            iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;
            autocompleteContainerRef.current.insertBefore(
              iconContainer,
              autocompleteElement,
            );

            // Handle place selection events
            autocompleteElement.addEventListener(
              "gmp-placeselect",
              (event: any) => {
                console.log("Place select event:", event);

                // Get the place details with the complete data we need
                // Since PlaceAutocompleteElement doesn't support the fields parameter,
                // we need to fetch the place details separately
                const placeId = event.place.id;

                if (placeId) {
                  console.log("Got place ID:", placeId);
                  fetchPlaceDetails(placeId);
                } else {
                  console.error("No place ID found in selection");
                  toast({
                    title: "Error",
                    description: "Could not identify the selected location",
                    variant: "destructive",
                  });
                }
              },
            );

            console.log(
              "FixedAddressPicker: PlaceAutocompleteElement initialized",
            );
          } else {
            console.error(
              "FixedAddressPicker: PlaceAutocompleteElement not available",
            );
            fallbackToRegularAutocomplete();
          }
        }

        setGoogleInitialized(true);
        console.log(
          "FixedAddressPicker: Google services initialized successfully",
        );
      } catch (error) {
        console.error(
          "FixedAddressPicker: Error initializing Google services:",
          error,
        );
        fallbackToRegularAutocomplete();
      }
    }

    // Fallback to regular Autocomplete if the modern element isn't available
    function fallbackToRegularAutocomplete() {
      try {
        if (autocompleteContainerRef.current) {
          // Create a standard input element
          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "Search for a location";
          input.className =
            "w-full h-10 px-3 py-2 pl-9 border rounded-md border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

          // Add the input to DOM
          autocompleteContainerRef.current.appendChild(input);

          // Add the search icon
          const iconContainer = document.createElement("div");
          iconContainer.className =
            "absolute left-2.5 top-2.5 z-10 pointer-events-none";
          iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;
          autocompleteContainerRef.current.insertBefore(iconContainer, input);

          // Initialize standard autocomplete
          if (window.google?.maps?.places) {
            const autocomplete = new window.google.maps.places.Autocomplete(
              input,
              {
                types: ["address", "establishment", "geocode"],
                componentRestrictions: { country: "us" },
                fields: [
                  "place_id",
                  "geometry",
                  "name",
                  "formatted_address",
                  "address_components",
                ],
              },
            );

            // Listen for place selection
            autocomplete.addListener("place_changed", () => {
              const place = autocomplete.getPlace();
              handlePlaceSelection(place);
            });

            console.log("FixedAddressPicker: Regular Autocomplete initialized");
          }
        }
      } catch (error) {
        console.error(
          "FixedAddressPicker: Error initializing fallback autocomplete:",
          error,
        );
        toast({
          title: "Error",
          description: "Could not initialize location search",
          variant: "destructive",
        });
      }
    }

    // Fetch complete place details using the Place ID
    function fetchPlaceDetails(placeId: string) {
      setIsLoading(true);

      // Create a PlacesService with a temporary div
      const tempDiv = document.createElement("div");
      const placesService = new window.google.maps.places.PlacesService(
        tempDiv,
      );

      // Use getDetails to get place information
      placesService.getDetails(
        {
          placeId: placeId,
          fields: [
            "name",
            "formatted_address",
            "geometry",
            "address_components",
          ],
        },
        (placeResult: any, status: any) => {
          setIsLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            placeResult
          ) {
            handlePlaceSelection(placeResult);
          } else {
            console.error("Error fetching place details:", status);
            toast({
              title: "Error",
              description: "Could not get location details",
              variant: "destructive",
            });
          }
        },
      );
    }

    // Set up callback for script loading
    window.initGoogleMaps = () => {
      console.log("[FixedAddressPicker] Google Maps initialized via callback");
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        "[FixedAddressPicker] Google Maps already loaded, initializing services",
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
        "[FixedAddressPicker] Google Maps script already exists, waiting for load",
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log("[FixedAddressPicker] Loading Google Maps script...");
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww";
    console.log(
      "[FixedAddressPicker] Using Google Maps API Key:",
      apiKey ? "Key found" : "Key missing",
    );
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta`;
    script.async = true;
    script.onerror = () => {
      console.error("[FixedAddressPicker] Failed to load Google Maps script");
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

      // Clean up the autocomplete element
      if (autocompleteElementRef.current) {
        autocompleteElementRef.current.remove();
      }
    };
  }, [toast]);

  // Handle place selection from the autocomplete element
  const handlePlaceSelection = (place: any) => {
    if (!place || !place.geometry) {
      console.error("FixedAddressPicker: No place details returned");
      toast({
        title: "Error",
        description: "Could not get location details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("FixedAddressPicker: Place selected:", place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === "function" ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === "function" ? location.lng() : location.lng;

      console.log(
        "FixedAddressPicker: Location coordinates:",
        latitude,
        longitude,
      );

      // Store the selected location and display the map
      setSelectedLocation({ lat: latitude, lng: longitude });
      setShowMap(true);

      // Initialize or update the map
      setTimeout(() => {
        initializeMap({ lat: latitude, lng: longitude });
      }, 50);

      // Prepare the address data
      const addressData: AddressData = {
        formatted_address: place.formatted_address || "",
        address_components: place.address_components || [],
        latitude,
        longitude,
        place_id: place.place_id || "",
        name: place.name || "",
      };

      // Pass the data to the parent component
      onAddressSelect(addressData);

      setIsLoading(false);
    } catch (error) {
      console.error("FixedAddressPicker: Error processing place data:", error);
      setIsLoading(false);

      toast({
        title: "Error",
        description: "Failed to process location data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className={`${className} relative`}>
      <div ref={autocompleteContainerRef} className="relative">
        {!googleInitialized && (
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Loading location search..."
              className="pl-9"
              disabled={true}
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="absolute right-2.5 top-2.5 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
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
