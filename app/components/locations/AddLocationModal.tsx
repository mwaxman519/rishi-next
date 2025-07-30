&quot;use client&quot;;

import React, { useState, useRef, useCallback } from &quot;react&quot;;
import { Search } from &quot;lucide-react&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &quot;@/components/ui/dialog&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import * as z from &quot;zod&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useMutation } from &quot;@tanstack/react-query&quot;;

// Google Maps components
import { GoogleMap, InfoWindow } from &quot;@react-google-maps/api&quot;;
import {
  GoogleMapsProvider,
  useGoogleMaps,
} from &quot;@/components/maps/GoogleMapsContext&quot;;
import { GooglePlacesInput } from &quot;@/components/maps/GooglePlacesInput&quot;;
import { LocationData } from &quot;@/components/maps/types&quot;;
import { useTheme } from &quot;next-themes&quot;;

// Map styles and configuration
const containerStyle = {
  width: &quot;100%&quot;,
  height: &quot;350px&quot;,
  borderRadius: &quot;0.5rem&quot;,
};

const defaultCenter = {
  lat: 37.7749, // Default location (San Francisco)
  lng: -122.4194,
};

// Form schema
const locationFormSchema = z.object({
  name: z.string().min(2, { message: &quot;Name must be at least 2 characters.&quot; }),
  locationType: z
    .string()
    .min(1, { message: &quot;Please select a location type.&quot; }),
  notes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

// Props for the modal component
interface AddLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLocationModal({
  open,
  onOpenChange,
}: AddLocationModalProps) {
  const { theme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();
  const { isLoaded, loadError, mapId } = useGoogleMaps();

  // Map reference
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null,
  );

  // State for location data
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<any>(null); // Using any for compatibility with both old PlaceResult and new LocationData
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<&quot;light&quot; | &quot;dark&quot;>(&quot;light&quot;);

  // Form setup
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "&quot;,
      locationType: &quot;business&quot;,
      notes: &quot;&quot;,
    },
  });

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const res = await fetch(&quot;/api/locations&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(locationData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || &quot;Failed to submit location&quot;);
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: &quot;Location submitted successfully&quot;,
        description: &quot;Your location has been submitted for approval.&quot;,
      });
      onOpenChange(false);
      form.reset();
      setSelectedLocation(null);
      setSelectedPlace(null);
      router.refresh();
    },
    onError: (error: Error) => {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Submission failed&quot;,
        description: error.message,
      });
    },
  });

  // Update map theme when global theme changes
  React.useEffect(() => {
    const currentTheme = resolvedTheme === &quot;dark&quot; ? &quot;dark&quot; : &quot;light&quot;;
    setMapTheme(currentTheme);

    // If map is already loaded, apply the theme style
    if (mapRef.current && window.google?.maps) {
      applyMapStyle(mapRef.current, currentTheme);
    }
  }, [resolvedTheme]);

  // Apply map style based on theme
  const applyMapStyle = (map: google.maps.Map, theme: &quot;light&quot; | &quot;dark&quot;) => {
    if (theme === &quot;dark&quot;) {
      map.setOptions({
        styles: [
          { elementType: &quot;geometry&quot;, stylers: [{ color: &quot;#242f3e&quot; }] },
          {
            elementType: &quot;labels.text.stroke&quot;,
            stylers: [{ color: &quot;#242f3e&quot; }],
          },
          { elementType: &quot;labels.text.fill&quot;, stylers: [{ color: &quot;#746855&quot; }] },
          {
            featureType: &quot;administrative.locality&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#d59563&quot; }],
          },
          {
            featureType: &quot;poi&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#d59563&quot; }],
          },
          {
            featureType: &quot;poi.park&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#263c3f&quot; }],
          },
          {
            featureType: &quot;poi.park&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#6b9a76&quot; }],
          },
          {
            featureType: &quot;road&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#38414e&quot; }],
          },
          {
            featureType: &quot;road&quot;,
            elementType: &quot;geometry.stroke&quot;,
            stylers: [{ color: &quot;#212a37&quot; }],
          },
          {
            featureType: &quot;road&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#9ca5b3&quot; }],
          },
          {
            featureType: &quot;road.highway&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#746855&quot; }],
          },
          {
            featureType: &quot;road.highway&quot;,
            elementType: &quot;geometry.stroke&quot;,
            stylers: [{ color: &quot;#1f2835&quot; }],
          },
          {
            featureType: &quot;road.highway&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#f3d19c&quot; }],
          },
          {
            featureType: &quot;transit&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#2f3948&quot; }],
          },
          {
            featureType: &quot;transit.station&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#d59563&quot; }],
          },
          {
            featureType: &quot;water&quot;,
            elementType: &quot;geometry&quot;,
            stylers: [{ color: &quot;#17263c&quot; }],
          },
          {
            featureType: &quot;water&quot;,
            elementType: &quot;labels.text.fill&quot;,
            stylers: [{ color: &quot;#515c6d&quot; }],
          },
          {
            featureType: &quot;water&quot;,
            elementType: &quot;labels.text.stroke&quot;,
            stylers: [{ color: &quot;#17263c&quot; }],
          },
        ],
      });
    } else {
      map.setOptions({ styles: [] }); // Reset to default light theme
    }
  };

  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;

      // Apply theme styling to map on load
      if (map && window.google?.maps) {
        applyMapStyle(map, mapTheme);
      }
    },
    [mapTheme],
  );

  // Handle place selection from GooglePlacesInput
  const handlePlaceSelected = useCallback(
    (placeData: LocationData) => {
      try {
        console.log(&quot;Place selected:&quot;, placeData);

        if (!placeData) {
          console.error(&quot;⚠️ No place data received&quot;);
          return;
        }

        if (!placeData.latitude || !placeData.longitude) {
          console.error(&quot;⚠️ Selected place has no coordinates&quot;);
          return;
        }

        const latLng = {
          lat: placeData.latitude,
          lng: placeData.longitude,
        };

        console.log(&quot;✅ Selected location:&quot;, latLng);

        // Update state with the selected place information
        setSelectedLocation(latLng);
        setSelectedPlace(placeData);
        setIsInfoOpen(true);

        // Center and zoom the map
        if (mapRef.current) {
          mapRef.current.panTo(latLng);
          mapRef.current.setZoom(15);
        }

        // Set form values from place data
        if (placeData.displayName) {
          form.setValue(&quot;name&quot;, placeData.displayName);
        }

        // Set location type based on place types
        if (placeData.types && placeData.types.length > 0) {
          if (placeData.types.includes(&quot;restaurant&quot;)) {
            form.setValue(&quot;locationType&quot;, &quot;restaurant&quot;);
          } else if (placeData.types.includes(&quot;store&quot;)) {
            form.setValue(&quot;locationType&quot;, &quot;retail&quot;);
          } else if (placeData.types.includes(&quot;office&quot;)) {
            form.setValue(&quot;locationType&quot;, &quot;office&quot;);
          } else if (placeData.types.includes(&quot;establishment&quot;)) {
            form.setValue(&quot;locationType&quot;, &quot;business&quot;);
          } else {
            form.setValue(&quot;locationType&quot;, &quot;business&quot;);
          }
        }
      } catch (error) {
        console.error(&quot;Error in handlePlaceSelected:&quot;, error);
        toast({
          variant: &quot;destructive&quot;,
          title: &quot;Error selecting location&quot;,
          description:
            &quot;There was a problem with the location selection. Please try again.&quot;,
        });
      }
    },
    [form, toast],
  );

  // Clear the search
  const handleClearSearch = useCallback(() => {
    // Simply reset the state
    setSelectedPlace(null);
    setSelectedLocation(null);
    setIsInfoOpen(false);
  }, []);

  // Find user's current location
  const handleFindMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      toast({
        title: &quot;Finding your location&quot;,
        description: &quot;Please allow location access if prompted.&quot;,
      });

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const latLng = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          setSelectedLocation(latLng);

          // Center and zoom the map
          if (mapRef.current) {
            mapRef.current.panTo(latLng);
            mapRef.current.setZoom(15);
          }

          try {
            // Use our API endpoint for reverse geocoding
            const response = await fetch(
              `/api/maps/geocode?lat=${latLng.lat}&lng=${latLng.lng}`,
            );

            if (!response.ok) {
              throw new Error(&quot;Failed to get address from coordinates&quot;);
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
              // Convert to LocationData format
              const placeData: LocationData = {
                id: data.results[0].id || &quot;&quot;,
                formattedAddress: data.results[0].formattedAddress || &quot;&quot;,
                displayName: data.results[0].displayName || &quot;Current Location&quot;,
                latitude:
                  data.results[0].geometry?.location?.latitude || latLng.lat,
                longitude:
                  data.results[0].geometry?.location?.longitude || latLng.lng,
                addressComponents: data.results[0].addressComponents || [],
                types: data.results[0].types || [],
                businessStatus: &quot;OPERATIONAL&quot;, // Default value
                plusCode: null, // Not using this field
              };

              setSelectedPlace(placeData);
              setIsInfoOpen(true);

              // Set form values
              form.setValue(&quot;name&quot;, placeData.displayName);

              // Set location type to business by default for current location
              form.setValue(&quot;locationType&quot;, &quot;business&quot;);
            } else {
              toast({
                variant: &quot;destructive&quot;,
                title: &quot;Address lookup failed&quot;,
                description: &quot;Could not determine address for your location.&quot;,
              });
            }
          } catch (error) {
            console.error(&quot;Reverse geocoding error:&quot;, error);
            toast({
              variant: &quot;destructive&quot;,
              title: &quot;Geocoding failed&quot;,
              description: &quot;Could not convert your coordinates to an address.&quot;,
            });
          }
        },
        (error) => {
          console.error(&quot;Geolocation error:&quot;, error);
          toast({
            variant: &quot;destructive&quot;,
            title: &quot;Location access failed&quot;,
            description: `Could not access your location: ${error.message}`,
          });
        },
      );
    } else {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Browser incompatible&quot;,
        description: &quot;Geolocation is not supported by your browser&quot;,
      });
    }
  }, [form, toast]);

  // Form submission handler
  const onSubmit = (values: LocationFormValues) => {
    if (!selectedPlace || !selectedLocation) {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Location required&quot;,
        description: &quot;Please select a location using the search tool.&quot;,
      });
      return;
    }

    // Extract address components
    const city =
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes(&quot;locality&quot;),
      )?.longText ||
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes(&quot;sublocality&quot;),
      )?.longText ||
      &quot;&quot;;

    const state =
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes(&quot;administrative_area_level_1&quot;),
      )?.longText || &quot;&quot;;

    const postalCode =
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes(&quot;postal_code&quot;),
      )?.longText || &quot;&quot;;

    // Prepare data for submission
    const submissionData = {
      name: values.name.trim(),
      address: selectedPlace.formattedAddress || &quot;&quot;,
      city,
      state,
      zipCode: postalCode,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      placeId: selectedPlace.id || &quot;&quot;,
      locationType: values.locationType,
      notes: values.notes?.trim() || &quot;&quot;,
    };

    submitMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&quot;max-w-4xl max-h-[90vh] overflow-y-auto&quot;>
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Search for a location and provide additional details to add it to
            the system.
          </DialogDescription>
        </DialogHeader>

        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6 py-4&quot;>
          <div className=&quot;space-y-6&quot;>
            <GoogleMapsProvider>
              <div className=&quot;space-y-4&quot;>
                <div className=&quot;flex gap-2&quot;>
                  <div className=&quot;flex-1&quot;>
                    <GooglePlacesInput
                      onPlaceSelected={handlePlaceSelected}
                      placeholder=&quot;Search for a location...&quot;
                      className=&quot;w-full&quot;
                    />
                  </div>
                  <Button
                    onClick={handleClearSearch}
                    variant=&quot;outline&quot;
                    size=&quot;sm&quot;
                    type=&quot;button&quot;
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleFindMyLocation}
                    variant=&quot;default&quot;
                    size=&quot;sm&quot;
                    type=&quot;button&quot;
                  >
                    My Location
                  </Button>
                </div>

                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={selectedLocation || defaultCenter}
                  zoom={selectedLocation ? 15 : 10}
                  onLoad={onMapLoad}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: true,
                    scaleControl: true,
                    streetViewControl: true,
                    rotateControl: false,
                    fullscreenControl: true,
                    mapId: mapId, // Add mapId for AdvancedMarkerElement support
                  }}
                >
                  {selectedLocation && window.google?.maps && (
                    <>
                      {/* Create the advanced marker element */}
                      <div id=&quot;marker-container&quot; className=&quot;hidden&quot;>
                        {(() => {
                          // Clean up previous marker if it exists
                          if (markerRef.current) {
                            markerRef.current.map = null;
                          }

                          // Create marker element with proper styling
                          if (
                            window.google?.maps?.marker?.AdvancedMarkerElement
                          ) {
                            // Create pin element
                            const pinElement = document.createElement(&quot;div&quot;);
                            pinElement.className = &quot;location-marker&quot;;
                            pinElement.style.width = &quot;24px&quot;;
                            pinElement.style.height = &quot;24px&quot;;
                            pinElement.style.borderRadius = &quot;50%&quot;;
                            pinElement.style.backgroundColor = &quot;blue&quot;;
                            pinElement.style.border = &quot;2px solid white&quot;;
                            pinElement.style.boxShadow =
                              &quot;0 2px 6px rgba(0,0,0,0.3)&quot;;
                            pinElement.style.cursor = &quot;pointer&quot;;
                            pinElement.title =
                              selectedPlace?.displayName || &quot;Selected location&quot;;

                            // Create the advanced marker
                            setTimeout(() => {
                              if (mapRef.current) {
                                markerRef.current =
                                  new window.google.maps.marker.AdvancedMarkerElement(
                                    {
                                      map: mapRef.current,
                                      position: selectedLocation,
                                      content: pinElement,
                                      title:
                                        selectedPlace?.displayName ||
                                        &quot;Selected location&quot;,
                                    },
                                  );
                              }
                            }, 0);
                          }

                          return null;
                        })()}
                      </div>

                      {/* Info window */}
                      {isInfoOpen && selectedPlace && (
                        <InfoWindow
                          position={selectedLocation}
                          onCloseClick={() => setIsInfoOpen(false)}
                          options={{
                            pixelOffset: new window.google.maps.Size(0, -40),
                            disableAutoPan: false,
                          }}
                        >
                          <div
                            className={`max-w-xs p-2 rounded-md ${
                              mapTheme === &quot;dark&quot;
                                ? &quot;bg-gray-800 text-white border border-gray-700&quot;
                                : &quot;bg-white text-gray-900&quot;
                            }`}
                            style={{
                              minWidth: &quot;200px&quot;,
                            }}
                          >
                            <h3 className=&quot;font-medium&quot;>
                              {selectedPlace.displayName || &quot;Selected Location&quot;}
                            </h3>
                            <p
                              className={`text-sm ${mapTheme === &quot;dark&quot; ? &quot;text-gray-300&quot; : &quot;text-gray-600&quot;}`}
                            >
                              {selectedPlace.formattedAddress}
                            </p>
                          </div>
                        </InfoWindow>
                      )}
                    </>
                  )}
                </GoogleMap>
              </div>
            </GoogleMapsProvider>

            {selectedPlace && (
              <div className=&quot;text-sm space-y-2 border rounded-md p-3 bg-muted/20&quot;>
                <div className=&quot;font-medium mb-1&quot;>Selected Location:</div>
                <div>{selectedPlace.formattedAddress}</div>
                {selectedPlace.addressComponents &&
                  selectedPlace.addressComponents.length > 0 && (
                    <div className=&quot;grid grid-cols-2 gap-2 mt-2 pt-2 border-t&quot;>
                      <div>
                        <span className=&quot;text-muted-foreground&quot;>City: </span>
                        <span className=&quot;font-medium&quot;>
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes(&quot;locality&quot;),
                          )?.longText || &quot;N/A&quot;}
                        </span>
                      </div>
                      <div>
                        <span className=&quot;text-muted-foreground&quot;>State: </span>
                        <span className=&quot;font-medium&quot;>
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes(&quot;administrative_area_level_1&quot;),
                          )?.longText || &quot;N/A&quot;}
                        </span>
                      </div>
                      <div>
                        <span className=&quot;text-muted-foreground&quot;>
                          Postal Code:{&quot; &quot;}
                        </span>
                        <span className=&quot;font-medium&quot;>
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes(&quot;postal_code&quot;),
                          )?.longText || &quot;N/A&quot;}
                        </span>
                      </div>
                      <div>
                        <span className=&quot;text-muted-foreground&quot;>Country: </span>
                        <span className=&quot;font-medium&quot;>
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes(&quot;country&quot;),
                          )?.longText || &quot;N/A&quot;}
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className=&quot;space-y-6&quot;
              >
                <FormField
                  control={form.control}
                  name=&quot;name&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name</FormLabel>
                      <FormControl>
                        <Input placeholder=&quot;Enter location name&quot; {...field} />
                      </FormControl>
                      <FormDescription>
                        Provide a clear, recognizable name for this location.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name=&quot;locationType&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select a location type&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value=&quot;business&quot;>Business</SelectItem>
                          <SelectItem value=&quot;venue&quot;>Venue</SelectItem>
                          <SelectItem value=&quot;office&quot;>Office</SelectItem>
                          <SelectItem value=&quot;warehouse&quot;>Warehouse</SelectItem>
                          <SelectItem value=&quot;retail&quot;>Retail Store</SelectItem>
                          <SelectItem value=&quot;restaurant&quot;>Restaurant</SelectItem>
                          <SelectItem value=&quot;landmark&quot;>Landmark</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Categorize this location for better organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name=&quot;notes&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=&quot;Add any special instructions or details about this location&quot;
                          className=&quot;min-h-[120px]&quot;
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional: Any important details about access, parking,
                        etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className=&quot;flex justify-end gap-2&quot;>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;outline&quot;
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type=&quot;submit&quot;
                    disabled={!selectedPlace || submitMutation.isPending}
                  >
                    {submitMutation.isPending
                      ? &quot;Submitting...&quot;
                      : &quot;Submit Location"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
