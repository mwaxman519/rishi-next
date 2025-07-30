"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  className = "",
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
      console.error("Map container or Google Maps not available");
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
      console.error("Error initializing map:", error);
      toast({
        title: "Map Error",
        description: "Could not display the map",
        variant: "destructive",
      });
    }
  };

  // Main initialization logic
  useEffect(() => {
    console.log("🔍 SimpleAddressPicker: Component mounted");

    // Set the global callback for the Google Maps script
    window.initGoogleMaps = () => {
      console.log("🔍 Google Maps script loaded and callback triggered");
      initializeGoogleComponents();
    };

    function initializeGoogleComponents() {
      console.log("🔍 Initializing Google Maps components...");

      if (!autocompleteContainerRef.current) {
        console.error("🔍 Autocomplete container ref not available");
        return;
      }

      if (!window.google?.maps?.places) {
        console.error("🔍 Google Maps Places API not available");
        return;
      }

      try {
        // Access the PlaceAutocompleteElement class
        const { PlaceAutocompleteElement } = window.google.maps.places;

        if (!PlaceAutocompleteElement) {
          console.error("🔍 PlaceAutocompleteElement not available in the API");
          toast({
            title: "API Error",
            description: "Required Google Maps components not available",
            variant: "destructive",
          });
          return;
        }

        console.log("🔍 Creating PlaceAutocompleteElement instance");

        // Create the autocomplete element with minimal configuration
        console.log("🔍 Creating PlaceAutocompleteElement with configuration");
        const element = new PlaceAutocompleteElement({
          types: ["address", "establishment", "geocode"],
        });

        console.log(
          "🔍 PlaceAutocompleteElement created successfully:",
          element,
        );

        // Make the element accessible for debugging in the browser console
        window.debugElement = element;

        // Style the element to match our UI
        console.log("🔍 Applying styles to element");

        // Force the element to be visible and properly sized
        element.style.display = "block";
        element.style.width = "100%";
        element.style.minHeight = "40px";

        // Match our app's styling
        element.style.padding = "8px 12px";
        element.style.backgroundColor = "transparent";
        element.style.boxSizing = "border-box";

        // Remove the default border since we're using a container with border
        element.style.border = "none";

        // Make sure the container is empty before adding elements
        // Don't try to remove children directly to avoid React DOM conflicts
        autocompleteContainerRef.current.innerHTML = "";

        // Add the element directly to the DOM
        autocompleteContainerRef.current.appendChild(element);
        console.log(
          "🔍 PlaceAutocompleteElement appended to DOM:",
          autocompleteContainerRef.current,
        );

        // Add a search icon for UI consistency (place on top of the input)
        const searchIcon = document.createElement("div");
        searchIcon.style.position = "absolute";
        searchIcon.style.left = "10px";
        searchIcon.style.top = "12px";
        searchIcon.style.zIndex = "10";
        searchIcon.style.pointerEvents = "none";
        searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;
        autocompleteContainerRef.current.appendChild(searchIcon);

        // Add 12px padding to any input element created by Google
        setTimeout(() => {
          const inputElements =
            autocompleteContainerRef.current.querySelectorAll("input");
          console.log(
            "🔍 Input elements found in container:",
            inputElements.length,
          );
          inputElements.forEach((input) => {
            input.style.paddingLeft = "32px";
          });
        }, 100);

        console.log(
          "🔍 Element properties:",
          Object.getOwnPropertyNames(element),
        );
        console.log(
          "🔍 Element prototype:",
          Object.getOwnPropertyNames(Object.getPrototypeOf(element)),
        );

        // Add event listener for the place_changed event
        element.addEventListener("gmp-placeselect", (event: any) => {
          console.log(
            "🎯 PlaceAutocompleteElement selection event triggered!",
            event,
          );

          try {
            // Attempt to extract the place from various locations
            let placeValue;

            // Check if the element has a getPlaceValue method
            if (typeof element.getPlaceValue === "function") {
              console.log("🎯 Using element.getPlaceValue()");
              placeValue = element.getPlaceValue();
              console.log("🎯 Place value from getPlaceValue:", placeValue);
            }
            // Check the event.detail.place structure
            else if (event.detail && event.detail.place) {
              console.log("🎯 Using event.detail.place");
              placeValue = event.detail.place;
              console.log("🎯 Place value from event.detail:", placeValue);
            }
            // Check other possible locations
            else if (event.place) {
              console.log("🎯 Using event.place");
              placeValue = event.place;
              console.log("🎯 Place value from event:", placeValue);
            } else {
              console.error("🎯 No place value found in event");
              console.error(
                "🎯 Event:",
                JSON.stringify(event, (k, v) =>
                  typeof v === "function" ? "[Function]" : v,
                ),
              );

              // As a last resort, try a direct DOM query to see if we can get more info
              const placeElements = document.querySelectorAll(
                "gmp-place-autocomplete",
              );
              console.log("🎯 Found place elements:", placeElements);

              return;
            }

            // If we have a place value with an ID, proceed to fetch details
            if (placeValue && placeValue.id) {
              console.log("🎯 Successfully extracted place ID:", placeValue.id);
              handlePlaceSelection(placeValue.id);
            } else {
              console.error("🎯 No place ID found in place value");
              toast({
                title: "Error",
                description: "Could not identify the selected location",
                variant: "destructive",
              });
            }
          } catch (error) {
            console.error("🎯 Error handling place selection:", error);
            toast({
              title: "Error",
              description: "Error processing the selected location",
              variant: "destructive",
            });
          }
        });

        // Notify that initialization is complete
        console.log(
          "🔍 PlaceAutocompleteElement initialized and attached to DOM",
        );
        setGoogleInitialized(true);
      } catch (error) {
        console.error("🔍 Error during Google Maps initialization:", error);
        toast({
          title: "Initialization Error",
          description: "Failed to initialize location services",
          variant: "destructive",
        });
      }
    }

    // Function to handle place selection and fetch details
    function handlePlaceSelection(placeId: string) {
      console.log("🔍 Handling place selection for ID:", placeId);
      setIsLoading(true);

      try {
        // Create a service if it doesn't exist
        if (!placesServiceRef.current) {
          console.log("🔍 Creating PlacesService");
          // Use a map if available, otherwise create with a div
          if (mapInstanceRef.current) {
            placesServiceRef.current =
              new window.google.maps.places.PlacesService(
                mapInstanceRef.current,
              );
          } else {
            const tempDiv = document.createElement("div");
            placesServiceRef.current =
              new window.google.maps.places.PlacesService(tempDiv);
          }
        }

        console.log("🔍 Requesting place details");
        placesServiceRef.current.getDetails(
          {
            placeId: placeId,
            fields: [
              "name",
              "formatted_address",
              "geometry",
              "address_components",
              "place_id",
            ],
          },
          (result: any, status: any) => {
            console.log("🔍 Place details response received. Status:", status);
            setIsLoading(false);

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              result
            ) {
              console.log("🔍 Place details successfully retrieved:", result);

              // Process the place data
              if (result.geometry && result.geometry.location) {
                // Extract location data
                const location = result.geometry.location;
                const latitude =
                  typeof location.lat === "function"
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === "function"
                    ? location.lng()
                    : location.lng;

                console.log("🔍 Location coordinates:", latitude, longitude);

                // Update UI state to show the map
                setSelectedLocation({ lat: latitude, lng: longitude });
                setShowMap(true);

                // Initialize the map with the location
                setTimeout(() => {
                  initializeMap({ lat: latitude, lng: longitude });
                }, 50);

                // Create the address data object to pass to parent
                const addressData: AddressData = {
                  formatted_address: result.formatted_address || "",
                  address_components: result.address_components || [],
                  latitude,
                  longitude,
                  place_id: result.place_id,
                  name: result.name || "",
                };

                console.log("🔍 Address data prepared:", addressData);

                // Call the parent callback with the address data
                console.log("🔍 Calling onAddressSelect with data");
                onAddressSelect(addressData);
                console.log("🔍 onAddressSelect call completed");
              } else {
                console.error(
                  "🔍 Place result missing geometry or location:",
                  result,
                );
                toast({
                  title: "Error",
                  description: "Selected location missing coordinate data",
                  variant: "destructive",
                });
              }
            } else {
              console.error("🔍 Error fetching place details. Status:", status);
              toast({
                title: "Error",
                description: "Could not retrieve location details",
                variant: "destructive",
              });
            }
          },
        );
      } catch (error) {
        console.error("🔍 Error in handlePlaceSelection:", error);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Error processing location data",
          variant: "destructive",
        });
      }
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      console.log("🔍 Google Maps already loaded, initializing components");
      initializeGoogleComponents();
    } else {
      // Load the Google Maps script
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api"]',
      );

      if (!existingScript) {
        console.log("🔍 Loading Google Maps script");
        // Try all possible API key environment variables
        const apiKey =
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
          process.env.NEXT_PUBLIC_GOOGLE_MAPS_JS_API_KEY ||
          process.env.NEXT_PUBLIC_GOOGLE_API_KEY ||
          "";

        console.log("🔍 Using API Key:", apiKey ? "Key found" : "Key missing");

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta`;
        script.async = true;
        script.defer = true;

        // Add detailed debugging for script loading issues
        script.onerror = () => {
          console.error("🔍 Failed to load Google Maps script");
          console.error(
            "🔍 API Key used (first few chars):",
            apiKey ? apiKey.substring(0, 8) + "..." : "none",
          );
          console.error("🔍 Full script URL:", script.src);

          toast({
            title: "Loading Error",
            description: "Failed to load Google Maps services",
            variant: "destructive",
          });
        };
        document.head.appendChild(script);
      } else {
        console.log(
          "🔍 Google Maps script already loading, waiting for callback",
        );
      }
    }

    // Cleanup function
    return () => {
      console.log("🔍 SimpleAddressPicker: Component unmounting, cleaning up");
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
        className="relative min-h-[45px] border rounded-md mb-2"
      >
        {/* Only show loading placeholder when Google isn't initialized */}
        {!googleInitialized && (
          <div className="absolute inset-0 flex items-center bg-background rounded-md">
            <Search className="absolute left-2.5 top-50% h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Loading location search..."
              className="pl-9 border-none"
              disabled={true}
            />
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-2.5 top-2.5 z-10">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Map container */}
      {showMap && selectedLocation && (
        <div className="mt-4">
          <div
            ref={mapRef}
            className="w-full h-[250px] rounded-md border"
            aria-label="Map showing selected location"
          />
        </div>
      )}
    </div>
  );
}
