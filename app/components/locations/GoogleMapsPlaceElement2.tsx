// GoogleMapsPlaceElement.tsx
&quot;use client&quot;;

import { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Declare the global Google Maps types
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
  }
}

export interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name?: string;
}

interface GoogleMapsPlaceElementProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

/**
 * GoogleMapsPlaceElement - A component that renders the Google Maps Place Autocomplete element
 *
 * This component uses a &quot;portal-like&quot; approach where we don&apos;t let React manage the DOM for
 * the Google Maps element at all. Instead, we use a div that stays stable across renders
 * as a container, and we manually add/remove Google elements to it.
 */
export default function GoogleMapsPlaceElement({
  onAddressSelect,
  className = "&quot;,
}: GoogleMapsPlaceElementProps) {
  // Create refs to store DOM elements
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Store non-DOM references that need to persist across renders
  const placesServiceRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Track component state
  const [isLoading, setIsLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Get the toast component for notifications
  const { toast } = useToast();

  // Effect to initialize the map when a location is selected
  useEffect(() => {
    // Function to initialize the map with a selected location
    function initializeMap(location: { lat: number; lng: number }) {
      if (!mapRef.current || !window.google || !window.google.maps) return;

      console.log(&quot;🗺️ Initializing map with location:&quot;, location);

      // Create a new map instance if it doesn&apos;t exist
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: location,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        // Add a marker to indicate the selected location
        new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        // Update existing map
        mapInstanceRef.current.setCenter(location);
      }
    }

    // If we have a selected location and the map is shown, initialize the map
    if (selectedLocation && showMap && window.google && window.google.maps) {
      initializeMap(selectedLocation);
    }
  }, [selectedLocation, showMap]);

  // Main effect to load Google Maps and initialize the place autocomplete
  useEffect(() => {
    // Define the callback function that Google Maps will call when loaded
    window.initGoogleMaps = () => {
      console.log(&quot;🔍 Google Maps script loaded and callback triggered&quot;);
      setIsScriptLoaded(true);

      // Delay the setup to ensure DOM is ready
      setTimeout(() => {
        setupGooglePlaceAutocomplete();
      }, 100);
    };

    // Function to handle the place selection and request details
    function handlePlaceSelection(placeId: string) {
      console.log(&quot;🔍 Handling place selection for ID:&quot;, placeId);
      setIsLoading(true);

      try {
        // Create a places service if it doesn&apos;t exist
        if (!placesServiceRef.current) {
          console.log(&quot;🔍 Creating PlacesService&quot;);
          const tempDiv = document.createElement(&quot;div&quot;);
          placesServiceRef.current =
            new window.google.maps.places.PlacesService(tempDiv);
        }

        // Request details for the selected place
        placesServiceRef.current.getDetails(
          {
            placeId: placeId,
            fields: [
              &quot;name&quot;,
              &quot;formatted_address&quot;,
              &quot;geometry&quot;,
              &quot;address_components&quot;,
              &quot;place_id&quot;,
            ],
          },
          (result: any, status: any) => {
            console.log(&quot;🔍 Place details response. Status:&quot;, status);
            setIsLoading(false);

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              result
            ) {
              // Successfully got place details
              console.log(&quot;🔍 Place details retrieved:&quot;, result);

              if (result.geometry && result.geometry.location) {
                // Extract coordinates from the result
                const location = result.geometry.location;
                const latitude =
                  typeof location.lat === &quot;function&quot;
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === &quot;function&quot;
                    ? location.lng()
                    : location.lng;

                // Update UI to show the map
                setSelectedLocation({ lat: latitude, lng: longitude });
                setShowMap(true);

                // Create address data to pass to parent
                const addressData: AddressData = {
                  formatted_address: result.formatted_address || &quot;&quot;,
                  address_components: result.address_components || [],
                  latitude,
                  longitude,
                  place_id: result.place_id,
                  name: result.name || &quot;&quot;,
                };

                // Debug logs to track the data flow
                console.log(
                  &quot;🔍 Created address data to pass to parent:&quot;,
                  addressData,
                );
                console.log(&quot;🔍 Calling onAddressSelect with data&quot;);

                // Notify the parent component
                try {
                  onAddressSelect(addressData);
                  console.log(&quot;🔍 onAddressSelect call completed&quot;);
                } catch (error) {
                  console.error(&quot;🔍 Error calling onAddressSelect:&quot;, error);
                }
              } else {
                // Handle missing geometry
                console.error(&quot;🔍 Place missing location data:&quot;, result);
                toast({
                  title: &quot;Error&quot;,
                  description: &quot;Selected location missing coordinate data&quot;,
                  variant: &quot;destructive&quot;,
                });
              }
            } else {
              // Handle API error
              console.error(&quot;🔍 Error fetching place details. Status:&quot;, status);
              toast({
                title: &quot;Error&quot;,
                description: &quot;Could not retrieve location details&quot;,
                variant: &quot;destructive&quot;,
              });
            }
          },
        );
      } catch (error) {
        console.error(&quot;🔍 Error in handlePlaceSelection:&quot;, error);
        setIsLoading(false);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Error processing location data&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    // Setup function to create and attach the PlaceAutocompleteElement
    function setupGooglePlaceAutocomplete() {
      console.log(
        &quot;🔍 Setting up Google PlaceAutocompleteElement with containerRef state:&quot;,
        !!containerRef.current,
      );

      // Check container ref with retry mechanism
      const checkContainerAndSetup = () => {
        if (!containerRef.current) {
          console.warn(&quot;🔍 Container ref not available yet, scheduling retry&quot;);
          // Schedule a retry
          setTimeout(checkContainerAndSetup, 100);
          return;
        }

        // Container ref is available, proceed with autocomplete setup
        console.log(&quot;🔍 Container ref is available, setting up autocomplete&quot;);

        // Double-check Google Maps is available
        if (
          !window.google ||
          !window.google.maps ||
          !window.google.maps.places
        ) {
          console.error(&quot;Google Maps API not fully loaded&quot;);
          setIsLoading(false);
          toast({
            title: &quot;API Loading Error&quot;,
            description: &quot;Google Maps API failed to load completely&quot;,
            variant: &quot;destructive&quot;,
          });
          return;
        }

        try {
          console.log(&quot;🔍 Setting up Google PlaceAutocompleteElement&quot;);

          // Clear the container
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }

          // Verify PlaceAutocompleteElement exists before creating it
          if (!window.google.maps.places.PlaceAutocompleteElement) {
            console.error(
              &quot;🔍 PlaceAutocompleteElement constructor is not available&quot;,
            );
            setIsLoading(false);
            toast({
              title: &quot;API Support Error&quot;,
              description:
                &quot;Your Google Maps API key does not have access to the PlaceAutocompleteElement beta feature&quot;,
              variant: &quot;destructive&quot;,
            });
            return;
          }

          console.log(&quot;🔍 Creating PlaceAutocompleteElement&quot;);

          // Catch specific API permissions errors
          try {
            // Create the autocomplete element with minimal configuration
            const element =
              new window.google.maps.places.PlaceAutocompleteElement({
                types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
              });

            // Style the element
            element.style.display = &quot;block&quot;;
            element.style.width = &quot;100%&quot;;
            element.style.minHeight = &quot;40px&quot;;
            element.style.padding = &quot;8px 12px 8px 32px&quot;;
            element.style.backgroundColor = &quot;transparent&quot;;
            element.style.boxSizing = &quot;border-box&quot;;
            element.style.border = &quot;none&quot;;

            // Create a container for the search icon
            const searchIcon = document.createElement(&quot;div&quot;);
            searchIcon.style.position = &quot;absolute&quot;;
            searchIcon.style.left = &quot;10px&quot;;
            searchIcon.style.top = &quot;12px&quot;;
            searchIcon.style.zIndex = &quot;10&quot;;
            searchIcon.style.pointerEvents = &quot;none&quot;;
            searchIcon.innerHTML = `<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>`;

            // Append elements to the container
            containerRef.current.appendChild(element);
            containerRef.current.appendChild(searchIcon);

            // Add event listener for place selection
            element.addEventListener(&quot;gmp-placeselect&quot;, (event: any) => {
              console.log(
                &quot;🎯 PlaceAutocompleteElement selection event triggered!&quot;,
                event,
              );

              try {
                // Check if we can get the place from the event
                if (
                  event.detail &&
                  event.detail.place &&
                  event.detail.place.id
                ) {
                  const placeId = event.detail.place.id;
                  console.log(&quot;🎯 Place ID found:&quot;, placeId);

                  // Force element to lose focus to prevent keyboard issues
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }

                  // Add a console message for debugging
                  console.log(
                    &quot;🎯 About to call handlePlaceSelection with ID:&quot;,
                    placeId,
                  );

                  // Call place selection handler outside the event callback for better reliability
                  setTimeout(() => {
                    handlePlaceSelection(placeId);
                  }, 0);
                } else {
                  console.error(&quot;🎯 No valid place found in event:&quot;, event);
                  toast({
                    title: &quot;Error&quot;,
                    description: &quot;Could not identify the selected location&quot;,
                    variant: &quot;destructive&quot;,
                  });
                }
              } catch (error) {
                console.error(&quot;🎯 Error handling place selection:&quot;, error);
                toast({
                  title: &quot;Error&quot;,
                  description: &quot;Error processing the selected location&quot;,
                  variant: &quot;destructive&quot;,
                });
              }
            });

            // Done loading
            setIsLoading(false);
            console.log(
              &quot;🔍 Google PlaceAutocompleteElement initialized successfully&quot;,
            );
          } catch (apiError: any) {
            // This catches the specific API permissions error
            console.error(
              &quot;🔍 API Error creating PlaceAutocompleteElement:&quot;,
              apiError,
            );

            // Check if this is the &quot;requests blocked&quot; error
            const errorMessage = apiError?.message || &quot;&quot;;
            if (
              errorMessage.includes(&quot;places.googleapis.com&quot;) &&
              errorMessage.includes(&quot;Requests to this API&quot;) &&
              errorMessage.includes(&quot;blocked&quot;)
            ) {
              toast({
                title: &quot;Google Maps API Permissions Error&quot;,
                description:
                  &quot;Your API key does not have access to the Places API v1. Contact your administrator to enable it.&quot;,
                variant: &quot;destructive&quot;,
              });
            } else {
              toast({
                title: &quot;Google Maps API Error&quot;,
                description: &quot;Error initializing the location search component&quot;,
                variant: &quot;destructive&quot;,
              });
            }

            setIsLoading(false);
          }
        } catch (error) {
          console.error(
            &quot;🔍 Error setting up Google PlaceAutocompleteElement:&quot;,
            error,
          );
          setIsLoading(false);
          toast({
            title: &quot;Initialization Error&quot;,
            description: &quot;Failed to initialize location services&quot;,
            variant: &quot;destructive&quot;,
          });
        }
      };

      // Start the checking process
      checkContainerAndSetup();
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log(
        &quot;🔍 Google Maps already loaded, checking for PlaceAutocompleteElement support&quot;,
      );

      // Check if the places library exists
      if (window.google.maps.places) {
        console.log(
          &quot;🔍 Places library found, checking for PlaceAutocompleteElement&quot;,
        );

        // Check if PlaceAutocompleteElement is available (it&apos;s in the beta API)
        if (window.google.maps.places.PlaceAutocompleteElement) {
          console.log(&quot;🔍 PlaceAutocompleteElement is available!&quot;);
          setIsScriptLoaded(true);

          // Delay to ensure the DOM is ready
          setTimeout(() => {
            setupGooglePlaceAutocomplete();
          }, 100);
        } else {
          console.error(
            &quot;🔍 PlaceAutocompleteElement not available - you need beta API enabled&quot;,
          );
          toast({
            title: &quot;API Support Error&quot;,
            description:
              &quot;Your Google Maps API key does not have access to the PlaceAutocompleteElement beta feature&quot;,
            variant: &quot;destructive&quot;,
          });
        }
      } else {
        console.error(&quot;🔍 Places library not available&quot;);
        toast({
          title: &quot;API Loading Error&quot;,
          description: &quot;Google Maps Places library failed to load&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    } else {
      // Load the Google Maps script
      const existingScript = document.querySelector(
        'script[src*=&quot;maps.googleapis.com/maps/api&quot;]',
      );

      if (!existingScript) {
        console.log(&quot;🔍 Loading Google Maps script&quot;);
        // Use the specific API key that worked before (with Places API v1 access)
        const apiKey = &quot;AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&quot;; // This key has Places API v1 access

        const script = document.createElement(&quot;script&quot;);
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          console.error(&quot;🔍 Failed to load Google Maps script&quot;);
          setIsLoading(false);
          toast({
            title: &quot;Loading Error&quot;,
            description: &quot;Failed to load Google Maps services&quot;,
            variant: &quot;destructive&quot;,
          });
        };

        document.head.appendChild(script);
      } else {
        console.log(&quot;🔍 Google Maps script already loading&quot;);
      }
    }

    // Cleanup function
    return () => {
      delete window.initGoogleMaps;
    };
  }, [onAddressSelect, toast]);

  return (
    <div className={`${className} relative`}>
      {/* Address search container */}
      <div className=&quot;relative min-h-[45px] border rounded-md mb-2&quot;>
        {/* Always render the container ref, but conditionally show the loading state over it */}
        <div ref={containerRef} className=&quot;relative w-full min-h-[40px]&quot; />

        {/* Show loading overlay when not ready */}
        {(isLoading || !isScriptLoaded) && (
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
                <Loader2 className=&quot;h-4 w-4 animate-spin text-muted-foreground&quot; />
              </div>
            </div>
          </div>
        )}
      </div>

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
