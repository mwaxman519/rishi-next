&quot;use client&quot;;

import { useState, useEffect, useCallback } from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { ScrollArea } from &quot;@/components/ui/scroll-area&quot;;

import { toast } from &quot;@/hooks/use-toast&quot;;
import {
  Search,
  Plus,
  Filter,
  BarChart,
  Grid2x2,
  MapPin,
  Eye,
  X,
  Clock,
  ChartBar,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { format } from &quot;date-fns&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import {
  LocationFilters,
  LocationFilterValues,
} from &quot;@/components/locations/LocationFilters&quot;;

import { SimplifiedLocationMap } from &quot;@/components/maps/SimplifiedLocationMap&quot;;

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
  submittedById?: string;
  createdById?: string;
  submittedByName?: string;
  submittedByOrganization?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminLocationsPage() {
  const { toast } = useToast();
  const [searchValue, setSearchValue] = useState("&quot;);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(&quot;map&quot;);
  const [viewMode, setViewMode] = useState<&quot;grid&quot; | &quot;list&quot;>(&quot;grid&quot;);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(
    new Set(),
  );
  const [bulkActionOpen, setBulkActionOpen] = useState<boolean>(false);
  const [advancedFilters, setAdvancedFilters] = useState<LocationFilterValues>({
    states: [],
    regions: [],
    cities: [],
    zipCodes: [],
    search: &quot;&quot;,
    status: [],
    locationType: [],
  });

  const googleMapsApiKey = &quot;AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg&quot;;

  // Fetch all locations data (including pending locations) from admin API
  const {
    data: locationsData,
    isLoading: locationsLoading,
    error: locationsError,
    refetch,
  } = useQuery<Location[]>({
    queryKey: [&quot;/api/admin/locations&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/admin/locations&quot;, {
        headers: {
          &quot;Cache-Control&quot;: &quot;no-cache&quot;,
          Pragma: &quot;no-cache&quot;,
        },
      });
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch locations&quot;);
      }
      return res.json();
    },
    // Set shorter staleTime to refresh data more frequently
    staleTime: 5000, // 5 seconds
    refetchOnWindowFocus: true,
  });

  // Refetch data on mount to ensure fresh data
  useEffect(() => {
    refetch();
  }, [refetch]);



  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), &quot;MMM d, yyyy&quot;);
    } catch (e) {
      return dateString;
    }
  };

  // Get color based on location type
  const getTypeColor = (type: string) => {
    if (!type) return &quot;bg-gray-600 text-gray-100&quot;;

    switch (type.toLowerCase()) {
      case &quot;venue&quot;:
      case &quot;event_venue&quot;:
        return &quot;bg-purple-700 text-purple-50&quot;;
      case &quot;office&quot;:
      case &quot;corporate_office&quot;:
        return &quot;bg-blue-700 text-blue-50&quot;;
      case &quot;retail&quot;:
      case &quot;store&quot;:
      case &quot;retail_store&quot;:
        return &quot;bg-green-700 text-green-50&quot;;
      case &quot;warehouse&quot;:
      case &quot;distribution_center&quot;:
        return &quot;bg-amber-700 text-amber-50&quot;;
      default:
        return &quot;bg-gray-600 text-gray-100&quot;;
    }
  };

  // Apply filters to locations data
  const filteredLocations =
    locationsData?.filter((location) => {
      // Apply text search filter
      const searchMatch =
        !searchValue ||
        location.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        location.address.toLowerCase().includes(searchValue.toLowerCase()) ||
        location.city.toLowerCase().includes(searchValue.toLowerCase()) ||
        location.state.toLowerCase().includes(searchValue.toLowerCase()) ||
        (location.zipCode &&
          location.zipCode.toLowerCase().includes(searchValue.toLowerCase()));

      // Apply advanced filters if they exist
      const stateMatch =
        !advancedFilters.states.length ||
        advancedFilters.states.includes(location.state);
      const cityMatch =
        !advancedFilters.cities.length ||
        advancedFilters.cities.includes(location.city);
      const zipMatch =
        !advancedFilters.zipCodes.length ||
        (location.zipCode &&
          advancedFilters.zipCodes.includes(location.zipCode));
      const statusMatch =
        !advancedFilters.status.length ||
        advancedFilters.status.includes(location.status);
      const typeMatch =
        !advancedFilters.locationType.length ||
        (location.locationType &&
          advancedFilters.locationType.includes(location.locationType));

      return (
        searchMatch &&
        stateMatch &&
        cityMatch &&
        zipMatch &&
        statusMatch &&
        typeMatch
      );
    }) || [];

  // Calculate count statistics
  const pendingCount = filteredLocations.filter(
    (loc) => loc.status === &quot;pending&quot;,
  ).length;
  const approvedCount = filteredLocations.filter(
    (loc) => loc.status === &quot;approved&quot;,
  ).length;
  const rejectedCount = filteredLocations.filter(
    (loc) => loc.status === &quot;rejected&quot;,
  ).length;
  const totalCount = filteredLocations.length;

  // Toggle selection of a location
  const toggleLocationSelection = (locationId: string) => {
    setSelectedLocations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(locationId)) {
        newSet.delete(locationId);
      } else {
        newSet.add(locationId);
      }
      return newSet;
    });
  };

  // Handle bulk approval of selected locations
  const handleBulkApprove = async () => {
    if (selectedLocations.size === 0) return;

    try {
      const response = await fetch(&quot;/api/admin/locations/bulk-update&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          locationIds: Array.from(selectedLocations),
          status: &quot;approved&quot;,
        }),
      });

      if (!response.ok) {
        throw new Error(&quot;Failed to approve locations&quot;);
      }

      toast({
        title: &quot;Locations Approved&quot;,
        description: `Successfully approved ${selectedLocations.size} locations`,
      });

      // Clear selection and refetch data
      setSelectedLocations(new Set());
      refetch();
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description:
          error instanceof Error
            ? error.message
            : &quot;Failed to approve locations&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  return (
    <div className=&quot;w-full min-h-screen bg-background text-foreground&quot;>
      <div className=&quot;container mx-auto py-8 px-4 space-y-6&quot;>
        {/* Page Header: Title with Action Buttons */}
        <div className=&quot;flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8&quot;>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
              Location Management
            </h1>
            <p className=&quot;text-gray-400 mt-1&quot;>
              View, filter, and manage all locations in the system
            </p>
          </div>

          <div className=&quot;flex gap-3&quot;>
            <Link
              href=&quot;/admin/locations/approval-queue&quot;
              className=&quot;inline-flex items-center justify-center rounded-md bg-amber-900/30 border border-amber-600/30 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-900/40 transition&quot;
            >
              <Badge className=&quot;bg-amber-500 hover:bg-amber-500 mr-2 h-5 w-5 rounded-full p-0 text-center text-xs font-semibold&quot;>
                {pendingCount}
              </Badge>
              Pending Approvals
            </Link>

            <Button asChild className=&quot;bg-blue-600 hover:bg-blue-700&quot;>
              <Link href=&quot;/admin/locations/new&quot;>
                <Plus className=&quot;mr-2 h-4 w-4&quot; />
                Add New Location
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className=&quot;flex flex-wrap gap-3 mb-4&quot;>
          <div className=&quot;relative flex-grow&quot;>
            <Input
              placeholder=&quot;Search by name, address, city...&quot;
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className=&quot;pr-10&quot;
            />
            {searchValue && (
              <Button
                variant=&quot;ghost&quot;
                size=&quot;icon&quot;
                className=&quot;absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8&quot;
                onClick={() => setSearchValue(&quot;&quot;)}
              >
                <X className=&quot;h-4 w-4&quot; />
              </Button>
            )}
          </div>

          <Button
            variant=&quot;outline&quot;
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={isFilterOpen ? &quot;border-primary/50 bg-primary/10&quot; : &quot;&quot;}
          >
            <Filter className=&quot;h-4 w-4 mr-2&quot; />
            Filters
          </Button>

          <div className=&quot;flex gap-2 ml-auto&quot;>
            <Badge
              variant=&quot;outline&quot;
              className=&quot;rounded-md bg-amber-900/10 border-amber-500/20 text-amber-400&quot;
            >
              <Clock className=&quot;mr-1 h-3 w-3&quot; />
              Pending: {pendingCount}
            </Badge>

            <Badge
              variant=&quot;outline&quot;
              className=&quot;rounded-md bg-green-900/10 border-green-500/20 text-green-400&quot;
            >
              <ChartBar className=&quot;mr-1 h-3 w-3&quot; />
              Approved: {approvedCount}
            </Badge>

            <Badge
              variant=&quot;outline&quot;
              className=&quot;rounded-md bg-blue-900/10 border-blue-500/20 text-blue-400&quot;
            >
              <BarChart className=&quot;mr-1 h-3 w-3&quot; />
              Total: {totalCount}
            </Badge>
          </div>
        </div>

        {/* Filters - conditionally shown */}
        {isFilterOpen && (
          <Card className=&quot;bg-card/50&quot;>
            <CardContent className=&quot;pt-6&quot;>
              <LocationFilters
                onFilterChange={setAdvancedFilters}
                initialValues={advancedFilters}
              />
            </CardContent>
          </Card>
        )}

        {/* Bulk actions - conditionally shown when locations are selected */}
        {selectedLocations.size > 0 && (
          <div className=&quot;bg-blue-900/30 border border-blue-500/30 rounded-md p-3 flex justify-between items-center&quot;>
            <div className=&quot;text-blue-200&quot;>
              <span className=&quot;font-semibold&quot;>{selectedLocations.size}</span>{&quot; &quot;}
              locations selected
            </div>
            <div className=&quot;flex gap-2&quot;>
              <Button
                size=&quot;sm&quot;
                variant=&quot;outline&quot;
                className=&quot;border-blue-500/50 text-blue-300 hover:bg-blue-900/40&quot;
                onClick={() => setSelectedLocations(new Set())}
              >
                Clear
              </Button>
              <Button
                size=&quot;sm&quot;
                className=&quot;bg-green-700 hover:bg-green-800 text-green-50&quot;
                onClick={handleBulkApprove}
              >
                Approve Selected
              </Button>
            </div>
          </div>
        )}

        {/* Tabs for different location views */}
        <Tabs
          defaultValue={activeTab}
          onValueChange={setActiveTab}
          className=&quot;w-full&quot;
        >
          <div className=&quot;flex justify-between items-center mb-4&quot;>
            <TabsList className=&quot;bg-muted/50&quot;>
              <TabsTrigger
                value=&quot;list&quot;
                className=&quot;data-[state=active]:bg-background&quot;
              >
                <Grid2x2 className=&quot;h-4 w-4 mr-2&quot; />
                List View
              </TabsTrigger>
              <TabsTrigger
                value=&quot;grid&quot;
                className=&quot;data-[state=active]:bg-background&quot;
              >
                <Grid2x2 className=&quot;h-4 w-4 mr-2&quot; />
                Grid View
              </TabsTrigger>
              <TabsTrigger
                value=&quot;map&quot;
                className=&quot;data-[state=active]:bg-background&quot;
              >
                <MapPin className=&quot;h-4 w-4 mr-2&quot; />
                Map View
              </TabsTrigger>
            </TabsList>
          </div>

          {/* List View Tab Content */}
          <TabsContent value=&quot;list&quot; className=&quot;mt-0&quot;>
            <Card>
              <CardContent className=&quot;p-0&quot;>
                {locationsLoading ? (
                  <div className=&quot;p-8 text-center&quot;>
                    <div className=&quot;animate-pulse flex flex-col items-center&quot;>
                      <div className=&quot;h-12 w-12 bg-gray-700 rounded-full mb-4&quot;></div>
                      <div className=&quot;h-4 w-48 bg-gray-700 rounded mb-2&quot;></div>
                      <div className=&quot;h-3 w-32 bg-gray-700 rounded&quot;></div>
                    </div>
                  </div>
                ) : locationsError ? (
                  <div className=&quot;p-8 text-center text-red-400&quot;>
                    <p>
                      Error loading locations:{&quot; &quot;}
                      {locationsError instanceof Error
                        ? locationsError.message
                        : &quot;Unknown error&quot;}
                    </p>
                    <Button
                      variant=&quot;outline&quot;
                      onClick={() => refetch()}
                      className=&quot;mt-4 border-red-700 text-red-400 hover:bg-red-950/30&quot;
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className=&quot;overflow-x-auto&quot;>
                    <table className=&quot;w-full&quot;>
                      <thead>
                        <tr className=&quot;bg-muted/50&quot;>
                          <th className=&quot;py-3 px-4 text-left font-medium text-sm&quot;>
                            Name
                          </th>
                          <th className=&quot;py-3 px-4 text-left font-medium text-sm&quot;>
                            Location
                          </th>
                          <th className=&quot;py-3 px-4 text-left font-medium text-sm&quot;>
                            Type
                          </th>
                          <th className=&quot;py-3 px-4 text-left font-medium text-sm&quot;>
                            Status
                          </th>
                          <th className=&quot;py-3 px-4 text-left font-medium text-sm&quot;>
                            Added
                          </th>
                          <th className=&quot;py-3 px-4 text-left font-medium text-sm&quot;>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className=&quot;divide-y divide-border&quot;>
                        {filteredLocations.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className=&quot;py-6 text-center text-muted-foreground&quot;
                            >
                              <MapPin className=&quot;h-10 w-10 text-gray-500 mx-auto mb-4&quot; />
                              <p className=&quot;text-gray-400 mb-1&quot;>
                                No locations found
                              </p>
                              <p className=&quot;text-gray-500 text-sm&quot;>
                                Try adjusting your search or filters
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredLocations.map((location) => (
                            <tr
                              key={location.id}
                              className={`hover:bg-muted/30 transition-colors ${selectedLocationId === location.id ? &quot;bg-blue-900/20 border-l-4 border-blue-500&quot; : &quot;&quot;}`}
                              onClick={() => setSelectedLocationId(location.id)}
                            >
                              <td className=&quot;py-3 px-4&quot;>
                                <div className=&quot;font-medium&quot;>
                                  {location.name}
                                </div>
                              </td>
                              <td className=&quot;py-3 px-4&quot;>
                                <div className=&quot;text-sm&quot;>
                                  {location.city}, {location.state}
                                </div>
                                <div className=&quot;text-xs text-muted-foreground&quot;>
                                  {location.zipCode}
                                </div>
                              </td>
                              <td className=&quot;py-3 px-4&quot;>
                                {location.locationType && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(location.locationType)}`}
                                  >
                                    {location.locationType}
                                  </span>
                                )}
                              </td>
                              <td className=&quot;py-3 px-4&quot;>
                                <Badge
                                  className={`
                                  ${location.status === &quot;approved&quot; ? &quot;bg-green-700 text-green-100&quot; : &quot;&quot;} 
                                  ${location.status === &quot;pending&quot; ? &quot;bg-amber-700 text-amber-100&quot; : &quot;&quot;} 
                                  ${location.status === &quot;rejected&quot; ? &quot;bg-red-700 text-red-100&quot; : &quot;&quot;}
                                `}
                                >
                                  {location.status || &quot;Unknown&quot;}
                                </Badge>
                              </td>
                              <td className=&quot;py-3 px-4&quot;>
                                <div className=&quot;text-sm&quot;>
                                  {formatDate(location.createdAt)}
                                </div>
                              </td>
                              <td className=&quot;py-3 px-4&quot;>
                                <Button asChild variant=&quot;ghost&quot; size=&quot;sm&quot;>
                                  <Link
                                    href={`/admin/locations/${location.id}`}
                                  >
                                    <Eye className=&quot;h-4 w-4 mr-1&quot; />
                                    View
                                  </Link>
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grid View Tab Content */}
          <TabsContent value=&quot;grid&quot; className=&quot;mt-0&quot;>
            {locationsLoading ? (
              <div className=&quot;p-8 text-center&quot;>
                <div className=&quot;animate-pulse flex flex-col items-center&quot;>
                  <div className=&quot;h-12 w-12 bg-gray-700 rounded-full mb-4&quot;></div>
                  <div className=&quot;h-4 w-48 bg-gray-700 rounded mb-2&quot;></div>
                  <div className=&quot;h-3 w-32 bg-gray-700 rounded&quot;></div>
                </div>
              </div>
            ) : locationsError ? (
              <div className=&quot;p-8 text-center text-red-400&quot;>
                <p>
                  Error loading locations:{&quot; &quot;}
                  {locationsError instanceof Error
                    ? locationsError.message
                    : &quot;Unknown error&quot;}
                </p>
                <Button
                  variant=&quot;outline&quot;
                  onClick={() => refetch()}
                  className=&quot;mt-4 border-red-700 text-red-400 hover:bg-red-950/30&quot;
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className=&quot;grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4&quot;>
                {filteredLocations.length === 0 ? (
                  <div className=&quot;col-span-full text-center p-8 border border-dashed border-gray-700 rounded-md&quot;>
                    <MapPin className=&quot;h-10 w-10 text-gray-500 mx-auto mb-4&quot; />
                    <p className=&quot;text-gray-400 mb-1&quot;>No locations found</p>
                    <p className=&quot;text-gray-500 text-sm&quot;>
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <Card
                      key={location.id}
                      className={`bg-card dark:bg-card/90 relative overflow-hidden transition ${
                        selectedLocationId === location.id
                          ? &quot;border-2 border-blue-500 shadow-lg shadow-blue-900/30&quot;
                          : &quot;hover:border-gray-600&quot;
                      }`}
                      onClick={() => setSelectedLocationId(location.id)}
                    >
                      <CardHeader className=&quot;p-4 pb-2&quot;>
                        <CardTitle className=&quot;text-lg font-semibold truncate&quot;>
                          {location.name}
                        </CardTitle>
                        <p className=&quot;text-xs text-gray-400&quot;>
                          Added {formatDate(location.createdAt)}
                        </p>
                      </CardHeader>

                      <CardContent className=&quot;p-4 pt-2 pb-2&quot;>
                        <div className=&quot;mb-3 text-sm&quot;>{location.address}</div>
                        <div className=&quot;flex items-center gap-2 mb-3&quot;>
                          <Badge
                            className=&quot;px-2 py-0.5 text-xs&quot;
                            variant=&quot;outline&quot;
                          >
                            {location.city}, {location.state}
                          </Badge>
                          {location.zipCode && (
                            <Badge
                              className=&quot;px-2 py-0.5 text-xs&quot;
                              variant=&quot;outline&quot;
                            >
                              {location.zipCode}
                            </Badge>
                          )}
                        </div>
                        <div className=&quot;flex flex-wrap gap-2 mb-3&quot;>
                          {location.locationType && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(location.locationType)}`}
                            >
                              {location.locationType}
                            </span>
                          )}
                          <Badge
                            className={`
                            ${location.status === &quot;approved&quot; ? &quot;bg-green-700 text-green-100&quot; : &quot;&quot;} 
                            ${location.status === &quot;pending&quot; ? &quot;bg-amber-700 text-amber-100&quot; : &quot;&quot;} 
                            ${location.status === &quot;rejected&quot; ? &quot;bg-red-700 text-red-100&quot; : &quot;&quot;}
                          `}
                          >
                            {location.status || &quot;Unknown&quot;}
                          </Badge>
                        </div>
                      </CardContent>

                      <div className=&quot;p-4 pt-2 flex justify-between items-center&quot;>
                        <div className=&quot;text-xs text-gray-400&quot;>
                          Updated {formatDate(location.updatedAt)}
                        </div>
                        <Button asChild variant=&quot;ghost&quot; size=&quot;sm&quot;>
                          <Link href={`/admin/locations/${location.id}`}>
                            <Eye className=&quot;h-4 w-4 mr-1&quot; />
                            View
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {/* Map View Tab Content */}
          <TabsContent value=&quot;map&quot; className=&quot;mt-0&quot;>
            <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-4&quot;>
              <Card className=&quot;overflow-hidden lg:col-span-2&quot;>
                <CardContent className=&quot;p-0&quot;>
                  {locationsLoading ? (
                    <div className=&quot;p-8 text-center h-96 flex items-center justify-center&quot;>
                      <div className=&quot;animate-pulse flex flex-col items-center&quot;>
                        <div className=&quot;h-12 w-12 bg-gray-700 rounded-full mb-4&quot;></div>
                        <div className=&quot;h-4 w-48 bg-gray-700 rounded mb-2&quot;></div>
                        <div className=&quot;h-3 w-32 bg-gray-700 rounded&quot;></div>
                      </div>
                    </div>
                  ) : locationsError ? (
                    <div className=&quot;p-8 text-center text-red-400 h-96 flex flex-col items-center justify-center&quot;>
                      <p>
                        Error loading locations:{&quot; &quot;}
                        {locationsError instanceof Error
                          ? locationsError.message
                          : &quot;Unknown error&quot;}
                      </p>
                      <Button
                        variant=&quot;outline&quot;
                        onClick={() => refetch()}
                        className=&quot;mt-4 border-red-700 text-red-400 hover:bg-red-950/30&quot;
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className=&quot;relative h-[75vh] md:h-[650px]&quot;>
                      <SimplifiedLocationMap
                        selectedLocationId={selectedLocationId}
                        onSelectLocation={(locationId) => {
                          if (locationId) {
                            setSelectedLocationId(locationId);
                          }
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location list for the map view - very compact design */}
              <Card className=&quot;h-[75vh] md:h-[650px] overflow-hidden&quot;>
                <CardHeader className=&quot;p-2 pb-1 border-b&quot;>
                  <CardTitle className=&quot;text-sm font-semibold&quot;>
                    Locations ({filteredLocations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className=&quot;p-0&quot;>
                  <ScrollArea className=&quot;h-[calc(75vh-40px)] md:h-[calc(650px-40px)]&quot;>
                    {locationsLoading ? (
                      <div className=&quot;p-2 text-center&quot;>
                        <div className=&quot;animate-pulse flex flex-col items-center&quot;>
                          <div className=&quot;h-8 w-8 bg-gray-700 rounded-full mb-2&quot;></div>
                          <div className=&quot;h-2 w-24 bg-gray-700 rounded&quot;></div>
                        </div>
                      </div>
                    ) : locationsError ? (
                      <div className=&quot;p-2 text-center text-red-400 text-xs&quot;>
                        <p>Failed to load locations</p>
                      </div>
                    ) : filteredLocations.length === 0 ? (
                      <div className=&quot;p-2 text-center text-muted-foreground text-xs&quot;>
                        <p>No locations found</p>
                      </div>
                    ) : (
                      <div className=&quot;divide-y divide-border&quot;>
                        {filteredLocations.map((location) => (
                          <div
                            key={location.id}
                            className={`py-2 px-3 cursor-pointer hover:bg-muted/50 transition-colors text-xs ${
                              selectedLocationId === location.id
                                ? &quot;bg-primary/10 border-l-2 border-l-primary&quot;
                                : &quot;&quot;
                            }`}
                            onClick={() => setSelectedLocationId(location.id)}
                          >
                            <div className=&quot;font-semibold truncate&quot;>
                              {location.name}
                            </div>
                            <div className=&quot;text-muted-foreground truncate text-xs&quot;>
                              {location.address}
                            </div>
                            <div className=&quot;flex items-center gap-1 mt-1&quot;>
                              <span className=&quot;text-[10px] text-muted-foreground&quot;>
                                {location.city}, {location.state}
                              </span>
                              {location.status && (
                                <span
                                  className={`inline-block ml-auto px-1.5 py-0.5 text-[10px] rounded-sm 
                                  ${location.status === &quot;approved&quot; || location.status === &quot;active&quot; ? &quot;bg-green-700/20 text-green-400&quot; : &quot;&quot;} 
                                  ${location.status === &quot;pending&quot; ? &quot;bg-amber-700/20 text-amber-400&quot; : &quot;&quot;} 
                                  ${location.status === &quot;rejected&quot; ? &quot;bg-red-700/20 text-red-400&quot; : &quot;&quot;}
                                  ${location.status === &quot;inactive&quot; ? &quot;bg-gray-700/20 text-gray-400&quot; : &quot;&quot;}
                                `}
                                >
                                  {location.status === &quot;active&quot;
                                    ? &quot;approved&quot;
                                    : location.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className=&quot;text-xs text-gray-500 mt-4 text-center">
          <p>
            Locations are global entities that can be shared across
            organizations.
          </p>
        </div>
      </div>
    </div>
  );
}
