"use client";

import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// The component interface
interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name?: string | undefined;
}

interface GooglePlacesFinderProps {
  onAddressSelect: (addressData: AddressData) => void;
  placeholder?: string;
  className?: string;
  apiKey?: string;
}

export default function GooglePlacesFinder({
  onAddressSelect,
  placeholder = "*** TESTING - Search for an address ***",
  className = "",
  apiKey = "AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww", // Default API key
}: GooglePlacesFinderProps) {
  // State management
  const [inputValue, setInputValue] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  // Refs for DOM and Google Maps services
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);
  const { toast } = useToast();

  // Load the Google Maps API
  useEffect(() => {
    // If the Google Maps API is already loaded, just use it
    if (window.google && window.google.maps) {
      console.log("GooglePlacesFinder: Google Maps already loaded");
      setGoogleLoaded(true);
      return;
    }

    // Otherwise load it
    console.log("GooglePlacesFinder: Loading Google Maps API");
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log("GooglePlacesFinder: Google Maps API loaded successfully");
      setGoogleLoaded(true);
    };

    script.onerror = () => {
      console.error("GooglePlacesFinder: Failed to load Google Maps API");
      setLoadError(new Error("Failed to load Google Maps API"));
      toast({
        title: "Error",
        description: "Unable to load Google Maps service",
        variant: "destructive",
      });
    };

    document.head.appendChild(script);

    return () => {
      // Clean up
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [apiKey, toast]);

  // Initialize Google Maps services when API is loaded
  useEffect(() => {
    if (!googleLoaded || !window.google || !window.google.maps) return;

    console.log("GooglePlacesFinder: Initializing services");
    try {
      // Initialize the autocomplete service
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();

      // Create a hidden element for the Places Service
      const mapDiv = document.createElement("div");
      document.body.appendChild(mapDiv);
      const map = new window.google.maps.Map(mapDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1,
      });
      placesService.current = new window.google.maps.places.PlacesService(map);

      console.log("GooglePlacesFinder: Services initialized successfully");
    } catch (error) {
      console.error("GooglePlacesFinder: Error initializing services", error);
      setLoadError(
        error instanceof Error
          ? error
          : new Error("Failed to initialize Google Maps services"),
      );
    }
  }, [googleLoaded]);

  // Handle input changes to fetch predictions
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (!value.trim() || !autocompleteService.current) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    console.log("GooglePlacesFinder: Fetching predictions for:", value);
    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: "us" },
      },
      (results: any[], status: any) => {
        setIsLoading(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results.length > 0
        ) {
          console.log("GooglePlacesFinder: Got predictions:", results.length);
          setPredictions(results);
          setShowDropdown(true);
        } else {
          console.log(
            "GooglePlacesFinder: No predictions found or error:",
            status,
          );
          setPredictions([]);
          setShowDropdown(false);
        }
      },
    );
  };

  // Get details of a selected place
  const handlePlaceSelect = (placeId: string) => {
    if (!placesService.current) {
      console.error("GooglePlacesFinder: Places service not available");
      return;
    }

    console.log("GooglePlacesFinder: Getting details for place ID:", placeId);
    setIsLoading(true);

    placesService.current.getDetails(
      {
        placeId,
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "name",
          "place_id",
        ],
      },
      (place: any, status: any) => {
        setIsLoading(false);
        setShowDropdown(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          console.log("GooglePlacesFinder: Got place details:", place);

          // Update the input field with the formatted address
          setInputValue(place.formatted_address || "");

          try {
            // Ensure we have coordinates
            if (!place.geometry || !place.geometry.location) {
              throw new Error("No coordinates found in place data");
            }

            // Extract lat/lng values
            let latitude: number, longitude: number;

            if (
              typeof place.geometry.location.lat === "function" &&
              typeof place.geometry.location.lng === "function"
            ) {
              latitude = place.geometry.location.lat();
              longitude = place.geometry.location.lng();
            } else {
              // Try direct access if they're not functions
              const location = place.geometry.location as any;
              latitude = location.lat;
              longitude = location.lng;
            }

            console.log(
              "GooglePlacesFinder: Extracted coordinates:",
              latitude,
              longitude,
            );

            // Prepare the data to send to the parent component
            const addressData = {
              formatted_address: place.formatted_address || "",
              address_components: place.address_components || [],
              latitude,
              longitude,
              place_id: place.place_id || "",
              name: place.name,
            };

            console.log(
              "GooglePlacesFinder: Sending data to parent:",
              addressData,
            );
            onAddressSelect(addressData);
          } catch (error) {
            console.error(
              "GooglePlacesFinder: Error processing place data:",
              error,
            );
            toast({
              title: "Error",
              description: "Unable to process location data",
              variant: "destructive",
            });
          }
        } else {
          console.error(
            "GooglePlacesFinder: Error getting place details:",
            status,
          );
          toast({
            title: "Error",
            description: "Could not retrieve location details",
            variant: "destructive",
          });
        }
      },
    );
  };

  // Handle clicking outside to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // If Google Maps failed to load, show an error state
  if (loadError) {
    return (
      <div className={`${className} relative`}>
        <Input
          placeholder="Location search unavailable"
          disabled
          className="bg-red-50"
        />
        <div className="text-xs text-red-500 mt-1">
          Could not load location services
        </div>
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
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-9"
          disabled={!googleLoaded}
        />
        {isLoading && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
        )}
      </div>

      {/* Predictions dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg">
          <ul className="py-1">
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handlePlaceSelect(prediction.place_id)}
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
