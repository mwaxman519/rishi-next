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

interface FixedAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function FixedAddressPicker({
  onAddressSelect,
  className = "&quot;,
}: FixedAddressPickerProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteElementRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize or update the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(
        &quot;FixedAddressPicker: Map container or Google Maps not available&quot;,
      );
      return;
    }

    console.log(
      &quot;FixedAddressPicker: Initializing map with location:&quot;,
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
        console.log(&quot;FixedAddressPicker: Creating new map instance&quot;);
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );
      } else {
        console.log(&quot;FixedAddressPicker: Reusing existing map instance&quot;);
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        console.log(&quot;FixedAddressPicker: Creating new marker&quot;);
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        console.log(&quot;FixedAddressPicker: Updating existing marker&quot;);
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error(&quot;FixedAddressPicker: Error initializing map:&quot;, error);
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
        console.log(&quot;FixedAddressPicker: Initializing Google services...&quot;);

        if (autocompleteContainerRef.current && window.google?.maps?.places) {
          // Check if PlaceAutocompleteElement is available
          if (window.google.maps.places.PlaceAutocompleteElement) {
            // Create configuration for the element - using only supported properties
            const config = {
              // The PlaceAutocompleteElement doesn&apos;t accept fields directly
              // We'll need to extract the fields from the place after selection
              types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
              componentRestrictions: { country: &quot;us&quot; },
            };

            // Create the element
            const autocompleteElement =
              new window.google.maps.places.PlaceAutocompleteElement(config);
            autocompleteElementRef.current = autocompleteElement;

            // Add the element to the DOM
            autocompleteContainerRef.current.appendChild(autocompleteElement);

            // Add styling to match the app
            autocompleteElement.style.width = &quot;100%&quot;;

            // After creating the element, find its input and add styles
            setTimeout(() => {
              const shadowRoot = autocompleteElement.shadowRoot;
              if (shadowRoot) {
                // Try to apply styles to the shadow DOM
                const style = document.createElement(&quot;style&quot;);
                style.textContent = `
                  :host {
                    --gmpx-color-primary: var(--primary);
                    --gmpx-font-family-regular: var(--font-sans);
                    width: 100%;
                  }
                  .input {
                    width: 100%;
                    padding: 8px 12px 8px 36px !important;
                    font-size: 14px;
                    border-radius: 6px;
                    border: 1px solid var(--input, hsl(var(--input)));
                    background-color: var(--background, hsl(var(--background)));
                    color: var(--foreground, hsl(var(--foreground)));
                    height: 40px;
                    outline: none;
                  }
                  .input:focus {
                    outline: none;
                    ring: 2px solid var(--ring, hsl(var(--ring)));
                  }
                `;
                shadowRoot.appendChild(style);
              }
            }, 100);

            // Add the search icon
            const iconContainer = document.createElement(&quot;div&quot;);
            iconContainer.className =
              &quot;absolute left-2.5 top-2.5 z-10 pointer-events-none&quot;;
            iconContainer.innerHTML = `<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search text-muted-foreground&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>`;
            autocompleteContainerRef.current.insertBefore(
              iconContainer,
              autocompleteElement,
            );

            // Handle place selection events
            autocompleteElement.addEventListener(
              &quot;gmp-placeselect&quot;,
              (event: any) => {
                console.log(&quot;Place select event:&quot;, event);

                // Get the place details with the complete data we need
                // Since PlaceAutocompleteElement doesn&apos;t support the fields parameter,
                // we need to fetch the place details separately
                const placeId = event.place.id;

                if (placeId) {
                  console.log(&quot;Got place ID:&quot;, placeId);
                  fetchPlaceDetails(placeId);
                } else {
                  console.error(&quot;No place ID found in selection&quot;);
                  toast({
                    title: &quot;Error&quot;,
                    description: &quot;Could not identify the selected location&quot;,
                    variant: &quot;destructive&quot;,
                  });
                }
              },
            );

            console.log(
              &quot;FixedAddressPicker: PlaceAutocompleteElement initialized&quot;,
            );
          } else {
            console.error(
              &quot;FixedAddressPicker: PlaceAutocompleteElement not available&quot;,
            );
            fallbackToRegularAutocomplete();
          }
        }

        setGoogleInitialized(true);
        console.log(
          &quot;FixedAddressPicker: Google services initialized successfully&quot;,
        );
      } catch (error) {
        console.error(
          &quot;FixedAddressPicker: Error initializing Google services:&quot;,
          error,
        );
        fallbackToRegularAutocomplete();
      }
    }

    // Fallback to regular Autocomplete if the modern element isn&apos;t available
    function fallbackToRegularAutocomplete() {
      try {
        if (autocompleteContainerRef.current) {
          // Create a standard input element
          const input = document.createElement(&quot;input&quot;);
          input.type = &quot;text&quot;;
          input.placeholder = &quot;Search for a location&quot;;
          input.className =
            &quot;w-full h-10 px-3 py-2 pl-9 border rounded-md border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;;

          // Add the input to DOM
          autocompleteContainerRef.current.appendChild(input);

          // Add the search icon
          const iconContainer = document.createElement(&quot;div&quot;);
          iconContainer.className =
            &quot;absolute left-2.5 top-2.5 z-10 pointer-events-none&quot;;
          iconContainer.innerHTML = `<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search text-muted-foreground&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>`;
          autocompleteContainerRef.current.insertBefore(iconContainer, input);

          // Initialize standard autocomplete
          if (window.google?.maps?.places) {
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

            // Listen for place selection
            autocomplete.addListener(&quot;place_changed&quot;, () => {
              const place = autocomplete.getPlace();
              handlePlaceSelection(place);
            });

            console.log(&quot;FixedAddressPicker: Regular Autocomplete initialized&quot;);
          }
        }
      } catch (error) {
        console.error(
          &quot;FixedAddressPicker: Error initializing fallback autocomplete:&quot;,
          error,
        );
        toast({
          title: &quot;Error&quot;,
          description: &quot;Could not initialize location search&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    // Fetch complete place details using the Place ID
    function fetchPlaceDetails(placeId: string) {
      setIsLoading(true);

      // Create a PlacesService with a temporary div
      const tempDiv = document.createElement(&quot;div&quot;);
      const placesService = new window.google.maps.places.PlacesService(
        tempDiv,
      );

      // Use getDetails to get place information
      placesService.getDetails(
        {
          placeId: placeId,
          fields: [
            &quot;name&quot;,
            &quot;formatted_address&quot;,
            &quot;geometry&quot;,
            &quot;address_components&quot;,
          ],
        },
        (placeResult: any, status: any) => {
          setIsLoading(false);

          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            placeResult
          ) {
            handlePlaceSelection(placeResult);
          } else {
            console.error(&quot;Error fetching place details:&quot;, status);
            toast({
              title: &quot;Error&quot;,
              description: &quot;Could not get location details&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        },
      );
    }

    // Set up callback for script loading
    window.initGoogleMaps = () => {
      console.log(&quot;[FixedAddressPicker] Google Maps initialized via callback&quot;);
      initializeServices();
    };

    // First check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(
        &quot;[FixedAddressPicker] Google Maps already loaded, initializing services&quot;,
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
        &quot;[FixedAddressPicker] Google Maps script already exists, waiting for load&quot;,
      );
      return; // The callback will handle initialization
    }

    // Load the script
    console.log(&quot;[FixedAddressPicker] Loading Google Maps script...&quot;);
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      &quot;AIzaSyB3BcM_Y6ASCfnr5Nm9V7-ZGf2oSCjgDww&quot;;
    console.log(
      &quot;[FixedAddressPicker] Using Google Maps API Key:&quot;,
      apiKey ? &quot;Key found&quot; : &quot;Key missing&quot;,
    );
    const script = document.createElement(&quot;script&quot;);
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta`;
    script.async = true;
    script.onerror = () => {
      console.error(&quot;[FixedAddressPicker] Failed to load Google Maps script&quot;);
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
      console.error(&quot;FixedAddressPicker: No place details returned&quot;);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Could not get location details&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log(&quot;FixedAddressPicker: Place selected:&quot;, place);

      // Extract the location coordinates
      const location = place.geometry.location;

      // Get the latitude and longitude (these might be methods or properties)
      const latitude =
        typeof location.lat === &quot;function&quot; ? location.lat() : location.lat;
      const longitude =
        typeof location.lng === &quot;function&quot; ? location.lng() : location.lng;

      console.log(
        &quot;FixedAddressPicker: Location coordinates:&quot;,
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
      console.error(&quot;FixedAddressPicker: Error processing place data:&quot;, error);
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
