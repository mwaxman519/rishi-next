"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";
import { useToast } from "@/hooks/use-toast";

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
}

export default function PlacesAutocompleteSimple({
  onPlaceSelect,
  placeholder = "Search for an address",
  defaultValue = "",
  className = "",
  disabled = false,
}: PlacesAutocompleteProps) {
  const { isLoaded, loadError, google } = useGoogleMaps();
  const { toast } = useToast();
  const [value, setValue] = useState(defaultValue);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteServiceRef =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null,
  );

  // Initialize Google services when API is loaded
  useEffect(() => {
    if (!isLoaded || !google) return;

    try {
      // Initialize autocomplete service
      autocompleteServiceRef.current =
        new google.maps.places.AutocompleteService();

      // Create a hidden element for the Places Service
      const dummyElement = document.createElement("div");
      placesServiceRef.current = new google.maps.places.PlacesService(
        dummyElement,
      );

      console.log("Google Places services initialized");
    } catch (error) {
      console.error("Error initializing Google Places services:", error);
    }
  }, [google, isLoaded]);

  // Set default value
  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue);
    }
  }, [defaultValue]);

  // Handle input changes
  function handleInputChange(text: string) {
    setValue(text);

    if (!text.trim() || !autocompleteServiceRef.current || !google) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);

    try {
      // Simple US-only place search
      autocompleteServiceRef.current.getPlacePredictions(
        {
          input: text,
          componentRestrictions: { country: "us" },
        },
        (results, status) => {
          setIsSearching(false);

          if (
            google &&
            status === google.maps.places.PlacesServiceStatus.OK &&
            results &&
            results.length > 0
          ) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        },
      );
    } catch (error) {
      console.error("Error getting place predictions:", error);
      setIsSearching(false);
      setPredictions([]);
    }
  }

  // Handle selecting a place
  function handleSelectPlace(placeId: string, displayName: string) {
    if (!placesServiceRef.current) {
      console.error("Places service not initialized");
      return;
    }

    // Immediately update the input field for better UX
    setValue(displayName);

    // Force update the DOM element directly to ensure visual feedback
    if (inputRef.current) {
      inputRef.current.value = displayName;
    }

    // Close the dropdown
    setIsOpen(false);

    console.log(`Selected place: ${displayName} (ID: ${placeId})`);

    // Get full place details
    placesServiceRef.current.getDetails(
      {
        placeId: placeId,
        fields: [
          "address_components",
          "formatted_address",
          "geometry",
          "name",
          "place_id",
        ],
      },
      (place, status) => {
        if (
          google &&
          status === google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          console.log("Got place details:", place);

          // Ensure we update the field with the formatted address
          if (place.formatted_address) {
            setValue(place.formatted_address);
            if (inputRef.current) {
              inputRef.current.value = place.formatted_address;
              // Dispatch an input event to make sure React state gets updated
              const event = new Event("input", { bubbles: true });
              inputRef.current.dispatchEvent(event);
            }
          }

          // Make sure location data is available
          if (!place.geometry || !place.geometry.location) {
            console.error("Missing geometry in place details");
            toast({
              title: "Error",
              description: "Location coordinates not available",
              variant: "destructive",
            });
            return;
          }

          // Add extra debugging to see the shape of the geometry object
          console.log("Full place details:", place);
          console.log("Place geometry structure:", place.geometry);
          console.log("Location object type:", typeof place.geometry.location);

          // Instead of trying to modify the object, we'll work with the original
          // and let the parent component handle the extraction logic
          onPlaceSelect(place);
        } else {
          console.error(`Error getting place details: ${status}`);
          toast({
            title: "Error",
            description: "Could not get location details",
            variant: "destructive",
          });
        }
      },
    );
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (loadError) {
    return (
      <div className={`${className} relative`}>
        <Input
          placeholder="Google Maps API failed to load"
          disabled={true}
          className="bg-red-50"
        />
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
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={!isLoaded || disabled}
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg">
          <ul className="py-1">
            {predictions.map((prediction) => {
              const mainText = prediction.structured_formatting.main_text;
              const secondaryText =
                prediction.structured_formatting.secondary_text;
              const fullAddress = `${mainText}, ${secondaryText}`;

              return (
                <li
                  key={prediction.place_id}
                  onClick={() =>
                    handleSelectPlace(prediction.place_id, fullAddress)
                  }
                  className="flex items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{mainText}</div>
                    <div className="text-xs text-muted-foreground">
                      {secondaryText}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
