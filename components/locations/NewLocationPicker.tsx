&quot;use client&quot;;

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { Loader2, MapPin } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;

// Track if the Maps API has been loaded
let googleMapsLoaded = false;

interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name?: string;
  types?: string[];
}

interface Props {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function NewLocationPicker({
  onAddressSelect,
  className = "&quot;,
}: Props) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState(&quot;&quot;);

  // Refs for DOM elements
  const autocompleteContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize or update map when selectedLocation changes
  useEffect(() => {
    if (!selectedLocation || !mapContainerRef.current || !window.google?.maps)
      return;

    const { lat, lng } = selectedLocation;
    const location = { lat, lng };

    if (!mapInstanceRef.current) {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center: location,
          zoom: 15,
          mapId: &quot;DEMO_MAP_ID&quot;,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
        },
      );

      // Add marker
      markerRef.current = new window.google.maps.Marker({
        position: location,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      // Update existing map
      mapInstanceRef.current.setCenter(location);

      // Update marker
      if (markerRef.current) {
        markerRef.current.setPosition(location);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: mapInstanceRef.current,
        });
      }
    }
  }, [selectedLocation]);

  // Load Google Maps API and initialize PlaceAutocompleteElement
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Only run this once
      if (googleMapsLoaded || window.google?.maps?.places) return;
      googleMapsLoaded = true;

      window.initMap = function () {
        console.log(&quot;Google Maps API loaded via callback&quot;);
        setupPlaceAutocomplete();
      };

      const script = document.createElement(&quot;script&quot;);
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&libraries=places,marker&callback=initMap&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const setupPlaceAutocomplete = () => {
      if (!autocompleteContainerRef.current || !window.google?.maps?.places)
        return;

      try {
        // Clean the container
        autocompleteContainerRef.current.innerHTML = &quot;&quot;;

        // Create a regular input as a fallback
        const fallbackInput = document.createElement(&quot;input&quot;);
        fallbackInput.type = &quot;text&quot;;
        fallbackInput.placeholder =
          &quot;Search for addresses, businesses, or places...&quot;;
        fallbackInput.id = &quot;location-search-input&quot;;
        fallbackInput.className =
          &quot;w-full h-12 pl-10 pr-3 focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-md border border-input bg-background text-foreground&quot;;

        // Add search icon container
        const searchIconContainer = document.createElement(&quot;div&quot;);
        searchIconContainer.className =
          &quot;pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 z-10&quot;;
        const searchIcon = document.createElement(&quot;div&quot;);
        searchIcon.innerHTML =
          '<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;16&quot; height=&quot;16&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot; class=&quot;lucide lucide-search h-4 w-4 text-muted-foreground&quot;><circle cx=&quot;11&quot; cy=&quot;11&quot; r=&quot;8&quot;/><path d=&quot;m21 21-4.3-4.3&quot;/></svg>';
        searchIconContainer.appendChild(searchIcon);

        // Create container for the input
        const inputContainer = document.createElement(&quot;div&quot;);
        inputContainer.className = &quot;relative w-full&quot;;
        inputContainer.appendChild(searchIconContainer);
        inputContainer.appendChild(fallbackInput);

        // Add the input container to the autocomplete container
        autocompleteContainerRef.current.appendChild(inputContainer);

        // Create an autocomplete instance on our input
        const autocomplete = new window.google.maps.places.Autocomplete(
          fallbackInput,
          {
            fields: [
              &quot;formatted_address&quot;,
              &quot;geometry&quot;,
              &quot;name&quot;,
              &quot;place_id&quot;,
              &quot;types&quot;,
              &quot;address_components&quot;,
            ],
            types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
          },
        );

        // When a place is selected
        autocomplete.addListener(&quot;place_changed&quot;, () => {
          const place = autocomplete.getPlace();

          if (!place.geometry || !place.geometry.location) {
            console.error(&quot;Place selected but no geometry data&quot;);
            return;
          }

          // Get location details
          const location = place.geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Update the selected location for the map
          setSelectedLocation({ lat, lng });

          // Determine if this is an establishment or business
          const isBusinessOrPlace =
            place.types &&
            (place.types.includes(&quot;establishment&quot;) ||
              place.types.includes(&quot;point_of_interest&quot;));

          // Create address object
          const addressData: AddressData = {
            formatted_address: place.formatted_address || &quot;&quot;,
            address_components: place.address_components || [],
            latitude: lat,
            longitude: lng,
            place_id: place.place_id || &quot;&quot;,
            name: isBusinessOrPlace ? place.name : place.name || &quot;&quot;,
            types: place.types || [],
          };

          console.log(&quot;Selected address data:&quot;, addressData);

          // Update display address
          if (isBusinessOrPlace && place.name && place.formatted_address) {
            setAddress(`${place.name} - ${place.formatted_address}`);
          } else if (place.formatted_address) {
            setAddress(place.formatted_address);
          }

          // Send data to parent component
          onAddressSelect(addressData);
        });

        setIsLoading(false);
        console.log(&quot;Autocomplete initialized with regular input&quot;);
      } catch (error) {
        console.error(&quot;Error setting up autocomplete:&quot;, error);
        setIsLoading(false);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to initialize location search&quot;,
          variant: &quot;destructive&quot;,
        });
      }
    };

    // Initialize
    setIsLoading(true);

    if (window.google?.maps?.places) {
      console.log(&quot;Google Maps already loaded, setting up autocomplete&quot;);
      setupPlaceAutocomplete();
    } else {
      loadGoogleMaps();
    }

    return () => {
      // Cleanup if needed
    };
  }, []); // Empty dependency array - run only once

  return (
    <div className={className}>
      {/* Search input */}
      <div className=&quot;relative mb-4 max-w-md&quot;>
        {isLoading && (
          <div className=&quot;absolute right-3 top-1/2 transform -translate-y-1/2 z-10&quot;>
            <Loader2 className=&quot;h-4 w-4 animate-spin text-primary&quot; />
          </div>
        )}
        <div
          ref={autocompleteContainerRef}
          className=&quot;place-autocomplete-container relative&quot;
        ></div>
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className={`w-full h-[350px] rounded-md border border-input relative ${!selectedLocation ? &quot;bg-muted/40 flex items-center justify-center&quot; : &quot;&quot;}`}
      >
        {!selectedLocation && (
          <div className=&quot;text-center text-muted-foreground flex flex-col items-center&quot;>
            <MapPin className=&quot;h-12 w-12 mb-3 text-muted-foreground/60&quot; />
            <p className=&quot;text-lg&quot;>Search for a location to see the map</p>
            <p className=&quot;text-sm text-muted-foreground/80 mt-1 max-w-xs">
              Try searching for businesses, landmarks, or addresses
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Google Maps types are defined in types/google-places-web-components.d.ts
