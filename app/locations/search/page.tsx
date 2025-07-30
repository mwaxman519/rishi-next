&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { LocationSearch } from &quot;@/components/locations/LocationSearch&quot;;
import { GoogleMapsProvider } from &quot;@/contexts/GoogleMapsContext&quot;;
import LocationMap from &quot;@/components/locations/LocationMap&quot;;
import PlacesAutocomplete from &quot;@/components/locations/PlacesAutocomplete&quot;;
import { MapPin, Navigation } from &quot;lucide-react&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;

import { LocationDTO } from &quot;@/types/locations&quot;;

// Sample location data for testing
const sampleLocations: LocationDTO[] = [
  {
    id: &quot;1&quot;,
    name: &quot;Downtown Office&quot;,
    type: &quot;office&quot;,
    status: &quot;approved&quot;,
    address1: &quot;123 Main St&quot;,
    address2: &quot;Suite 300&quot;,
    city: &quot;San Francisco&quot;,
    state: { id: &quot;CA&quot;, name: &quot;California&quot;, abbreviation: &quot;CA&quot; },
    stateId: &quot;CA&quot;,
    zipcode: &quot;94105&quot;,
    latitude: 37.7749,
    longitude: -122.4194,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: &quot;1&quot;,
  },
  {
    id: &quot;2&quot;,
    name: &quot;Convention Center&quot;,
    type: &quot;venue&quot;,
    status: &quot;approved&quot;,
    address1: &quot;747 Howard St&quot;,
    address2: "&quot;,
    city: &quot;San Francisco&quot;,
    state: { id: &quot;CA&quot;, name: &quot;California&quot;, abbreviation: &quot;CA&quot; },
    stateId: &quot;CA&quot;,
    zipcode: &quot;94103&quot;,
    latitude: 37.7841,
    longitude: -122.4019,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: &quot;1&quot;,
  },
  {
    id: &quot;3&quot;,
    name: &quot;City Park Event Space&quot;,
    type: &quot;venue&quot;,
    status: &quot;pending&quot;,
    address1: &quot;501 Stanyan St&quot;,
    address2: &quot;&quot;,
    city: &quot;San Francisco&quot;,
    state: { id: &quot;CA&quot;, name: &quot;California&quot;, abbreviation: &quot;CA&quot; },
    stateId: &quot;CA&quot;,
    zipcode: &quot;94117&quot;,
    latitude: 37.7694,
    longitude: -122.4555,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: &quot;1&quot;,
  },
  {
    id: &quot;4&quot;,
    name: &quot;East Bay Warehouse&quot;,
    type: &quot;storage&quot;,
    status: &quot;approved&quot;,
    address1: &quot;1 Broadway&quot;,
    address2: &quot;Building C&quot;,
    city: &quot;Oakland&quot;,
    state: { id: &quot;CA&quot;, name: &quot;California&quot;, abbreviation: &quot;CA&quot; },
    stateId: &quot;CA&quot;,
    zipcode: &quot;94607&quot;,
    latitude: 37.8042,
    longitude: -122.2746,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: &quot;1&quot;,
  },
  {
    id: &quot;5&quot;,
    name: &quot;South Bay Exhibition Hall&quot;,
    type: &quot;venue&quot;,
    status: &quot;rejected&quot;,
    address1: &quot;150 W San Carlos St&quot;,
    address2: &quot;&quot;,
    city: &quot;San Jose&quot;,
    state: { id: &quot;CA&quot;, name: &quot;California&quot;, abbreviation: &quot;CA&quot; },
    stateId: &quot;CA&quot;,
    zipcode: &quot;95113&quot;,
    latitude: 37.3299,
    longitude: -121.8898,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationId: &quot;1&quot;,
    rejectionReason: &quot;Venue does not meet accessibility requirements&quot;,
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
      title: &quot;Location selected&quot;,
      description: `Selected ${location.name}`,
    });
  };

  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    setSelectedPlace(place);
    toast({
      title: &quot;Place selected&quot;,
      description: `Selected ${place.formatted_address}`,
    });
  };

  return (
    <GoogleMapsProvider>
      <div className=&quot;container mx-auto py-8&quot;>
        <h1 className=&quot;text-3xl font-bold mb-6&quot;>
          Location Search & Google Maps Integration
        </h1>

        <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
          {/* Search panel */}
          <Card className=&quot;lg:col-span-2&quot;>
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

              <div className=&quot;mt-8&quot;>
                <h3 className=&quot;text-lg font-medium mb-3&quot;>Search Results</h3>
                <div className=&quot;space-y-3&quot;>
                  {searchResults.map((location) => (
                    <Card
                      key={location.id}
                      className=&quot;cursor-pointer hover:bg-accent/50 transition-colors&quot;
                      onClick={() => handleLocationSelect(location)}
                    >
                      <CardContent className=&quot;p-4&quot;>
                        <div className=&quot;flex justify-between items-start&quot;>
                          <div>
                            <div className=&quot;flex items-center gap-2&quot;>
                              <h4 className=&quot;font-medium&quot;>{location.name}</h4>
                              <Badge
                                variant={
                                  location.status === &quot;approved&quot;
                                    ? &quot;default&quot;
                                    : location.status === &quot;pending&quot;
                                      ? &quot;secondary&quot;
                                      : &quot;destructive&quot;
                                }
                              >
                                {location.status}
                              </Badge>
                            </div>
                            <div className=&quot;flex items-start mt-2&quot;>
                              <MapPin className=&quot;h-4 w-4 mr-2 mt-0.5 text-muted-foreground&quot; />
                              <div className=&quot;text-sm text-muted-foreground&quot;>
                                <p>{location.address1}</p>
                                {location.address2 && (
                                  <p>{location.address2}</p>
                                )}
                                <p>
                                  {location.city},{&quot; &quot;}
                                  {location.state?.abbreviation}{&quot; &quot;}
                                  {location.zipcode}
                                </p>
                              </div>
                            </div>
                          </div>
                          {&quot;distance&quot; in location && (
                            <Badge variant=&quot;outline&quot;>
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
              <div className=&quot;mb-4&quot;>
                <h3 className=&quot;text-sm font-medium mb-2&quot;>
                  Places Autocomplete
                </h3>
                <PlacesAutocomplete
                  onPlaceSelect={handlePlaceSelect}
                  placeholder=&quot;Search for a place&quot;
                  className=&quot;mb-4&quot;
                />
              </div>

              <Separator className=&quot;my-4&quot; />

              {selectedPlace && (
                <div className=&quot;mb-5 p-3 bg-accent rounded-lg&quot;>
                  <h3 className=&quot;font-medium mb-1&quot;>Selected Place</h3>
                  <p className=&quot;text-sm&quot;>{selectedPlace.formatted_address}</p>
                  {selectedPlace.geometry?.location && (
                    <div className=&quot;flex items-center mt-2 gap-2&quot;>
                      <Button
                        variant=&quot;outline&quot;
                        size=&quot;sm&quot;
                        className=&quot;text-xs&quot;
                        onClick={() => {
                          if (selectedPlace.geometry?.location) {
                            navigator.clipboard.writeText(
                              `${selectedPlace.geometry.location.lat()}, ${selectedPlace.geometry.location.lng()}`,
                            );
                            toast({
                              title: &quot;Coordinates copied&quot;,
                              description:
                                &quot;Location coordinates copied to clipboard&quot;,
                            });
                          }
                        }}
                      >
                        <Navigation className=&quot;h-3 w-3 mr-1&quot; /> Copy Coordinates
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {selectedLocation &&
              selectedLocation.latitude &&
              selectedLocation.longitude ? (
                <div className=&quot;space-y-4&quot;>
                  <LocationMap
                    latitude={selectedLocation.latitude}
                    longitude={selectedLocation.longitude}
                    className=&quot;w-full h-[300px] rounded-md border&quot;
                  />
                  <div className=&quot;p-3 bg-accent rounded-lg&quot;>
                    <h3 className=&quot;font-medium mb-1&quot;>
                      {selectedLocation.name}
                    </h3>
                    <p className=&quot;text-sm&quot;>
                      {selectedLocation.type} - {selectedLocation.status}
                    </p>
                    <p className=&quot;text-sm text-muted-foreground mt-1&quot;>
                      {selectedLocation.address1}, {selectedLocation.city},{&quot; &quot;}
                      {selectedLocation.state?.abbreviation}
                    </p>
                  </div>
                </div>
              ) : selectedPlace && selectedPlace.geometry?.location ? (
                <LocationMap
                  latitude={selectedPlace.geometry.location.lat()}
                  longitude={selectedPlace.geometry.location.lng()}
                  className=&quot;w-full h-[300px] rounded-md border&quot;
                />
              ) : (
                <div className=&quot;flex items-center justify-center bg-muted h-[300px] rounded-md border&quot;>
                  <div className=&quot;text-center p-4&quot;>
                    <MapPin className=&quot;h-8 w-8 mx-auto mb-2 text-muted-foreground/50&quot; />
                    <p className=&quot;text-muted-foreground">
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
