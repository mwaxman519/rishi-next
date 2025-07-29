"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState, useRef, useCallback } from "react";
import { ChevronLeft, Search, MapPin, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTheme } from "next-themes";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Google Maps Components
import {
  GoogleMap,
  Marker,
  Autocomplete,
  LoadScript,
  InfoWindow,
} from "@react-google-maps/api";

// Custom components
import ManualAddressEntry from "@/components/locations/ManualAddressEntry";

// API Key and Configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";
// Define libraries array outside component to avoid reloading warning
// Use 'as any' to fix TypeScript error with the libraries prop
const libraries = ["places"] as any;

// Map Container Style
const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "0.5rem",
};

// Default Map Center (San Francisco)
const defaultCenter = {
  lat: 37.7749,
  lng: -122.4194,
};

// Form Schema for Location Data
const locationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  locationType: z
    .string()
    .min(1, { message: "Please select a location type." }),
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
  const [activeTab, setActiveTab] = useState("google-search");

  // Location State
  const [selectedLocation, setSelectedLocation] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState<boolean>(false);
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");

  // Form Setup
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      locationType: "business",
      notes: "",
    },
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit location");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Location submitted successfully",
        description: "Your location has been submitted for approval.",
      });
      router.push("/locations");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    },
  });

  // Theme Change Effect
  React.useEffect(() => {
    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    setMapTheme(currentTheme);

    if (mapRef.current && window.google?.maps) {
      applyMapStyle(mapRef.current, currentTheme);
    }
  }, [resolvedTheme]);

  // Apply Map Styling Based on Theme
  const applyMapStyle = (map: google.maps.Map, theme: "light" | "dark") => {
    if (theme === "dark") {
      map.setOptions({
        styles: [
          { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
          {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#242f3e" }],
          },
          { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
          {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#263c3f" }],
          },
          {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#6b9a76" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#38414e" }],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [{ color: "#212a37" }],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9ca5b3" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#746855" }],
          },
          {
            featureType: "road.highway",
            elementType: "geometry.stroke",
            stylers: [{ color: "#1f2835" }],
          },
          {
            featureType: "road.highway",
            elementType: "labels.text.fill",
            stylers: [{ color: "#f3d19c" }],
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#2f3948" }],
          },
          {
            featureType: "transit.station",
            elementType: "labels.text.fill",
            stylers: [{ color: "#d59563" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#17263c" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#515c6d" }],
          },
          {
            featureType: "water",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#17263c" }],
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
        "address_components",
        "formatted_address",
        "geometry",
        "name",
        "place_id",
        "types",
        "vicinity",
      ]);
    },
    [],
  );

  // Place Changed Handler
  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) {
      console.error("Autocomplete reference not available");
      return;
    }

    try {
      const place = autocompleteRef.current.getPlace();
      console.log("Place selected:", place);

      if (!place.geometry || !place.geometry.location) {
        console.error("⚠️ Selected place has no geometry location");
        return;
      }

      const location = place.geometry.location;
      const latLng = {
        lat: location.lat(),
        lng: location.lng(),
      };

      console.log("✅ Selected location:", latLng);
      console.log("✅ Selected place:", place);

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
        form.setValue("name", place.name);
      }

      // Set location type based on place types
      if (place.types && place.types.length > 0) {
        if (place.types.includes("restaurant")) {
          form.setValue("locationType", "restaurant");
        } else if (place.types.includes("store")) {
          form.setValue("locationType", "retail");
        } else if (place.types.includes("office")) {
          form.setValue("locationType", "office");
        } else if (place.types.includes("establishment")) {
          form.setValue("locationType", "business");
        } else {
          form.setValue("locationType", "business");
        }
      }
    } catch (error) {
      console.error("Error in onPlaceChanged:", error);
      toast({
        variant: "destructive",
        title: "Error selecting location",
        description:
          "There was a problem with the location selection. Please try again.",
      });
    }
  }, [form, toast]);

  // Clear Search Handler
  const handleClearSearch = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setSelectedPlace(null);
    setSelectedLocation(null);
    setIsInfoOpen(false);

    // Reset form fields
    form.setValue("name", "");
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
              if (status === "OK" && results && results[0]) {
                setSelectedPlace(results[0]);
                setIsInfoOpen(true);

                // Set form name based on place data
                const result = results[0];
                // Try to extract a name from formatted address if direct name property isn't available
                const addressName =
                  result.formatted_address?.split(",")[0] || "";
                form.setValue(
                  "name",
                  (result as any).name || addressName || "New Location",
                );
              } else {
                console.error(`Geocoder failed: ${status}`);
              }
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: "destructive",
            title: "Geolocation error",
            description:
              "Unable to access your current location. Please check your browser permissions.",
          });
        },
      );
    } else {
      console.error("Geolocation is not supported by this browser");
      toast({
        variant: "destructive",
        title: "Not supported",
        description: "Geolocation is not supported by your browser.",
      });
    }
  }, [form, toast]);

  // Extract Address Components
  const getAddressComponent = (
    components: google.maps.GeocoderAddressComponent[] | undefined,
    type: string,
  ): string => {
    if (!components) return "";

    const component = components.find((comp) => comp.types.includes(type));

    return component ? component.long_name : "";
  };

  // Form Submission Handler
  const onSubmit = (values: LocationFormValues) => {
    if (!selectedPlace) {
      toast({
        variant: "destructive",
        title: "Location required",
        description:
          "Please select a location using either the search tool or manual address entry.",
      });
      return;
    }

    // Extract address components
    const city =
      getAddressComponent(selectedPlace.address_components, "locality") ||
      getAddressComponent(selectedPlace.address_components, "sublocality") ||
      "";
    const state =
      getAddressComponent(
        selectedPlace.address_components,
        "administrative_area_level_1",
      ) || "";
    const postalCode =
      getAddressComponent(selectedPlace.address_components, "postal_code") ||
      "";

    // Prepare data for submission
    const submissionData = {
      name: values.name.trim(),
      address: selectedPlace.formatted_address || "",
      city,
      state,
      zipCode: postalCode,
      latitude: selectedLocation?.lat || 0, // Use 0 if coordinates are not available
      longitude: selectedLocation?.lng || 0, // Use 0 if coordinates are not available
      placeId: selectedPlace.place_id || "",
      locationType: values.locationType,
      notes: values.notes?.trim() || "",
    };

    // Submit the data
    submitMutation.mutate(submissionData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/locations">
            <ChevronLeft className="h-4 w-4" />
            Back to Locations
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Add New Location</h1>
      </div>

      <p className="text-muted-foreground">
        Submit a new location for approval. Once approved, it will be available
        for booking and scheduling.
      </p>

      <Alert className="bg-primary/5 border-primary/20 mb-6">
        <MapPin className="h-4 w-4 text-primary" />
        <AlertTitle>Location Search</AlertTitle>
        <AlertDescription>
          Search for addresses or businesses, use your current location, or
          click directly on the map to select a location.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Find Location</CardTitle>
              <CardDescription>
                Search for addresses, businesses, or add a location manually
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="google-search">
                    Google Maps Search
                  </TabsTrigger>
                  <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
                </TabsList>

                <TabsContent value="google-search" className="space-y-4">
                  <LoadScript
                    googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                  >
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Autocomplete
                            onLoad={onAutocompleteLoad}
                            onPlaceChanged={onPlaceChanged}
                            options={{
                              types: ["establishment", "geocode"],
                              fields: [
                                "address_components",
                                "formatted_address",
                                "geometry",
                                "name",
                                "place_id",
                                "types",
                                "vicinity",
                              ],
                            }}
                          >
                            <input
                              ref={inputRef}
                              type="text"
                              placeholder="Search for a location..."
                              className="w-full pl-10 pr-4 py-3 border border-input bg-background rounded-md shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            />
                          </Autocomplete>
                        </div>
                        <Button
                          onClick={handleClearSearch}
                          variant="outline"
                          size="sm"
                          type="button"
                        >
                          Clear
                        </Button>
                        <Button
                          onClick={handleFindMyLocation}
                          variant="default"
                          size="sm"
                          type="button"
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
                            title={selectedPlace?.name || "Selected location"}
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
                                    mapTheme === "dark"
                                      ? "bg-gray-800 text-white border border-gray-700"
                                      : "bg-white text-gray-900"
                                  }`}
                                  style={{
                                    minWidth: "200px",
                                  }}
                                >
                                  <h3 className="font-medium">
                                    {selectedPlace.name || "Selected Location"}
                                  </h3>
                                  <p
                                    className={`text-sm ${mapTheme === "dark" ? "text-gray-300" : "text-gray-600"}`}
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

                <TabsContent value="manual-entry" className="space-y-4">
                  <ManualAddressEntry
                    onLocationSelect={(locationData) => {
                      // Convert the manual address entry data to a format compatible with our form
                      const formattedAddress = `${locationData.address1}${locationData.address2 ? ", " + locationData.address2 : ""}, ${locationData.city}, ${locationData.state} ${locationData.zipcode}`;

                      // Create a place-like object
                      const place = {
                        formatted_address: formattedAddress,
                        address_components: [
                          {
                            long_name: locationData.address1,
                            short_name: locationData.address1,
                            types: ["street_number", "route"],
                          },
                          {
                            long_name: locationData.city,
                            short_name: locationData.city,
                            types: ["locality"],
                          },
                          {
                            long_name: locationData.state,
                            short_name: locationData.state,
                            types: ["administrative_area_level_1"],
                          },
                          {
                            long_name: locationData.zipcode,
                            short_name: locationData.zipcode,
                            types: ["postal_code"],
                          },
                        ],
                        place_id: "",
                        name:
                          locationData.name || formattedAddress.split(",")[0],
                      };

                      // Set form values - ensure we have a non-empty string as name
                      const locationName =
                        locationData.name ||
                        (formattedAddress
                          ? formattedAddress.split(",")[0]
                          : "") ||
                        "New Location";
                      form.setValue("name", locationName);

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
                    onToggleSearchMode={() => setActiveTab("google-search")}
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Address
                    </h3>
                    <p className="font-medium">
                      {selectedPlace.formatted_address}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    {selectedPlace.address_components && (
                      <>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            City
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              "locality",
                            ) ||
                              getAddressComponent(
                                selectedPlace.address_components,
                                "sublocality",
                              ) ||
                              "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            State/Province
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              "administrative_area_level_1",
                            ) || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Postal Code
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              "postal_code",
                            ) || "N/A"}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">
                            Country
                          </h3>
                          <p>
                            {getAddressComponent(
                              selectedPlace.address_components,
                              "country",
                            ) || "N/A"}
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Latitude
                      </h3>
                      <p className="font-mono text-sm">
                        {selectedLocation
                          ? selectedLocation.lat.toFixed(6)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">
                        Longitude
                      </h3>
                      <p className="font-mono text-sm">
                        {selectedLocation
                          ? selectedLocation.lng.toFixed(6)
                          : "N/A"}
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
                  id="location-form"
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter location name" {...field} />
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
                    name="locationType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a location type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="venue">Venue</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                            <SelectItem value="retail">Retail Store</SelectItem>
                            <SelectItem value="restaurant">
                              Restaurant
                            </SelectItem>
                            <SelectItem value="landmark">Landmark</SelectItem>
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
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add any special instructions or details about this location"
                            className="min-h-[120px]"
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
            <CardFooter className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => router.push("/locations")}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="location-form"
                disabled={!selectedPlace || submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting..." : "Submit Location"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
