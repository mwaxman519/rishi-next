&quot;use client&quot;;

import { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Search, Loader2 } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Declare global types
declare global {
  interface Window {
    google: any;
    initMap: () => void;
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

interface SimplePlaceAutocompleteProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function SimplePlaceAutocomplete({
  onAddressSelect,
  className = "&quot;,
}: SimplePlaceAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Flag to ensure we don&apos;t double-initialize
    let isInitialized = false;

    // Setup callback for Google Maps API
    window.initMap = () => {
      console.log(&quot;Google Maps API loaded via callback&quot;);
      if (isInitialized) return;
      initializeAutocomplete();
    };

    // Function to initialize the autocomplete control
    function initializeAutocomplete() {
      if (!containerRef.current || isInitialized) return;
      isInitialized = true;

      console.log(&quot;Initializing autocomplete&quot;);

      try {
        if (
          !window.google ||
          !window.google.maps ||
          !window.google.maps.places
        ) {
          throw new Error(&quot;Google Maps API not loaded correctly&quot;);
        }

        // Clear container
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }

        // Check for required API
        if (!window.google.maps.places.PlaceAutocompleteElement) {
          throw new Error(
            &quot;PlaceAutocompleteElement not available - API key needs Places v1 beta access&quot;,
          );
        }

        // Create the element
        const element = new window.google.maps.places.PlaceAutocompleteElement({
          types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
        });

        // Style element
        element.style.width = &quot;100%&quot;;
        element.style.minHeight = &quot;40px&quot;;
        element.style.padding = &quot;8px 12px 8px 32px&quot;;
        element.style.backgroundColor = &quot;transparent&quot;;
        element.style.boxSizing = &quot;border-box&quot;;
        element.style.border = &quot;none&quot;;

        // Add search icon
        const searchIcon = document.createElement(&quot;div&quot;);
        searchIcon.style.position = &quot;absolute&quot;;
        searchIcon.style.left = &quot;10px&quot;;
        searchIcon.style.top = &quot;12px&quot;;
        searchIcon.style.zIndex = &quot;10&quot;;
        searchIcon.innerHTML =
          '<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>';

        // Append elements
        containerRef.current.appendChild(element);
        containerRef.current.appendChild(searchIcon);

        // Listen for place selection
        element.addEventListener(&quot;gmp-placeselect&quot;, (event: any) => {
          console.log(&quot;Place selected event:&quot;, event);

          try {
            if (!event.detail?.place?.id) {
              throw new Error(&quot;No place ID in selection event&quot;);
            }

            // Get place details
            const placeId = event.detail.place.id;
            const placesService = new window.google.maps.places.PlacesService(
              document.createElement(&quot;div&quot;),
            );

            placesService.getDetails(
              {
                placeId,
                fields: [
                  &quot;name&quot;,
                  &quot;formatted_address&quot;,
                  &quot;geometry&quot;,
                  &quot;address_components&quot;,
                  &quot;place_id&quot;,
                ],
              },
              (result: any, status: any) => {
                if (
                  status !== window.google.maps.places.PlacesServiceStatus.OK ||
                  !result
                ) {
                  throw new Error(`Failed to get place details: ${status}`);
                }

                if (!result.geometry?.location) {
                  throw new Error(&quot;Place missing location data&quot;);
                }

                // Get coordinates
                const location = result.geometry.location;
                const latitude =
                  typeof location.lat === &quot;function&quot;
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === &quot;function&quot;
                    ? location.lng()
                    : location.lng;

                // Create address data
                const addressData: AddressData = {
                  formatted_address: result.formatted_address || &quot;&quot;,
                  address_components: result.address_components || [],
                  latitude,
                  longitude,
                  place_id: result.place_id,
                  name: result.name || &quot;&quot;,
                };

                console.log(&quot;Sending address data to parent:&quot;, addressData);

                // Force synchronous update to parent
                setTimeout(() => {
                  onAddressSelect(addressData);
                }, 10);
              },
            );
          } catch (error) {
            console.error(&quot;Error processing place selection:&quot;, error);
            toast({
              title: &quot;Error&quot;,
              description: &quot;Failed to process the selected location&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error(&quot;Error initializing Google Places:&quot;, error);
        setIsLoading(false);
        toast({
          title: &quot;Initialization Error&quot;,
          description:
            error instanceof Error
              ? error.message
              : &quot;Failed to initialize location services&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      console.log(&quot;Google Maps already loaded&quot;);
      initializeAutocomplete();
    } else {
      // Load Google Maps script if not already loading
      const existingScript = document.querySelector(
        'script[src*=&quot;maps.googleapis.com/maps/api&quot;]',
      );

      if (!existingScript) {
        console.log(&quot;Loading Google Maps script&quot;);
        const apiKey = &quot;AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&quot;; // Key with Places API v1 access

        const script = document.createElement(&quot;script&quot;);
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap&loading=async&v=beta`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          console.error(&quot;Failed to load Google Maps script&quot;);
          setIsLoading(false);
          toast({
            title: &quot;Loading Error&quot;,
            description: &quot;Failed to load Google Maps services&quot;,
            variant: &quot;destructive&quot;,
          });
        };

        document.head.appendChild(script);
      } else {
        console.log(&quot;Google Maps script already loading&quot;);
      }
    }

    // Cleanup function
    return () => {
      // Reset to an empty function to prevent TypeScript error
      window.initMap = () => {};
    };
  }, [onAddressSelect, toast]);

  return (
    <div className={`${className} relative`}>
      <div className=&quot;relative min-h-[45px] border rounded-md&quot;>
        <div ref={containerRef} className=&quot;relative w-full min-h-[40px]&quot; />

        {isLoading && (
          <div className=&quot;absolute inset-0 bg-background z-10&quot;>
            <div className=&quot;relative flex items-center h-full&quot;>
              <Search className=&quot;absolute left-2.5 top-[50%] transform translate-y-[-50%] h-4 w-4 text-muted-foreground&quot; />
              <Input
                type=&quot;text&quot;
                placeholder=&quot;Loading location search...&quot;
                className=&quot;pl-9 h-full border-0&quot;
                disabled={true}
              />
              <div className=&quot;absolute right-2.5 top-[50%] transform translate-y-[-50%]&quot;>
                <Loader2 className=&quot;h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
