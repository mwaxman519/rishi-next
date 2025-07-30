&quot;use client&quot;;

/**
 * PlaceAutocompleteAddressPicker Component
 *
 * This component provides a modern Google Maps Place Autocomplete experience using the latest PlaceAutocompleteElement.
 * It handles:
 * - Loading Google Maps API with the correct parameters and Map ID
 * - Setting up the newest PlaceAutocompleteElement web component (from the beta API)
 * - Processing selected places and displaying them on a mini-map
 * - Converting coordinates to a standard format for the parent component
 *
 * IMPORTANT FIXES IMPLEMENTED:
 * 1. Removed 'fields' property which is not supported by PlaceAutocompleteElement
 * 2. Added mapId for Advanced Markers support in both script loading and map initialization
 * 3. Uses a consistent Google Maps API key throughout the component
 * 4. Implements proper event listener 'gmp-placeselect' for the modern web component
 */

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, MapPin, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Augment Window interface to add Google Maps properties
declare global {
  interface Window {
    google: any; // Using any for flexibility with the beta Google Maps API
    initGoogleMaps?: () => void; // Global callback function for API initialization
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

interface PlaceAutocompleteAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function PlaceAutocompleteAddressPicker({
  onAddressSelect,
  className = "&quot;,
}: PlaceAutocompleteAddressPickerProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState(&quot;&quot;);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteElementRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        &quot;PlaceAutocompleteAddressPicker: Map container or Google Maps not available&quot;,
      );
      return;
    }

    console.log(
      &quot;PlaceAutocompleteAddressPicker: Initializing map with location:&quot;,
      location,
    );

    try {
      // Set map options - include mapId for Advanced Markers support
      const mapOptions = {
        center: location,
        zoom: 15,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        mapId: &quot;8f718a3abe8b23eb&quot;, // Using the same Map ID as the rest of the application
      };

      // Create or reuse map
      if (!mapInstanceRef.current) {
        console.log(
          &quot;PlaceAutocompleteAddressPicker: Creating new map instance&quot;,
        );
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log(
          &quot;PlaceAutocompleteAddressPicker: Reusing existing map instance&quot;,
        );
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log(&quot;PlaceAutocompleteAddressPicker: Creating new marker&quot;);
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log(&quot;PlaceAutocompleteAddressPicker: Updating existing marker&quot;);
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error(
        &quot;PlaceAutocompleteAddressPicker: Error initializing map:&quot;,
        error,
      );
      toast({
        title: &quot;Map Error&quot;,
        description: &quot;Could not display the map&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Initialize Google Maps and set up PlaceAutocompleteElement
  useEffect(() => {
    // Define the initialization function
    function initializeServices() {
      try {
        console.log(
          &quot;PlaceAutocompleteAddressPicker: Initializing Google services...&quot;,
        );

        if (autocompleteContainerRef.current && window.google?.maps?.places) {
          // Create PlaceAutocompleteElement - the newest Google Maps Places API component
          const { PlaceAutocompleteElement } = window.google.maps.places;

          if (PlaceAutocompleteElement) {
            // Create configuration for the element - PlaceAutocompleteElement has different config options than Autocomplete
            const config = {
              // types parameter is valid for PlaceAutocompleteElement
              types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
              // Component restrictions are still valid
              componentRestrictions: { country: &quot;us&quot; },
              // Note: 'fields' is not supported by PlaceAutocompleteElement
              // We'll extract needed fields after place selection
            };

            // Create the element
            const autocompleteElement = new PlaceAutocompleteElement(config);
            autocompleteElementRef.current = autocompleteElement;

            // Add the element to the DOM
            autocompleteContainerRef.current.appendChild(autocompleteElement);

            // Style the element to match the app's design
            const autocompleteInput =
              autocompleteElement.querySelector(&quot;input&quot;);
            if (autocompleteInput) {
              autocompleteInput.className =
                &quot;w-full h-10 px-3 py-2 pl-9 border rounded-md border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;;
              autocompleteInput.placeholder = &quot;Search for a location&quot;;
            }

            // Add the search icon
            const iconContainer = document.createElement(&quot;div&quot;);
            iconContainer.className =
              &quot;absolute left-2.5 top-2.5 pointer-events-none&quot;;
            iconContainer.innerHTML = `<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search text-muted-foreground&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>`;
            autocompleteContainerRef.current.insertBefore(
              iconContainer,
              autocompleteElement,
            );

            // Handle place selection events
            autocompleteElement.addEventListener(
              &quot;gmp-placeselect&quot;,
              (event: any) => {
                const place = event.place;
                handlePlaceSelection(place);
              },
            );

            console.log(
              &quot;PlaceAutocompleteAddressPicker: PlaceAutocompleteElement initialized&quot;,
            );
          } else {
            console.error(
              &quot;PlaceAutocompleteAddressPicker: PlaceAutocompleteElement not available&quot;,
            );

            toast({
              title: &quot;API Error&quot;,
              description: &quot;Latest Google Maps API components not available&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        }

        setGoogleInitialized(true);
        console.log(
          &quot;PlaceAutocompleteAddressPicker: Google services initialized successfully&quot;,
        );
      } catch (error) {
        console.error(
          &quot;PlaceAutocompleteAddressPicker: Error initializing Google services:&quot;,
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
        &quot;[PlaceAutocompleteAddressPicker] Google Maps initialized via callback&quot;,
      );
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        &quot;[PlaceAutocompleteAddressPicker] Google Maps already loaded, initializing services&quot;,
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
        &quot;[PlaceAutocompleteAddressPicker] Google Maps script already exists, waiting for load&quot;,
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log(
      &quot;[PlaceAutocompleteAddressPicker] Loading Google Maps script...&quot;,
    );
    // Use the consistent API key from the main application
    const apiKey = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;
    // Add the Map ID for Advanced Markers
    const mapId = &quot;8f718a3abe8b23eb&quot;;
    console.log(
      &quot;[PlaceAutocompleteAddressPicker] Using Google Maps API Key:&quot;,
      apiKey ? &quot;Key found&quot; : &quot;Key missing&quot;,
    );
    const script = document.createElement(&quot;script&quot;);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta&map_ids=${mapId}`;
    script.async = true;
    script.onerror = () => {
      console.error(
        &quot;[PlaceAutocompleteAddressPicker] Failed to load Google Maps script&quot;,
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

      // Clean up the autocomplete element
      if (autocompleteElementRef.current) {
        autocompleteElementRef.current.remove();
      }
    };
  }, [toast]);

  // Handle place selection from the autocomplete element
  const handlePlaceSelection = (place: any) => {
    if (!place || !place.geometry) {
      console.error(
        &quot;PlaceAutocompleteAddressPicker: No place details returned&quot;,
      );
      toast({
        title: &quot;Error&quot;,
        description: &quot;Could not get location details&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(&quot;PlaceAutocompleteAddressPicker: Place selected:&quot;, place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === &quot;function&quot; ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === &quot;function&quot; ? location.lng() : location.lng;

      console.log(
        &quot;PlaceAutocompleteAddressPicker: Location coordinates:&quot;,
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
        &quot;PlaceAutocompleteAddressPicker: Error processing place data:&quot;,
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
