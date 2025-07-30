&quot;use client&quot;;

import { useEffect, useState, useRef } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
}

export default function DynamicPlacesAutocomplete({
  onPlaceSelect,
  placeholder = &quot;Search for a location&quot;,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip server-side rendering
    if (typeof window === &quot;undefined&quot;) return;

    // Check if we already have Google Maps loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      initializePlacesAutocomplete();
      setLoaded(true);
      return;
    }

    // Define a global callback function
    window.initAutocomplete = () => {
      initializePlacesAutocomplete();
      setLoaded(true);
    };

    // Handle authentication failures
    window.gm_authFailure = () => {
      console.error(&quot;Google Maps authentication failed!&quot;);
      setError(
        &quot;Google Maps authentication failed. Your API key may be invalid or restricted.&quot;,
      );
    };

    // Get API key
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setError(&quot;Google Maps API key is missing!&quot;);
      return;
    }

    // Load the Google Maps script via our own proxy API to avoid CSP issues
    const script = document.createElement(&quot;script&quot;);
    script.src = `/api/maps/proxy-js-api?libraries=places&callback=initAutocomplete`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      console.error(&quot;Error loading Google Maps script:&quot;, error);
      setError(
        &quot;Failed to load Google Maps script. Check your internet connection and API key.&quot;,
      );
    };

    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
      delete window.initAutocomplete;
      delete window.gm_authFailure;
    };
  }, []);

  const initializePlacesAutocomplete = () => {
    try {
      if (!inputRef.current) return;

      // Initialize Google Places Autocomplete
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        {
          types: [&quot;geocode&quot;, &quot;establishment&quot;],
        },
      );

      // Add a listener for place changes
      if (autocompleteRef.current) {
        autocompleteRef.current.addListener(&quot;place_changed&quot;, () => {
          const autocomplete = autocompleteRef.current;
          if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place && place.place_id) {
              onPlaceSelect(place);
            }
          }
        });
      }
    } catch (err) {
      console.error(&quot;Error initializing Places Autocomplete:&quot;, err);
      setError(
        `Error initializing Places Autocomplete: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  };

  return (
    <div className=&quot;relative w-full&quot;>
      <Input
        ref={inputRef}
        type=&quot;text&quot;
        placeholder={placeholder}
        className={error ? &quot;border-red-500&quot; : "&quot;}
        disabled={!loaded}
      />

      {error && <div className=&quot;text-red-500 text-sm mt-1&quot;>{error}</div>}

      {!loaded && !error && (
        <div className=&quot;text-gray-500 text-sm mt-1">
          Loading Places Autocomplete...
        </div>
      )}
    </div>
  );
}

// Add TypeScript definitions
declare global {
  interface Window {
    // Use 'any' type to avoid circular reference with 'typeof google'
    google?: any;
    initAutocomplete?: () => void;
    gm_authFailure?: () => void;
  }
}
