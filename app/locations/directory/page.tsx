"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LocationList,
  type Location,
} from "@/app/components/locations/LocationList";
import LocationMap from "@/app/components/locations/LocationMap";
import { useToast } from "@/hooks/use-toast";

export default function LocationsDirectoryPage() {
  const { toast } = useToast();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [activeView, setActiveView] = useState<string>("list");

  // Fetch locations from the API
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    error: locationsError,
  } = useQuery<{ locations: Location[] }>({
    queryKey: ["/api/locations"],
    queryFn: async () => {
      const res = await fetch("/api/locations");
      if (!res.ok) {
        throw new Error("Failed to fetch locations");
      }
      return res.json();
    },
  });

  // Fetch location metadata for filtering
  const { data: metadataData, isLoading: isMetadataLoading } = useQuery({
    queryKey: ["/api/locations/metadata"],
    queryFn: async () => {
      const res = await fetch("/api/locations/metadata");
      if (!res.ok) {
        throw new Error("Failed to fetch location metadata");
      }
      return res.json();
    },
  });

  // Handle location selection
  const handleSelectLocation = (location: Location) => {
    setSelectedLocationId(location.id);
  };

  // Show error toast if there's an API error
  useEffect(() => {
    if (locationsError) {
      toast({
        title: "Error loading locations",
        description:
          locationsError instanceof Error
            ? locationsError.message
            : "Something went wrong while loading locations",
        variant: "destructive",
      });
    }
  }, [locationsError, toast]);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Location Directory
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse and search all available locations
          </p>
        </div>
        <Button asChild>
          <Link href="/locations/add">
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      {metadataData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metadataData.stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Active Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metadataData.stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Available States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metadataData.metadata.states.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content - Tabs for List and Map views */}
      <Tabs
        defaultValue="list"
        value={activeView}
        onValueChange={setActiveView}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="map">Map View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {isLocationsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading locations...
              </span>
            </div>
          ) : locationsError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <XCircle className="h-8 w-8 text-destructive mb-2" />
              <h3 className="font-semibold">Error loading locations</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {locationsError instanceof Error
                  ? locationsError.message
                  : "Something went wrong while loading locations"}
              </p>
            </div>
          ) : (
            <LocationList
              locations={locationsData?.locations || []}
              onSelectLocation={handleSelectLocation}
              selectedLocationId={selectedLocationId}
              isAdmin={false}
              viewOnly={false}
              allowSelection={true}
              showStatus={false}
              showFilters={true}
              showActions={true}
              baseUrl="/locations"
              availableStates={metadataData?.metadata.states}
              availableCities={metadataData?.metadata.cities}
              initialView="grid"
            />
          )}
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          {isLocationsLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading locations map...
              </span>
            </div>
          ) : locationsError ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <XCircle className="h-8 w-8 text-destructive mb-2" />
              <h3 className="font-semibold">Error loading map</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                {locationsError instanceof Error
                  ? locationsError.message
                  : "Something went wrong while loading location data"}
              </p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden h-[600px]">
              <LocationMap
                locations={locationsData?.locations || []}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                height="100%"
                width="100%"
                showInfoWindow={true}
                clusterMarkers={true}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
