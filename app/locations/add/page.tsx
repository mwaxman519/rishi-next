&quot;use client&quot;;

import React, { useState, useRef, useCallback } from &quot;react&quot;;
import { ChevronLeft, Search, MapPin, Loader2 } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import * as z from &quot;zod&quot;;
import { useTheme } from &quot;next-themes&quot;;
import { useMutation } from &quot;@tanstack/react-query&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;

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

// Google Maps Components
import {
  GoogleMap,
  Marker,
  Autocomplete,
  LoadScript,
  InfoWindow,
} from &quot;@react-google-maps/api&quot;;

// Custom components
import ManualAddressEntry from &quot;@/components/locations/ManualAddressEntry&quot;;

// API Key and Configuration
const GOOGLE_MAPS_API_KEY = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;
// Define libraries array outside component to avoid reloading warning
// Use 'as any' to fix TypeScript error with the libraries prop
const libraries = [&quot;places&quot;] as any;

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
  notes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function AddLocationPage() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const { toast } = useToast();

  // Search and Map References
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // UI State
  const [activeTab, setActiveTab] = useState(&quot;google-search&quot;);

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
      notes: &quot;&quot;,
    },
  });

  // Submit Mutation
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
      router.push(&quot;/locations&quot;);
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
      notes: values.notes?.trim() || &quot;&quot;,
    };

    // Submit the data
    submitMutation.mutate(submissionData);
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center gap-2&quot;>
        <Button variant=&quot;ghost&quot; size=&quot;sm&quot; className=&quot;gap-1&quot; asChild>
          <Link href=&quot;/locations&quot;>
            <ChevronLeft className=&quot;h-4 w-4&quot; />
            Back to Locations
          </Link>
        </Button>
      </div>

      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Add New Location</h1>
      </div>

      <p className=&quot;text-muted-foreground&quot;>
        Submit a new location for approval. Once approved, it will be available
        for booking and scheduling.
      </p>

      <Alert className=&quot;bg-primary/5 border-primary/20 mb-6&quot;>
        <MapPin className=&quot;h-4 w-4 text-primary&quot; />
        <AlertTitle>Location Search</AlertTitle>
        <AlertDescription>
          Search for addresses or businesses, use your current location, or
          click directly on the map to select a location.
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
                  <LoadScript
                    googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                  >
                    <div className=&quot;space-y-4&quot;>
                      <div className=&quot;flex gap-2&quot;>
                        <div className=&quot;flex-1 relative&quot;>
                          <div className=&quot;absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none&quot;>
                            <Search className=&quot;h-4 w-4 text-muted-foreground&quot; />
                          </div>
                          <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                              types: [&quot;establishment&quot;, &quot;geocode&quot;],
                              fields: [
                                &quot;address_components&quot;,
                                &quot;formatted_address&quot;,
                                &quot;geometry&quot;,
                                &quot;name&quot;,
                                &quot;place_id&quot;,
                                &quot;types&quot;,
                                &quot;vicinity&quot;,
                              ],
                            }}
                          >
                            <input
                              ref={inputRef}
                              type=&quot;text&quot;
                              placeholder=&quot;Search for a location...&quot;
                              className=&quot;w-full pl-10 pr-4 py-3 border border-input bg-background rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none&quot;
                            />
                          </Autocomplete>
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
                        }}
                      >
                        {selectedLocation && (
                          <Marker
                            position={selectedLocation}
                            title={selectedPlace?.name || &quot;Selected location&quot;}
                            animation={window.google?.maps.Animation.DROP}
                          >
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
                          </Marker>
                        )}
                      </GoogleMap>
                    </div>
                  </LoadScript>
                </TabsContent>

                <TabsContent value=&quot;manual-entry&quot; className=&quot;space-y-4&quot;>
                  <ManualAddressEntry
                    onLocationSelect={(locationData) => {
                      // Convert the manual address entry data to a format compatible with our form
                      const formattedAddress = `${locationData.address1}${locationData.address2 ? &quot;, &quot; + locationData.address2 : &quot;&quot;}, ${locationData.city}, ${locationData.state} ${locationData.zipcode}`;

                      // Create a place-like object
                      const place = {
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
                          locationData.name || formattedAddress.split(&quot;,&quot;)[0],
                      };

                      // Set form values - ensure we have a non-empty string as name
                      const locationName =
                        locationData.name ||
                        (formattedAddress
                          ? formattedAddress.split(&quot;,&quot;)[0]
                          : &quot;&quot;) ||
                        &quot;New Location&quot;;
                      form.setValue(&quot;name&quot;, locationName);

                      // Update state with the selected place
                      setSelectedPlace(place as any);

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
                onClick={() => router.push(&quot;/locations&quot;)}
                className=&quot;mr-2&quot;
              >
                Cancel
              </Button>
              <Button
                type=&quot;submit&quot;
                form=&quot;location-form&quot;
                disabled={!selectedPlace || submitMutation.isPending}
              >
                {submitMutation.isPending ? &quot;Submitting...&quot; : &quot;Submit Location"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
