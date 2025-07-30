&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { z } from &quot;zod&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useMutation } from &quot;@tanstack/react-query&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { Loader2, MapPin, Info, CheckCircle } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { RadioGroup, RadioGroupItem } from &quot;@/components/ui/radio-group&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import { useGoogleMaps } from &quot;@/contexts/GoogleMapsContext&quot;;

// Define the schema for location submission
const locationFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: &quot;Location name must be at least 3 characters&quot; }),
  address: z
    .string()
    .min(5, { message: &quot;Address must be at least 5 characters&quot; }),
  city: z.string().min(2, { message: &quot;City is required&quot; }),
  state: z.string().min(2, { message: &quot;State is required&quot; }),
  zipCode: z.string().min(5, { message: &quot;Zip code is required&quot; }),
  latitude: z.number().or(z.string().transform((val) => parseFloat(val))),
  longitude: z.number().or(z.string().transform((val) => parseFloat(val))),
  locationType: z.enum([&quot;venue&quot;, &quot;service_area&quot;], {
    required_error: &quot;Please select a location type&quot;,
  }),
  notes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

// Default values for the form
const defaultValues: Partial<LocationFormValues> = {
  locationType: &quot;venue&quot;,
  notes: "&quot;,
};

export default function AddLocationForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [searchBox, setSearchBox] =
    useState<google.maps.places.SearchBox | null>(null);
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { isLoaded } = useGoogleMaps();

  // Initialize the form with react-hook-form
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues,
  });

  // Get latitude and longitude values from the form
  const latitude = form.watch(&quot;latitude&quot;);
  const longitude = form.watch(&quot;longitude&quot;);

  // Setup mutation for submitting the location
  const mutation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      const response = await fetch(&quot;/api/locations&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to submit location&quot;);
      }

      return response.json();
    },
    onSuccess: () => {
      setFormSubmitted(true);
      toast({
        title: &quot;Location submitted successfully&quot;,
        description: &quot;Your location has been submitted for approval.&quot;,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Submission failed&quot;,
        description: error.message,
      });
    },
  });

  // Initialize Google Maps and related services
  useEffect(() => {
    if (!isLoaded) return;

    // Create a map instance
    const mapDiv = document.getElementById(&quot;location-map&quot;);
    if (!mapDiv) return;

    const map = new google.maps.Map(mapDiv, {
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      zoom: 12,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    // Create a marker for the selected location
    const newMarker = new google.maps.Marker({
      map,
      draggable: true,
      position: { lat: 40.7128, lng: -74.006 },
      animation: google.maps.Animation.DROP,
    });

    // Create a search box
    const input = document.getElementById(&quot;pac-input&quot;) as HTMLInputElement;
    if (!input) return;

    const searchBoxInstance = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Create a geocoder
    const geocoderInstance = new google.maps.Geocoder();

    // Set up map event listeners
    map.addListener(&quot;bounds_changed&quot;, () => {
      searchBoxInstance.setBounds(map.getBounds() as google.maps.LatLngBounds);
    });

    // Handle search box place selection
    searchBoxInstance.addListener(&quot;places_changed&quot;, () => {
      const places = searchBoxInstance.getPlaces();
      if (!places || places.length === 0) return;

      const place = places[0];
      if (!place.geometry || !place.geometry.location) return;

      // Update the map and marker
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }

      newMarker.setPosition(place.geometry.location);

      // Update form with place details
      if (place.address_components) {
        updateFormFromPlace(place);
      }

      // Update form with coordinates
      form.setValue(&quot;latitude&quot;, place.geometry.location.lat());
      form.setValue(&quot;longitude&quot;, place.geometry.location.lng());
    });

    // Handle marker drag events
    newMarker.addListener(&quot;dragend&quot;, () => {
      const position = newMarker.getPosition();
      if (!position) return;

      const lat = position.lat();
      const lng = position.lng();

      form.setValue(&quot;latitude&quot;, lat);
      form.setValue(&quot;longitude&quot;, lng);

      // Reverse geocode to get address details
      geocoderInstance.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === &quot;OK&quot; && results && results[0]) {
            updateFormFromPlace(results[0]);
          }
        },
      );
    });

    // Store instances for later use
    setMapInstance(map);
    setMarker(newMarker);
    setSearchBox(searchBoxInstance);
    setGeocoder(geocoderInstance);
    setIsMapLoaded(true);

    // Cleanup function
    return () => {
      // Clean up event listeners if needed
    };
  }, [isLoaded, form]);

  // Update form fields from a place result
  const updateFormFromPlace = (
    place: google.maps.places.PlaceResult | google.maps.GeocoderResult,
  ) => {
    let street = &quot;&quot;;
    let city = &quot;&quot;;
    let state = &quot;&quot;;
    let zipCode = &quot;&quot;;

    // Extract address components
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes(&quot;street_number&quot;)) {
          street = component.long_name + &quot; &quot; + street;
        } else if (types.includes(&quot;route&quot;)) {
          street += component.long_name;
        } else if (types.includes(&quot;locality&quot;)) {
          city = component.long_name;
        } else if (types.includes(&quot;administrative_area_level_1&quot;)) {
          state = component.short_name;
        } else if (types.includes(&quot;postal_code&quot;)) {
          zipCode = component.long_name;
        }
      }
    }

    // Update form values
    if (street) form.setValue(&quot;address&quot;, street);
    if (city) form.setValue(&quot;city&quot;, city);
    if (state) form.setValue(&quot;state&quot;, state);
    if (zipCode) form.setValue(&quot;zipCode&quot;, zipCode);

    // Update location name with formatted address if empty
    if (!form.getValues(&quot;name&quot;) && place.formatted_address) {
      form.setValue(
        &quot;name&quot;,
        place.name || place.formatted_address.split(&quot;,&quot;)[0],
      );
    }
  };

  // Update marker position when lat/lng changes
  useEffect(() => {
    if (!marker || !mapInstance || !latitude || !longitude) return;

    const position = new google.maps.LatLng(latitude, longitude);
    marker.setPosition(position);
    mapInstance.panTo(position);
  }, [latitude, longitude, marker, mapInstance]);

  // Handle form submission
  const onSubmit = (data: LocationFormValues) => {
    mutation.mutate(data);
  };

  // Handle clicking back to locations list
  const handleBackToList = () => {
    router.push(&quot;/locations&quot;);
  };

  // Handle clicking submit another location
  const handleSubmitAnother = () => {
    form.reset(defaultValues);
    setFormSubmitted(false);
  };

  // If form was submitted successfully, show success message
  if (formSubmitted) {
    return (
      <Card className=&quot;w-full&quot;>
        <CardHeader>
          <CardTitle className=&quot;flex items-center&quot;>
            <CheckCircle className=&quot;h-6 w-6 text-green-500 mr-2&quot; />
            Location Submitted Successfully
          </CardTitle>
          <CardDescription>
            Your location has been submitted and is pending approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert
            variant=&quot;default&quot;
            className=&quot;mb-4 bg-green-50 border-green-200&quot;
          >
            <CheckCircle className=&quot;h-4 w-4 text-green-600&quot; />
            <AlertTitle>Submission successful</AlertTitle>
            <AlertDescription>
              Your location request has been submitted for review by an
              administrator. You'll be notified when it&apos;s approved or if
              additional information is needed.
            </AlertDescription>
          </Alert>

          <dl className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4 text-sm&quot;>
            <div>
              <dt className=&quot;font-medium&quot;>Location Name</dt>
              <dd>{form.getValues(&quot;name&quot;)}</dd>
            </div>
            <div>
              <dt className=&quot;font-medium&quot;>Address</dt>
              <dd>{form.getValues(&quot;address&quot;)}</dd>
            </div>
            <div>
              <dt className=&quot;font-medium&quot;>City</dt>
              <dd>{form.getValues(&quot;city&quot;)}</dd>
            </div>
            <div>
              <dt className=&quot;font-medium&quot;>State</dt>
              <dd>{form.getValues(&quot;state&quot;)}</dd>
            </div>
            <div>
              <dt className=&quot;font-medium&quot;>Zip Code</dt>
              <dd>{form.getValues(&quot;zipCode&quot;)}</dd>
            </div>
            <div>
              <dt className=&quot;font-medium&quot;>Location Type</dt>
              <dd className=&quot;capitalize&quot;>
                {form.getValues(&quot;locationType&quot;).replace(&quot;_&quot;, &quot; &quot;)}
              </dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className=&quot;flex flex-col sm:flex-row gap-3 sm:justify-end&quot;>
          <Button variant=&quot;outline&quot; onClick={handleBackToList}>
            Back to Locations
          </Button>
          <Button onClick={handleSubmitAnother}>Submit Another Location</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className=&quot;space-y-6&quot;>
      <Card>
        <CardHeader>
          <CardTitle className=&quot;flex items-center&quot;>
            <MapPin className=&quot;mr-2 h-5 w-5&quot; />
            Submit a New Location
          </CardTitle>
          <CardDescription>
            Submit a new location or service area for approval. Once approved,
            it can be used for bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;mb-6&quot;>
            <Alert variant=&quot;info&quot; className=&quot;mb-4&quot;>
              <Info className=&quot;h-4 w-4&quot; />
              <AlertTitle>How location approval works</AlertTitle>
              <AlertDescription>
                Submitted locations require approval before they can be used in
                booking portals. Please provide accurate information to expedite
                the review process.
              </AlertDescription>
            </Alert>
          </div>

          {!isLoaded ? (
            <div className=&quot;flex items-center justify-center py-10&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
              <span className=&quot;ml-3&quot;>Loading map...</span>
            </div>
          ) : (
            <div className=&quot;space-y-8&quot;>
              <div>
                <div className=&quot;rounded-lg overflow-hidden&quot;>
                  <div className=&quot;relative mb-4&quot;>
                    <input
                      id=&quot;pac-input&quot;
                      className=&quot;w-full h-10 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary z-10 relative bg-white&quot;
                      type=&quot;text&quot;
                      placeholder=&quot;Search for a location...&quot;
                    />
                  </div>
                  <div
                    id=&quot;location-map&quot;
                    className=&quot;w-full h-[400px] rounded-lg border&quot;
                  ></div>
                </div>

                <p className=&quot;text-sm text-muted-foreground mt-2&quot;>
                  Search for a location or drag the pin to position it
                  precisely.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className=&quot;space-y-6&quot;
                >
                  <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                    <FormField
                      control={form.control}
                      name=&quot;name&quot;
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=&quot;Enter location name&quot;
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Provide a descriptive name for this location.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;locationType&quot;
                      render={({ field }) => (
                        <FormItem className=&quot;space-y-3&quot;>
                          <FormLabel>Location Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className=&quot;flex flex-col space-y-1&quot;
                            >
                              <FormItem className=&quot;flex items-center space-x-3 space-y-0&quot;>
                                <FormControl>
                                  <RadioGroupItem value=&quot;venue&quot; />
                                </FormControl>
                                <FormLabel className=&quot;font-normal&quot;>
                                  Venue (Physical Location)
                                </FormLabel>
                              </FormItem>
                              <FormItem className=&quot;flex items-center space-x-3 space-y-0&quot;>
                                <FormControl>
                                  <RadioGroupItem value=&quot;service_area&quot; />
                                </FormControl>
                                <FormLabel className=&quot;font-normal&quot;>
                                  Service Area
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;address&quot;
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=&quot;Enter street address&quot;
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;city&quot;
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder=&quot;Enter city&quot; {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;state&quot;
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder=&quot;Enter state&quot; {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;zipCode&quot;
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder=&quot;Enter zip code&quot; {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;latitude&quot;
                      render={({ field: { onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=&quot;Latitude (set by map)&quot;
                              {...rest}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  onChange(value);
                                } else {
                                  onChange(e.target.value);
                                }
                              }}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name=&quot;longitude&quot;
                      render={({ field: { onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder=&quot;Longitude (set by map)&quot;
                              {...rest}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  onChange(value);
                                } else {
                                  onChange(e.target.value);
                                }
                              }}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name=&quot;notes&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder=&quot;Add any additional details about this location&quot;
                            className=&quot;min-h-[120px]&quot;
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Include any important details that might help during
                          the approval process.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className=&quot;flex justify-end space-x-4&quot;>
                    <Button
                      type=&quot;button&quot;
                      variant=&quot;outline&quot;
                      onClick={handleBackToList}
                    >
                      Cancel
                    </Button>
                    <Button type=&quot;submit&quot; disabled={mutation.isPending}>
                      {mutation.isPending && (
                        <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin" />
                      )}
                      Submit Location
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
