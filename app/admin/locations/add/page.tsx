&quot;use client&quot;;

import React, { useState, useRef, useCallback, useEffect } from &quot;react&quot;;
import {
  ChevronLeft,
  Search,
  MapPin,
  Loader2,
  Plus,
  Check,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import * as z from &quot;zod&quot;;
import { useTheme } from &quot;next-themes&quot;;
import { useMutation } from &quot;@tanstack/react-query&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// UI Components
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
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
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;

// Google Maps Components
import { GoogleMap, InfoWindow } from &quot;@react-google-maps/api&quot;;
import { useGoogleMaps } from &quot;@/hooks/useGoogleMaps&quot;;

// Custom components
import ManualAddressEntry from &quot;@/components/locations/ManualAddressEntry&quot;;
import PlaceAutocompleteAddressPicker from &quot;@/components/locations/PlaceAutocompleteAddressPicker&quot;;

// API Key and Configuration
const GOOGLE_MAPS_API_KEY = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;
// Map ID for AdvancedMarkerElement support - Using our default Map ID
const DEFAULT_MAP_ID = &quot;8f718a3abe8b23eb&quot;;

// Map Container Style
const containerStyle = {
  width: &quot;100%&quot;,
  height: &quot;400px&quot;,
  borderRadius: &quot;0.5rem&quot;,
};

// Default Map Center (San Francisco)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

// Form Schema for Location Data
const locationFormSchema = z.object({
  name: z.string().min(2, { message: &quot;Name must be at least 2 characters.&quot; }),
  locationType: z
    .string()
    .min(1, { message: &quot;Please select a location type.&quot; }),
  status: z.string().min(1, { message: &quot;Please select a status.&quot; }),
  notes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function AdminAddLocationPage() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const { isLoaded, mapId } = useGoogleMaps();

  // UI State
  const [activeTab, setActiveTab] = useState(&quot;google-search&quot;);

  // Search and Map References
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<any>(null); // Reference for the advanced marker

  // Location State
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<&quot;light&quot; | &quot;dark&quot;>(&quot;light&quot;);

  // Form Setup
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "&quot;,
      locationType: &quot;business&quot;,
      status: &quot;active&quot;,
      notes: &quot;&quot;,
    },
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const res = await fetch(&quot;/api/admin/locations&quot;, {
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
        title: &quot;Location added successfully&quot;,
        description: &quot;The location has been added to the system.&quot;,
      });
      router.push(&quot;/admin/locations&quot;);
    },
    onError: (error: Error) => {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Submission failed&quot;,
        description: error.message,
      });
    },
  });

  // Theme Change Effect
  React.useEffect(() => {
    const currentTheme = resolvedTheme === &quot;dark&quot; ? &quot;dark&quot; : &quot;light&quot;;
    setMapTheme(currentTheme);

    if (mapRef.current && window.google?.maps) {
      applyMapStyle(mapRef.current, currentTheme);
    }
  }, [resolvedTheme]);

  // Apply Map Styling Based on Theme
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

  // Map Load Handler
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

  // Autocomplete Load Handler
  const onAutocompleteLoad = useCallback(
    (autocomplete: google.maps.places.Autocomplete) => {
      autocompleteRef.current = autocomplete;

      // Set the fields we want to retrieve from the Places API
      autocomplete.setFields([
        &quot;address_components&quot;,
        &quot;formatted_address&quot;,
        &quot;geometry&quot;,
        &quot;name&quot;,
        &quot;place_id&quot;,
        &quot;types&quot;,
        &quot;vicinity&quot;,
      ]);
    },
    [],
  );

  // Place Changed Handler
  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) {
      console.error(&quot;Autocomplete reference not available&quot;);
      return;
    }

    try {
      const place = autocompleteRef.current.getPlace();
      console.log(&quot;Place selected:&quot;, place);

      if (!place.geometry || !place.geometry.location) {
        console.error(&quot;⚠️ Selected place has no geometry location&quot;);
        return;
      }

      const location = place.geometry.location;
      const latLng = {
        lat: location.lat(),
        lng: location.lng(),
      };

      console.log(&quot;✅ Selected location:&quot;, latLng);
      console.log(&quot;✅ Selected place:&quot;, place);

      // Update state with the selected place information
      setSelectedLocation(latLng);
      setSelectedPlace(place);
      setIsInfoOpen(true);

      // Center and zoom the map
      if (mapRef.current) {
        mapRef.current.panTo(latLng);
        mapRef.current.setZoom(15);
      }

      // Set form values from place data
      if (place.name) {
        form.setValue(&quot;name&quot;, place.name);
      }

      // Set location type based on place types
      if (place.types && place.types.length > 0) {
        if (place.types.includes(&quot;restaurant&quot;)) {
          form.setValue(&quot;locationType&quot;, &quot;restaurant&quot;);
        } else if (place.types.includes(&quot;store&quot;)) {
          form.setValue(&quot;locationType&quot;, &quot;retail&quot;);
        } else if (place.types.includes(&quot;office&quot;)) {
          form.setValue(&quot;locationType&quot;, &quot;office&quot;);
        } else if (place.types.includes(&quot;establishment&quot;)) {
          form.setValue(&quot;locationType&quot;, &quot;business&quot;);
        } else {
          form.setValue(&quot;locationType&quot;, &quot;business&quot;);
        }
      }
    } catch (error) {
      console.error(&quot;Error in onPlaceChanged:&quot;, error);
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Error selecting location&quot;,
        description:
          &quot;There was a problem with the location selection. Please try again.&quot;,
      });
    }
  }, [form, toast]);

  // Clear Search Handler
  const handleClearSearch = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = &quot;&quot;;
    }
    setSelectedPlace(null);
    setSelectedLocation(null);
    setIsInfoOpen(false);

    // Reset form fields
    form.setValue(&quot;name&quot;, &quot;&quot;);
  }, [form]);

  // Find My Location Handler
  const handleFindMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
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

          // Perform reverse geocoding to get address
          if (window.google && window.google.maps) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: latLng }, (results, status) => {
              if (status === &quot;OK&quot; && results && results[0]) {
                setSelectedPlace(results[0]);
                setIsInfoOpen(true);

                // Set form name based on place data
                const result = results[0];
                // Try to extract a name from formatted address if direct name property isn&apos;t available
                const addressName =
                  result.formatted_address?.split(&quot;,&quot;)[0] || &quot;&quot;;
                form.setValue(
                  &quot;name&quot;,
                  (result as any).name || addressName || &quot;New Location&quot;,
                );
              } else {
                console.error(`Geocoder failed: ${status}`);
              }
            });
          }
        },
        (error) => {
          console.error(&quot;Geolocation error:&quot;, error);
          toast({
            variant: &quot;destructive&quot;,
            title: &quot;Geolocation error&quot;,
            description:
              &quot;Unable to access your current location. Please check your browser permissions.&quot;,
          });
        },
      );
    } else {
      console.error(&quot;Geolocation is not supported by this browser&quot;);
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Not supported&quot;,
        description: &quot;Geolocation is not supported by your browser.&quot;,
      });
    }
  }, [form, toast]);

  // Extract Address Components
  const getAddressComponent = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    type: string,
  ): string => {
    if (!components) return &quot;&quot;;

    const component = components.find((comp) => comp.types.includes(type));

    return component ? component.long_name : &quot;&quot;;
  };

  // Form Submission Handler
  const onSubmit = (values: LocationFormValues) => {
    if (!selectedPlace) {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Location required&quot;,
        description:
          &quot;Please select a location using either the search tool or manual address entry.&quot;,
      });
      return;
    }

    // Extract address components
    const city =
      getAddressComponent(selectedPlace.address_components, &quot;locality&quot;) ||
      getAddressComponent(selectedPlace.address_components, &quot;sublocality&quot;) ||
      &quot;&quot;;
    const state =
      getAddressComponent(
        selectedPlace.address_components,
        &quot;administrative_area_level_1&quot;,
      ) || &quot;&quot;;
    const postalCode =
      getAddressComponent(selectedPlace.address_components, &quot;postal_code&quot;) ||
      &quot;&quot;;

    // Prepare data for submission
    const submissionData = {
      name: values.name.trim(),
      address: selectedPlace.formatted_address || &quot;&quot;,
      city,
      state,
      zipCode: postalCode,
      latitude: selectedLocation?.lat || 0, // Use 0 if coordinates are not available
      longitude: selectedLocation?.lng || 0, // Use 0 if coordinates are not available
      placeId: selectedPlace.place_id || &quot;&quot;,
      locationType: values.locationType,
      status: values.status,
      approved: true, // Admin locations are approved by default
      notes: values.notes?.trim() || &quot;&quot;,
    };

    // Submit the data
    submitMutation.mutate(submissionData);
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center gap-2&quot;>
        <Button variant=&quot;ghost&quot; size=&quot;sm&quot; className=&quot;gap-1&quot; asChild>
          <Link href=&quot;/admin/locations&quot;>
            <ChevronLeft className=&quot;h-4 w-4&quot; />
            Back to Admin Locations
          </Link>
        </Button>
      </div>

      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
          Add New Location (Admin)
        </h1>
      </div>

      <p className=&quot;text-muted-foreground&quot;>
        As an administrator, you can directly add new locations to the system
        without requiring approval.
      </p>

      <Alert className=&quot;bg-primary/5 border-primary/20 mb-6&quot;>
        <MapPin className=&quot;h-4 w-4 text-primary&quot; />
        <AlertTitle>Location Management</AlertTitle>
        <AlertDescription>
          Search for addresses or businesses, add manual addresses, or use your
          current location. New locations will be immediately available in the
          system.
        </AlertDescription>
      </Alert>

      <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-8&quot;>
        <div className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Find Location</CardTitle>
              <CardDescription>
                Search for addresses, businesses, or add a location manually
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className=&quot;w-full&quot;
              >
                <TabsList className=&quot;grid w-full grid-cols-2 mb-4&quot;>
                  <TabsTrigger value=&quot;google-search&quot;>
                    Google Maps Search
                  </TabsTrigger>
                  <TabsTrigger value=&quot;manual-entry&quot;>Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value=&quot;google-search&quot; className=&quot;space-y-4&quot;>
                  <div className=&quot;space-y-4&quot;>
                    <div className=&quot;flex gap-2&quot;>
                      <div className=&quot;flex-1 relative&quot;>
                        {/* Using PlaceAutocompleteAddressPicker component instead of deprecated Autocomplete */}
                        <PlaceAutocompleteAddressPicker
                          onAddressSelect={(addressData) => {
                            console.log(&quot;Address selected:&quot;, addressData);

                            // Set the selected location for the map
                            const location = {
                              lat: addressData.latitude,
                              lng: addressData.longitude,
                            };

                            setSelectedLocation(location);

                            // Create a place-like object for compatibility with existing code
                            const placeData: google.maps.places.PlaceResult = {
                              formatted_address: addressData.formatted_address,
                              address_components:
                                addressData.address_components,
                              geometry: {
                                location: new google.maps.LatLng(
                                  addressData.latitude,
                                  addressData.longitude,
                                ),
                                viewport: new google.maps.LatLngBounds(
                                  new google.maps.LatLng(
                                    addressData.latitude - 0.01,
                                    addressData.longitude - 0.01,
                                  ),
                                  new google.maps.LatLng(
                                    addressData.latitude + 0.01,
                                    addressData.longitude + 0.01,
                                  ),
                                ),
                              },
                              place_id: addressData.place_id,
                              name:
                                addressData.name ||
                                addressData.formatted_address.split(&quot;,&quot;)[0] ||
                                &quot;New Location&quot;,
                              types: addressData.address_components.flatMap(
                                (comp) => comp.types || [],
                              ),
                            };

                            // Use type assertion to help TypeScript understand this is compatible
                            setSelectedPlace(
                              placeData as google.maps.places.PlaceResult,
                            );
                            setIsInfoOpen(true);

                            // Set the place name in the form - ensure we have a non-empty string
                            form.setValue(
                              &quot;name&quot;,
                              addressData.name ||
                                addressData.formatted_address.split(&quot;,&quot;)[0] ||
                                &quot;New Location&quot;,
                            );

                            // Center the map on the selected location
                            if (mapRef.current) {
                              mapRef.current.panTo(location);
                              mapRef.current.setZoom(15);
                            }

                            // Determine location type from address components if available
                            const placeTypes =
                              addressData.address_components.flatMap(
                                (component) => component.types || [],
                              );

                            if (placeTypes.includes(&quot;restaurant&quot;)) {
                              form.setValue(&quot;locationType&quot;, &quot;restaurant&quot;);
                            } else if (placeTypes.includes(&quot;store&quot;)) {
                              form.setValue(&quot;locationType&quot;, &quot;retail&quot;);
                            } else if (placeTypes.includes(&quot;office&quot;)) {
                              form.setValue(&quot;locationType&quot;, &quot;office&quot;);
                            } else {
                              form.setValue(&quot;locationType&quot;, &quot;business&quot;);
                            }
                          }}
                          className=&quot;mb-2&quot;
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

                    {window.google?.maps ? (
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
                          mapId: mapId, // Use mapId from the context
                        }}
                      >
                        {selectedLocation && window.google?.maps && (
                          <>
                            {/* Create the advanced marker element */}
                            <div id=&quot;marker-container&quot; className=&quot;hidden&quot;>
                              {(() => {
                                // Create marker element with proper styling
                                if (
                                  window.google?.maps?.marker
                                    ?.AdvancedMarkerElement &&
                                  mapRef.current
                                ) {
                                  // Create pin element
                                  const pinElement =
                                    document.createElement(&quot;div&quot;);
                                  pinElement.className = &quot;location-marker&quot;;
                                  pinElement.style.width = &quot;36px&quot;;
                                  pinElement.style.height = &quot;36px&quot;;
                                  pinElement.style.borderRadius = &quot;50%&quot;;
                                  pinElement.style.backgroundColor = &quot;blue&quot;;
                                  pinElement.style.border = &quot;2px solid white&quot;;
                                  pinElement.style.boxShadow =
                                    &quot;0 2px 6px rgba(0,0,0,0.3)&quot;;
                                  pinElement.style.cursor = &quot;pointer&quot;;
                                  pinElement.title =
                                    selectedPlace?.name || &quot;Selected location&quot;;

                                  // Create the advanced marker
                                  setTimeout(() => {
                                    try {
                                      const advancedMarker =
                                        new window.google.maps.marker.AdvancedMarkerElement(
                                          {
                                            map: mapRef.current,
                                            position: selectedLocation,
                                            content: pinElement,
                                            title:
                                              selectedPlace?.name ||
                                              &quot;Selected location&quot;,
                                          },
                                        );
                                    } catch (error) {
                                      console.error(
                                        &quot;Failed to create advanced marker:&quot;,
                                        error,
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
                                  pixelOffset: new window.google.maps.Size(
                                    0,
                                    -40,
                                  ),
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
                                    {selectedPlace.name || &quot;Selected Location&quot;}
                                  </h3>
                                  <p
                                    className={`text-sm ${mapTheme === &quot;dark&quot; ? &quot;text-gray-300&quot; : &quot;text-gray-600&quot;}`}
                                  >
                                    {selectedPlace.formatted_address}
                                  </p>
                                </div>
                              </InfoWindow>
                            )}
                          </>
                        )}
                      </GoogleMap>
                    ) : (
                      <div
                        className=&quot;flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md&quot;
                        style={{
                          width: &quot;100%&quot;,
                          height: &quot;400px&quot;,
                        }}
                      >
                        <div className=&quot;flex flex-col items-center text-center p-4&quot;>
                          <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-2&quot; />
                          <p className=&quot;text-muted-foreground&quot;>
                            Loading Google Maps...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value=&quot;manual-entry&quot; className=&quot;space-y-4&quot;>
                  <ManualAddressEntry
                    onLocationSelect={(locationData) => {
                      // Convert the manual address entry data to a format compatible with our form
                      const formattedAddress = `${locationData.address1}${locationData.address2 ? &quot;, &quot; + locationData.address2 : &quot;&quot;}, ${locationData.city}, ${locationData.state} ${locationData.zipcode}`;

                      // Create a place-like object with properly shaped Google Maps types
                      const place: google.maps.places.PlaceResult = {
                        formatted_address: formattedAddress,
                        address_components: [
                          {
                            long_name: locationData.address1,
                            short_name: locationData.address1,
                            types: [&quot;street_number&quot;, &quot;route&quot;],
                          },
                          {
                            long_name: locationData.city,
                            short_name: locationData.city,
                            types: [&quot;locality&quot;],
                          },
                          {
                            long_name: locationData.state,
                            short_name: locationData.state,
                            types: [&quot;administrative_area_level_1&quot;],
                          },
                          {
                            long_name: locationData.zipcode,
                            short_name: locationData.zipcode,
                            types: [&quot;postal_code&quot;],
                          },
                        ],
                        place_id: &quot;&quot;,
                        name:
                          locationData.name ||
                          formattedAddress.split(&quot;,&quot;)[0] ||
                          &quot;New Location&quot;,
                      };

                      // Add geometry if coordinates are available
                      if (locationData.latitude && locationData.longitude) {
                        place.geometry = {
                          location: new google.maps.LatLng(
                            locationData.latitude,
                            locationData.longitude,
                          ),
                          viewport: new google.maps.LatLngBounds(
                            new google.maps.LatLng(
                              locationData.latitude - 0.01,
                              locationData.longitude - 0.01,
                            ),
                            new google.maps.LatLng(
                              locationData.latitude + 0.01,
                              locationData.longitude + 0.01,
                            ),
                          ),
                        };
                      }

                      // Set form values - ensure we have a non-empty string as name
                      const locationName =
                        locationData.name ||
                        (formattedAddress
                          ? formattedAddress.split(&quot;,&quot;)[0]
                          : &quot;&quot;) ||
                        &quot;New Location&quot;;
                      form.setValue(&quot;name&quot;, locationName);

                      // Update state with the selected place
                      setSelectedPlace(place as google.maps.places.PlaceResult);

                      // If coordinates are available, set those too
                      if (locationData.latitude && locationData.longitude) {
                        setSelectedLocation({
                          lat: locationData.latitude,
                          lng: locationData.longitude,
                        });
                      }
                    }}
                    onToggleSearchMode={() => setActiveTab(&quot;google-search&quot;)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {selectedPlace && (
            <Card>
              <CardHeader>
                <CardTitle>Selected Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-4&quot;>
                  <div>
                    <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Address
                    </h3>
                    <p className=&quot;font-medium&quot;>
                      {selectedPlace.formatted_address}
                    </p>
                  </div>

                  <Separator />

                  <div className=&quot;grid grid-cols-2 gap-4&quot;>
                    {selectedPlace.address_components && (
                      <>
                        <div>
                          <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                            City
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              &quot;locality&quot;,
                            ) ||
                              getAddressComponent(
                                selectedPlace.address_components,
                                &quot;sublocality&quot;,
                              ) ||
                              &quot;N/A&quot;}
                          </p>
                        </div>
                        <div>
                          <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                            State/Province
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              &quot;administrative_area_level_1&quot;,
                            ) || &quot;N/A&quot;}
                          </p>
                        </div>
                        <div>
                          <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                            Postal Code
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              &quot;postal_code&quot;,
                            ) || &quot;N/A&quot;}
                          </p>
                        </div>
                        <div>
                          <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                            Country
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              &quot;country&quot;,
                            ) || &quot;N/A&quot;}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className=&quot;grid grid-cols-2 gap-4&quot;>
                    <div>
                      <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                        Latitude
                      </h3>
                      <p className=&quot;font-mono text-sm&quot;>
                        {selectedLocation
                          ? selectedLocation.lat.toFixed(6)
                          : &quot;N/A&quot;}
                      </p>
                    </div>
                    <div>
                      <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                        Longitude
                      </h3>
                      <p className=&quot;font-mono text-sm&quot;>
                        {selectedLocation
                          ? selectedLocation.lng.toFixed(6)
                          : &quot;N/A&quot;}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Location Details</CardTitle>
              <CardDescription>
                Provide information about this location
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  id=&quot;location-form&quot;
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
                            <SelectItem value=&quot;restaurant&quot;>
                              Restaurant
                            </SelectItem>
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
                    name=&quot;status&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder=&quot;Select status&quot; />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=&quot;active&quot;>
                              <div className=&quot;flex items-center gap-2&quot;>
                                <div className=&quot;h-2 w-2 rounded-full bg-green-500&quot;></div>
                                <span>Active</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=&quot;inactive&quot;>
                              <div className=&quot;flex items-center gap-2&quot;>
                                <div className=&quot;h-2 w-2 rounded-full bg-gray-400&quot;></div>
                                <span>Inactive</span>
                              </div>
                            </SelectItem>
                            <SelectItem value=&quot;pending&quot;>
                              <div className=&quot;flex items-center gap-2&quot;>
                                <div className=&quot;h-2 w-2 rounded-full bg-yellow-500&quot;></div>
                                <span>Pending Review</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Set the current status of this location.
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
                </form>
              </Form>
            </CardContent>
            <CardFooter className=&quot;flex justify-end&quot;>
              <Button
                variant=&quot;outline&quot;
                onClick={() => router.push(&quot;/admin/locations&quot;)}
                className=&quot;mr-2&quot;
              >
                Cancel
              </Button>
              <Button
                type=&quot;submit&quot;
                form=&quot;location-form&quot;
                disabled={!selectedPlace || submitMutation.isPending}
              >
                {submitMutation.isPending ? &quot;Submitting...&quot; : &quot;Add Location"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
