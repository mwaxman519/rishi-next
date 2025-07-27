"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { cn } from "@/lib/utils";

export interface PlaceResult {
  placeId: string;
  name: string;
  address: string;
  formattedAddress?: string;
  location: {
    lat: number;
    lng: number;
  };
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  placeType?: string;
}

interface LocationSearchProps {
  onPlaceSelect: (place: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  initialValue?: string;
  usePopover?: boolean;
}

export function LocationSearch({
  onPlaceSelect,
  placeholder = "Search for a location...",
  className,
  autoFocus = false,
  initialValue = "",
  usePopover = true,
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService =
    useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);
  const sessionToken =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const { isLoaded, loadError } = useGoogleMaps();

  // Create session token once map is loaded
  useEffect(() => {
    if (
      isLoaded &&
      window.google &&
      window.google.maps &&
      window.google.maps.places
    ) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();

      // Create an invisible div to attach the PlacesService
      const placesDiv = document.createElement("div");
      placesDiv.style.display = "none";
      document.body.appendChild(placesDiv);
      placesService.current = new window.google.maps.places.PlacesService(
        placesDiv,
      );

      // Create a new session token
      sessionToken.current =
        new window.google.maps.places.AutocompleteSessionToken();

      return () => {
        document.body.removeChild(placesDiv);
      };
    }
  }, [isLoaded]);

