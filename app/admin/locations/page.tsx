"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

import { toast } from "@/hooks/use-toast";
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
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  LocationFilters,
  LocationFilterValues,
} from "@/components/locations/LocationFilters";

import { SimplifiedLocationMap } from "@/components/maps/SimplifiedLocationMap";

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
  const [searchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("map");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
    search: "",
    status: [],
    locationType: [],
  });

  const googleMapsApiKey = "AIzaSyD-1UzABjgG0SYCZ2bLYtd7a7n1gJNYodg";

  // Fetch all locations data (including pending locations) from admin API
  const {
    data: locationsData,
    isLoading: locationsLoading,
    error: locationsError,
    refetch,
  } = useQuery<Location[]>({
    queryKey: ["/api/admin/locations"],
    queryFn: async () => {
      const res = await fetch("/api/admin/locations", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch locations");
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
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return dateString;
    }
  };

  // Get color based on location type
  const getTypeColor = (type: string) => {
    if (!type) return "bg-gray-600 text-gray-100";

    switch (type.toLowerCase()) {
      case "venue":
      case "event_venue":
        return "bg-purple-700 text-purple-50";
      case "office":
      case "corporate_office":
        return "bg-blue-700 text-blue-50";
      case "retail":
      case "store":
      case "retail_store":
        return "bg-green-700 text-green-50";
      case "warehouse":
      case "distribution_center":
        return "bg-amber-700 text-amber-50";
      default:
        return "bg-gray-600 text-gray-100";
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
    (loc) => loc.status === "pending",
  ).length;
  const approvedCount = filteredLocations.filter(
    (loc) => loc.status === "approved",
  ).length;
  const rejectedCount = filteredLocations.filter(
    (loc) => loc.status === "rejected",
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
      const response = await fetch("/api/admin/locations/bulk-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationIds: Array.from(selectedLocations),
          status: "approved",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve locations");
      }

      toast({
        title: "Locations Approved",
        description: `Successfully approved ${selectedLocations.size} locations`,
      });

      // Clear selection and refetch data
      setSelectedLocations(new Set());
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to approve locations",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 px-4 space-y-6">
        {/* Page Header: Title with Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Location Management
            </h1>
            <p className="text-gray-400 mt-1">
              View, filter, and manage all locations in the system
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/locations/approval-queue"
              className="inline-flex items-center justify-center rounded-md bg-amber-900/30 border border-amber-600/30 px-4 py-2 text-sm font-medium text-amber-200 hover:bg-amber-900/40 transition"
            >
              <Badge className="bg-amber-500 hover:bg-amber-500 mr-2 h-5 w-5 rounded-full p-0 text-center text-xs font-semibold">
                {pendingCount}
              </Badge>
              Pending Approvals
            </Link>

            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/admin/locations/new">
                <Plus className="mr-2 h-4 w-4" />
                Add New Location
              </Link>
            </Button>
          </div>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-grow">
            <Input
              placeholder="Search by name, address, city..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pr-10"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => setSearchValue("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={isFilterOpen ? "border-primary/50 bg-primary/10" : ""}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>

          <div className="flex gap-2 ml-auto">
            <Badge
              variant="outline"
              className="rounded-md bg-amber-900/10 border-amber-500/20 text-amber-400"
            >
              <Clock className="mr-1 h-3 w-3" />
              Pending: {pendingCount}
            </Badge>

            <Badge
              variant="outline"
              className="rounded-md bg-green-900/10 border-green-500/20 text-green-400"
            >
              <ChartBar className="mr-1 h-3 w-3" />
              Approved: {approvedCount}
            </Badge>

            <Badge
              variant="outline"
              className="rounded-md bg-blue-900/10 border-blue-500/20 text-blue-400"
            >
              <BarChart className="mr-1 h-3 w-3" />
              Total: {totalCount}
            </Badge>
          </div>
        </div>

        {/* Filters - conditionally shown */}
        {isFilterOpen && (
          <Card className="bg-card/50">
            <CardContent className="pt-6">
              <LocationFilters
                onFilterChange={setAdvancedFilters}
                initialValues={advancedFilters}
                availableLocations={locationsData || []}
              />
            </CardContent>
          </Card>
        )}

        {/* Bulk actions - conditionally shown when locations are selected */}
        {selectedLocations.size > 0 && (
          <div className="bg-blue-900/30 border border-blue-500/30 rounded-md p-3 flex justify-between items-center">
            <div className="text-blue-200">
              <span className="font-semibold">{selectedLocations.size}</span>{" "}
              locations selected
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-blue-500/50 text-blue-300 hover:bg-blue-900/40"
                onClick={() => setSelectedLocations(new Set())}
              >
                Clear
              </Button>
              <Button
                size="sm"
                className="bg-green-700 hover:bg-green-800 text-green-50"
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
          className="w-full"
        >
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger
                value="list"
                className="data-[state=active]:bg-background"
              >
                <Grid2x2 className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger
                value="grid"
                className="data-[state=active]:bg-background"
              >
                <Grid2x2 className="h-4 w-4 mr-2" />
                Grid View
              </TabsTrigger>
              <TabsTrigger
                value="map"
                className="data-[state=active]:bg-background"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Map View
              </TabsTrigger>
            </TabsList>
          </div>

          {/* List View Tab Content */}
          <TabsContent value="list" className="mt-0">
            <Card>
              <CardContent className="p-0">
                {locationsLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
                      <div className="h-4 w-48 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 w-32 bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ) : locationsError ? (
                  <div className="p-8 text-center text-red-400">
                    <p>
                      Error loading locations:{" "}
                      {locationsError instanceof Error
                        ? locationsError.message
                        : "Unknown error"}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => refetch()}
                      className="mt-4 border-red-700 text-red-400 hover:bg-red-950/30"
                    >
                      Retry
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium text-sm">
                            Name
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-sm">
                            Location
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-sm">
                            Type
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-sm">
                            Status
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-sm">
                            Added
                          </th>
                          <th className="py-3 px-4 text-left font-medium text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredLocations.length === 0 ? (
                          <tr>
                            <td
                              colSpan={6}
                              className="py-6 text-center text-muted-foreground"
                            >
                              <MapPin className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                              <p className="text-gray-400 mb-1">
                                No locations found
                              </p>
                              <p className="text-gray-500 text-sm">
                                Try adjusting your search or filters
                              </p>
                            </td>
                          </tr>
                        ) : (
                          filteredLocations.map((location) => (
                            <tr
                              key={location.id}
                              className={`hover:bg-muted/30 transition-colors ${selectedLocationId === location.id ? "bg-blue-900/20 border-l-4 border-blue-500" : ""}`}
                              onClick={() => setSelectedLocationId(location.id)}
                            >
                              <td className="py-3 px-4">
                                <div className="font-medium">
                                  {location.name}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm">
                                  {location.city}, {location.state}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {location.zipCode}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {location.locationType && (
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(location.locationType)}`}
                                  >
                                    {location.locationType}
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  className={`
                                  ${location.status === "approved" ? "bg-green-700 text-green-100" : ""} 
                                  ${location.status === "pending" ? "bg-amber-700 text-amber-100" : ""} 
                                  ${location.status === "rejected" ? "bg-red-700 text-red-100" : ""}
                                `}
                                >
                                  {location.status || "Unknown"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm">
                                  {formatDate(location.createdAt)}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Button asChild variant="ghost" size="sm">
                                  <Link
                                    href={`/admin/locations/${location.id}`}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
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
          <TabsContent value="grid" className="mt-0">
            {locationsLoading ? (
              <div className="p-8 text-center">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
                  <div className="h-4 w-48 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 w-32 bg-gray-700 rounded"></div>
                </div>
              </div>
            ) : locationsError ? (
              <div className="p-8 text-center text-red-400">
                <p>
                  Error loading locations:{" "}
                  {locationsError instanceof Error
                    ? locationsError.message
                    : "Unknown error"}
                </p>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="mt-4 border-red-700 text-red-400 hover:bg-red-950/30"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredLocations.length === 0 ? (
                  <div className="col-span-full text-center p-8 border border-dashed border-gray-700 rounded-md">
                    <MapPin className="h-10 w-10 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400 mb-1">No locations found</p>
                    <p className="text-gray-500 text-sm">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <Card
                      key={location.id}
                      className={`bg-card dark:bg-card/90 relative overflow-hidden transition ${
                        selectedLocationId === location.id
                          ? "border-2 border-blue-500 shadow-lg shadow-blue-900/30"
                          : "hover:border-gray-600"
                      }`}
                      onClick={() => setSelectedLocationId(location.id)}
                    >
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg font-semibold truncate">
                          {location.name}
                        </CardTitle>
                        <p className="text-xs text-gray-400">
                          Added {formatDate(location.createdAt)}
                        </p>
                      </CardHeader>

                      <CardContent className="p-4 pt-2 pb-2">
                        <div className="mb-3 text-sm">{location.address}</div>
                        <div className="flex items-center gap-2 mb-3">
                          <Badge
                            className="px-2 py-0.5 text-xs"
                            variant="outline"
                          >
                            {location.city}, {location.state}
                          </Badge>
                          {location.zipCode && (
                            <Badge
                              className="px-2 py-0.5 text-xs"
                              variant="outline"
                            >
                              {location.zipCode}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {location.locationType && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${getTypeColor(location.locationType)}`}
                            >
                              {location.locationType}
                            </span>
                          )}
                          <Badge
                            className={`
                            ${location.status === "approved" ? "bg-green-700 text-green-100" : ""} 
                            ${location.status === "pending" ? "bg-amber-700 text-amber-100" : ""} 
                            ${location.status === "rejected" ? "bg-red-700 text-red-100" : ""}
                          `}
                          >
                            {location.status || "Unknown"}
                          </Badge>
                        </div>
                      </CardContent>

                      <div className="p-4 pt-2 flex justify-between items-center">
                        <div className="text-xs text-gray-400">
                          Updated {formatDate(location.updatedAt)}
                        </div>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/locations/${location.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
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
          <TabsContent value="map" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="overflow-hidden lg:col-span-2">
                <CardContent className="p-0">
                  {locationsLoading ? (
                    <div className="p-8 text-center h-96 flex items-center justify-center">
                      <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 bg-gray-700 rounded-full mb-4"></div>
                        <div className="h-4 w-48 bg-gray-700 rounded mb-2"></div>
                        <div className="h-3 w-32 bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ) : locationsError ? (
                    <div className="p-8 text-center text-red-400 h-96 flex flex-col items-center justify-center">
                      <p>
                        Error loading locations:{" "}
                        {locationsError instanceof Error
                          ? locationsError.message
                          : "Unknown error"}
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="mt-4 border-red-700 text-red-400 hover:bg-red-950/30"
                      >
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="relative h-[75vh] md:h-[650px]">
                      <SimplifiedLocationMap
                        locations={filteredLocations}
                        googleMapsApiKey={googleMapsApiKey}
                        onLocationSelect={(locationId) => {
                          if (locationId) {
                            setSelectedLocationId(locationId);
                          }
                        }}
                        highlightedLocationId={selectedLocationId}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location list for the map view - very compact design */}
              <Card className="h-[75vh] md:h-[650px] overflow-hidden">
                <CardHeader className="p-2 pb-1 border-b">
                  <CardTitle className="text-sm font-semibold">
                    Locations ({filteredLocations.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[calc(75vh-40px)] md:h-[calc(650px-40px)]">
                    {locationsLoading ? (
                      <div className="p-2 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                          <div className="h-8 w-8 bg-gray-700 rounded-full mb-2"></div>
                          <div className="h-2 w-24 bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    ) : locationsError ? (
                      <div className="p-2 text-center text-red-400 text-xs">
                        <p>Failed to load locations</p>
                      </div>
                    ) : filteredLocations.length === 0 ? (
                      <div className="p-2 text-center text-muted-foreground text-xs">
                        <p>No locations found</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {filteredLocations.map((location) => (
                          <div
                            key={location.id}
                            className={`py-2 px-3 cursor-pointer hover:bg-muted/50 transition-colors text-xs ${
                              selectedLocationId === location.id
                                ? "bg-primary/10 border-l-2 border-l-primary"
                                : ""
                            }`}
                            onClick={() => setSelectedLocationId(location.id)}
                          >
                            <div className="font-semibold truncate">
                              {location.name}
                            </div>
                            <div className="text-muted-foreground truncate text-xs">
                              {location.address}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[10px] text-muted-foreground">
                                {location.city}, {location.state}
                              </span>
                              {location.status && (
                                <span
                                  className={`inline-block ml-auto px-1.5 py-0.5 text-[10px] rounded-sm 
                                  ${location.status === "approved" || location.status === "active" ? "bg-green-700/20 text-green-400" : ""} 
                                  ${location.status === "pending" ? "bg-amber-700/20 text-amber-400" : ""} 
                                  ${location.status === "rejected" ? "bg-red-700/20 text-red-400" : ""}
                                  ${location.status === "inactive" ? "bg-gray-700/20 text-gray-400" : ""}
                                `}
                                >
                                  {location.status === "active"
                                    ? "approved"
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
        <div className="text-xs text-gray-500 mt-4 text-center">
          <p>
            Locations are global entities that can be shared across
            organizations.
          </p>
        </div>
      </div>
    </div>
  );
}
