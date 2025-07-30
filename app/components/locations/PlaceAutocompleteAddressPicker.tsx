"use client";

/**
 * PlaceAutocompleteAddressPicker Component
 *
 * This component provides a modern Google Maps Place Autocomplete experience using the latest PlaceAutocompleteElement.
 * It handles:
 * - Loading Google Maps API with the correct parameters and Map ID
 * - Setting up the newest PlaceAutocompleteElement web component (from the beta API)
 * - Processing selected places and displaying them on a mini-map
 * - Converting coordinates to a standard format for the parent component
 *
 * IMPORTANT FIXES IMPLEMENTED:
 * 1. Removed 'fields' property which is not supported by PlaceAutocompleteElement
 * 2. Added mapId for Advanced Markers support in both script loading and map initialization
 * 3. Uses a consistent Google Maps API key throughout the component
 * 4. Implements proper event listener 'gmp-placeselect' for the modern web component
 */

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Augment Window interface to add Google Maps properties
declare global {
  interface Window {
    google: any; // Using any for flexibility with the beta Google Maps API
    initGoogleMaps?: () => void; // Global callback function for API initialization
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

interface PlaceAutocompleteAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function PlaceAutocompleteAddressPicker({
  onAddressSelect,
  className = "",
}: PlaceAutocompleteAddressPickerProps): React.JSX.Element {
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

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteElementRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        "PlaceAutocompleteAddressPicker: Map container or Google Maps not available",
      );
      return;
    }

    console.log(
      "PlaceAutocompleteAddressPicker: Initializing map with location:",
      location,
    );

    try {
      // Set map options - include mapId for Advanced Markers support
      const mapOptions = {
        center: location,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: "8f718a3abe8b23eb", // Using the same Map ID as the rest of the application
      };

      // Create or reuse map
      if (!mapInstanceRef.current) {
        console.log(
          "PlaceAutocompleteAddressPicker: Creating new map instance",
        );
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log(
          "PlaceAutocompleteAddressPicker: Reusing existing map instance",
        );
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log("PlaceAutocompleteAddressPicker: Creating new marker");
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log("PlaceAutocompleteAddressPicker: Updating existing marker");
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error(
        "PlaceAutocompleteAddressPicker: Error initializing map:",
        error,
      );
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
        console.log(
          "PlaceAutocompleteAddressPicker: Initializing Google services...",
        );

        if (autocompleteContainerRef.current && window.google?.maps?.places) {
          // Create PlaceAutocompleteElement - the newest Google Maps Places API component
          const { PlaceAutocompleteElement } = window.google.maps.places;

          if (PlaceAutocompleteElement) {
            // Create configuration for the element - PlaceAutocompleteElement has different config options than Autocomplete
            const config = {
              // types parameter is valid for PlaceAutocompleteElement
              types: ["address", "establishment", "geocode"],
              // Component restrictions are still valid
              componentRestrictions: { country: "us" },
              // Note: 'fields' is not supported by PlaceAutocompleteElement
              // We'll extract needed fields after place selection
            };

            // Create the element
            const autocompleteElement = new PlaceAutocompleteElement(config);
            autocompleteElementRef.current = autocompleteElement;

            // Add the element to the DOM
            autocompleteContainerRef.current.appendChild(autocompleteElement);

            // Style the element to match the app's design
            const autocompleteInput =
              autocompleteElement.querySelector("input");
            if (autocompleteInput) {
              autocompleteInput.className =
                "w-full h-10 px-3 py-2 pl-9 border rounded-md border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
              autocompleteInput.placeholder = "Search for a location";
            }

            // Add the search icon
            const iconContainer = document.createElement("div");
            iconContainer.className =
              "absolute left-2.5 top-2.5 pointer-events-none";
            iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;
            autocompleteContainerRef.current.insertBefore(
              iconContainer,
              autocompleteElement,
            );

            // Handle place selection events
            autocompleteElement.addEventListener(
              "gmp-placeselect",
              (event: any) => {
                const place = event.place;
                handlePlaceSelection(place);
              },
            );

            console.log(
              "PlaceAutocompleteAddressPicker: PlaceAutocompleteElement initialized",
            );
          } else {
            console.error(
              "PlaceAutocompleteAddressPicker: PlaceAutocompleteElement not available",
            );

            toast({
              title: "API Error",
              description: "Latest Google Maps API components not available",
              variant: "destructive",
            });
          }
        }

        setGoogleInitialized(true);
        console.log(
          "PlaceAutocompleteAddressPicker: Google services initialized successfully",
        );
      } catch (error) {
        console.error(
          "PlaceAutocompleteAddressPicker: Error initializing Google services:",
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
      console.log(
        "[PlaceAutocompleteAddressPicker] Google Maps initialized via callback",
      );
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        "[PlaceAutocompleteAddressPicker] Google Maps already loaded, initializing services",
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
        "[PlaceAutocompleteAddressPicker] Google Maps script already exists, waiting for load",
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log(
      "[PlaceAutocompleteAddressPicker] Loading Google Maps script...",
    );
    // Use the consistent API key from the main application
    const apiKey = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";
    // Add the Map ID for Advanced Markers
    const mapId = "8f718a3abe8b23eb";
    console.log(
      "[PlaceAutocompleteAddressPicker] Using Google Maps API Key:",
      apiKey ? "Key found" : "Key missing",
    );
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta&map_ids=${mapId}`;
    script.async = true;
    script.onerror = () => {
      console.error(
        "[PlaceAutocompleteAddressPicker] Failed to load Google Maps script",
      );
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
      console.error(
        "PlaceAutocompleteAddressPicker: No place details returned",
      );
      toast({
        title: "Error",
        description: "Could not get location details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("PlaceAutocompleteAddressPicker: Place selected:", place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === "function" ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === "function" ? location.lng() : location.lng;

      console.log(
        "PlaceAutocompleteAddressPicker: Location coordinates:",
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
      console.error(
        "PlaceAutocompleteAddressPicker: Error processing place data:",
        error,
      );
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
