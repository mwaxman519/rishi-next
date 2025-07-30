&quot;use client&quot;;

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Augment Window interface to add Google Maps properties
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
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

interface StandardAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function StandardAddressPicker({
  onAddressSelect,
  className = "&quot;,
}: StandardAddressPickerProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        &quot;StandardAddressPicker: Map container or Google Maps not available&quot;,
      );
      return;
    }

    console.log(
      &quot;StandardAddressPicker: Initializing map with location:&quot;,
      location,
    );

    try {
      // Set map options
      const mapOptions = {
        center: location,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      // Create or reuse map
      if (!mapInstanceRef.current) {
        console.log(&quot;StandardAddressPicker: Creating new map instance&quot;);
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log(&quot;StandardAddressPicker: Reusing existing map instance&quot;);
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log(&quot;StandardAddressPicker: Creating new marker&quot;);
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log(&quot;StandardAddressPicker: Updating existing marker&quot;);
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error(&quot;StandardAddressPicker: Error initializing map:&quot;, error);
      toast({
        title: &quot;Map Error&quot;,
        description: &quot;Could not display the map&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Initialize Google Maps and set up standard Autocomplete
  useEffect(() => {
    function initializeServices() {
      try {
        console.log(&quot;StandardAddressPicker: Initializing Google services...&quot;);

        if (autocompleteContainerRef.current && window.google?.maps?.places) {
          // Create a standard input element
          const input = document.createElement(&quot;input&quot;);
          input.type = &quot;text&quot;;
          input.placeholder = &quot;Search for a location&quot;;
          input.className =
            &quot;w-full h-10 px-3 py-2 pl-9 border rounded-md border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;;
          inputRef.current = input;

          // Add the input to DOM
          autocompleteContainerRef.current.appendChild(input);

          // Add the search icon
          const iconContainer = document.createElement(&quot;div&quot;);
          iconContainer.className =
            &quot;absolute left-2.5 top-2.5 z-10 pointer-events-none&quot;;
          iconContainer.innerHTML = `<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search text-muted-foreground&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>`;
          autocompleteContainerRef.current.insertBefore(iconContainer, input);

          // Initialize standard autocomplete
          const autocomplete = new window.google.maps.places.Autocomplete(
            input,
            {
              types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
              componentRestrictions: { country: &quot;us&quot; },
              fields: [
                &quot;place_id&quot;,
                &quot;geometry&quot;,
                &quot;name&quot;,
                &quot;formatted_address&quot;,
                &quot;address_components&quot;,
              ],
            },
          );
          autocompleteRef.current = autocomplete;

          // Listen for place selection
          autocomplete.addListener(&quot;place_changed&quot;, () => {
            const place = autocomplete.getPlace();
            handlePlaceSelection(place);
          });

          console.log(
            &quot;StandardAddressPicker: Standard Autocomplete initialized&quot;,
          );
        }

        setGoogleInitialized(true);
        console.log(
          &quot;StandardAddressPicker: Google services initialized successfully&quot;,
        );
      } catch (error) {
        console.error(
          &quot;StandardAddressPicker: Error initializing Google services:&quot;,
          error,
        );
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to initialize location services&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    // Set up callback for script loading
    window.initGoogleMaps = () => {
      console.log(
        &quot;[StandardAddressPicker] Google Maps initialized via callback&quot;,
      );
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        &quot;[StandardAddressPicker] Google Maps already loaded, initializing services&quot;,
      );
      initializeServices();
      return;
    }

    // Check if script is already in document but not fully loaded
    const existingScript = document.querySelector(
      'script[src*=&quot;maps.googleapis.com/maps/api&quot;]',
    );
    if (existingScript) {
      console.log(
        &quot;[StandardAddressPicker] Google Maps script already exists, waiting for load&quot;,
      );
      return; // The callback will handle initialization
    }

    // Load the script - using the stable API version, not beta
    console.log(&quot;[StandardAddressPicker] Loading Google Maps script...&quot;);
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      &quot;AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww&quot;;
    console.log(
      &quot;[StandardAddressPicker] Using Google Maps API Key:&quot;,
      apiKey ? &quot;Key found&quot; : &quot;Key missing&quot;,
    );
    const script = document.createElement(&quot;script&quot;);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async`;
    script.async = true;
    script.onerror = () => {
      console.error(
        &quot;[StandardAddressPicker] Failed to load Google Maps script&quot;,
      );
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to load Google Maps service&quot;,
        variant: &quot;destructive&quot;,
      });
    };
    document.head.appendChild(script);

    return () => {
      // Remove the global callback
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }

      // Clean up event listeners
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [toast]);

  // Handle place selection from the autocomplete
  const handlePlaceSelection = (place: any) => {
    if (!place || !place.geometry) {
      console.error(&quot;StandardAddressPicker: No place details returned&quot;);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Could not get location details&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(&quot;StandardAddressPicker: Place selected:&quot;, place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === &quot;function&quot; ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === &quot;function&quot; ? location.lng() : location.lng;

      console.log(
        &quot;StandardAddressPicker: Location coordinates:&quot;,
        latitude,
        longitude,
      );

      // Store the selected location and display the map
      setSelectedLocation({ lat: latitude, lng: longitude });
      setShowMap(true);

      // Initialize or update the map
      setTimeout(() => {
        initializeMap({ lat: latitude, lng: longitude });
      }, 50);

      // Prepare the address data
      const addressData: AddressData = {
        formatted_address: place.formatted_address || &quot;&quot;,
        address_components: place.address_components || [],
        latitude,
        longitude,
        place_id: place.place_id || &quot;&quot;,
        name: place.name || &quot;&quot;,
      };

      // Pass the data to the parent component
      onAddressSelect(addressData);

      setIsLoading(false);
    } catch (error) {
      console.error(
        &quot;StandardAddressPicker: Error processing place data:&quot;,
        error,
      );
      setIsLoading(false);

      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to process location data&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  return (
    <div className={`${className} relative`}>
      <div ref={autocompleteContainerRef} className=&quot;relative&quot;>
        {!googleInitialized && (
          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
            <Input
              type=&quot;text&quot;
              placeholder=&quot;Loading location search...&quot;
              className=&quot;pl-9&quot;
              disabled={true}
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className=&quot;absolute right-2.5 top-2.5 z-10&quot;>
          <Loader2 className=&quot;h-4 w-4 animate-spin text-muted-foreground&quot; />
        </div>
      )}

      {/* Map container */}
      {showMap && selectedLocation && (
        <div className=&quot;mt-4&quot;>
          <div
            ref={mapRef}
            className=&quot;w-full h-[250px] rounded-md border&quot;
            aria-label=&quot;Map showing selected location"
          />
        </div>
      )}
    </div>
  );
}
