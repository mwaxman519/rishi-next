&quot;use client&quot;;

import React, { useEffect, useRef, useState } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, MapPin, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;

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

// Track if the Maps API has been loaded
let googleMapsLoaded = false;

export default function SimpleLocationPicker({
  onAddressSelect,
  className = "&quot;,
}: Props): React.ReactNode {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [address, setAddress] = useState(&quot;&quot;);

  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const autocompleteRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initializeGoogleMaps = () => {
      if (googleMapsLoaded || window.google?.maps) return;
      googleMapsLoaded = true;

      window.initMap = function () {
        console.log(&quot;Google Maps API loaded via callback&quot;);
        if (window.google?.maps?.places) {
          setupAutocomplete();
        }
      };

      const script = document.createElement(&quot;script&quot;);
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&libraries=places&callback=initMap&loading=async&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    const setupAutocomplete = () => {
      if (!inputRef.current) return;

      try {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            types: [&quot;address&quot;, &quot;establishment&quot;, &quot;geocode&quot;],
          },
        );

        autocompleteRef.current.addListener(&quot;place_changed&quot;, () => {
          const place = autocompleteRef.current.getPlace();

          if (!place.geometry) {
            console.error(&quot;Place selected but no geometry data&quot;);
            return;
          }

          // Get location data
          const location = place.geometry.location;
          const lat = location.lat();
          const lng = location.lng();

          // Update selected location for map
          setSelectedLocation({ lat, lng });

          // Determine if business/place
          const isBusinessOrPlace =
            place.types &&
            (place.types.includes(&quot;establishment&quot;) ||
              place.types.includes(&quot;point_of_interest&quot;));

          // Create address data
          const addressData: AddressData = {
            formatted_address: place.formatted_address || address,
            address_components: place.address_components || [],
            latitude: lat,
            longitude: lng,
            place_id: place.place_id || &quot;&quot;,
            name: isBusinessOrPlace ? place.name : place.name || address,
            types: place.types || [],
          };

          console.log(&quot;Selected address data:&quot;, addressData);

          // Update display
          if (isBusinessOrPlace && place.name && place.formatted_address) {
            setAddress(`${place.name} - ${place.formatted_address}`);
          } else if (place.formatted_address) {
            setAddress(place.formatted_address);
          }

          // Send to parent
          onAddressSelect(addressData);
        });

        setIsLoading(false);
        console.log(&quot;Autocomplete initialized&quot;);
      } catch (error) {
        console.error(&quot;Error setting up autocomplete:&quot;, error);
        setIsLoading(false);
      }
    };

    // Initialize if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setupAutocomplete();
      setIsLoading(false);
    } else {
      initializeGoogleMaps();
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
    };
  }, []);

  // Initialize map when location is selected
  useEffect(() => {
    if (!selectedLocation || !mapContainerRef.current || !window.google?.maps)
      return;

    if (!mapInstanceRef.current) {
      // Create new map
      mapInstanceRef.current = new window.google.maps.Map(
        mapContainerRef.current,
        {
          center: selectedLocation,
          zoom: 15,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        },
      );

      // Create marker
      markerRef.current = new window.google.maps.Marker({
        position: selectedLocation,
        map: mapInstanceRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    } else {
      // Update existing map and marker
      mapInstanceRef.current.setCenter(selectedLocation);

      if (markerRef.current) {
        markerRef.current.setPosition(selectedLocation);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: selectedLocation,
          map: mapInstanceRef.current,
        });
      }
    }
  }, [selectedLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
  };

  return (
    <div className={className}>
      {/* Search input */}
      <div className=&quot;relative mb-4 max-w-md&quot;>
        <div className=&quot;relative rounded-md shadow-sm&quot;>
          <div className=&quot;pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3&quot;>
            <Search
              className=&quot;h-4 w-4 text-muted-foreground&quot;
              aria-hidden=&quot;true&quot;
            />
          </div>
          <Input
            ref={inputRef}
            type=&quot;text&quot;
            value={address}
            onChange={handleInputChange}
            placeholder=&quot;Search for addresses, businesses, or places...&quot;
            className=&quot;pl-10 h-12 focus-visible:ring-2 focus-visible:ring-primary rounded-lg shadow-md&quot;
            disabled={isLoading}
          />
          {isLoading && (
            <div className=&quot;absolute inset-y-0 right-0 flex items-center pr-3&quot;>
              <Loader2 className=&quot;h-4 w-4 animate-spin text-primary&quot; />
            </div>
          )}
        </div>
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

// Define types for the global scope
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}
