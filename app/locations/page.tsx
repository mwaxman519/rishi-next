&quot;use client&quot;;

import React, { useState, useEffect, useRef } from &quot;react&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  MapPin,
  Map,
  Globe,
  Building,
  Plus,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Loader2,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { PendingLocationsList } from &quot;@/components/locations/PendingLocationsList&quot;;
import { LocationMap } from &quot;@/components/maps/LocationMap&quot;;
import { ClusteredLocationMap } from &quot;@/components/maps/ClusteredLocationMap&quot;;
import { GoogleMapsProvider } from &quot;@/components/maps/GoogleMapsContext&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useLocations, LocationFilters } from &quot;@/hooks/useLocations&quot;;

export default function LocationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(&quot;map&quot;);
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [filters, setFilters] = useState<LocationFilters>({});
  const [resetFilter, setResetFilter] = useState(false);

  // Fetch locations data with the current filters
  const { locations, isLoading, stats } = useLocations(filters);

  // Convert locations data to format expected by the map component
  const mapLocations = locations
    .map((loc) => ({
      id: loc.id,
      latitude: Number(loc.geoLat) || 0,
      longitude: Number(loc.geoLng) || 0,
      name: loc.name,
      address: loc.address1 + (loc.address2 ? `, ${loc.address2}` : &quot;&quot;),
      city: loc.city,
      state: loc.state || loc.stateCode || &quot;&quot;,
      type: loc.type,
      status: loc.status,
    }))
    .filter((loc) => loc.latitude && loc.longitude);

  // Handle filter changes from the map
  const handleFilterChange = (newFilters: {
    type?: string;
    status?: string;
    state?: string;
  }) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setFilters((prev) => ({
      ...prev,
      search: query,
    }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery(&quot;&quot;);
    setFilters({});
    setResetFilter(true);
    // Reset the resetFilter state after a short delay to allow components to react
    setTimeout(() => setResetFilter(false), 100);
  };

  // Navigate to location detail
  const handleViewLocation = (locationId: string) => {
    router.push(`/locations/${locationId}`);
  };

  // Filtered state data for states list
  const statesList = Object.entries(stats?.byState || {})
    .map(([name, count]) => ({
      name,
      count,
      code: getStateCode(name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Function to get state code (simplified)
  function getStateCode(stateName: string): string {
    const stateCodes: Record<string, string> = {
      Alabama: &quot;AL&quot;,
      Alaska: &quot;AK&quot;,
      Arizona: &quot;AZ&quot;,
      Arkansas: &quot;AR&quot;,
      California: &quot;CA&quot;,
      Colorado: &quot;CO&quot;,
      Connecticut: &quot;CT&quot;,
      Delaware: &quot;DE&quot;,
      Florida: &quot;FL&quot;,
      Georgia: &quot;GA&quot;,
      Hawaii: &quot;HI&quot;,
      Idaho: &quot;ID&quot;,
      Illinois: &quot;IL&quot;,
      Indiana: &quot;IN&quot;,
      Iowa: &quot;IA&quot;,
      Kansas: &quot;KS&quot;,
      Kentucky: &quot;KY&quot;,
      Louisiana: &quot;LA&quot;,
      Maine: &quot;ME&quot;,
      Maryland: &quot;MD&quot;,
      Massachusetts: &quot;MA&quot;,
      Michigan: &quot;MI&quot;,
      Minnesota: &quot;MN&quot;,
      Mississippi: &quot;MS&quot;,
      Missouri: &quot;MO&quot;,
      Montana: &quot;MT&quot;,
      Nebraska: &quot;NE&quot;,
      Nevada: &quot;NV&quot;,
      &quot;New Hampshire&quot;: &quot;NH&quot;,
      &quot;New Jersey&quot;: &quot;NJ&quot;,
      &quot;New Mexico&quot;: &quot;NM&quot;,
      &quot;New York&quot;: &quot;NY&quot;,
      &quot;North Carolina&quot;: &quot;NC&quot;,
      &quot;North Dakota&quot;: &quot;ND&quot;,
      Ohio: &quot;OH&quot;,
      Oklahoma: &quot;OK&quot;,
      Oregon: &quot;OR&quot;,
      Pennsylvania: &quot;PA&quot;,
      &quot;Rhode Island&quot;: &quot;RI&quot;,
      &quot;South Carolina&quot;: &quot;SC&quot;,
      &quot;South Dakota&quot;: &quot;SD&quot;,
      Tennessee: &quot;TN&quot;,
      Texas: &quot;TX&quot;,
      Utah: &quot;UT&quot;,
      Vermont: &quot;VT&quot;,
      Virginia: &quot;VA&quot;,
      Washington: &quot;WA&quot;,
      &quot;West Virginia&quot;: &quot;WV&quot;,
      Wisconsin: &quot;WI&quot;,
      Wyoming: &quot;WY&quot;,
    };
    return stateCodes[stateName] || &quot;XX&quot;;
  }

  return (
    <div className=&quot;container mx-auto py-6 space-y-8&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Locations</h1>
        <div className=&quot;space-x-3&quot;>
          <Link
            href=&quot;/locations/states/new&quot;
            className=&quot;inline-flex items-center justify-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20&quot;
          >
            <Plus className=&quot;mr-2 h-4 w-4&quot; />
            Add State
          </Link>
          <Link
            href=&quot;/locations/add&quot;
            className=&quot;inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90&quot;
          >
            <Plus className=&quot;mr-2 h-4 w-4&quot; />
            Add Venue
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;map&quot;>Map View</TabsTrigger>
          <TabsTrigger value=&quot;states&quot;>States</TabsTrigger>
          <TabsTrigger value=&quot;regions&quot;>Regions</TabsTrigger>
          <TabsTrigger value=&quot;venues&quot;>Venues</TabsTrigger>
          <TabsTrigger value=&quot;pending&quot;>Pending Approval</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;map&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;flex items-center justify-between&quot;>
            <p className=&quot;text-muted-foreground&quot;>
              Interactive map of all service areas and venues.
            </p>

            <div className=&quot;flex items-center gap-2&quot;>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                <Input
                  type=&quot;text&quot;
                  placeholder=&quot;Search locations...&quot;
                  className=&quot;w-[200px] pl-9&quot;
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle>Location Map</CardTitle>
              <CardDescription>
                Interactive map with clustering and filtering capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className=&quot;p-6 pt-0&quot;>
              <div className=&quot;relative border rounded-md&quot;>
                <GoogleMapsProvider>
                  {isLoading ? (
                    <div className=&quot;h-[600px] flex items-center justify-center&quot;>
                      <div className=&quot;flex flex-col items-center&quot;>
                        <Loader2 className=&quot;h-8 w-8 animate-spin text-primary mb-2&quot; />
                        <p className=&quot;text-sm text-muted-foreground&quot;>
                          Loading locations...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ClusteredLocationMap
                      locations={mapLocations}
                      height={600}
                      onViewLocationDetail={handleViewLocation}
                      enableFiltering
                      onFilterChange={handleFilterChange}
                      resetFilter={resetFilter}
                      stats={stats}
                    />
                  )}
                </GoogleMapsProvider>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;states&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <div>
              <h2 className=&quot;text-2xl font-semibold&quot;>States</h2>
              <p className=&quot;text-muted-foreground&quot;>
                Manage states and their service areas
              </p>
            </div>

            <Button variant=&quot;outline&quot; asChild>
              <Link href=&quot;/locations/states/new&quot;>
                <Plus className=&quot;mr-2 h-4 w-4&quot; />
                Add State
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className=&quot;px-6 py-4&quot;>
              <div className=&quot;flex justify-between items-center&quot;>
                <div>
                  <CardTitle>States List</CardTitle>
                  <CardDescription>
                    All states with service coverage
                  </CardDescription>
                </div>

                <div className=&quot;flex items-center gap-2&quot;>
                  <div className=&quot;relative&quot;>
                    <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      type=&quot;text&quot;
                      placeholder=&quot;Search states...&quot;
                      className=&quot;w-[150px] sm:w-[250px] pl-9 h-9&quot;
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className=&quot;px-6 py-0&quot;>
              {isLoading ? (
                <div className=&quot;space-y-2 py-4&quot;>
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className=&quot;h-12 w-full&quot; />
                  ))}
                </div>
              ) : statesList.length === 0 ? (
                <div className=&quot;py-12 text-center&quot;>
                  <Building className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
                  <h3 className=&quot;mt-4 text-lg font-medium&quot;>No States Found</h3>
                  <p className=&quot;mt-2 text-sm text-muted-foreground max-w-md mx-auto&quot;>
                    There are no states currently in the system. Add a state to
                    get started.
                  </p>
                  <Button className=&quot;mt-4&quot; variant=&quot;outline&quot; asChild>
                    <Link href=&quot;/locations/states/new&quot;>
                      <Plus className=&quot;mr-2 h-4 w-4&quot; />
                      Add First State
                    </Link>
                  </Button>
                </div>
              ) : (
                <table className=&quot;w-full&quot;>
                  <thead>
                    <tr className=&quot;border-b&quot;>
                      <th className=&quot;text-left py-3 px-2&quot;>
                        <div className=&quot;flex items-center&quot;>
                          <span className=&quot;text-sm font-medium&quot;>State</span>
                          <ArrowUpDown className=&quot;ml-1 h-3 w-3&quot; />
                        </div>
                      </th>
                      <th className=&quot;text-left py-3 px-2&quot;>
                        <div className=&quot;flex items-center&quot;>
                          <span className=&quot;text-sm font-medium&quot;>Code</span>
                        </div>
                      </th>
                      <th className=&quot;text-center py-3 px-2&quot;>
                        <div className=&quot;flex items-center justify-center&quot;>
                          <span className=&quot;text-sm font-medium&quot;>Venues</span>
                        </div>
                      </th>
                      <th className=&quot;text-right py-3 px-2&quot;>
                        <span className=&quot;text-sm font-medium&quot;>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statesList.map((state) => (
                      <tr
                        key={state.name}
                        className=&quot;border-b hover:bg-muted/50&quot;
                      >
                        <td className=&quot;py-3 px-2 font-medium&quot;>{state.name}</td>
                        <td className=&quot;py-3 px-2&quot;>{state.code}</td>
                        <td className=&quot;py-3 px-2 text-center&quot;>
                          <Badge>{state.count}</Badge>
                        </td>
                        <td className=&quot;py-3 px-2 text-right&quot;>
                          <Button variant=&quot;ghost&quot; size=&quot;sm&quot; asChild>
                            <Link
                              href={`/locations/states/${state.name.toLowerCase()}`}
                            >
                              <Eye className=&quot;mr-1 h-3.5 w-3.5&quot; />
                              View
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;regions&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <div>
              <h2 className=&quot;text-2xl font-semibold&quot;>Regions</h2>
              <p className=&quot;text-muted-foreground&quot;>Manage geographic regions</p>
            </div>

            <Button variant=&quot;outline&quot; asChild>
              <Link href=&quot;/locations/regions/new&quot;>
                <Plus className=&quot;mr-2 h-4 w-4&quot; />
                Add Region
              </Link>
            </Button>
          </div>

          <Card className=&quot;relative min-h-[250px]&quot;>
            <div className=&quot;absolute inset-0 flex flex-col items-center justify-center&quot;>
              <Globe className=&quot;h-16 w-16 text-muted-foreground/30&quot; />
              <h3 className=&quot;mt-4 text-lg font-medium&quot;>Regions Coming Soon</h3>
              <p className=&quot;mt-2 text-center text-muted-foreground max-w-md&quot;>
                The regions feature is currently in development. Check back soon
                to manage regional groupings of locations.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;venues&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <div>
              <h2 className=&quot;text-2xl font-semibold&quot;>Venues</h2>
              <p className=&quot;text-muted-foreground&quot;>Manage venue locations</p>
            </div>

            <Button asChild>
              <Link href=&quot;/locations/add&quot;>
                <Plus className=&quot;mr-2 h-4 w-4&quot; />
                Add Venue
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className=&quot;px-6 py-4&quot;>
              <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
                <div>
                  <CardTitle>Venues List</CardTitle>
                  <CardDescription>
                    All registered venue locations
                  </CardDescription>
                </div>

                <div className=&quot;flex items-center gap-2 w-full sm:w-auto&quot;>
                  <div className=&quot;relative flex-1 sm:flex-none&quot;>
                    <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      type=&quot;text&quot;
                      placeholder=&quot;Search venues...&quot;
                      className=&quot;w-full sm:w-[250px] pl-9 h-9&quot;
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    size=&quot;sm&quot;
                    variant=&quot;outline&quot;
                    onClick={() => setActiveTab(&quot;map&quot;)}
                  >
                    <Filter className=&quot;h-3.5 w-3.5 mr-1&quot; />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className=&quot;px-6 py-0&quot;>
              <div className=&quot;overflow-auto&quot;>
                {isLoading ? (
                  <div className=&quot;space-y-2 py-4&quot;>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className=&quot;h-12 w-full&quot; />
                    ))}
                  </div>
                ) : locations.length === 0 ? (
                  <div className=&quot;py-12 text-center&quot;>
                    <Building className=&quot;h-12 w-12 mx-auto text-muted-foreground/50&quot; />
                    <h3 className=&quot;mt-4 text-lg font-medium&quot;>
                      No Venues Found
                    </h3>
                    <p className=&quot;mt-2 text-sm text-muted-foreground max-w-md mx-auto&quot;>
                      {Object.keys(filters).length > 0
                        ? &quot;No venues match your search criteria. Try adjusting your filters.&quot;
                        : &quot;There are no venues currently in the system. Add a venue to get started.&quot;}
                    </p>
                    {Object.keys(filters).length > 0 ? (
                      <Button
                        className=&quot;mt-4&quot;
                        variant=&quot;outline&quot;
                        onClick={clearAllFilters}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button className=&quot;mt-4&quot; asChild>
                        <Link href=&quot;/locations/add&quot;>
                          <Plus className=&quot;mr-2 h-4 w-4&quot; />
                          Add First Venue
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <table className=&quot;w-full&quot;>
                    <thead>
                      <tr className=&quot;border-b&quot;>
                        <th className=&quot;text-left py-3 px-2&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Name</span>
                            <ArrowUpDown className=&quot;ml-1 h-3 w-3&quot; />
                          </div>
                        </th>
                        <th className=&quot;text-left py-3 px-2&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Address</span>
                          </div>
                        </th>
                        <th className=&quot;text-left py-3 px-2&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <span className=&quot;text-sm font-medium&quot;>City</span>
                            <ArrowUpDown className=&quot;ml-1 h-3 w-3&quot; />
                          </div>
                        </th>
                        <th className=&quot;text-left py-3 px-2&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <span className=&quot;text-sm font-medium&quot;>State</span>
                          </div>
                        </th>
                        <th className=&quot;text-left py-3 px-2&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <span className=&quot;text-sm font-medium&quot;>Status</span>
                          </div>
                        </th>
                        <th className=&quot;text-right py-3 px-2&quot;>
                          <span className=&quot;text-sm font-medium&quot;>Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location) => (
                        <tr
                          key={location.id}
                          className=&quot;border-b hover:bg-muted/50&quot;
                        >
                          <td className=&quot;py-3 px-2 font-medium&quot;>
                            {location.name}
                          </td>
                          <td className=&quot;py-3 px-2&quot;>
                            {location.address1 || &quot;-&quot;}
                          </td>
                          <td className=&quot;py-3 px-2&quot;>{location.city || &quot;-&quot;}</td>
                          <td className=&quot;py-3 px-2&quot;>
                            {location.state || location.stateCode || &quot;-&quot;}
                          </td>
                          <td className=&quot;py-3 px-2&quot;>
                            <Badge
                              variant={
                                location.status === &quot;active&quot;
                                  ? &quot;default&quot;
                                  : location.status === &quot;pending&quot;
                                    ? &quot;secondary&quot;
                                    : location.status === &quot;rejected&quot;
                                      ? &quot;destructive&quot;
                                      : &quot;outline&quot;
                              }
                            >
                              {location.status || &quot;unknown&quot;}
                            </Badge>
                          </td>
                          <td className=&quot;py-3 px-2 text-right&quot;>
                            <Button variant=&quot;ghost&quot; size=&quot;sm&quot; asChild>
                              <Link href={`/locations/${location.id}`}>
                                <Eye className=&quot;mr-1 h-3.5 w-3.5&quot; />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant=&quot;ghost&quot;
                              size=&quot;sm&quot;
                              className=&quot;text-muted-foreground&quot;
                              asChild
                            >
                              <Link href={`/locations/${location.id}/edit`}>
                                <Pencil className=&quot;mr-1 h-3.5 w-3.5&quot; />
                                Edit
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {locations.length > 0 && (
                <div className=&quot;py-4 flex justify-between items-center&quot;>
                  <div className=&quot;text-sm text-muted-foreground&quot;>
                    Showing {locations.length}{&quot; &quot;}
                    {locations.length === 1 ? &quot;venue&quot; : &quot;venues&quot;}
                  </div>
                  {/* Pagination would go here */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;pending&quot; className=&quot;space-y-6&quot;>
          <div className=&quot;flex justify-between items-center&quot;>
            <div>
              <h2 className=&quot;text-2xl font-semibold&quot;>Pending Approval</h2>
              <p className=&quot;text-muted-foreground">
                Review and approve location submissions
              </p>
            </div>
          </div>

          <PendingLocationsList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
