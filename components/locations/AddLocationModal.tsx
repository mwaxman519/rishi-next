"use client";

import React, { useState, useRef, useCallback } from "react";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

// Google Maps components
import { GoogleMap, InfoWindow } from "@react-google-maps/api";
import {
  GoogleMapsProvider,
  useGoogleMaps,
} from "@/components/maps/GoogleMapsContext";
import { GooglePlacesInput } from "@/components/maps/GooglePlacesInput";
import { LocationData } from "@/components/maps/types";
import { useTheme } from "next-themes";

// Map styles and configuration
const containerStyle = {
  width: "100%",
  height: "350px",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: 37.7749, // Default location (San Francisco)
  lng: -122.4194,
};

// Form schema
const locationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  locationType: z
    .string()
    .min(1, { message: "Please select a location type." }),
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
  const [mapTheme, setMapTheme] = useState<"light" | "dark">("light");

  // Form setup
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      locationType: "business",
      notes: "",
    },
  });

  // Submit mutation
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
      onOpenChange(false);
      form.reset();
      setSelectedLocation(null);
      setSelectedPlace(null);
      router.refresh();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: error.message,
      });
    },
  });

  // Update map theme when global theme changes
  React.useEffect(() => {
    const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
    setMapTheme(currentTheme);

    // If map is already loaded, apply the theme style
    if (mapRef.current && window.google?.maps) {
      applyMapStyle(mapRef.current, currentTheme);
    }
  }, [resolvedTheme]);

  // Apply map style based on theme
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
        console.log("Place selected:", placeData);

        if (!placeData) {
          console.error("⚠️ No place data received");
          return;
        }

        if (!placeData.latitude || !placeData.longitude) {
          console.error("⚠️ Selected place has no coordinates");
          return;
        }

        const latLng = {
          lat: placeData.latitude,
          lng: placeData.longitude,
        };

        console.log("✅ Selected location:", latLng);

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
          form.setValue("name", placeData.displayName);
        }

        // Set location type based on place types
        if (placeData.types && placeData.types.length > 0) {
          if (placeData.types.includes("restaurant")) {
            form.setValue("locationType", "restaurant");
          } else if (placeData.types.includes("store")) {
            form.setValue("locationType", "retail");
          } else if (placeData.types.includes("office")) {
            form.setValue("locationType", "office");
          } else if (placeData.types.includes("establishment")) {
            form.setValue("locationType", "business");
          } else {
            form.setValue("locationType", "business");
          }
        }
      } catch (error) {
        console.error("Error in handlePlaceSelected:", error);
        toast({
          variant: "destructive",
          title: "Error selecting location",
          description:
            "There was a problem with the location selection. Please try again.",
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
        title: "Finding your location",
        description: "Please allow location access if prompted.",
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
              throw new Error("Failed to get address from coordinates");
            }

            const data = await response.json();

            if (data.results && data.results.length > 0) {
              // Convert to LocationData format
              const placeData: LocationData = {
                id: data.results[0].id || "",
                formattedAddress: data.results[0].formattedAddress || "",
                displayName: data.results[0].displayName || "Current Location",
                latitude:
                  data.results[0].geometry?.location?.latitude || latLng.lat,
                longitude:
                  data.results[0].geometry?.location?.longitude || latLng.lng,
                addressComponents: data.results[0].addressComponents || [],
                types: data.results[0].types || [],
                businessStatus: "OPERATIONAL", // Default value
                plusCode: null, // Not using this field
              };

              setSelectedPlace(placeData);
              setIsInfoOpen(true);

              // Set form values
              form.setValue("name", placeData.displayName);

              // Set location type to business by default for current location
              form.setValue("locationType", "business");
            } else {
              toast({
                variant: "destructive",
                title: "Address lookup failed",
                description: "Could not determine address for your location.",
              });
            }
          } catch (error) {
            console.error("Reverse geocoding error:", error);
            toast({
              variant: "destructive",
              title: "Geocoding failed",
              description: "Could not convert your coordinates to an address.",
            });
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast({
            variant: "destructive",
            title: "Location access failed",
            description: `Could not access your location: ${error.message}`,
          });
        },
      );
    } else {
      toast({
        variant: "destructive",
        title: "Browser incompatible",
        description: "Geolocation is not supported by your browser",
      });
    }
  }, [form, toast]);

  // Form submission handler
  const onSubmit = (values: LocationFormValues) => {
    if (!selectedPlace || !selectedLocation) {
      toast({
        variant: "destructive",
        title: "Location required",
        description: "Please select a location using the search tool.",
      });
      return;
    }

    // Extract address components
    const city =
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes("locality"),
      )?.longText ||
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes("sublocality"),
      )?.longText ||
      "";

    const state =
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes("administrative_area_level_1"),
      )?.longText || "";

    const postalCode =
      selectedPlace.addressComponents?.find((c: { types: string[] }) =>
        c.types.includes("postal_code"),
      )?.longText || "";

    // Prepare data for submission
    const submissionData = {
      name: values.name.trim(),
      address: selectedPlace.formattedAddress || "",
      city,
      state,
      zipCode: postalCode,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      placeId: selectedPlace.id || "",
      locationType: values.locationType,
      notes: values.notes?.trim() || "",
    };

    submitMutation.mutate(submissionData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Search for a location and provide additional details to add it to
            the system.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-6">
            <GoogleMapsProvider>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <GooglePlacesInput
                      onPlaceSelected={handlePlaceSelected}
                      placeholder="Search for a location..."
                      className="w-full"
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
                      <div id="marker-container" className="hidden">
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
                            const pinElement = document.createElement("div");
                            pinElement.className = "location-marker";
                            pinElement.style.width = "24px";
                            pinElement.style.height = "24px";
                            pinElement.style.borderRadius = "50%";
                            pinElement.style.backgroundColor = "blue";
                            pinElement.style.border = "2px solid white";
                            pinElement.style.boxShadow =
                              "0 2px 6px rgba(0,0,0,0.3)";
                            pinElement.style.cursor = "pointer";
                            pinElement.title =
                              selectedPlace?.displayName || "Selected location";

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
                                        "Selected location",
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
                              mapTheme === "dark"
                                ? "bg-gray-800 text-white border border-gray-700"
                                : "bg-white text-gray-900"
                            }`}
                            style={{
                              minWidth: "200px",
                            }}
                          >
                            <h3 className="font-medium">
                              {selectedPlace.displayName || "Selected Location"}
                            </h3>
                            <p
                              className={`text-sm ${mapTheme === "dark" ? "text-gray-300" : "text-gray-600"}`}
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
              <div className="text-sm space-y-2 border rounded-md p-3 bg-muted/20">
                <div className="font-medium mb-1">Selected Location:</div>
                <div>{selectedPlace.formattedAddress}</div>
                {selectedPlace.addressComponents &&
                  selectedPlace.addressComponents.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t">
                      <div>
                        <span className="text-muted-foreground">City: </span>
                        <span className="font-medium">
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes("locality"),
                          )?.longText || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">State: </span>
                        <span className="font-medium">
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes("administrative_area_level_1"),
                          )?.longText || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Postal Code:{" "}
                        </span>
                        <span className="font-medium">
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes("postal_code"),
                          )?.longText || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Country: </span>
                        <span className="font-medium">
                          {selectedPlace.addressComponents.find(
                            (c: { types: string[] }) =>
                              c.types.includes("country"),
                          )?.longText || "N/A"}
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
                          <SelectItem value="restaurant">Restaurant</SelectItem>
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

                <DialogFooter className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!selectedPlace || submitMutation.isPending}
                  >
                    {submitMutation.isPending
                      ? "Submitting..."
                      : "Submit Location"}
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
