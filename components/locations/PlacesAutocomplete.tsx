"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "../ui/input";

// Mock useToast hook if not available
const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant,
    }: {
      title: string;
      description: string;
      variant?: string;
    }) => {
      console.log(`Toast: ${title} - ${description}`);
    },
  };
};

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

export default function PlacesAutocomplete({
  onPlaceSelect,
  placeholder = "Search for an address",
  className,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autoCompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      // If Google Maps API is not loaded, show a toast
      toast({
        title: "Google Maps not loaded",
        description:
          "Please make sure Google Maps API is correctly configured.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Google Places Autocomplete
      if (inputRef.current) {
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          { types: ["address"] },
        );

        // Add a listener for place changed
        autoCompleteRef.current.addListener("place_changed", () => {
          if (autoCompleteRef.current) {
            const place = autoCompleteRef.current.getPlace();

            if (!place.geometry) {
              toast({
                title: "Invalid Location",
                description: "Please select a location from the dropdown.",
                variant: "destructive",
              });
              return;
            }

            onPlaceSelect(place);
          }
        });
      }
    } catch (error: any) {
      toast({
        title: "Google Maps Error",
        description:
          error.message || "An error occurred while initializing Google Maps",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }

    return () => {
      // Clean up listener on unmount
      if (autoCompleteRef.current && window.google) {
        window.google.maps.event.clearInstanceListeners(
          autoCompleteRef.current,
        );
      }
    };
  }, [onPlaceSelect, toast]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className={className}
        disabled={isLoading}
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
