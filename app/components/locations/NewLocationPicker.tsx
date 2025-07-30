"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Track if the Maps API has been loaded
let googleMapsLoaded = false;

interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name?: string;
  types?: string[];
}

interface Props {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function NewLocationPicker({
  onAddressSelect,
  className = "",
}: Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState("");

  // Refs for DOM elements
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize or update map when selectedLocation changes
  useEffect(() => {
    if (!selectedLocation || !mapContainerRef.current || !window.google?.maps)
      return;

    const { lat, lng } = selectedLocation;
    const location = { lat, lng };

    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center: location,
          zoom: 15,
          mapId: "DEMO_MAP_ID",
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        },
      );

      // Add marker
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      // Update existing map
      mapInstanceRef.current.setCenter(location);

      // Update marker
      if (markerRef.current) {
        markerRef.current.setPosition(location);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
        });
      }
    }
  }, [selectedLocation]);

  // Load Google Maps API and initialize PlaceAutocompleteElement
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Only run this once
      if (googleMapsLoaded || window.google?.maps?.places) return;
      googleMapsLoaded = true;

      window.initMap = function () {
        console.log("Google Maps API loaded via callback");
        setupPlaceAutocomplete();
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&libraries=places,marker&callback=initMap&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const setupPlaceAutocomplete = () => {
      if (!autocompleteContainerRef.current || !window.google?.maps?.places)
        return;

      try {
        // Clean the container
        autocompleteContainerRef.current.innerHTML = "";

        // Create a regular input as a fallback
        const fallbackInput = document.createElement("input");
        fallbackInput.type = "text";
        fallbackInput.placeholder =
          "Search for addresses, businesses, or places...";
        fallbackInput.id = "location-search-input";
        fallbackInput.className =
          "w-full h-12 pl-10 pr-3 focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-md border border-input bg-background text-foreground";

        // Add search icon container
        const searchIconContainer = document.createElement("div");
        searchIconContainer.className =
          "pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10";
        const searchIcon = document.createElement("div");
        searchIcon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search h-4 w-4 text-muted-foreground"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>';
        searchIconContainer.appendChild(searchIcon);

        // Create container for the input
        const inputContainer = document.createElement("div");
        inputContainer.className = "relative w-full";
        inputContainer.appendChild(searchIconContainer);
        inputContainer.appendChild(fallbackInput);

        // Add the input container to the autocomplete container
        autocompleteContainerRef.current.appendChild(inputContainer);

        // Create an autocomplete instance on our input
        const autocomplete = new window.google.maps.places.Autocomplete(
          fallbackInput,
          {
            fields: [
              "formatted_address",
              "geometry",
              "name",
              "place_id",
              "types",
              "address_components",
            ],
            types: ["address", "establishment", "geocode"],
          },
        );

        // When a place is selected
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (!place.geometry || !place.geometry.location) {
            console.error("Place selected but no geometry data");
            return;
          }

          // Get location details
          const location = place.geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Update the selected location for the map
          setSelectedLocation({ lat, lng });

          // Determine if this is an establishment or business
          const isBusinessOrPlace =
            place.types &&
            (place.types.includes("establishment") ||
              place.types.includes("point_of_interest"));

          // Create address object
          const addressData: AddressData = {
            formatted_address: place.formatted_address || "",
            address_components: place.address_components || [],
            latitude: lat,
            longitude: lng,
            place_id: place.place_id || "",
            name: isBusinessOrPlace ? place.name : place.name || "",
            types: place.types || [],
          };

          console.log("Selected address data:", addressData);

          // Update display address
          if (isBusinessOrPlace && place.name && place.formatted_address) {
            setAddress(`${place.name} - ${place.formatted_address}`);
          } else if (place.formatted_address) {
            setAddress(place.formatted_address);
          }

          // Send data to parent component
          onAddressSelect(addressData);
        });

        setIsLoading(false);
        console.log("Autocomplete initialized with regular input");
      } catch (error) {
        console.error("Error setting up autocomplete:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Failed to initialize location search",
          variant: "destructive",
        });
      }
    };

    // Initialize
    setIsLoading(true);

    if (window.google?.maps?.places) {
      console.log("Google Maps already loaded, setting up autocomplete");
      setupPlaceAutocomplete();
    } else {
      loadGoogleMaps();
    }

    return () => {
      // Cleanup if needed
    };
  }, []); // Empty dependency array - run only once

  return (
    <div className={className}>
      {/* Search input */}
      <div className="relative mb-4 max-w-md">
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}
        <div
          ref={autocompleteContainerRef}
          className="place-autocomplete-container relative"
        ></div>
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-[350px] rounded-md border border-input relative ${!selectedLocation ? "bg-muted/40 flex items-center justify-center" : ""}`}
      >
        {!selectedLocation && (
          <div className="text-center text-muted-foreground flex flex-col items-center">
            <MapPin className="h-12 w-12 mb-3 text-muted-foreground/60" />
            <p className="text-lg">Search for a location to see the map</p>
            <p className="text-sm text-muted-foreground/80 mt-1 max-w-xs">
              Try searching for businesses, landmarks, or addresses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Google Maps types are defined in types/google-places-web-components.d.ts
