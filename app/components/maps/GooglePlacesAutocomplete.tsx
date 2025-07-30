&quot;use client&quot;;

import { useEffect, useRef, useState } from &quot;react&quot;;
import { Loader } from &quot;@googlemaps/js-api-loader&quot;;
import { Input } from &quot;@/components/ui/input&quot;;

interface GooglePlacesAutocompleteProps {
  apiKey: string;
  onPlaceSelect?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Google Places Autocomplete component using the latest recommended API
 */
export function GooglePlacesAutocomplete({
  apiKey,
  onPlaceSelect,
  placeholder = &quot;Search for a place...&quot;,
  className = "&quot;,
}: GooglePlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load Google Maps JavaScript API
  useEffect(() => {
    const loader = new Loader({
      apiKey,
      version: &quot;weekly&quot;,
      libraries: [&quot;places&quot;],
    });

    loader
      .load()
      .then(() => {
        console.log(&quot;Google Maps Places API loaded&quot;);
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error(&quot;Error loading Google Maps Places API:&quot;, err);
      });
  }, [apiKey]);

  // Initialize autocomplete when API is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current) return;

    try {
      console.log(&quot;Initializing Places Autocomplete&quot;);

      // Initialize the autocomplete
      const autocomplete = new google.maps.places.Autocomplete(
        inputRef.current,
        {
          fields: [
            &quot;address_components&quot;,
            &quot;geometry&quot;,
            &quot;name&quot;,
            &quot;formatted_address&quot;,
          ],
          types: [&quot;establishment&quot;, &quot;geocode&quot;],
        },
      );

      // Store reference
      autocompleteRef.current = autocomplete;

      // Add listener for place selection
      autocomplete.addListener(&quot;place_changed&quot;, () => {
        const place = autocomplete.getPlace();
        console.log(&quot;Place selected:&quot;, place);

        if (onPlaceSelect && place) {
          onPlaceSelect(place);
        }
      });

      console.log(&quot;Places Autocomplete initialized successfully&quot;);
    } catch (error) {
      console.error(&quot;Error initializing Places Autocomplete:&quot;, error);
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, onPlaceSelect]);

  return (
    <div className={`relative ${className}`}>
      <Input
        ref={inputRef}
        type=&quot;text&quot;
        placeholder={placeholder}
        className=&quot;w-full bg-gray-800 border-gray-700 text-white&quot;
        disabled={!isLoaded}
      />
      {!isLoaded && (
        <div className=&quot;absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
          Loading...
        </div>
      )}
    </div>
  );
}
