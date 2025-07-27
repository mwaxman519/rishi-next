"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Info, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

// Define the schema for location submission
const locationFormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Location name must be at least 3 characters" }),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "Zip code is required" }),
  latitude: z.number().or(z.string().transform((val) => parseFloat(val))),
  longitude: z.number().or(z.string().transform((val) => parseFloat(val))),
  locationType: z.enum(["venue", "service_area"], {
    required_error: "Please select a location type",
  }),
  notes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

// Default values for the form
const defaultValues: Partial<LocationFormValues> = {
  locationType: "venue",
  notes: "",
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
  const latitude = form.watch("latitude");
  const longitude = form.watch("longitude");

  // Setup mutation for submitting the location
  const mutation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit location");
      }

      return response.json();
    },
    onSuccess: () => {
      setFormSubmitted(true);
      toast({
        title: "Location submitted successfully",
        description: "Your location has been submitted for approval.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    },
  });

  // Initialize Google Maps and related services
  useEffect(() => {
    if (!isLoaded) return;

    // Create a map instance
    const mapDiv = document.getElementById("location-map");
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
    const input = document.getElementById("pac-input") as HTMLInputElement;
    if (!input) return;

    const searchBoxInstance = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

    // Create a geocoder
    const geocoderInstance = new google.maps.Geocoder();

    // Set up map event listeners
    map.addListener("bounds_changed", () => {
      searchBoxInstance.setBounds(map.getBounds() as google.maps.LatLngBounds);
    });

    // Handle search box place selection
    searchBoxInstance.addListener("places_changed", () => {
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
      form.setValue("latitude", place.geometry.location.lat());
      form.setValue("longitude", place.geometry.location.lng());
    });

    // Handle marker drag events
    newMarker.addListener("dragend", () => {
      const position = newMarker.getPosition();
      if (!position) return;

      const lat = position.lat();
      const lng = position.lng();

      form.setValue("latitude", lat);
      form.setValue("longitude", lng);

      // Reverse geocode to get address details
      geocoderInstance.geocode(
        { location: { lat, lng } },
        (results, status) => {
          if (status === "OK" && results && results[0]) {
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
    let street = "";
    let city = "";
    let state = "";
    let zipCode = "";

    // Extract address components
    if (place.address_components) {
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("street_number")) {
          street = component.long_name + " " + street;
        } else if (types.includes("route")) {
          street += component.long_name;
        } else if (types.includes("locality")) {
          city = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          state = component.short_name;
        } else if (types.includes("postal_code")) {
          zipCode = component.long_name;
        }
      }
    }

    // Update form values
    if (street) form.setValue("address", street);
    if (city) form.setValue("city", city);
    if (state) form.setValue("state", state);
    if (zipCode) form.setValue("zipCode", zipCode);

    // Update location name with formatted address if empty
    if (!form.getValues("name") && place.formatted_address) {
      form.setValue(
        "name",
        place.name || place.formatted_address.split(",")[0],
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
    router.push("/locations");
  };

  // Handle clicking submit another location
  const handleSubmitAnother = () => {
    form.reset(defaultValues);
    setFormSubmitted(false);
  };

  // If form was submitted successfully, show success message
  if (formSubmitted) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
            Location Submitted Successfully
          </CardTitle>
          <CardDescription>
            Your location has been submitted and is pending approval.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert
            variant="default"
            className="mb-4 bg-green-50 border-green-200"
          >
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Submission successful</AlertTitle>
            <AlertDescription>
              Your location request has been submitted for review by an
              administrator. You'll be notified when it's approved or if
              additional information is needed.
            </AlertDescription>
          </Alert>

          <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="font-medium">Location Name</dt>
              <dd>{form.getValues("name")}</dd>
            </div>
            <div>
              <dt className="font-medium">Address</dt>
              <dd>{form.getValues("address")}</dd>
            </div>
            <div>
              <dt className="font-medium">City</dt>
              <dd>{form.getValues("city")}</dd>
            </div>
            <div>
              <dt className="font-medium">State</dt>
              <dd>{form.getValues("state")}</dd>
            </div>
            <div>
              <dt className="font-medium">Zip Code</dt>
              <dd>{form.getValues("zipCode")}</dd>
            </div>
            <div>
              <dt className="font-medium">Location Type</dt>
              <dd className="capitalize">
                {form.getValues("locationType").replace("_", " ")}
              </dd>
            </div>
          </dl>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button variant="outline" onClick={handleBackToList}>
            Back to Locations
          </Button>
          <Button onClick={handleSubmitAnother}>Submit Another Location</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Submit a New Location
          </CardTitle>
          <CardDescription>
            Submit a new location or service area for approval. Once approved,
            it can be used for bookings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Alert variant="info" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>How location approval works</AlertTitle>
              <AlertDescription>
                Submitted locations require approval before they can be used in
                booking portals. Please provide accurate information to expedite
                the review process.
              </AlertDescription>
            </Alert>
          </div>

          {!isLoaded ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3">Loading map...</span>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <div className="rounded-lg overflow-hidden">
                  <div className="relative mb-4">
                    <input
                      id="pac-input"
                      className="w-full h-10 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-primary focus:border-primary z-10 relative bg-white"
                      type="text"
                      placeholder="Search for a location..."
                    />
                  </div>
                  <div
                    id="location-map"
                    className="w-full h-[400px] rounded-lg border"
                  ></div>
                </div>

                <p className="text-sm text-muted-foreground mt-2">
                  Search for a location or drag the pin to position it
                  precisely.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter location name"
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
                      name="locationType"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Location Type</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="venue" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Venue (Physical Location)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="service_area" />
                                </FormControl>
                                <FormLabel className="font-normal">
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
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter street address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter state" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter zip code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="latitude"
                      render={({ field: { onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Latitude (set by map)"
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
                      name="longitude"
                      render={({ field: { onChange, ...rest } }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Longitude (set by map)"
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any additional details about this location"
                            className="min-h-[120px]"
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

                  <div className="flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBackToList}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={mutation.isPending}>
                      {mutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
