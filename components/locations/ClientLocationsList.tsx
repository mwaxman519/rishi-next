&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import {
  MapPin,
  Check,
  X,
  AlertCircle,
  Search,
  Loader2,
  PlusCircle,
  LocateFixed,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardHeader, CardTitle, CardContent } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Alert, AlertDescription } from &quot;@/components/ui/alert&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import FinalLocationPicker from &quot;@/components/locations/FinalLocationPicker&quot;;
import { useGoogleMaps } from &quot;@/contexts/GoogleMapsContext&quot;;

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  locationType: string;
  status: string;
  submittedById: string;
  submittedByName?: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandLocation {
  id: string;
  brandId: string;
  locationId: string;
  active: boolean;
  location: Location;
  createdAt: string;
}

interface ClientLocationsListProps {
  brandId: string;
}

export default function ClientLocationsList({
  brandId,
}: ClientLocationsListProps) {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isLoaded } = useGoogleMaps();

  // Fetch brand locations (locations already activated for this brand)
  const {
    data: brandLocationsData,
    isLoading: brandLocationsLoading,
    error: brandLocationsError,
  } = useQuery<{
    brandLocations?: BrandLocation[];
  }>({
    queryKey: [&quot;brandLocations&quot;, brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${brandId}/locations`);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch brand locations&quot;);
      }
      return res.json();
    },
    enabled: !!brandId,
  });

  // Fetch all approved locations (for adding new ones to the brand)
  const {
    data: approvedLocationsData,
    isLoading: approvedLocationsLoading,
    error: approvedLocationsError,
  } = useQuery<{
    locations?: Location[];
  }>({
    queryKey: [&quot;approvedLocations&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/locations/approved&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch approved locations&quot;);
      }
      return res.json();
    },
  });

  // Mutation for activating a location for a brand
  const activateMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const res = await fetch(`/api/brands/${brandId}/locations`, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({ locationId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || &quot;Failed to activate location&quot;);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;brandLocations&quot;, brandId] });
      toast({
        title: &quot;Location activated&quot;,
        description: &quot;Location has been successfully added to your brand.&quot;,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Activation failed&quot;,
        description: error.message,
      });
    },
  });

  // Mutation for updating a brand location (active/inactive)
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      brandLocationId,
      active,
    }: {
      brandLocationId: string;
      active: boolean;
    }) => {
      const res = await fetch(
        `/api/brands/${brandId}/locations/${brandLocationId}`,
        {
          method: &quot;PATCH&quot;,
          headers: {
            &quot;Content-Type&quot;: &quot;application/json&quot;,
          },
          body: JSON.stringify({ active }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || &quot;Failed to update location status&quot;);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;brandLocations&quot;, brandId] });
      toast({
        title: &quot;Status updated&quot;,
        description: &quot;Location status has been successfully updated.&quot;,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Update failed&quot;,
        description: error.message,
      });
    },
  });

  // Mutation for deactivating (removing) a location from a brand
  const deactivateMutation = useMutation({
    mutationFn: async (brandLocationId: string) => {
      const res = await fetch(
        `/api/brands/${brandId}/locations/${brandLocationId}`,
        {
          method: &quot;DELETE&quot;,
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || &quot;Failed to remove location&quot;);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;brandLocations&quot;, brandId] });
      toast({
        title: &quot;Location removed&quot;,
        description: &quot;Location has been successfully removed from your brand.&quot;,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: &quot;destructive&quot;,
        title: &quot;Removal failed&quot;,
        description: error.message,
      });
    },
  });

  // Handle search filter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter brand locations based on search query
  const filteredBrandLocations = brandLocationsData?.brandLocations
    ? brandLocationsData.brandLocations.filter(
        (bl: BrandLocation) =>
          bl.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bl.location.address
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bl.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bl.location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
          bl.location.zipCode.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : [];

  // Filter approved locations that are not already in the brand
  const alreadyAddedLocationIds = new Set(
    brandLocationsData?.brandLocations
      ? brandLocationsData.brandLocations.map(
          (bl: BrandLocation) => bl.locationId,
        )
      : [],
  );

  const availableApprovedLocations = approvedLocationsData?.locations
    ? approvedLocationsData.locations.filter(
        (location: Location) => !alreadyAddedLocationIds.has(location.id),
      )
    : [];

  // Filter available locations based on search query
  const filteredAvailableLocations = availableApprovedLocations.filter(
    (location: Location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.zipCode.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle activation toggle
  const handleActivationToggle = (brandLocation: BrandLocation) => {
    updateStatusMutation.mutate({
      brandLocationId: brandLocation.id,
      active: !brandLocation.active,
    });
  };

  // Handle adding a new location to brand
  const handleAddLocation = (locationId: string) => {
    activateMutation.mutate(locationId);
  };

  // Handle removing a location from brand
  const handleRemoveLocation = (brandLocationId: string) => {
    deactivateMutation.mutate(brandLocationId);
  };

  // Handle selecting a location on the map
  const handleLocationSelected = (locationId: string) => {
    setSelectedLocationId(locationId);
    setShowLocationPicker(false);
    // Activate the selected location
    activateMutation.mutate(locationId);
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
        <div className=&quot;relative w-full sm:w-80&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            type=&quot;search&quot;
            placeholder=&quot;Search locations...&quot;
            className=&quot;pl-8 w-full&quot;
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className=&quot;mr-2 h-4 w-4&quot; />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className=&quot;sm:max-w-[600px]&quot;>
            <DialogHeader>
              <DialogTitle>Add a New Location</DialogTitle>
              <DialogDescription>
                Select a location to add to your brand. Only approved locations
                can be added.
              </DialogDescription>
            </DialogHeader>

            <div className=&quot;py-4 max-h-[400px] overflow-y-auto&quot;>
              {approvedLocationsLoading ? (
                <div className=&quot;flex justify-center py-8&quot;>
                  <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
                </div>
              ) : approvedLocationsError ? (
                <Alert variant=&quot;destructive&quot;>
                  <AlertCircle className=&quot;h-4 w-4&quot; />
                  <AlertDescription>
                    Failed to load available locations. Please try again.
                  </AlertDescription>
                </Alert>
              ) : filteredAvailableLocations.length === 0 ? (
                <div className=&quot;text-center py-8&quot;>
                  <MapPin className=&quot;h-12 w-12 text-muted-foreground mx-auto mb-4&quot; />
                  <h3 className=&quot;text-lg font-medium mb-2&quot;>
                    No locations available
                  </h3>
                  <p className=&quot;text-muted-foreground max-w-md mx-auto&quot;>
                    {searchQuery
                      ? &quot;No approved locations match your search criteria.&quot;
                      : &quot;No approved locations are available to add to your brand.&quot;}
                  </p>
                </div>
              ) : (
                <div className=&quot;space-y-4&quot;>
                  {filteredAvailableLocations.map((location: Location) => (
                    <Card key={location.id} className=&quot;overflow-hidden&quot;>
                      <CardContent className=&quot;p-4&quot;>
                        <div className=&quot;flex justify-between items-start&quot;>
                          <div>
                            <h4 className=&quot;font-medium text-base&quot;>
                              {location.name}
                            </h4>
                            <p className=&quot;text-sm text-muted-foreground mb-1&quot;>
                              {location.address}
                            </p>
                            <p className=&quot;text-sm text-muted-foreground&quot;>
                              {location.city}, {location.state}{&quot; &quot;}
                              {location.zipCode}
                            </p>
                            <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
                              {location.locationType}
                            </Badge>
                          </div>
                          <Button
                            variant=&quot;default&quot;
                            size=&quot;sm&quot;
                            onClick={() => handleAddLocation(location.id)}
                          >
                            <PlusCircle className=&quot;h-4 w-4 mr-1&quot; />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className=&quot;gap-2 sm:gap-0&quot;>
              <Button
                variant=&quot;outline&quot;
                onClick={() => setShowLocationPicker(true)}
                disabled={!isLoaded}
              >
                <LocateFixed className=&quot;mr-2 h-4 w-4&quot; />
                Find on Map
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show location picker if enabled */}
      {showLocationPicker && (
        <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
          <DialogContent className=&quot;sm:max-w-[900px] sm:max-h-[80vh]&quot;>
            <DialogHeader>
              <DialogTitle>Select Location on Map</DialogTitle>
              <DialogDescription>
                Browse and select from approved locations on the map.
              </DialogDescription>
            </DialogHeader>

            <div className=&quot;h-[500px] mt-4&quot;>
              <FinalLocationPicker
                onAddressSelect={(data) => {
                  // Handle address selection for map-based location picking
                  console.log(&quot;Address selected:&quot;, data);
                }}
                onLocationSelected={handleLocationSelected}
                filterApprovedOnly={true}
                excludeLocationIds={Array.from(alreadyAddedLocationIds)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue=&quot;active&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;active&quot;>Active</TabsTrigger>
          <TabsTrigger value=&quot;inactive&quot;>Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;active&quot;>
          {brandLocationsLoading ? (
            <div className=&quot;flex justify-center py-8&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
            </div>
          ) : brandLocationsError ? (
            <Alert variant=&quot;destructive&quot;>
              <AlertCircle className=&quot;h-4 w-4&quot; />
              <AlertDescription>
                Failed to load brand locations. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredBrandLocations.filter((bl: BrandLocation) => bl.active)
              .length === 0 ? (
            <div className=&quot;text-center py-8 border rounded-lg&quot;>
              <MapPin className=&quot;h-12 w-12 text-muted-foreground mx-auto mb-4&quot; />
              <h3 className=&quot;text-lg font-medium mb-2&quot;>No active locations</h3>
              <p className=&quot;text-muted-foreground max-w-md mx-auto mb-6&quot;>
                {searchQuery
                  ? &quot;No active locations match your search criteria.&quot;
                  : &quot;You don&apos;t have any active locations for this brand yet. Active locations will appear in booking portals.&quot;}
              </p>
              <Button
                variant=&quot;outline&quot;
                onClick={() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      '[role=&quot;dialog&quot;] [role=&quot;button&quot;]',
                    )
                    ?.click()
                }
              >
                <PlusCircle className=&quot;mr-2 h-4 w-4&quot; />
                Add Your First Location
              </Button>
            </div>
          ) : (
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
              {filteredBrandLocations
                .filter((brandLocation: BrandLocation) => brandLocation.active)
                .map((brandLocation: BrandLocation) => (
                  <Card key={brandLocation.id} className=&quot;overflow-hidden&quot;>
                    <CardContent className=&quot;p-4&quot;>
                      <div className=&quot;flex flex-col h-full&quot;>
                        <div>
                          <h4 className=&quot;font-medium text-base&quot;>
                            {brandLocation.location.name}
                          </h4>
                          <p className=&quot;text-sm text-muted-foreground mb-1&quot;>
                            {brandLocation.location.address}
                          </p>
                          <p className=&quot;text-sm text-muted-foreground&quot;>
                            {brandLocation.location.city},{&quot; &quot;}
                            {brandLocation.location.state}{&quot; &quot;}
                            {brandLocation.location.zipCode}
                          </p>
                          <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
                            {brandLocation.location.locationType}
                          </Badge>
                        </div>

                        <div className=&quot;flex justify-between items-center mt-4 pt-4 border-t&quot;>
                          <div className=&quot;flex items-center space-x-2&quot;>
                            <Switch
                              id={`active-${brandLocation.id}`}
                              checked={brandLocation.active}
                              onCheckedChange={() =>
                                handleActivationToggle(brandLocation)
                              }
                            />
                            <Label htmlFor={`active-${brandLocation.id}`}>
                              {brandLocation.active ? &quot;Active&quot; : &quot;Inactive&quot;}
                            </Label>
                          </div>

                          <Button
                            variant=&quot;ghost&quot;
                            size=&quot;sm&quot;
                            className=&quot;text-destructive hover:text-destructive hover:bg-destructive/10&quot;
                            onClick={() =>
                              handleRemoveLocation(brandLocation.id)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value=&quot;inactive&quot;>
          {brandLocationsLoading ? (
            <div className=&quot;flex justify-center py-8&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
            </div>
          ) : brandLocationsError ? (
            <Alert variant=&quot;destructive&quot;>
              <AlertCircle className=&quot;h-4 w-4&quot; />
              <AlertDescription>
                Failed to load brand locations. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredBrandLocations.filter((bl: BrandLocation) => !bl.active)
              .length === 0 ? (
            <div className=&quot;text-center py-8 border rounded-lg&quot;>
              <MapPin className=&quot;h-12 w-12 text-muted-foreground mx-auto mb-4&quot; />
              <h3 className=&quot;text-lg font-medium mb-2&quot;>
                No inactive locations
              </h3>
              <p className=&quot;text-muted-foreground max-w-md mx-auto&quot;>
                {searchQuery
                  ? &quot;No inactive locations match your search criteria.&quot;
                  : &quot;You don&apos;t have any inactive locations for this brand.&quot;}
              </p>
            </div>
          ) : (
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
              {filteredBrandLocations
                .filter((brandLocation: BrandLocation) => !brandLocation.active)
                .map((brandLocation: BrandLocation) => (
                  <Card key={brandLocation.id} className=&quot;overflow-hidden&quot;>
                    <CardContent className=&quot;p-4&quot;>
                      <div className=&quot;flex flex-col h-full&quot;>
                        <div>
                          <h4 className=&quot;font-medium text-base&quot;>
                            {brandLocation.location.name}
                          </h4>
                          <p className=&quot;text-sm text-muted-foreground mb-1&quot;>
                            {brandLocation.location.address}
                          </p>
                          <p className=&quot;text-sm text-muted-foreground&quot;>
                            {brandLocation.location.city},{&quot; &quot;}
                            {brandLocation.location.state}{&quot; &quot;}
                            {brandLocation.location.zipCode}
                          </p>
                          <Badge variant=&quot;outline&quot; className=&quot;mt-2&quot;>
                            {brandLocation.location.locationType}
                          </Badge>
                        </div>

                        <div className=&quot;flex justify-between items-center mt-4 pt-4 border-t&quot;>
                          <div className=&quot;flex items-center space-x-2&quot;>
                            <Switch
                              id={`active-${brandLocation.id}`}
                              checked={brandLocation.active}
                              onCheckedChange={() =>
                                handleActivationToggle(brandLocation)
                              }
                            />
                            <Label htmlFor={`active-${brandLocation.id}`}>
                              {brandLocation.active ? &quot;Active&quot; : &quot;Inactive&quot;}
                            </Label>
                          </div>

                          <Button
                            variant=&quot;ghost&quot;
                            size=&quot;sm&quot;
                            className=&quot;text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              handleRemoveLocation(brandLocation.id)
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
