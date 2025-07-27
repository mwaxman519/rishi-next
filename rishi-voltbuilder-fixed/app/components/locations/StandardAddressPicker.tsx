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

interface StandardAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function StandardAddressPicker({
  onAddressSelect,
  className = "",
}: StandardAddressPickerProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        "StandardAddressPicker: Map container or Google Maps not available",
      );
      return;
    }

    console.log(
      "StandardAddressPicker: Initializing map with location:",
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
        console.log("StandardAddressPicker: Creating new map instance");
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log("StandardAddressPicker: Reusing existing map instance");
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log("StandardAddressPicker: Creating new marker");
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log("StandardAddressPicker: Updating existing marker");
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error("StandardAddressPicker: Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not display the map",
        variant: "destructive",
      });
    }
  };

  // Initialize Google Maps and set up standard Autocomplete
  useEffect(() => {
    function initializeServices() {
      try {
        console.log("StandardAddressPicker: Initializing Google services...");

        if (autocompleteContainerRef.current && window.google?.maps?.places) {
          // Create a standard input element
          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "Search for a location";
          input.className =
            "w-full h-10 px-3 py-2 pl-9 border rounded-md border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
          inputRef.current = input;

          // Add the input to DOM
          autocompleteContainerRef.current.appendChild(input);

          // Add the search icon
          const iconContainer = document.createElement("div");
          iconContainer.className =
            "absolute left-2.5 top-2.5 z-10 pointer-events-none";
          iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search text-muted-foreground"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;
          autocompleteContainerRef.current.insertBefore(iconContainer, input);

          // Initialize standard autocomplete
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
          autocompleteRef.current = autocomplete;

          // Listen for place selection
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            handlePlaceSelection(place);
          });

          console.log(
            "StandardAddressPicker: Standard Autocomplete initialized",
          );
        }

        setGoogleInitialized(true);
        console.log(
          "StandardAddressPicker: Google services initialized successfully",
        );
      } catch (error) {
        console.error(
          "StandardAddressPicker: Error initializing Google services:",
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
        "[StandardAddressPicker] Google Maps initialized via callback",
      );
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        "[StandardAddressPicker] Google Maps already loaded, initializing services",
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
        "[StandardAddressPicker] Google Maps script already exists, waiting for load",
      );
      return; // The callback will handle initialization
    }

    // Load the script - using the stable API version, not beta
    console.log("[StandardAddressPicker] Loading Google Maps script...");
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww";
    console.log(
      "[StandardAddressPicker] Using Google Maps API Key:",
      apiKey ? "Key found" : "Key missing",
    );
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.onerror = () => {
      console.error(
        "[StandardAddressPicker] Failed to load Google Maps script",
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

      // Clean up event listeners
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [toast]);

  // Handle place selection from the autocomplete
  const handlePlaceSelection = (place: any) => {
    if (!place || !place.geometry) {
      console.error("StandardAddressPicker: No place details returned");
      toast({
        title: "Error",
        description: "Could not get location details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("StandardAddressPicker: Place selected:", place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === "function" ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === "function" ? location.lng() : location.lng;

      console.log(
        "StandardAddressPicker: Location coordinates:",
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
        "StandardAddressPicker: Error processing place data:",
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