  // Fetch place predictions when search query changes
  useEffect(() => {
    if (!isLoaded || !autocompleteService.current || !searchQuery.trim()) {
      setPredictions([]);
      return;
    }

    const fetchPredictions = async () => {
      try {
        setLoading(true);

        const request: google.maps.places.AutocompletionRequest = {
          input: searchQuery,
          sessionToken: sessionToken.current,
          types: ["establishment", "geocode"],
          componentRestrictions: { country: "us" }, // Restrict to US
        };

        autocompleteService.current.getPlacePredictions(
          request,
          (
            predictions: google.maps.places.AutocompletePrediction[] | null,
            status: google.maps.places.PlacesServiceStatus,
          ) => {
            if (
              status === google.maps.places.PlacesServiceStatus.OK &&
              predictions
            ) {
              setPredictions(predictions);
            } else {
              setPredictions([]);
            }
            setLoading(false);
          },
        );
      } catch (error) {
        console.error("Error fetching place predictions:", error);
        setPredictions([]);
        setLoading(false);
      }
    };

    // Debounce the predictions request
    const timer = setTimeout(() => {
      fetchPredictions();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, isLoaded]);

  // Handle place selection
  const handleSelectPlace = async (
    prediction: google.maps.places.AutocompletePrediction,
  ) => {
    if (!placesService.current) return;

    try {
      setLoading(true);

      placesService.current.getDetails(
        {
          placeId: prediction.place_id,
          fields: [
            "name",
            "place_id",
            "formatted_address",
            "geometry.location",
            "address_components",
            "types",
          ],
          sessionToken: sessionToken.current,
        },
        (
          place: google.maps.places.PlaceResult | null,
          status: google.maps.places.PlacesServiceStatus,
        ) => {
          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            // Extract address components
            let city = "";
            let state = "";
            let postalCode = "";
            let country = "";

            place.address_components?.forEach((component) => {
              if (component.types.includes("locality")) {
                city = component.long_name;
              } else if (
                component.types.includes("administrative_area_level_1")
              ) {
                state = component.short_name;
              } else if (component.types.includes("postal_code")) {
                postalCode = component.long_name;
              } else if (component.types.includes("country")) {
                country = component.long_name;
              }
            });

            // Determine place type
            let placeType = "address";
            if (place.types) {
              if (place.types.includes("establishment")) {
                placeType = "business";
              } else if (place.types.includes("park")) {
                placeType = "park";
              } else if (place.types.includes("school")) {
                placeType = "school";
              } else if (place.types.includes("stadium")) {
                placeType = "stadium";
              }
            }

            // Create place result
            const placeResult: PlaceResult = {
              placeId: place.place_id || "",
              name:
                place.name || prediction.structured_formatting?.main_text || "",
              address: place.formatted_address || prediction.description || "",
              formattedAddress: place.formatted_address || "",
              location: {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              },
              city,
              state,
              postalCode,
              country,
              placeType,
            };

            // Update the search input with the selected place
            setSearchQuery(placeResult.name || placeResult.address);

            // Call the callback with the place details
            onPlaceSelect(placeResult);

            // Create a new session token for the next search
            sessionToken.current =
              new window.google.maps.places.AutocompleteSessionToken();

            // Close the popover/dropdown
            setFocused(false);
            setOpenPopover(false);
          }
          setLoading(false);
        },
      );
    } catch (error) {
      console.error("Error getting place details:", error);
      setLoading(false);
    }
  };

  // Handle clearing the search input
  const handleClearSearch = () => {
    setSearchQuery("");
    setPredictions([]);
    setFocused(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Determine if we should show a command or a popover
  const SearchComponent = useMemo(() => {
    // Basic input with dropdown of results
    const InputWithResults = (
      <div className="relative w-full">
        <div className="relative">
          <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            autoFocus={autoFocus}
            className={cn("pl-9 pr-8 w-full", className)}
            disabled={!isLoaded || loading}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={handleClearSearch}
              disabled={loading}
              type="button"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
          {loading && (
            <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
          )}
        </div>

        {focused && (searchQuery || predictions.length > 0) && (
          <Card className="absolute top-full left-0 right-0 mt-1 z-10 shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Command>
                <CommandList>
                  {predictions.length === 0 ? (
                    <CommandEmpty>
                      {searchQuery
                        ? "No results found."
                        : "Start typing to search for locations."}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {predictions.map((prediction) => (
                        <CommandItem
                          key={prediction.place_id}
                          onSelect={() => handleSelectPlace(prediction)}
                          className="flex flex-col items-start py-2"
                        >
                          <div className="font-medium">
                            {prediction.structured_formatting?.main_text ||
                              prediction.description}
                          </div>
                          {prediction.structured_formatting?.secondary_text && (
                            <div className="text-sm text-muted-foreground">
                              {prediction.structured_formatting.secondary_text}
                            </div>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </CardContent>
          </Card>
        )}
      </div>
    );

    // If using popover, wrap the input in a popover
    if (usePopover) {
      return (
        <Popover open={openPopover && focused} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <div
              className="relative w-full"
              onClick={() => {
                setFocused(true);
                setOpenPopover(true);
              }}
            >
              <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  setFocused(true);
                  setOpenPopover(true);
                }}
                autoFocus={autoFocus}
                className={cn("pl-9 pr-8 w-full", className)}
                disabled={!isLoaded || loading}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-9 w-9 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearSearch();
                  }}
                  disabled={loading}
                  type="button"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
              {loading && (
                <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin" />
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-full min-w-[300px]" align="start">
            <Command>
              <CommandList>
                {predictions.length === 0 ? (
                  <CommandEmpty>
                    {searchQuery
                      ? "No results found."
                      : "Start typing to search for locations."}
                  </CommandEmpty>
                ) : (
                  <CommandGroup>
                    {predictions.map((prediction) => (
                      <CommandItem
                        key={prediction.place_id}
                        onSelect={() => handleSelectPlace(prediction)}
                        className="flex flex-col items-start py-2"
                      >
                        <div className="font-medium">
                          {prediction.structured_formatting?.main_text ||
                            prediction.description}
                        </div>
                        {prediction.structured_formatting?.secondary_text && (
                          <div className="text-sm text-muted-foreground">
                            {prediction.structured_formatting.secondary_text}
                          </div>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      );
    }

    return InputWithResults;
  }, [
    searchQuery,
    focused,
    predictions,
    loading,
    isLoaded,
    placeholder,
    className,
    autoFocus,
    openPopover,
    usePopover,
  ]);

  // If Google Maps is not loaded yet, show a loading state
  if (loadError) {
    return (
      <div className={cn("relative w-full", className)}>
        <Input
          disabled
          placeholder="Error loading Google Maps"
          className="pl-9 w-full"
        />
        <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return SearchComponent;
}
