"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LocationSearch } from "@/components/locations/LocationSearch";
import { GoogleMapsProvider } from "@/contexts/GoogleMapsContext";
import LocationMap from "@/components/locations/LocationMap";
import PlacesAutocomplete from "@/components/locations/PlacesAutocomplete";
import { MapPin, Navigation } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

import { LocationDTO } from "@/types/locations";

// Sample location data for testing
const sampleLocations: LocationDTO[] = [
  {
    id: "1",
    name: "Downtown Office",
    type: "office",
    status: "approved",
    address1: "123 Main St",
    address2: "Suite 300",
    city: "San Francisco",
    state: { id: "CA", name: "California", abbreviation: "CA" },
    stateId: "CA",
    zipcode: "94105",
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "1",
  },
  {
    id: "2",
    name: "Convention Center",
    type: "venue",
    status: "approved",
    address1: "747 Howard St",
    address2: "",
    city: "San Francisco",
    state: { id: "CA", name: "California", abbreviation: "CA" },
    stateId: "CA",
    zipcode: "94103",
    latitude: 37.7841,
    longitude: -122.4019,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "1",
  },
  {
    id: "3",
    name: "City Park Event Space",
    type: "venue",
    status: "pending",
    address1: "501 Stanyan St",
    address2: "",
    city: "San Francisco",
    state: { id: "CA", name: "California", abbreviation: "CA" },
    stateId: "CA",
    zipcode: "94117",
    latitude: 37.7694,
    longitude: -122.4555,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "1",
  },
  {
    id: "4",
    name: "East Bay Warehouse",
    type: "storage",
    status: "approved",
    address1: "1 Broadway",
    address2: "Building C",
    city: "Oakland",
    state: { id: "CA", name: "California", abbreviation: "CA" },
    stateId: "CA",
    zipcode: "94607",
    latitude: 37.8042,
    longitude: -122.2746,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "1",
  },
  {
    id: "5",
    name: "South Bay Exhibition Hall",
    type: "venue",
    status: "rejected",
    address1: "150 W San Carlos St",
    address2: "",
    city: "San Jose",
    state: { id: "CA", name: "California", abbreviation: "CA" },
    stateId: "CA",
    zipcode: "95113",
    latitude: 37.3299,
    longitude: -121.8898,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: "1",
    rejectionReason: "Venue does not meet accessibility requirements",
  },
];

export default function LocationSearchPage() {
  const [searchResults, setSearchResults] =
    useState<LocationDTO[]>(sampleLocations);
  const [selectedLocation, setSelectedLocation] = useState<LocationDTO | null>(
    null,
  );
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const { toast } = useToast();

  const handleLocationSelect = (location: LocationDTO) => {
    setSelectedLocation(location);
    toast({
      title: "Location selected",
      description: `Selected ${location.name}`,
    });
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    toast({
      title: "Place selected",
      description: `Selected ${place.formatted_address}`,
    });
  };

  return (
    <GoogleMapsProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">
          Location Search & Google Maps Integration
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search panel */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Location Search</CardTitle>
              <CardDescription>
                Search for locations using multiple filters
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LocationSearch
                locations={sampleLocations}
                onSearch={setSearchResults}
                onLocationSelect={handleLocationSelect}
              />

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">Search Results</h3>
                <div className="space-y-3">
                  {searchResults.map((location) => (
                    <Card
                      key={location.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleLocationSelect(location)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{location.name}</h4>
                              <Badge
                                variant={
                                  location.status === "approved"
                                    ? "default"
                                    : location.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                              >
                                {location.status}
                              </Badge>
                            </div>
                            <div className="flex items-start mt-2">
                              <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                              <div className="text-sm text-muted-foreground">
                                <p>{location.address1}</p>
                                {location.address2 && (
                                  <p>{location.address2}</p>
                                )}
                                <p>
                                  {location.city},{" "}
                                  {location.state?.abbreviation}{" "}
                                  {location.zipcode}
                                </p>
                              </div>
                            </div>
                          </div>
                          {"distance" in location && (
                            <Badge variant="outline">
                              {(location as any).distance.toFixed(1)} mi
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map panel */}
          <Card>
            <CardHeader>
              <CardTitle>Map & Selection</CardTitle>
              <CardDescription>View selected location on map</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">
                  Places Autocomplete
                </h3>
                <PlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search for a place"
                  className="mb-4"
                />
              </div>

              <Separator className="my-4" />

              {selectedPlace && (
                <div className="mb-5 p-3 bg-accent rounded-lg">
                  <h3 className="font-medium mb-1">Selected Place</h3>
                  <p className="text-sm">{selectedPlace.formatted_address}</p>
                  {selectedPlace.geometry?.location && (
                    <div className="flex items-center mt-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => {
                          if (selectedPlace.geometry?.location) {
                            navigator.clipboard.writeText(
                              `${selectedPlace.geometry.location.lat()}, ${selectedPlace.geometry.location.lng()}`,
                            );
                            toast({
                              title: "Coordinates copied",
                              description:
                                "Location coordinates copied to clipboard",
                            });
                          }
                        }}
                      >
                        <Navigation className="h-3 w-3 mr-1" /> Copy Coordinates
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {selectedLocation &&
              selectedLocation.latitude &&
              selectedLocation.longitude ? (
                <div className="space-y-4">
                  <LocationMap
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    className="w-full h-[300px] rounded-md border"
                  />
                  <div className="p-3 bg-accent rounded-lg">
                    <h3 className="font-medium mb-1">
                      {selectedLocation.name}
                    </h3>
                    <p className="text-sm">
                      {selectedLocation.type} - {selectedLocation.status}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedLocation.address1}, {selectedLocation.city},{" "}
                      {selectedLocation.state?.abbreviation}
                    </p>
                  </div>
                </div>
              ) : selectedPlace && selectedPlace.geometry?.location ? (
                <LocationMap
                  latitude={selectedPlace.geometry.location.lat()}
                  longitude={selectedPlace.geometry.location.lng()}
                  className="w-full h-[300px] rounded-md border"
                />
              ) : (
                <div className="flex items-center justify-center bg-muted h-[300px] rounded-md border">
                  <div className="text-center p-4">
                    <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-muted-foreground">
                      Select a location or place to view on map
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
