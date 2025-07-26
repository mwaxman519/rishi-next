"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Declare global types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
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

interface SimplePlaceAutocompleteProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function SimplePlaceAutocomplete({
  onAddressSelect,
  className = "",
}: SimplePlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Flag to ensure we don't double-initialize
    let isInitialized = false;

    // Setup callback for Google Maps API
    window.initMap = () => {
      console.log("Google Maps API loaded via callback");
      if (isInitialized) return;
      initializeAutocomplete();
    };

    // Function to initialize the autocomplete control
    function initializeAutocomplete() {
      if (!containerRef.current || isInitialized) return;
      isInitialized = true;

      console.log("Initializing autocomplete");

      try {
        if (
          !window.google ||
          !window.google.maps ||
          !window.google.maps.places
        ) {
          throw new Error("Google Maps API not loaded correctly");
        }

        // Clear container
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }

        // Check for required API
        if (!window.google.maps.places.PlaceAutocompleteElement) {
          throw new Error(
            "PlaceAutocompleteElement not available - API key needs Places v1 beta access",
          );
        }

        // Create the element
        const element = new window.google.maps.places.PlaceAutocompleteElement({
          types: ["address", "establishment", "geocode"],
        });

        // Style element
        element.style.width = "100%";
        element.style.minHeight = "40px";
        element.style.padding = "8px 12px 8px 32px";
        element.style.backgroundColor = "transparent";
        element.style.boxSizing = "border-box";
        element.style.border = "none";

        // Add search icon
        const searchIcon = document.createElement("div");
        searchIcon.style.position = "absolute";
        searchIcon.style.left = "10px";
        searchIcon.style.top = "12px";
        searchIcon.style.zIndex = "10";
        searchIcon.innerHTML =
          '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>';

        // Append elements
        containerRef.current.appendChild(element);
        containerRef.current.appendChild(searchIcon);

        // Listen for place selection
        element.addEventListener("gmp-placeselect", (event: any) => {
          console.log("Place selected event:", event);

          try {
            if (!event.detail?.place?.id) {
              throw new Error("No place ID in selection event");
            }

            // Get place details
            const placeId = event.detail.place.id;
            const placesService = new window.google.maps.places.PlacesService(
              document.createElement("div"),
            );

            placesService.getDetails(
              {
                placeId,
                fields: [
                  "name",
                  "formatted_address",
                  "geometry",
                  "address_components",
                  "place_id",
                ],
              },
              (result: any, status: any) => {
                if (
                  status !== window.google.maps.places.PlacesServiceStatus.OK ||
                  !result
                ) {
                  throw new Error(`Failed to get place details: ${status}`);
                }

                if (!result.geometry?.location) {
                  throw new Error("Place missing location data");
                }

                // Get coordinates
                const location = result.geometry.location;
                const latitude =
                  typeof location.lat === "function"
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === "function"
                    ? location.lng()
                    : location.lng;

                // Create address data
                const addressData: AddressData = {
                  formatted_address: result.formatted_address || "",
                  address_components: result.address_components || [],
                  latitude,
                  longitude,
                  place_id: result.place_id,
                  name: result.name || "",
                };

                console.log("Sending address data to parent:", addressData);

                // Force synchronous update to parent
                setTimeout(() => {
                  onAddressSelect(addressData);
                }, 10);
              },
            );
          } catch (error) {
            console.error("Error processing place selection:", error);
            toast({
              title: "Error",
              description: "Failed to process the selected location",
              variant: "destructive",
            });
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Google Places:", error);
        setIsLoading(false);
        toast({
          title: "Initialization Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to initialize location services",
          variant: "destructive",
        });
      }
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      console.log("Google Maps already loaded");
      initializeAutocomplete();
    } else {
      // Load Google Maps script if not already loading
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api"]',
      );

      if (!existingScript) {
        console.log("Loading Google Maps script");
        const apiKey = "AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q"; // Key with Places API v1 access

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap&loading=async&v=beta`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          console.error("Failed to load Google Maps script");
          setIsLoading(false);
          toast({
            title: "Loading Error",
            description: "Failed to load Google Maps services",
            variant: "destructive",
          });
        };

        document.head.appendChild(script);
      } else {
        console.log("Google Maps script already loading");
      }
    }

    // Cleanup function
    return () => {
      // Reset to an empty function to prevent TypeScript error
      window.initMap = () => {};
    };
  }, [onAddressSelect, toast]);

  return (
    <div className={`${className} relative`}>
      <div className="relative min-h-[45px] border rounded-md">
        <div ref={containerRef} className="relative w-full min-h-[40px]" />

        {isLoading && (
          <div className="absolute inset-0 bg-background z-10">
            <div className="relative flex items-center h-full">
              <Search className="absolute left-2.5 top-[50%] transform translate-y-[-50%] h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Loading location search..."
                className="pl-9 h-full border-0"
                disabled={true}
              />
              <div className="absolute right-2.5 top-[50%] transform translate-y-[-50%]">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
