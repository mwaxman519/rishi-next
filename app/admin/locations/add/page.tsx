"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  MapPin,
  Loader2,
  Plus,
  Check,
} from "lucide-react";
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
import { Switch } from "@/components/ui/switch";

// Google Maps Components
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

// Custom components
import ManualAddressEntry from "@/app/components/locations/ManualAddressEntry";
import PlaceAutocompleteAddressPicker from "@/app/components/locations/PlaceAutocompleteAddressPicker";

// API Key and Configuration
const GOOGLE_MAPS_API_KEY = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";
// Map ID for AdvancedMarkerElement support - Using our default Map ID
const DEFAULT_MAP_ID = "8f718a3abe8b23eb";

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
  status: z.string().min(1, { message: "Please select a status." }),
  notes: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

export default function AdminAddLocationPage() {
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const { isLoaded, mapId } = useGoogleMaps();

  // UI State
  const [activeTab, setActiveTab] = useState("google-search");

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
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");

  // Form Setup
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      locationType: "business",
      status: "active",
      notes: "",
    },
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: async (locationData: any) => {
      const res = await fetch("/api/admin/locations", {
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
        title: "Location added successfully",
        description: "The location has been added to the system.",
      });
      router.push("/admin/locations");
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
      status: values.status,
      approved: true, // Admin locations are approved by default
      notes: values.notes?.trim() || "",
    };

    // Submit the data
    submitMutation.mutate(submissionData);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="gap-1" asChild>
          <Link href="/admin/locations">
            <ChevronLeft className="h-4 w-4" />
            Back to Admin Locations
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Add New Location (Admin)
        </h1>
      </div>

      <p className="text-muted-foreground">
        As an administrator, you can directly add new locations to the system
        without requiring approval.
      </p>

      <Alert className="bg-primary/5 border-primary/20 mb-6">
        <MapPin className="h-4 w-4 text-primary" />
        <AlertTitle>Location Management</AlertTitle>
        <AlertDescription>
          Search for addresses or businesses, add manual addresses, or use your
          current location. New locations will be immediately available in the
          system.
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
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        {/* Using PlaceAutocompleteAddressPicker component instead of deprecated Autocomplete */}
                        <PlaceAutocompleteAddressPicker
                          onAddressSelect={(addressData) => {
                            console.log("Address selected:", addressData);

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
                                addressData.formatted_address.split(",")[0] ||
                                "New Location",
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
                              "name",
                              addressData.name ||
                                addressData.formatted_address.split(",")[0] ||
                                "New Location",
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

                            if (placeTypes.includes("restaurant")) {
                              form.setValue("locationType", "restaurant");
                            } else if (placeTypes.includes("store")) {
                              form.setValue("locationType", "retail");
                            } else if (placeTypes.includes("office")) {
                              form.setValue("locationType", "office");
                            } else {
                              form.setValue("locationType", "business");
                            }
                          }}
                          className="mb-2"
                        />
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
                            <div id="marker-container" className="hidden">
                              {(() => {
                                // Create marker element with proper styling
                                if (
                                  window.google?.maps?.marker
                                    ?.AdvancedMarkerElement &&
                                  mapRef.current
                                ) {
                                  // Create pin element
                                  const pinElement =
                                    document.createElement("div");
                                  pinElement.className = "location-marker";
                                  pinElement.style.width = "36px";
                                  pinElement.style.height = "36px";
                                  pinElement.style.borderRadius = "50%";
                                  pinElement.style.backgroundColor = "blue";
                                  pinElement.style.border = "2px solid white";
                                  pinElement.style.boxShadow =
                                    "0 2px 6px rgba(0,0,0,0.3)";
                                  pinElement.style.cursor = "pointer";
                                  pinElement.title =
                                    selectedPlace?.name || "Selected location";

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
                                              "Selected location",
                                          },
                                        );
                                    } catch (error) {
                                      console.error(
                                        "Failed to create advanced marker:",
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
                          </>
                        )}
                      </GoogleMap>
                    ) : (
                      <div
                        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                        style={{
                          width: "100%",
                          height: "400px",
                        }}
                      >
                        <div className="flex flex-col items-center text-center p-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                          <p className="text-muted-foreground">
                            Loading Google Maps...
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="manual-entry" className="space-y-4">
                  <ManualAddressEntry
                    onLocationSelect={(locationData) => {
                      // Convert the manual address entry data to a format compatible with our form
                      const formattedAddress = `${locationData.address1}${locationData.address2 ? ", " + locationData.address2 : ""}, ${locationData.city}, ${locationData.state} ${locationData.zipcode}`;

                      // Create a place-like object with properly shaped Google Maps types
                      const place: google.maps.places.PlaceResult = {
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
                          locationData.name ||
                          formattedAddress.split(",")[0] ||
                          "New Location",
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
                          ? formattedAddress.split(",")[0]
                          : "") ||
                        "New Location";
                      form.setValue("name", locationName);

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
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span>Active</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="inactive">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                <span>Inactive</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
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
                onClick={() => router.push("/admin/locations")}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="location-form"
                disabled={!selectedPlace || submitMutation.isPending}
              >
                {submitMutation.isPending ? "Submitting..." : "Add Location"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
