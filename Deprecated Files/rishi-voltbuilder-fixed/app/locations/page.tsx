"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { PendingLocationsList } from "@/components/locations/PendingLocationsList";
import { LocationMap } from "@/components/maps/LocationMap";
import { ClusteredLocationMap } from "@/components/maps/ClusteredLocationMap";
import { GoogleMapsProvider } from "@/components/maps/GoogleMapsContext";
import { useRouter } from "next/navigation";
import { useLocations, LocationFilters } from "@/hooks/useLocations";

export default function LocationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("map");
  const [searchQuery, setSearchQuery] = useState("");
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
      address: loc.address1 + (loc.address2 ? `, ${loc.address2}` : ""),
      city: loc.city,
      state: loc.state || loc.stateCode || "",
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
    setSearchQuery("");
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
      Alabama: "AL",
      Alaska: "AK",
      Arizona: "AZ",
      Arkansas: "AR",
      California: "CA",
      Colorado: "CO",
      Connecticut: "CT",
      Delaware: "DE",
      Florida: "FL",
      Georgia: "GA",
      Hawaii: "HI",
      Idaho: "ID",
      Illinois: "IL",
      Indiana: "IN",
      Iowa: "IA",
      Kansas: "KS",
      Kentucky: "KY",
      Louisiana: "LA",
      Maine: "ME",
      Maryland: "MD",
      Massachusetts: "MA",
      Michigan: "MI",
      Minnesota: "MN",
      Mississippi: "MS",
      Missouri: "MO",
      Montana: "MT",
      Nebraska: "NE",
      Nevada: "NV",
      "New Hampshire": "NH",
      "New Jersey": "NJ",
      "New Mexico": "NM",
      "New York": "NY",
      "North Carolina": "NC",
      "North Dakota": "ND",
      Ohio: "OH",
      Oklahoma: "OK",
      Oregon: "OR",
      Pennsylvania: "PA",
      "Rhode Island": "RI",
      "South Carolina": "SC",
      "South Dakota": "SD",
      Tennessee: "TN",
      Texas: "TX",
      Utah: "UT",
      Vermont: "VT",
      Virginia: "VA",
      Washington: "WA",
      "West Virginia": "WV",
      Wisconsin: "WI",
      Wyoming: "WY",
    };
    return stateCodes[stateName] || "XX";
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Locations</h1>
        <div className="space-x-3">
          <Link
            href="/locations/states/new"
            className="inline-flex items-center justify-center rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary shadow-sm hover:bg-primary/20"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add State
          </Link>
          <Link
            href="/locations/add"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Venue
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map">Map View</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="regions">Regions</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
        </TabsList>

        <TabsContent value="map" className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Interactive map of all service areas and venues.
            </p>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search locations..."
                  className="w-[200px] pl-9"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Location Map</CardTitle>
              <CardDescription>
                Interactive map with clustering and filtering capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="relative border rounded-md">
                <GoogleMapsProvider>
                  {isLoading ? (
                    <div className="h-[600px] flex items-center justify-center">
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                        <p className="text-sm text-muted-foreground">
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

        <TabsContent value="states" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">States</h2>
              <p className="text-muted-foreground">
                Manage states and their service areas
              </p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/locations/states/new">
                <Plus className="mr-2 h-4 w-4" />
                Add State
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>States List</CardTitle>
                  <CardDescription>
                    All states with service coverage
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search states..."
                      className="w-[150px] sm:w-[250px] pl-9 h-9"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-0">
              {isLoading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : statesList.length === 0 ? (
                <div className="py-12 text-center">
                  <Building className="h-12 w-12 mx-auto text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-medium">No States Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                    There are no states currently in the system. Add a state to
                    get started.
                  </p>
                  <Button className="mt-4" variant="outline" asChild>
                    <Link href="/locations/states/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add First State
                    </Link>
                  </Button>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">State</span>
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </div>
                      </th>
                      <th className="text-left py-3 px-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium">Code</span>
                        </div>
                      </th>
                      <th className="text-center py-3 px-2">
                        <div className="flex items-center justify-center">
                          <span className="text-sm font-medium">Venues</span>
                        </div>
                      </th>
                      <th className="text-right py-3 px-2">
                        <span className="text-sm font-medium">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {statesList.map((state) => (
                      <tr
                        key={state.name}
                        className="border-b hover:bg-muted/50"
                      >
                        <td className="py-3 px-2 font-medium">{state.name}</td>
                        <td className="py-3 px-2">{state.code}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge>{state.count}</Badge>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={`/locations/states/${state.name.toLowerCase()}`}
                            >
                              <Eye className="mr-1 h-3.5 w-3.5" />
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

        <TabsContent value="regions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Regions</h2>
              <p className="text-muted-foreground">Manage geographic regions</p>
            </div>

            <Button variant="outline" asChild>
              <Link href="/locations/regions/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Region
              </Link>
            </Button>
          </div>

          <Card className="relative min-h-[250px]">
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Globe className="h-16 w-16 text-muted-foreground/30" />
              <h3 className="mt-4 text-lg font-medium">Regions Coming Soon</h3>
              <p className="mt-2 text-center text-muted-foreground max-w-md">
                The regions feature is currently in development. Check back soon
                to manage regional groupings of locations.
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="venues" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Venues</h2>
              <p className="text-muted-foreground">Manage venue locations</p>
            </div>

            <Button asChild>
              <Link href="/locations/add">
                <Plus className="mr-2 h-4 w-4" />
                Add Venue
              </Link>
            </Button>
          </div>

          <Card>
            <CardHeader className="px-6 py-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle>Venues List</CardTitle>
                  <CardDescription>
                    All registered venue locations
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search venues..."
                      className="w-full sm:w-[250px] pl-9 h-9"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("map")}
                  >
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-0">
              <div className="overflow-auto">
                {isLoading ? (
                  <div className="space-y-2 py-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : locations.length === 0 ? (
                  <div className="py-12 text-center">
                    <Building className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">
                      No Venues Found
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                      {Object.keys(filters).length > 0
                        ? "No venues match your search criteria. Try adjusting your filters."
                        : "There are no venues currently in the system. Add a venue to get started."}
                    </p>
                    {Object.keys(filters).length > 0 ? (
                      <Button
                        className="mt-4"
                        variant="outline"
                        onClick={clearAllFilters}
                      >
                        Clear Filters
                      </Button>
                    ) : (
                      <Button className="mt-4" asChild>
                        <Link href="/locations/add">
                          <Plus className="mr-2 h-4 w-4" />
                          Add First Venue
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">Name</span>
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </th>
                        <th className="text-left py-3 px-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">Address</span>
                          </div>
                        </th>
                        <th className="text-left py-3 px-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">City</span>
                            <ArrowUpDown className="ml-1 h-3 w-3" />
                          </div>
                        </th>
                        <th className="text-left py-3 px-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">State</span>
                          </div>
                        </th>
                        <th className="text-left py-3 px-2">
                          <div className="flex items-center">
                            <span className="text-sm font-medium">Status</span>
                          </div>
                        </th>
                        <th className="text-right py-3 px-2">
                          <span className="text-sm font-medium">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {locations.map((location) => (
                        <tr
                          key={location.id}
                          className="border-b hover:bg-muted/50"
                        >
                          <td className="py-3 px-2 font-medium">
                            {location.name}
                          </td>
                          <td className="py-3 px-2">
                            {location.address1 || "-"}
                          </td>
                          <td className="py-3 px-2">{location.city || "-"}</td>
                          <td className="py-3 px-2">
                            {location.state || location.stateCode || "-"}
                          </td>
                          <td className="py-3 px-2">
                            <Badge
                              variant={
                                location.status === "active"
                                  ? "default"
                                  : location.status === "pending"
                                    ? "secondary"
                                    : location.status === "rejected"
                                      ? "destructive"
                                      : "outline"
                              }
                            >
                              {location.status || "unknown"}
                            </Badge>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/locations/${location.id}`}>
                                <Eye className="mr-1 h-3.5 w-3.5" />
                                View
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground"
                              asChild
                            >
                              <Link href={`/locations/${location.id}/edit`}>
                                <Pencil className="mr-1 h-3.5 w-3.5" />
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
                <div className="py-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing {locations.length}{" "}
                    {locations.length === 1 ? "venue" : "venues"}
                  </div>
                  {/* Pagination would go here */}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-semibold">Pending Approval</h2>
              <p className="text-muted-foreground">
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
