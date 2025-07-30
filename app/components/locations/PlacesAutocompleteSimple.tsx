&quot;use client&quot;;

import { useEffect, useState, useRef } from &quot;react&quot;;
import { Search, Loader2, MapPin } from &quot;lucide-react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { useGoogleMaps } from &quot;@/contexts/GoogleMapsContext&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

interface PlacesAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
}

export default function PlacesAutocompleteSimple({
  onPlaceSelect,
  placeholder = &quot;Search for an address&quot;,
  defaultValue = "&quot;,
  className = &quot;&quot;,
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
      const dummyElement = document.createElement(&quot;div&quot;);
      placesServiceRef.current = new google.maps.places.PlacesService(
        dummyElement,
      );

      console.log(&quot;Google Places services initialized&quot;);
    } catch (error) {
      console.error(&quot;Error initializing Google Places services:&quot;, error);
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
          componentRestrictions: { country: &quot;us&quot; },
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
      console.error(&quot;Error getting place predictions:&quot;, error);
      setIsSearching(false);
      setPredictions([]);
    }
  }

  // Handle selecting a place
  function handleSelectPlace(placeId: string, displayName: string) {
    if (!placesServiceRef.current) {
      console.error(&quot;Places service not initialized&quot;);
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
          &quot;address_components&quot;,
          &quot;formatted_address&quot;,
          &quot;geometry&quot;,
          &quot;name&quot;,
          &quot;place_id&quot;,
        ],
      },
      (place, status) => {
        if (
          google &&
          status === google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          console.log(&quot;Got place details:&quot;, place);

          // Ensure we update the field with the formatted address
          if (place.formatted_address) {
            setValue(place.formatted_address);
            if (inputRef.current) {
              inputRef.current.value = place.formatted_address;
              // Dispatch an input event to make sure React state gets updated
              const event = new Event(&quot;input&quot;, { bubbles: true });
              inputRef.current.dispatchEvent(event);
            }
          }

          // Make sure location data is available
          if (!place.geometry || !place.geometry.location) {
            console.error(&quot;Missing geometry in place details&quot;);
            toast({
              title: &quot;Error&quot;,
              description: &quot;Location coordinates not available&quot;,
              variant: &quot;destructive&quot;,
            });
            return;
          }

          // Add extra debugging to see the shape of the geometry object
          console.log(&quot;Full place details:&quot;, place);
          console.log(&quot;Place geometry structure:&quot;, place.geometry);
          console.log(&quot;Location object type:&quot;, typeof place.geometry.location);

          // Instead of trying to modify the object, we'll work with the original
          // and let the parent component handle the extraction logic
          onPlaceSelect(place);
        } else {
          console.error(`Error getting place details: ${status}`);
          toast({
            title: &quot;Error&quot;,
            description: &quot;Could not get location details&quot;,
            variant: &quot;destructive&quot;,
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

    document.addEventListener(&quot;mousedown&quot;, handleOutsideClick);
    return () => document.removeEventListener(&quot;mousedown&quot;, handleOutsideClick);
  }, []);

  if (loadError) {
    return (
      <div className={`${className} relative`}>
        <Input
          placeholder=&quot;Google Maps API failed to load&quot;
          disabled={true}
          className=&quot;bg-red-50&quot;
        />
      </div>
    );
  }

  return (
    <div className={`${className} relative`}>
      <div className=&quot;relative&quot;>
        <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
        <Input
          ref={inputRef}
          type=&quot;text&quot;
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={!isLoaded || disabled}
          className=&quot;pl-9&quot;
        />
        {isSearching && (
          <Loader2 className=&quot;absolute right-2.5 top-2.5 h-4 w-4 animate-spin&quot; />
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className=&quot;absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg&quot;>
          <ul className=&quot;py-1&quot;>
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
                  className=&quot;flex items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer&quot;
                >
                  <MapPin className=&quot;h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground&quot; />
                  <div className=&quot;flex-1&quot;>
                    <div className=&quot;text-sm font-medium&quot;>{mainText}</div>
                    <div className=&quot;text-xs text-muted-foreground">
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
