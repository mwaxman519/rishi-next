&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { MapPin, Plus, Loader2, XCircle } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  LocationList,
  type Location,
} from &quot;@/components/locations/LocationList&quot;;
import LocationMap from &quot;@/components/locations/LocationMap&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

export default function LocationsDirectoryPage() {
  const { toast } = useToast();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [activeView, setActiveView] = useState<string>(&quot;list&quot;);

  // Fetch locations from the API
  const {
    data: locationsData,
    isLoading: isLocationsLoading,
    error: locationsError,
  } = useQuery<{ locations: Location[] }>({
    queryKey: [&quot;/api/locations&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/locations&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch locations&quot;);
      }
      return res.json();
    },
  });

  // Fetch location metadata for filtering
  const { data: metadataData, isLoading: isMetadataLoading } = useQuery({
    queryKey: [&quot;/api/locations/metadata&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/locations/metadata&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch location metadata&quot;);
      }
      return res.json();
    },
  });

  // Handle location selection
  const handleSelectLocation = (location: Location) => {
    setSelectedLocationId(location.id);
  };

  // Show error toast if there&apos;s an API error
  useEffect(() => {
    if (locationsError) {
      toast({
        title: &quot;Error loading locations&quot;,
        description:
          locationsError instanceof Error
            ? locationsError.message
            : &quot;Something went wrong while loading locations&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  }, [locationsError, toast]);

  return (
    <div className=&quot;container mx-auto py-8 space-y-8&quot;>
      <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            Location Directory
          </h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            Browse and search all available locations
          </p>
        </div>
        <Button asChild>
          <Link href=&quot;/locations/add&quot;>
            <Plus className=&quot;mr-2 h-4 w-4&quot; />
            Add Location
          </Link>
        </Button>
      </div>

      {/* Stats cards */}
      {metadataData && (
        <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;text-base&quot;>Total Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-3xl font-bold&quot;>
                {metadataData.stats.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;text-base&quot;>Active Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-3xl font-bold&quot;>
                {metadataData.stats.active}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;text-base&quot;>Available States</CardTitle>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-3xl font-bold&quot;>
                {metadataData.metadata.states.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main content - Tabs for List and Map views */}
      <Tabs
        defaultValue=&quot;list&quot;
        value={activeView}
        onValueChange={setActiveView}
        className=&quot;space-y-4&quot;
      >
        <TabsList>
          <TabsTrigger value=&quot;list&quot;>List View</TabsTrigger>
          <TabsTrigger value=&quot;map&quot;>Map View</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;list&quot; className=&quot;space-y-4&quot;>
          {isLocationsLoading ? (
            <div className=&quot;flex justify-center items-center h-64&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
              <span className=&quot;ml-2 text-muted-foreground&quot;>
                Loading locations...
              </span>
            </div>
          ) : locationsError ? (
            <div className=&quot;flex flex-col items-center justify-center h-64 text-center&quot;>
              <XCircle className=&quot;h-8 w-8 text-destructive mb-2&quot; />
              <h3 className=&quot;font-semibold&quot;>Error loading locations</h3>
              <p className=&quot;text-sm text-muted-foreground mt-1 max-w-md&quot;>
                {locationsError instanceof Error
                  ? locationsError.message
                  : &quot;Something went wrong while loading locations&quot;}
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
              baseUrl=&quot;/locations&quot;
              availableStates={metadataData?.metadata.states}
              availableCities={metadataData?.metadata.cities}
              initialView=&quot;grid&quot;
            />
          )}
        </TabsContent>

        <TabsContent value=&quot;map&quot; className=&quot;space-y-4&quot;>
          {isLocationsLoading ? (
            <div className=&quot;flex justify-center items-center h-64&quot;>
              <Loader2 className=&quot;h-8 w-8 animate-spin text-primary&quot; />
              <span className=&quot;ml-2 text-muted-foreground&quot;>
                Loading locations map...
              </span>
            </div>
          ) : locationsError ? (
            <div className=&quot;flex flex-col items-center justify-center h-64 text-center&quot;>
              <XCircle className=&quot;h-8 w-8 text-destructive mb-2&quot; />
              <h3 className=&quot;font-semibold&quot;>Error loading map</h3>
              <p className=&quot;text-sm text-muted-foreground mt-1 max-w-md&quot;>
                {locationsError instanceof Error
                  ? locationsError.message
                  : &quot;Something went wrong while loading location data&quot;}
              </p>
            </div>
          ) : (
            <div className=&quot;rounded-md border overflow-hidden h-[600px]&quot;>
              <LocationMap
                locations={locationsData?.locations || []}
                selectedLocationId={selectedLocationId}
                onSelectLocation={handleSelectLocation}
                height=&quot;100%&quot;
                width=&quot;100%&quot;
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
