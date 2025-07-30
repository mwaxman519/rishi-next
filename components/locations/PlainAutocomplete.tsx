&quot;use client&quot;;

import { useRef, useState, useEffect } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Loader2, Search } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

interface AddressData {
  formatted_address: string;
  address_components: any[];
  latitude: number;
  longitude: number;
  place_id: string;
  name?: string;
}

interface Props {
  onAddressSelect: (data: AddressData) => void;
  className?: string;
}

export default function PlainAutocomplete({
  onAddressSelect,
  className = "&quot;,
}: Props) {
  const [address, setAddress] = useState(&quot;&quot;);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Handle manual entry submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      toast({
        title: &quot;Error&quot;,
        description: &quot;Please enter an address&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create a geocoder to convert address to coordinates
      if (!window.google?.maps?.Geocoder) {
        throw new Error(&quot;Google Maps Geocoder not available&quot;);
      }

      const geocoder = new window.google.maps.Geocoder();

      geocoder.geocode(
        { address: address.trim() },
        (results: any, status: any) => {
          setIsLoading(false);

          if (
            status === window.google.maps.GeocoderStatus.OK &&
            results &&
            results[0]
          ) {
            const result = results[0];
            const location = result.geometry.location;

            const addressData: AddressData = {
              formatted_address: result.formatted_address || address,
              address_components: result.address_components || [],
              latitude: location.lat(),
              longitude: location.lng(),
              place_id: result.place_id || &quot;&quot;,
              name: address,
            };

            console.log(&quot;Got location data from manual entry:&quot;, addressData);
            onAddressSelect(addressData);
          } else {
            toast({
              title: &quot;Error&quot;,
              description: &quot;Could not find coordinates for the entered address&quot;,
              variant: &quot;destructive&quot;,
            });
          }
        },
      );
    } catch (error) {
      console.error(&quot;Error geocoding address:&quot;, error);
      setIsLoading(false);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to process the address&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Reference to the input element for autocomplete
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Load Google Maps script and set up autocomplete
  useEffect(() => {
    // Define window.initMap callback
    window.initMap = function () {
      console.log(&quot;Google Maps API loaded&quot;);

      // Set up autocomplete if input element exists
      if (inputRef.current && window.google?.maps?.places) {
        try {
          // Create the autocomplete instance
          autocompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            {
              types: [&quot;address&quot;], // Only use address type to avoid mixing errors
            },
          );

          // Add place_changed listener
          autocompleteRef.current.addListener(&quot;place_changed&quot;, () => {
            const place = autocompleteRef.current.getPlace();

            if (!place.geometry) {
              // User just pressed enter with incomplete input
              return;
            }

            // Get location details
            const location = place.geometry.location;

            // Create address object
            const addressData: AddressData = {
              formatted_address: place.formatted_address || address,
              address_components: place.address_components || [],
              latitude: location.lat(),
              longitude: location.lng(),
              place_id: place.place_id || &quot;&quot;,
              name: place.name || address,
            };

            // Update the input field value
            if (place.formatted_address) {
              setAddress(place.formatted_address);
            }

            // Call the callback
            console.log(&quot;Autocomplete selected location:&quot;, addressData);

            // Use setTimeout to ensure this runs after React's state updates
            setTimeout(() => {
              onAddressSelect(addressData);
            }, 0);
          });
        } catch (error) {
          console.error(&quot;Error setting up Google autocomplete:&quot;, error);
        }
      }
    };

    // Load Google Maps script if not loaded
    if (!window.google) {
      const script = document.createElement(&quot;script&quot;);
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q&libraries=places&callback=initMap&v=weekly`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    } else if (window.google?.maps?.places) {
      // Maps already loaded, manually invoke initMap
      window.initMap();
    }

    return () => {
      // Clean up
      if (autocompleteRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
      }
      window.initMap = function () {};
    };
  }, [address, onAddressSelect]);

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className=&quot;relative&quot;>
        <div className=&quot;relative&quot;>
          <Search className=&quot;absolute left-2.5 top-[14px] h-4 w-4 text-muted-foreground&quot; />
          <Input
            ref={inputRef}
            type=&quot;text&quot;
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder=&quot;Enter an address...&quot;
            className=&quot;pl-9 pr-24 h-12&quot;
            disabled={isLoading}
          />
          <div className=&quot;absolute right-1 top-1&quot;>
            <Button type=&quot;submit&quot; size=&quot;sm&quot; disabled={isLoading}>
              {isLoading ? (
                <Loader2 className=&quot;h-4 w-4 animate-spin mr-2" />
              ) : null}
              Search
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Google Maps types are defined in types/google-places-web-components.d.ts
