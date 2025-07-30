&quot;use client&quot;;

import { useEffect, useState, useRef } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Search, Loader2, MapPin } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

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
  placeholder = &quot;*** TESTING - Search for an address ***&quot;,
  className = "&quot;,
  apiKey = &quot;AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww&quot;, // Default API key
}: GooglePlacesFinderProps) {
  // State management
  const [inputValue, setInputValue] = useState(&quot;&quot;);
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
      console.log(&quot;GooglePlacesFinder: Google Maps already loaded&quot;);
      setGoogleLoaded(true);
      return;
    }

    // Otherwise load it
    console.log(&quot;GooglePlacesFinder: Loading Google Maps API&quot;);
    const script = document.createElement(&quot;script&quot;);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log(&quot;GooglePlacesFinder: Google Maps API loaded successfully&quot;);
      setGoogleLoaded(true);
    };

    script.onerror = () => {
      console.error(&quot;GooglePlacesFinder: Failed to load Google Maps API&quot;);
      setLoadError(new Error(&quot;Failed to load Google Maps API&quot;));
      toast({
        title: &quot;Error&quot;,
        description: &quot;Unable to load Google Maps service&quot;,
        variant: &quot;destructive&quot;,
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

    console.log(&quot;GooglePlacesFinder: Initializing services&quot;);
    try {
      // Initialize the autocomplete service
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();

      // Create a hidden element for the Places Service
      const mapDiv = document.createElement(&quot;div&quot;);
      document.body.appendChild(mapDiv);
      const map = new window.google.maps.Map(mapDiv, {
        center: { lat: 0, lng: 0 },
        zoom: 1,
      });
      placesService.current = new window.google.maps.places.PlacesService(map);

      console.log(&quot;GooglePlacesFinder: Services initialized successfully&quot;);
    } catch (error) {
      console.error(&quot;GooglePlacesFinder: Error initializing services&quot;, error);
      setLoadError(
        error instanceof Error
          ? error
          : new Error(&quot;Failed to initialize Google Maps services&quot;),
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

    console.log(&quot;GooglePlacesFinder: Fetching predictions for:&quot;, value);
    setIsLoading(true);

    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        componentRestrictions: { country: &quot;us&quot; },
      },
      (results: any[], status: any) => {
        setIsLoading(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          results &&
          results.length > 0
        ) {
          console.log(&quot;GooglePlacesFinder: Got predictions:&quot;, results.length);
          setPredictions(results);
          setShowDropdown(true);
        } else {
          console.log(
            &quot;GooglePlacesFinder: No predictions found or error:&quot;,
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
      console.error(&quot;GooglePlacesFinder: Places service not available&quot;);
      return;
    }

    console.log(&quot;GooglePlacesFinder: Getting details for place ID:&quot;, placeId);
    setIsLoading(true);

    placesService.current.getDetails(
      {
        placeId,
        fields: [
          &quot;address_components&quot;,
          &quot;formatted_address&quot;,
          &quot;geometry&quot;,
          &quot;name&quot;,
          &quot;place_id&quot;,
        ],
      },
      (place: any, status: any) => {
        setIsLoading(false);
        setShowDropdown(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          console.log(&quot;GooglePlacesFinder: Got place details:&quot;, place);

          // Update the input field with the formatted address
          setInputValue(place.formatted_address || &quot;&quot;);

          try {
            // Ensure we have coordinates
            if (!place.geometry || !place.geometry.location) {
              throw new Error(&quot;No coordinates found in place data&quot;);
            }

            // Extract lat/lng values
            let latitude: number, longitude: number;

            if (
              typeof place.geometry.location.lat === &quot;function&quot; &&
              typeof place.geometry.location.lng === &quot;function&quot;
            ) {
              latitude = place.geometry.location.lat();
              longitude = place.geometry.location.lng();
            } else {
              // Try direct access if they&apos;re not functions
              const location = place.geometry.location as any;
              latitude = location.lat;
              longitude = location.lng;
            }

            console.log(
              &quot;GooglePlacesFinder: Extracted coordinates:&quot;,
              latitude,
              longitude,
            );

            // Prepare the data to send to the parent component
            const addressData = {
              formatted_address: place.formatted_address || &quot;&quot;,
              address_components: place.address_components || [],
              latitude,
              longitude,
              place_id: place.place_id || &quot;&quot;,
              name: place.name,
            };

            console.log(
              &quot;GooglePlacesFinder: Sending data to parent:&quot;,
              addressData,
            );
            onAddressSelect(addressData);
          } catch (error) {
            console.error(
              &quot;GooglePlacesFinder: Error processing place data:&quot;,
              error,
            );
            toast({
              title: &quot;Error&quot;,
              description: &quot;Unable to process location data&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        } else {
          console.error(
            &quot;GooglePlacesFinder: Error getting place details:&quot;,
            status,
          );
          toast({
            title: &quot;Error&quot;,
            description: &quot;Could not retrieve location details&quot;,
            variant: &quot;destructive&quot;,
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

    document.addEventListener(&quot;mousedown&quot;, handleOutsideClick);
    return () => document.removeEventListener(&quot;mousedown&quot;, handleOutsideClick);
  }, []);

  // If Google Maps failed to load, show an error state
  if (loadError) {
    return (
      <div className={`${className} relative`}>
        <Input
          placeholder=&quot;Location search unavailable&quot;
          disabled
          className=&quot;bg-red-50&quot;
        />
        <div className=&quot;text-xs text-red-500 mt-1&quot;>
          Could not load location services
        </div>
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
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className=&quot;pl-9&quot;
          disabled={!googleLoaded}
        />
        {isLoading && (
          <Loader2 className=&quot;absolute right-2.5 top-2.5 h-4 w-4 animate-spin&quot; />
        )}
      </div>

      {/* Predictions dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className=&quot;absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-white dark:bg-slate-800 border shadow-lg&quot;>
          <ul className=&quot;py-1&quot;>
            {predictions.map((prediction) => (
              <li
                key={prediction.place_id}
                onClick={() => handlePlaceSelect(prediction.place_id)}
                className=&quot;flex items-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer&quot;
              >
                <MapPin className=&quot;h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground&quot; />
                <div className=&quot;flex-1&quot;>
                  <div className=&quot;text-sm font-medium&quot;>
                    {prediction.structured_formatting.main_text}
                  </div>
                  <div className=&quot;text-xs text-muted-foreground">
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
