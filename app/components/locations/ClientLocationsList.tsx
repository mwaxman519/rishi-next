"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MapPin,
  Check,
  X,
  AlertCircle,
  Search,
  Loader2,
  PlusCircle,
  LocateFixed,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import FinalLocationPicker from "@/app/components/locations/FinalLocationPicker";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

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
  const [searchQuery, setSearchQuery] = useState("");
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
    queryKey: ["brandLocations", brandId],
    queryFn: async () => {
      const res = await fetch(`/api/brands/${brandId}/locations`);
      if (!res.ok) {
        throw new Error("Failed to fetch brand locations");
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
    queryKey: ["approvedLocations"],
    queryFn: async () => {
      const res = await fetch("/api/locations/approved");
      if (!res.ok) {
        throw new Error("Failed to fetch approved locations");
      }
      return res.json();
    },
  });

  // Mutation for activating a location for a brand
  const activateMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const res = await fetch(`/api/brands/${brandId}/locations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locationId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to activate location");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandLocations", brandId] });
      toast({
        title: "Location activated",
        description: "Location has been successfully added to your brand.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Activation failed",
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
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ active }),
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update location status");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandLocations", brandId] });
      toast({
        title: "Status updated",
        description: "Location status has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
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
          method: "DELETE",
        },
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to remove location");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brandLocations", brandId] });
      toast({
        title: "Location removed",
        description: "Location has been successfully removed from your brand.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Removal failed",
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search locations..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add a New Location</DialogTitle>
              <DialogDescription>
                Select a location to add to your brand. Only approved locations
                can be added.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 max-h-[400px] overflow-y-auto">
              {approvedLocationsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : approvedLocationsError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load available locations. Please try again.
                  </AlertDescription>
                </Alert>
              ) : filteredAvailableLocations.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No locations available
                  </h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {searchQuery
                      ? "No approved locations match your search criteria."
                      : "No approved locations are available to add to your brand."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAvailableLocations.map((location: Location) => (
                    <Card key={location.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-base">
                              {location.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-1">
                              {location.address}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {location.city}, {location.state}{" "}
                              {location.zipCode}
                            </p>
                            <Badge variant="outline" className="mt-2">
                              {location.locationType}
                            </Badge>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAddLocation(location.id)}
                          >
                            <PlusCircle className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setShowLocationPicker(true)}
                disabled={!isLoaded}
              >
                <LocateFixed className="mr-2 h-4 w-4" />
                Find on Map
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Show location picker if enabled */}
      {showLocationPicker && (
        <Dialog open={showLocationPicker} onOpenChange={setShowLocationPicker}>
          <DialogContent className="sm:max-w-[900px] sm:max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Select Location on Map</DialogTitle>
              <DialogDescription>
                Browse and select from approved locations on the map.
              </DialogDescription>
            </DialogHeader>

            <div className="h-[500px] mt-4">
              <FinalLocationPicker
                onAddressSelect={(data) => {
                  // Handle address selection for map-based location picking
                  console.log("Address selected:", data);
                }}
                onLocationSelected={handleLocationSelected}
                filterApprovedOnly={true}
                excludeLocationIds={Array.from(alreadyAddedLocationIds)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {brandLocationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : brandLocationsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load brand locations. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredBrandLocations.filter((bl: BrandLocation) => bl.active)
              .length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No active locations</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                {searchQuery
                  ? "No active locations match your search criteria."
                  : "You don't have any active locations for this brand yet. Active locations will appear in booking portals."}
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      '[role="dialog"] [role="button"]',
                    )
                    ?.click()
                }
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Your First Location
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrandLocations
                .filter((brandLocation: BrandLocation) => brandLocation.active)
                .map((brandLocation: BrandLocation) => (
                  <Card key={brandLocation.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div>
                          <h4 className="font-medium text-base">
                            {brandLocation.location.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-1">
                            {brandLocation.location.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {brandLocation.location.city},{" "}
                            {brandLocation.location.state}{" "}
                            {brandLocation.location.zipCode}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {brandLocation.location.locationType}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`active-${brandLocation.id}`}
                              checked={brandLocation.active}
                              onCheckedChange={() =>
                                handleActivationToggle(brandLocation)
                              }
                            />
                            <Label htmlFor={`active-${brandLocation.id}`}>
                              {brandLocation.active ? "Active" : "Inactive"}
                            </Label>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

        <TabsContent value="inactive">
          {brandLocationsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : brandLocationsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load brand locations. Please try again.
              </AlertDescription>
            </Alert>
          ) : filteredBrandLocations.filter((bl: BrandLocation) => !bl.active)
              .length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No inactive locations
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchQuery
                  ? "No inactive locations match your search criteria."
                  : "You don't have any inactive locations for this brand."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBrandLocations
                .filter((brandLocation: BrandLocation) => !brandLocation.active)
                .map((brandLocation: BrandLocation) => (
                  <Card key={brandLocation.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col h-full">
                        <div>
                          <h4 className="font-medium text-base">
                            {brandLocation.location.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mb-1">
                            {brandLocation.location.address}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {brandLocation.location.city},{" "}
                            {brandLocation.location.state}{" "}
                            {brandLocation.location.zipCode}
                          </p>
                          <Badge variant="outline" className="mt-2">
                            {brandLocation.location.locationType}
                          </Badge>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id={`active-${brandLocation.id}`}
                              checked={brandLocation.active}
                              onCheckedChange={() =>
                                handleActivationToggle(brandLocation)
                              }
                            />
                            <Label htmlFor={`active-${brandLocation.id}`}>
                              {brandLocation.active ? "Active" : "Inactive"}
                            </Label>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
