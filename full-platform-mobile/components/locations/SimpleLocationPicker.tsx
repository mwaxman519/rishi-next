"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

// Track if the Maps API has been loaded
let googleMapsLoaded = false;

export default function SimpleLocationPicker({
  onAddressSelect,
  className = "",
}: Props): React.ReactNode {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState("");

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = () => {
      if (googleMapsLoaded || window.google?.maps) return;
      googleMapsLoaded = true;

      window.initMap = function () {
        console.log("Google Maps API loaded via callback");
        if (window.google?.maps?.places) {
          setupAutocomplete();
        }
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&libraries=places&callback=initMap&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const setupAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: ["address", "establishment", "geocode"],
          },
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          if (!place.geometry) {
            console.error("Place selected but no geometry data");
            return;
          }

          // Get location data
          const location = place.geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Update selected location for map
          setSelectedLocation({ lat, lng });

          // Determine if business/place
          const isBusinessOrPlace =
            place.types &&
            (place.types.includes("establishment") ||
              place.types.includes("point_of_interest"));

          // Create address data
          const addressData: AddressData = {
            formatted_address: place.formatted_address || address,
            address_components: place.address_components || [],
            latitude: lat,
            longitude: lng,
            place_id: place.place_id || "",
            name: isBusinessOrPlace ? place.name : place.name || address,
            types: place.types || [],
          };

          console.log("Selected address data:", addressData);

          // Update display
          if (isBusinessOrPlace && place.name && place.formatted_address) {
            setAddress(`${place.name} - ${place.formatted_address}`);
          } else if (place.formatted_address) {
            setAddress(place.formatted_address);
          }

          // Send to parent
          onAddressSelect(addressData);
        });

        setIsLoading(false);
        console.log("Autocomplete initialized");
      } catch (error) {
        console.error("Error setting up autocomplete:", error);
        setIsLoading(false);
      }
    };

    // Initialize if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setupAutocomplete();
      setIsLoading(false);
    } else {
      initializeGoogleMaps();
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, []);

  // Initialize map when location is selected
  useEffect(() => {
    if (!selectedLocation || !mapContainerRef.current || !window.google?.maps)
      return;

    if (!mapInstanceRef.current) {
      // Create new map
      mapInstanceRef.current = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center: selectedLocation,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        },
      );

      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: selectedLocation,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      // Update existing map and marker
      mapInstanceRef.current.setCenter(selectedLocation);

      if (markerRef.current) {
        markerRef.current.setPosition(selectedLocation);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: selectedLocation,
          map: mapInstanceRef.current,
        });
      }
    }
  }, [selectedLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  return (
    <div className={className}>
      {/* Search input */}
      <div className="relative mb-4 max-w-md">
        <div className="relative rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <Input
            ref={inputRef}
            type="text"
            value={address}
            onChange={handleInputChange}
            placeholder="Search for addresses, businesses, or places..."
            className="pl-10 h-12 focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-md"
            disabled={isLoading}
          />
          {isLoading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
        </div>
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

// Define types for the global scope
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}
