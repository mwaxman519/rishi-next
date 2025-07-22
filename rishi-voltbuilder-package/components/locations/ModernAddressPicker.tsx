"use client";

import React, { useEffect, useRef, useState } from "react";
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

interface ModernAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function ModernAddressPicker({
  onAddressSelect,
  className = "",
}: ModernAddressPickerProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        "ModernAddressPicker: Map container or Google Maps not available",
      );
      return;
    }

    console.log(
      "ModernAddressPicker: Initializing map with location:",
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
        console.log("ModernAddressPicker: Creating new map instance");
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log("ModernAddressPicker: Reusing existing map instance");
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log("ModernAddressPicker: Creating new marker");
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log("ModernAddressPicker: Updating existing marker");
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error("ModernAddressPicker: Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not display the map",
        variant: "destructive",
      });
    }
  };

  // Initialize Google Maps and set up Autocomplete
  useEffect(() => {
    // Define the initialization function
    function initializeServices() {
      try {
        console.log("ModernAddressPicker: Initializing Google services...");

        if (inputRef.current && window.google?.maps?.places) {
          // Create a new Autocomplete instance directly on the input field
          // This is the MODERN way recommended by Google for Place Autocomplete
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: ["geocode", "establishment"],
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

          // Add listener for place changes
          autocompleteRef.current.addListener("place_changed", () => {
            const place = autocompleteRef.current.getPlace();
            handlePlaceSelection(place);
          });

          console.log(
            "ModernAddressPicker: Autocomplete initialized on input element",
          );
        }

        setGoogleInitialized(true);
        console.log(
          "ModernAddressPicker: Google services initialized successfully",
        );
      } catch (error) {
        console.error(
          "ModernAddressPicker: Error initializing Google services:",
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
      console.log("[ModernAddressPicker] Google Maps initialized via callback");
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        "[ModernAddressPicker] Google Maps already loaded, initializing services",
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
        "[ModernAddressPicker] Google Maps script already exists, waiting for load",
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log("[ModernAddressPicker] Loading Google Maps script...");
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      "AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww";
    console.log(
      "[ModernAddressPicker] Using Google Maps API Key:",
      apiKey ? "Key found" : "Key missing",
    );
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.onerror = () => {
      console.error("[ModernAddressPicker] Failed to load Google Maps script");
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

      // Remove the event listener from autocomplete to prevent memory leaks
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, [toast]);

  // Handle place selection from the autocomplete widget
  const handlePlaceSelection = (place: any) => {
    if (!place || !place.geometry) {
      console.error("ModernAddressPicker: No place details returned");
      toast({
        title: "Error",
        description: "Could not get location details",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("ModernAddressPicker: Place selected:", place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === "function" ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === "function" ? location.lng() : location.lng;

      console.log(
        "ModernAddressPicker: Location coordinates:",
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
      console.error("ModernAddressPicker: Error processing place data:", error);
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
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for a location"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
          disabled={!googleInitialized}
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
        )}
      </div>

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
