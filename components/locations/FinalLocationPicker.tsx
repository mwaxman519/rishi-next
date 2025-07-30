"use client";

import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Make sure Google Maps is only loaded once
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
  onLocationSelected?: (locationId: string) => void;
  filterApprovedOnly?: boolean;
  excludeLocationIds?: unknown[];
  className?: string;
}

export default function FinalLocationPicker({
  onAddressSelect,
  onLocationSelected,
  filterApprovedOnly,
  excludeLocationIds,
  className = "",
}: Props): React.ReactNode {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const { toast } = useToast();

  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Add styling for the Google Places autocomplete dropdown with light/dark mode support
  // Add styles and fix dropdown positioning
  useEffect(() => {
    // Add custom styles for the Google Maps autocomplete dropdown
    const style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = `
      /* Style the autocomplete dropdown to match our UI */
      .pac-container {
        /* Solid colors for both light and dark modes */
        background-color: rgb(var(--popover)) !important;
        color: rgb(var(--foreground)) !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2) !important;
        border: 1px solid rgb(var(--border)) !important;
        z-index: 9999 !important;
        /* Ensure this dropdown is fully opaque */
        opacity: 1 !important;
        backdrop-filter: none !important;
        -webkit-backdrop-filter: none !important;
        border: 1px solid var(--border, #e2e8f0) !important;
        margin-top: 4px !important;
        z-index: 9999 !important;
        padding: 0.5rem !important;
        font-family: inherit !important;
        max-width: 460px !important;
        backdrop-filter: none !important; /* Ensure no transparency */
      }

      /* Dark mode specific styles */
      html.dark .pac-container {
        background-color: hsl(var(--background, 224 71% 4%)) !important;
        border-color: hsl(var(--border, 215 27.9% 16.9%)) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;
      }

      /* Container positioning */
      #autocomplete-container {
        position: relative !important;
        max-width: 460px !important;
        width: 100% !important;
      }
      
      /* Style dropdown items */
      .pac-item {
        padding: 0.75rem 0.5rem;
        border-top: none;
        border-radius: 0.25rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        font-size: 0.9rem;
        color: var(--foreground, #000);
        margin-bottom: 2px;
        border-bottom: 1px solid var(--border, #e2e8f0);
        background-color: transparent !important;
      }
      
      /* Dark mode specific styles for items */
      html.dark .pac-item {
        color: var(--foreground, #fff);
        border-bottom: 1px solid hsl(var(--border, 215 27.9% 16.9%));
      }
      
      .pac-item:last-child {
        border-bottom: none;
      }
      
      .pac-item:hover, .pac-item-selected {
        background-color: rgb(var(--muted)) !important;
        opacity: 1 !important;
        color: rgb(var(--foreground)) !important;
      }
      
      html.dark .pac-item:hover, html.dark .pac-item-selected {
        background-color: rgb(var(--muted)) !important;
        opacity: 1 !important;
        color: rgb(var(--foreground)) !important;
      }
      
      .pac-icon {
        filter: brightness(1);
        margin-right: 0.75rem;
      }
      
      html.dark .pac-icon {
        filter: brightness(1.5); /* Brighten icons in dark mode */
      }
      
      .pac-item-query {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--foreground, #000);
      }
      
      html.dark .pac-item-query {
        color: var(--foreground, #fff);
      }
      
      .pac-matched {
        font-weight: 700;
        color: hsl(var(--primary, 221.2 83.2% 53.3%));
      }
      
      .pac-item-context {
        font-size: 0.85rem;
        color: var(--muted-foreground, #64748b);
        margin-left: 0.25rem;
      }
      
      html.dark .pac-item-context {
        color: var(--muted-foreground, #94a3b8);
      }
    `;
    document.head.appendChild(style);

    // Fix dropdown width with MutationObserver
    const observer = new MutationObserver((mutations) => {
      const pacContainers = document.querySelectorAll(".pac-container");
      if (pacContainers.length > 0 && inputRef.current) {
        pacContainers.forEach((container) => {
          // Only proceed if inputRef.current is not null
          if (inputRef.current) {
            // Get exact input width
            const inputWidth = inputRef.current.offsetWidth;
            const rect = inputRef.current.getBoundingClientRect();

            // Apply input width to dropdown
            (container as HTMLElement).style.width = `${inputWidth}px`;
            (container as HTMLElement).style.maxWidth = `${inputWidth}px`;
            (container as HTMLElement).style.left = `${rect.left}px`;

            // Force solid background and opacity with a more comprehensive approach
            const containerStyle = `
              background-color: rgb(var(--popover)) !important;
              opacity: 1 !important; 
              -webkit-backdrop-filter: none !important;
              backdrop-filter: none !important;
              border: 1px solid rgb(var(--border)) !important;
              border-radius: 0.375rem !important;
              padding: 0 !important;
              overflow: hidden !important;
              box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
            `;

            // Apply all styles at once to prevent any possible race conditions
            (container as HTMLElement).setAttribute(
              "style",
              `${(container as HTMLElement).getAttribute("style") || ""}; ${containerStyle}`,
            );

            // Apply styles to child elements too
            const items = container.querySelectorAll(".pac-item");
            items.forEach((item) => {
              const itemEl = item as HTMLElement;
              itemEl.style.backgroundColor = "rgb(var(--popover))";
              itemEl.style.color = "rgb(var(--foreground))";

              // Add event listeners to ensure hover states have solid backgrounds
              itemEl.addEventListener("mouseenter", () => {
                itemEl.style.backgroundColor = "rgb(var(--muted))";
                itemEl.style.opacity = "1";
                itemEl.style.borderColor = "rgb(var(--border))";
                itemEl.style.margin = "0";
                itemEl.style.padding = "0.5rem 1rem";
              });

              itemEl.addEventListener("mouseleave", () => {
                itemEl.style.backgroundColor = "rgb(var(--popover))";
                itemEl.style.opacity = "1";
                itemEl.style.borderColor = "rgb(var(--border))";
                itemEl.style.margin = "0";
                itemEl.style.padding = "0.5rem 1rem";
              });
            });
          }
        });
      }
    });

    // Observe the entire document for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      if (style.parentNode) {
        document.head.removeChild(style);
      }
      observer.disconnect();
    };
  }, []);

  // Initialize and update the map
  useEffect(() => {
    if (!selectedLocation || !mapContainerRef.current || !window.google?.maps)
      return;

    // Create the map if it doesn't exist
    if (!mapInstanceRef.current) {
      console.log("Creating new map with location:", selectedLocation);

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

      // Create a marker for the location
      markerRef.current = new window.google.maps.Marker({
        position: selectedLocation,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      // Update existing map and marker
      console.log("Updating map with new location:", selectedLocation);
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

  // Load Google Maps and set up autocomplete
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Only run this once
      if (googleMapsLoaded || window.google?.maps?.places) return;
      googleMapsLoaded = true;

      window.initMap = function () {
        console.log("Google Maps API loaded via callback");
        setupAutocomplete();
      };

      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&libraries=places&callback=initMap&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const setupAutocomplete = () => {
      if (!inputRef.current || !window.google?.maps?.places) return;

      try {
        // Create autocomplete instance
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: [], // Allow all types, including businesses and establishments
          },
        );

        // Add place_changed listener
        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();

          if (!place.geometry) {
            console.log("Place selected but no geometry data");
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
            formatted_address: place.formatted_address || address,
            address_components: place.address_components || [],
            latitude: lat,
            longitude: lng,
            place_id: place.place_id || "",
            name: isBusinessOrPlace ? place.name : place.name || address,
            types: place.types || [],
          };

          console.log("Selected address data:", addressData);

          // Update input value with the place name for businesses or formatted address
          if (
            place.name &&
            place.types &&
            (place.types.includes("establishment") ||
              place.types.includes("point_of_interest"))
          ) {
            // For businesses/establishments, show the name followed by the address
            setAddress(`${place.name} - ${place.formatted_address}`);
          } else if (place.formatted_address) {
            // For regular addresses
            setAddress(place.formatted_address);
          }

          // Send data to parent component
          onAddressSelect(addressData);
        });

        setIsLoading(false);
        console.log("Autocomplete initialized");
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
      setupAutocomplete();
    } else {
      loadGoogleMaps();
    }

    return () => {
      // Cleanup
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, []); // Empty dependency array - run only once

  // Input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  return (
    <div className={className}>
      {/* Search input */}
      <div id="autocomplete-container" className="relative mb-4 max-w-md">
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

// Google Maps types are defined in types/google-places-web-components.d.ts
