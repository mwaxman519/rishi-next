// GoogleMapsPlaceElement.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
 * This component uses a "portal-like" approach where we don't let React manage the DOM for
 * the Google Maps element at all. Instead, we use a div that stays stable across renders
 * as a container, and we manually add/remove Google elements to it.
 */
export default function GoogleMapsPlaceElement({
  onAddressSelect,
  className = "",
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

      console.log("🗺️ Initializing map with location:", location);

      // Create a new map instance if it doesn't exist
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
      console.log("🔍 Google Maps script loaded and callback triggered");
      setIsScriptLoaded(true);

      // Delay the setup to ensure DOM is ready
      setTimeout(() => {
        setupGooglePlaceAutocomplete();
      }, 100);
    };

    // Function to handle the place selection and request details
    function handlePlaceSelection(placeId: string) {
      console.log("🔍 Handling place selection for ID:", placeId);
      setIsLoading(true);

      try {
        // Create a places service if it doesn't exist
        if (!placesServiceRef.current) {
          console.log("🔍 Creating PlacesService");
          const tempDiv = document.createElement("div");
          placesServiceRef.current =
            new window.google.maps.places.PlacesService(tempDiv);
        }

        // Request details for the selected place
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
            console.log("🔍 Place details response. Status:", status);
            setIsLoading(false);

            if (
              status === window.google.maps.places.PlacesServiceStatus.OK &&
              result
            ) {
              // Successfully got place details
              console.log("🔍 Place details retrieved:", result);

              if (result.geometry && result.geometry.location) {
                // Extract coordinates from the result
                const location = result.geometry.location;
                const latitude =
                  typeof location.lat === "function"
                    ? location.lat()
                    : location.lat;
                const longitude =
                  typeof location.lng === "function"
                    ? location.lng()
                    : location.lng;

                // Update UI to show the map
                setSelectedLocation({ lat: latitude, lng: longitude });
                setShowMap(true);

                // Create address data to pass to parent
                const addressData: AddressData = {
                  formatted_address: result.formatted_address || "",
                  address_components: result.address_components || [],
                  latitude,
                  longitude,
                  place_id: result.place_id,
                  name: result.name || "",
                };

                // Debug logs to track the data flow
                console.log(
                  "🔍 Created address data to pass to parent:",
                  addressData,
                );
                console.log("🔍 Calling onAddressSelect with data");

                // Notify the parent component
                try {
                  onAddressSelect(addressData);
                  console.log("🔍 onAddressSelect call completed");
                } catch (error) {
                  console.error("🔍 Error calling onAddressSelect:", error);
                }
              } else {
                // Handle missing geometry
                console.error("🔍 Place missing location data:", result);
                toast({
                  title: "Error",
                  description: "Selected location missing coordinate data",
                  variant: "destructive",
                });
              }
            } else {
              // Handle API error
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

    // Setup function to create and attach the PlaceAutocompleteElement
    function setupGooglePlaceAutocomplete() {
      console.log(
        "🔍 Setting up Google PlaceAutocompleteElement with containerRef state:",
        !!containerRef.current,
      );

      // Check container ref with retry mechanism
      const checkContainerAndSetup = () => {
        if (!containerRef.current) {
          console.warn("🔍 Container ref not available yet, scheduling retry");
          // Schedule a retry
          setTimeout(checkContainerAndSetup, 100);
          return;
        }

        // Container ref is available, proceed with autocomplete setup
        console.log("🔍 Container ref is available, setting up autocomplete");

        // Double-check Google Maps is available
        if (
          !window.google ||
          !window.google.maps ||
          !window.google.maps.places
        ) {
          console.error("Google Maps API not fully loaded");
          setIsLoading(false);
          toast({
            title: "API Loading Error",
            description: "Google Maps API failed to load completely",
            variant: "destructive",
          });
          return;
        }

        try {
          console.log("🔍 Setting up Google PlaceAutocompleteElement");

          // Clear the container
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }

          // Verify PlaceAutocompleteElement exists before creating it
          if (!window.google.maps.places.PlaceAutocompleteElement) {
            console.error(
              "🔍 PlaceAutocompleteElement constructor is not available",
            );
            setIsLoading(false);
            toast({
              title: "API Support Error",
              description:
                "Your Google Maps API key does not have access to the PlaceAutocompleteElement beta feature",
              variant: "destructive",
            });
            return;
          }

          console.log("🔍 Creating PlaceAutocompleteElement");

          // Catch specific API permissions errors
          try {
            // Create the autocomplete element with minimal configuration
            const element =
              new window.google.maps.places.PlaceAutocompleteElement({
                types: ["address", "establishment", "geocode"],
              });

            // Style the element
            element.style.display = "block";
            element.style.width = "100%";
            element.style.minHeight = "40px";
            element.style.padding = "8px 12px 8px 32px";
            element.style.backgroundColor = "transparent";
            element.style.boxSizing = "border-box";
            element.style.border = "none";

            // Create a container for the search icon
            const searchIcon = document.createElement("div");
            searchIcon.style.position = "absolute";
            searchIcon.style.left = "10px";
            searchIcon.style.top = "12px";
            searchIcon.style.zIndex = "10";
            searchIcon.style.pointerEvents = "none";
            searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>`;

            // Append elements to the container
            containerRef.current.appendChild(element);
            containerRef.current.appendChild(searchIcon);

            // Add event listener for place selection
            element.addEventListener("gmp-placeselect", (event: any) => {
              console.log(
                "🎯 PlaceAutocompleteElement selection event triggered!",
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
                  console.log("🎯 Place ID found:", placeId);

                  // Force element to lose focus to prevent keyboard issues
                  if (document.activeElement instanceof HTMLElement) {
                    document.activeElement.blur();
                  }

                  // Add a console message for debugging
                  console.log(
                    "🎯 About to call handlePlaceSelection with ID:",
                    placeId,
                  );

                  // Call place selection handler outside the event callback for better reliability
                  setTimeout(() => {
                    handlePlaceSelection(placeId);
                  }, 0);
                } else {
                  console.error("🎯 No valid place found in event:", event);
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

            // Done loading
            setIsLoading(false);
            console.log(
              "🔍 Google PlaceAutocompleteElement initialized successfully",
            );
          } catch (apiError: any) {
            // This catches the specific API permissions error
            console.error(
              "🔍 API Error creating PlaceAutocompleteElement:",
              apiError,
            );

            // Check if this is the "requests blocked" error
            const errorMessage = apiError?.message || "";
            if (
              errorMessage.includes("places.googleapis.com") &&
              errorMessage.includes("Requests to this API") &&
              errorMessage.includes("blocked")
            ) {
              toast({
                title: "Google Maps API Permissions Error",
                description:
                  "Your API key does not have access to the Places API v1. Contact your administrator to enable it.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Google Maps API Error",
                description: "Error initializing the location search component",
                variant: "destructive",
              });
            }

            setIsLoading(false);
          }
        } catch (error) {
          console.error(
            "🔍 Error setting up Google PlaceAutocompleteElement:",
            error,
          );
          setIsLoading(false);
          toast({
            title: "Initialization Error",
            description: "Failed to initialize location services",
            variant: "destructive",
          });
        }
      };

      // Start the checking process
      checkContainerAndSetup();
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log(
        "🔍 Google Maps already loaded, checking for PlaceAutocompleteElement support",
      );

      // Check if the places library exists
      if (window.google.maps.places) {
        console.log(
          "🔍 Places library found, checking for PlaceAutocompleteElement",
        );

        // Check if PlaceAutocompleteElement is available (it's in the beta API)
        if (window.google.maps.places.PlaceAutocompleteElement) {
          console.log("🔍 PlaceAutocompleteElement is available!");
          setIsScriptLoaded(true);

          // Delay to ensure the DOM is ready
          setTimeout(() => {
            setupGooglePlaceAutocomplete();
          }, 100);
        } else {
          console.error(
            "🔍 PlaceAutocompleteElement not available - you need beta API enabled",
          );
          toast({
            title: "API Support Error",
            description:
              "Your Google Maps API key does not have access to the PlaceAutocompleteElement beta feature",
            variant: "destructive",
          });
        }
      } else {
        console.error("🔍 Places library not available");
        toast({
          title: "API Loading Error",
          description: "Google Maps Places library failed to load",
          variant: "destructive",
        });
      }
    } else {
      // Load the Google Maps script
      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com/maps/api"]',
      );

      if (!existingScript) {
        console.log("🔍 Loading Google Maps script");
        // Use the specific API key that worked before (with Places API v1 access)
        const apiKey = "AIzaSyD8PPMg1ZVIB8ih7JIsTVahbPzlAhwJ70Q"; // This key has Places API v1 access

        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMaps&loading=async&v=beta`;
        script.async = true;
        script.defer = true;

        script.onerror = () => {
          console.error("🔍 Failed to load Google Maps script");
          setIsLoading(false);
          toast({
            title: "Loading Error",
            description: "Failed to load Google Maps services",
            variant: "destructive",
          });
        };

        document.head.appendChild(script);
      } else {
        console.log("🔍 Google Maps script already loading");
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
      <div className="relative min-h-[45px] border rounded-md mb-2">
        {/* Always render the container ref, but conditionally show the loading state over it */}
        <div ref={containerRef} className="relative w-full min-h-[40px]" />

        {/* Show loading overlay when not ready */}
        {(isLoading || !isScriptLoaded) && (
          <div className="absolute inset-0 bg-background z-10">
            <div className="relative flex items-center h-full">
              <Search className="absolute left-2.5 top-[50%] transform translate-y-[-50%] h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Loading location search..."
                className="pl-9 h-full border-0"
                disabled={true}
              />
              <div className="absolute right-2.5 top-[50%] transform translate-y-[-50%]">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </div>

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
