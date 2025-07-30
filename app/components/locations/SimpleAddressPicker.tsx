&quot;use client&quot;;

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, MapPin, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Augment Window interface to add Google Maps properties
declare global {
  interface Window {
    google: any;
    initGoogleMaps?: () => void;
    debugElement?: any;
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

interface SimpleAddressPickerProps {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

/**
 * SimpleAddressPicker - A modern address picker using Google Maps Platform's latest APIs
 *
 * This component uses Google's newest PlaceAutocompleteElement from the beta API.
 * It renders a fully-featured address search input with autocompletion.
 * When a location is selected, it displays a map and returns the complete place data.
 */
export default function SimpleAddressPicker({
  onAddressSelect,
  className = "&quot;,
}: SimpleAddressPickerProps): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // References
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);

  const { toast } = useToast();

  // Function to initialize the map with a location
  const initializeMap = (location: { lat: number; lng: number }) => {
    if (!mapRef.current || !window.google?.maps) {
      console.error(&quot;Map container or Google Maps not available&quot;);
      return;
    }

    try {
      // Set map options
      const mapOptions = {
        center: location,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      };

      // Create or reuse map
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new window.google.maps.Map(
          mapRef.current,
          mapOptions,
        );

        // Create PlacesService with the map for better performance
        placesServiceRef.current = new window.google.maps.places.PlacesService(
          mapInstanceRef.current,
        );
      } else {
        mapInstanceRef.current.setCenter(location);
      }

      // Create or reuse marker
      if (!markerRef.current) {
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
          animation: window.google.maps.Animation.DROP,
        });
      } else {
        markerRef.current.setPosition(location);
      }
    } catch (error) {
      console.error(&quot;Error initializing map:&quot;, error);
      toast({
        title: &quot;Map Error&quot;,
        description: &quot;Could not display the map&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Main initialization logic
  useEffect(() => {
    console.log(&quot;🔍 SimpleAddressPicker: Component mounted&quot;);

    // Set the global callback for the Google Maps script
    window.initGoogleMaps = () => {
      console.log(&quot;🔍 Google Maps script loaded and callback triggered&quot;);
      initializeGoogleComponents();
    };

    function initializeGoogleComponents() {
      console.log(&quot;🔍 Initializing Google Maps components...&quot;);

      if (!autocompleteContainerRef.current) {
        console.error(&quot;🔍 Autocomplete container ref not available&quot;);
        return;
      }

      if (!window.google?.maps?.places) {
        console.error(&quot;🔍 Google Maps Places API not available&quot;);
        return;
      }

      try {
        // Access the PlaceAutocompleteElement class
        const { PlaceAutocompleteElement } = window.google.maps.places;

        if (!PlaceAutocompleteElement) {
          console.error(&quot;🔍 PlaceAutocompleteElement not available in the API&quot;);
          toast({
            title: &quot;API Error&quot;,
            description: &quot;Required Google Maps components not available&quot;,
            variant: &quot;destructive&quot;,
          });
          return;
        }

        console.log(&quot;🔍 Creating PlaceAutocompleteElement instance&quot;);

        // Create the autocomplete element with minimal configuration
        console.log(&quot;🔍 Creating PlaceAutocompleteElement with configuration&quot;);
        const element = new PlaceAutocompleteElement({
          types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
        });

        console.log(
          &quot;🔍 PlaceAutocompleteElement created successfully:&quot;,
          element,
        );

        // Make the element accessible for debugging in the browser console
        window.debugElement = element;

        // Style the element to match our UI
        console.log(&quot;🔍 Applying styles to element&quot;);

        // Force the element to be visible and properly sized
        element.style.display = &quot;block&quot;;
        element.style.width = &quot;100%&quot;;
        element.style.minHeight = &quot;40px&quot;;

        // Match our app's styling
        element.style.padding = &quot;8px 12px&quot;;
        element.style.backgroundColor = &quot;transparent&quot;;
        element.style.boxSizing = &quot;border-box&quot;;

        // Remove the default border since we&apos;re using a container with border
        element.style.border = &quot;none&quot;;

        // Make sure the container is empty before adding elements
        // Don't try to remove children directly to avoid React DOM conflicts
        autocompleteContainerRef.current.innerHTML = &quot;&quot;;

        // Add the element directly to the DOM
        autocompleteContainerRef.current.appendChild(element);
        console.log(
          &quot;🔍 PlaceAutocompleteElement appended to DOM:&quot;,
          autocompleteContainerRef.current,
        );

        // Add a search icon for UI consistency (place on top of the input)
        const searchIcon = document.createElement(&quot;div&quot;);
        searchIcon.style.position = &quot;absolute&quot;;
        searchIcon.style.left = &quot;10px&quot;;
        searchIcon.style.top = &quot;12px&quot;;
        searchIcon.style.zIndex = &quot;10&quot;;
        searchIcon.style.pointerEvents = &quot;none&quot;;
        searchIcon.innerHTML = `<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;></circle><path d=&quot;m21 21-4.3-4.3&quot;></path></svg>`;
        autocompleteContainerRef.current.appendChild(searchIcon);

        // Add 12px padding to any input element created by Google
        setTimeout(() => {
          const inputElements =
            autocompleteContainerRef.current.querySelectorAll(&quot;input&quot;);
          console.log(
            &quot;🔍 Input elements found in container:&quot;,
            inputElements.length,
          );
          inputElements.forEach((input) => {
            input.style.paddingLeft = &quot;32px&quot;;
          });
        }, 100);

        console.log(
          &quot;🔍 Element properties:&quot;,
          Object.getOwnPropertyNames(element),
        );
        console.log(
          &quot;🔍 Element prototype:&quot;,
          Object.getOwnPropertyNames(Object.getPrototypeOf(element)),
        );

        // Add event listener for the place_changed event
        element.addEventListener(&quot;gmp-placeselect&quot;, (event: any) => {
          console.log(
            &quot;🎯 PlaceAutocompleteElement selection event triggered!&quot;,
            event,
          );

          try {
            // Attempt to extract the place from various locations
            let placeValue;

            // Check if the element has a getPlaceValue method
            if (typeof element.getPlaceValue === &quot;function&quot;) {
              console.log(&quot;🎯 Using element.getPlaceValue()&quot;);
              placeValue = element.getPlaceValue();
              console.log(&quot;🎯 Place value from getPlaceValue:&quot;, placeValue);
            }
            // Check the event.detail.place structure
            else if (event.detail && event.detail.place) {
              console.log(&quot;🎯 Using event.detail.place&quot;);
              placeValue = event.detail.place;
              console.log(&quot;🎯 Place value from event.detail:&quot;, placeValue);
            }
            // Check other possible locations
            else if (event.place) {
              console.log(&quot;🎯 Using event.place&quot;);
              placeValue = event.place;
              console.log(&quot;🎯 Place value from event:&quot;, placeValue);
            } else {
              console.error(&quot;🎯 No place value found in event&quot;);
              console.error(
                &quot;🎯 Event:&quot;,
                JSON.stringify(event, (k, v) =>
                  typeof v === &quot;function&quot; ? &quot;[Function]&quot; : v,
                ),
              );

              // As a last resort, try a direct DOM query to see if we can get more info
              const placeElements = document.querySelectorAll(
                &quot;gmp-place-autocomplete&quot;,
              );
              console.log(&quot;🎯 Found place elements:&quot;, placeElements);

              return;
            }

            // If we have a place value with an ID, proceed to fetch details
            if (placeValue && placeValue.id) {
              console.log(&quot;🎯 Successfully extracted place ID:&quot;, placeValue.id);
              handlePlaceSelection(placeValue.id);
            } else {
              console.error(&quot;🎯 No place ID found in place value&quot;);
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

        // Notify that initialization is complete
        console.log(
          &quot;🔍 PlaceAutocompleteElement initialized and attached to DOM&quot;,
        );
        setGoogleInitialized(true);
      } catch (error) {
        console.error(&quot;🔍 Error during Google Maps initialization:&quot;, error);
        toast({
          title: &quot;Initialization Error&quot;,
          description: &quot;Failed to initialize location services&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    }

    // Function to handle place selection and fetch details
    function handlePlaceSelection(placeId: string) {
      console.log(&quot;🔍 Handling place selection for ID:&quot;, placeId);
      setIsLoading(true);

      try {
        // Create a service if it doesn&apos;t exist
        if (!placesServiceRef.current) {
          console.log(&quot;🔍 Creating PlacesService&quot;);
          // Use a map if available, otherwise create with a div
          if (mapInstanceRef.current) {
            placesServiceRef.current =
              new window.google.maps.places.PlacesService(
                mapInstanceRef.current,
              );
          } else {
            const tempDiv = document.createElement(&quot;div&quot;);
            placesServiceRef.current =
              new window.google.maps.places.PlacesService(tempDiv);
          }
        }

        console.log(&quot;🔍 Requesting place details&quot;);
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
            console.log(&quot;🔍 Place details response received. Status:&quot;, status);
            setIsLoading(false);

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              result
            ) {
              console.log(&quot;🔍 Place details successfully retrieved:&quot;, result);

              // Process the place data
              if (result.geometry && result.geometry.location) {
                // Extract location data
                const location = result.geometry.location;
                const latitude =
                  typeof location.lat === &quot;function&quot;
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === &quot;function&quot;
                    ? location.lng()
                    : location.lng;

                console.log(&quot;🔍 Location coordinates:&quot;, latitude, longitude);

                // Update UI state to show the map
                setSelectedLocation({ lat: latitude, lng: longitude });
                setShowMap(true);

                // Initialize the map with the location
                setTimeout(() => {
                  initializeMap({ lat: latitude, lng: longitude });
                }, 50);

                // Create the address data object to pass to parent
                const addressData: AddressData = {
                  formatted_address: result.formatted_address || &quot;&quot;,
                  address_components: result.address_components || [],
                  latitude,
                  longitude,
                  place_id: result.place_id,
                  name: result.name || &quot;&quot;,
                };

                console.log(&quot;🔍 Address data prepared:&quot;, addressData);

                // Call the parent callback with the address data
                console.log(&quot;🔍 Calling onAddressSelect with data&quot;);
                onAddressSelect(addressData);
                console.log(&quot;🔍 onAddressSelect call completed&quot;);
              } else {
                console.error(
                  &quot;🔍 Place result missing geometry or location:&quot;,
                  result,
                );
                toast({
                  title: &quot;Error&quot;,
                  description: &quot;Selected location missing coordinate data&quot;,
                  variant: &quot;destructive&quot;,
                });
              }
            } else {
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

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log(&quot;🔍 Google Maps already loaded, initializing components&quot;);
      initializeGoogleComponents();
    } else {
      // Load the Google Maps script
      const existingScript = document.querySelector(
        'script[src*=&quot;maps.googleapis.com/maps/api&quot;]',
      );

      if (!existingScript) {
        console.log(&quot;🔍 Loading Google Maps script&quot;);
        // Try all possible API key environment variables
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY ||
          process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
          &quot;&quot;;

        console.log(&quot;🔍 Using API Key:&quot;, apiKey ? &quot;Key found&quot; : &quot;Key missing&quot;);

        const script = document.createElement(&quot;script&quot;);
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta`;
        script.async = true;
        script.defer = true;

        // Add detailed debugging for script loading issues
        script.onerror = () => {
          console.error(&quot;🔍 Failed to load Google Maps script&quot;);
          console.error(
            &quot;🔍 API Key used (first few chars):&quot;,
            apiKey ? apiKey.substring(0, 8) + &quot;...&quot; : &quot;none&quot;,
          );
          console.error(&quot;🔍 Full script URL:&quot;, script.src);

          toast({
            title: &quot;Loading Error&quot;,
            description: &quot;Failed to load Google Maps services&quot;,
            variant: &quot;destructive&quot;,
          });
        };
        document.head.appendChild(script);
      } else {
        console.log(
          &quot;🔍 Google Maps script already loading, waiting for callback&quot;,
        );
      }
    }

    // Cleanup function
    return () => {
      console.log(&quot;🔍 SimpleAddressPicker: Component unmounting, cleaning up&quot;);
      if (window.initGoogleMaps) {
        delete window.initGoogleMaps;
      }
      if (window.debugElement) {
        delete window.debugElement;
      }
    };
  }, [toast, onAddressSelect]);

  return (
    <div className={`${className} relative`}>
      {/* Address search container */}
      <div
        ref={autocompleteContainerRef}
        className=&quot;relative min-h-[45px] border rounded-md mb-2&quot;
      >
        {/* Only show loading placeholder when Google isn&apos;t initialized */}
        {!googleInitialized && (
          <div className=&quot;absolute inset-0 flex items-center bg-background rounded-md&quot;>
            <Search className=&quot;absolute left-2.5 top-50% h-4 w-4 text-muted-foreground&quot; />
            <Input
              type=&quot;text&quot;
              placeholder=&quot;Loading location search...&quot;
              className=&quot;pl-9 border-none&quot;
              disabled={true}
            />
          </div>
        )}
      </div>

      {/* Loading indicator */}
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
