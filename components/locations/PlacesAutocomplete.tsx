&quot;use client&quot;;

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;

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
  placeholder = &quot;Search for an address&quot;,
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
        title: &quot;Google Maps not loaded&quot;,
        description:
          &quot;Please make sure Google Maps API is correctly configured.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Initialize Google Places Autocomplete
      if (inputRef.current) {
        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          { types: [&quot;address&quot;] },
        );

        // Add a listener for place changed
        autoCompleteRef.current.addListener(&quot;place_changed&quot;, () => {
          if (autoCompleteRef.current) {
            const place = autoCompleteRef.current.getPlace();

            if (!place.geometry) {
              toast({
                title: &quot;Invalid Location&quot;,
                description: &quot;Please select a location from the dropdown.&quot;,
                variant: &quot;destructive&quot;,
              });
              return;
            }

            onPlaceSelect(place);
          }
        });
      }
    } catch (error: any) {
      toast({
        title: &quot;Google Maps Error&quot;,
        description:
          error.message || &quot;An error occurred while initializing Google Maps&quot;,
        variant: &quot;destructive&quot;,
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
    <div className=&quot;relative&quot;>
      <Input
        ref={inputRef}
        placeholder={placeholder}
        className={className}
        disabled={isLoading}
      />
      {isLoading && (
        <div className=&quot;absolute right-3 top-1/2 -translate-y-1/2&quot;>
          <Loader2 className=&quot;h-4 w-4 animate-spin text-muted-foreground&quot; />
        </div>
      )}
    </div>
  );
}
