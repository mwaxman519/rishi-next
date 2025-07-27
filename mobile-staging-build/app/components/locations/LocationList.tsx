"use client";

import { useState, useMemo, useCallback } from "react";
import {
  MapPin,
  Building2,
  Search,
  X,
  Filter,
  ArrowUpDown,
  Check,
  ChevronDown,
  MoreHorizontal,
  MapIcon,
  PencilLine,
  Trash2,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  CircleSlash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LocationFilter, type LocationFilterValues } from "./LocationFilter";
import { cn } from "@/lib/utils";

import { Location as MapLocation } from "./LocationMap";

// Extended location type with additional fields beyond what the map needs
export interface Location extends MapLocation {
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: string;
  updatedAt?: string;
  submittedById?: string;
  submittedByName?: string;
  submittedByOrganization?: string;
  approved?: boolean;
  approvedById?: string;
  approvedAt?: string;
  notes?: string;
}

export interface LocationListProps {
  locations: Location[];
  isLoading?: boolean;
  error?: Error | null;
  onSelectLocation?: (location: Location) => void;
  selectedLocationId?: string | null;
  onDeleteLocation?: (id: string) => void;
  onApproveLocation?: (id: string) => void;
  onRejectLocation?: (id: string) => void;
  availableStates?: { id: string; name: string }[];
  availableCities?: { id: string; name: string }[];
  isAdmin?: boolean;
  viewOnly?: boolean;
  allowSelection?: boolean;
  showStatus?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
  baseUrl?: string;
  className?: string;
  emptyStateMessage?: string;
  initialView?: "grid" | "table" | "map";
}

export function LocationList({
  locations = [],
  isLoading = false,
  error = null,
  onSelectLocation,
  onDeleteLocation,
  onApproveLocation,
  onRejectLocation,
  availableStates = [],
  availableCities = [],
  isAdmin = false,
  viewOnly = false,
  allowSelection = false,
  showStatus = true,
  showFilters = true,
  showActions = true,
  baseUrl = "/locations",
  className,
  emptyStateMessage = "No locations found",
  initialView = "grid",
}: LocationListProps) {
  const router = useRouter();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<"grid" | "table" | "map">(
    initialView,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortField, setSortField] = useState<keyof Location>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<LocationFilterValues>({
    search: "",
    states: [],
    cities: [],
    zipCodes: [],
    types: [],
    status: [],
    regions: [],
  });

  // Handle filter changes
  const handleFilterChange = useCallback((newFilters: LocationFilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle sort changes
  const handleSort = useCallback(
    (field: keyof Location) => {
      setSortDirection((current) =>
        sortField === field && current === "asc" ? "desc" : "asc",
      );
      setSortField(field);
    },
    [sortField],
  );

  // Handle location selection
  const handleSelectLocation = useCallback(
    (location: Location) => {
      if (location.id) {
        setSelectedLocationId(location.id);
        if (onSelectLocation) {
          onSelectLocation(location);
        }
      }
    },
    [onSelectLocation],
  );

  // Filter and sort locations
  const filteredLocations = useMemo(() => {
    let result = [...locations];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (location) =>
          location.name.toLowerCase().includes(searchLower) ||
          location.address.toLowerCase().includes(searchLower) ||
          location.city?.toLowerCase().includes(searchLower) ||
          location.state?.toLowerCase().includes(searchLower) ||
          location.zipCode?.toLowerCase().includes(searchLower),
      );
    }

    // Apply state filter
    if (filters.states.length > 0) {
      result = result.filter(
        (location) => location.state && filters.states.includes(location.state),
      );
    }

    // Apply city filter
    if (filters.cities.length > 0) {
      result = result.filter(
        (location) => location.city && filters.cities.includes(location.city),
      );
    }

    // Apply zip code filter
    if (filters.zipCodes.length > 0) {
      result = result.filter(
        (location) =>
          location.zipCode && filters.zipCodes.includes(location.zipCode),
      );
    }

    // Apply type filter
    if (filters.types.length > 0) {
      result = result.filter(
        (location) =>
          location.locationType &&
          filters.types.includes(location.locationType),
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      result = result.filter(
        (location) =>
          location.status && filters.status.includes(location.status),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (bValue === undefined) return sortDirection === "asc" ? 1 : -1;

      // Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number and boolean comparison
      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [locations, filters, sortField, sortDirection]);

  // Paginate results
  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLocations.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLocations, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

  // Status badge renderer
  const renderStatusBadge = (status?: string, approved?: boolean) => {
    if (!status) return null;

    let variant:
      | "default"
      | "secondary"
      | "destructive"
      | "outline"
      | null
      | undefined = "secondary";
    let icon = null;

    switch (status.toLowerCase()) {
      case "active":
        variant = "default";
        icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        break;
      case "inactive":
        variant = "secondary";
        icon = <CircleSlash className="h-3 w-3 mr-1" />;
        break;
      case "pending":
        variant = "outline";
        icon = <Clock className="h-3 w-3 mr-1" />;
        break;
      case "rejected":
        variant = "destructive";
        icon = <XCircle className="h-3 w-3 mr-1" />;
        break;
      default:
        if (approved === true) {
          variant = "default";
          icon = <CheckCircle2 className="h-3 w-3 mr-1" />;
        } else if (approved === false) {
          variant = "outline";
          icon = <Clock className="h-3 w-3 mr-1" />;
        }
    }

    return (
      <Badge variant={variant} className="ml-2 text-xs">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Location type badge renderer
  const renderLocationTypeBadge = (locationType?: string) => {
    if (!locationType) return null;

    return (
      <Badge variant="outline" className="text-xs font-normal">
        {locationType.charAt(0).toUpperCase() + locationType.slice(1)}
      </Badge>
    );
  };

  // Action menu for each location
  const renderActionMenu = (location: Location) => {
    if (!showActions) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`${baseUrl}/${location.id}`} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>

          {!viewOnly && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href={`${baseUrl}/${location.id}/edit`}
                  className="cursor-pointer"
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  {location.status === "pending" && (
                    <>
                      {onApproveLocation && location.id && (
                        <DropdownMenuItem
                          onClick={() =>
                            onApproveLocation(location.id as string)
                          }
                          className="text-green-600 focus:text-green-600"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                      )}

                      {onRejectLocation && location.id && (
                        <DropdownMenuItem
                          onClick={() =>
                            onRejectLocation(location.id as string)
                          }
                          className="text-red-600 focus:text-red-600"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  {onDeleteLocation && location.id && (
                    <DropdownMenuItem
                      onClick={() => onDeleteLocation(location.id as string)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-2">
          <div className="animate-spin">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-2 max-w-md text-center">
          <XCircle className="h-8 w-8 text-destructive" />
          <h3 className="font-semibold">Error loading locations</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (locations.length === 0 || filteredLocations.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        {showFilters && (
          <LocationFilter
            onFilterChange={handleFilterChange}
            initialValues={filters}
            showStatusFilter={isAdmin && showStatus}
            availableStates={availableStates}
            availableCities={availableCities}
          />
        )}

        <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8 text-center">
          <MapPin className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-2">No locations found</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            {emptyStateMessage}
          </p>
          {!viewOnly && (
            <Button asChild>
              <Link href={`${baseUrl}/add`}>
                <MapPin className="mr-2 h-4 w-4" />
                Add New Location
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filters */}
      {showFilters && (
        <LocationFilter
          onFilterChange={handleFilterChange}
          initialValues={filters}
          showStatusFilter={isAdmin && showStatus}
          availableStates={availableStates}
          availableCities={availableCities}
        />
      )}

      {/* View toggle and total count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium">{filteredLocations.length}</span> of{" "}
          <span className="font-medium">{locations.length}</span> locations
        </p>

        <div className="flex items-center space-x-2">
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-[200px] grid-cols-3">
              <TabsTrigger value="grid">
                <div className="flex items-center">
                  <Building2 className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Grid</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="table">
                <div className="flex items-center">
                  <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Table</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="map">
                <div className="flex items-center">
                  <MapIcon className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Map</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Views */}
      <div>
        {/* Grid View */}
        {viewMode === "grid" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
              {paginatedLocations.map((location) => (
                <Card
                  key={location.id}
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    selectedLocationId === location.id
                      ? "ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg"
                      : "hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1 hover:border-primary/40",
                  )}
                  style={{
                    transformOrigin: "center",
                    animation:
                      selectedLocationId === location.id
                        ? "pulse 2s infinite"
                        : "none",
                  }}
                  onClick={() =>
                    allowSelection && handleSelectLocation(location)
                  }
                >
                  <CardHeader className="p-0">
                    <div className="bg-muted h-32 flex items-center justify-center relative">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                      {showStatus && location.status && (
                        <div className="absolute top-2 right-2">
                          {renderStatusBadge(
                            location.status,
                            location.approved,
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-base">
                          {location.name}
                        </CardTitle>
                        {location.locationType && (
                          <div>
                            {renderLocationTypeBadge(location.locationType)}
                          </div>
                        )}
                      </div>
                      {renderActionMenu(location)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {location.address}
                    </p>
                    {location.city && location.state && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {location.city}, {location.state} {location.zipCode}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`${baseUrl}/${location.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Always show first page, last page, current page, and pages around current
                    let pageToShow: number;
                    if (totalPages <= 5) {
                      // Show all pages if 5 or fewer
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      // Near start
                      if (i < 4) {
                        pageToShow = i + 1;
                      } else {
                        pageToShow = totalPages;
                      }
                    } else if (currentPage >= totalPages - 2) {
                      // Near end
                      if (i === 0) {
                        pageToShow = 1;
                      } else {
                        pageToShow = totalPages - (4 - i);
                      }
                    } else {
                      // Middle
                      if (i === 0) {
                        pageToShow = 1;
                      } else if (i === 4) {
                        pageToShow = totalPages;
                      } else {
                        pageToShow = currentPage + (i - 2);
                      }
                    }

                    // Add ellipsis
                    if (
                      (i === 1 && pageToShow > 2) ||
                      (i === 3 && pageToShow < totalPages - 1)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <span className="h-9 w-9 flex items-center justify-center">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageToShow)}
                          isActive={currentPage === pageToShow}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={cn(
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 hover:bg-transparent hover:underline"
                      >
                        Location
                        {sortField === "name" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("locationType")}
                        className="flex items-center gap-1 hover:bg-transparent hover:underline"
                      >
                        Type
                        {sortField === "locationType" && (
                          <span className="ml-1">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Address
                    </TableHead>
                    {showStatus && (
                      <TableHead className="w-[100px]">
                        <Button
                          variant="ghost"
                          onClick={() => handleSort("status")}
                          className="flex items-center gap-1 hover:bg-transparent hover:underline"
                        >
                          Status
                          {sortField === "status" && (
                            <span className="ml-1">
                              {sortDirection === "asc" ? "↑" : "↓"}
                            </span>
                          )}
                        </Button>
                      </TableHead>
                    )}
                    <TableHead className="w-[100px] text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLocations.map((location) => (
                    <TableRow
                      key={location.id}
                      className={cn(
                        "transition-colors duration-200",
                        allowSelection && "cursor-pointer",
                        selectedLocationId === location.id
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "hover:bg-muted/30",
                      )}
                      onClick={() =>
                        allowSelection && handleSelectLocation(location)
                      }
                      style={{
                        animation:
                          selectedLocationId === location.id
                            ? "pulse-subtle 2s infinite"
                            : "none",
                      }}
                    >
                      <TableCell className="font-medium">
                        {location.name}
                      </TableCell>
                      <TableCell>
                        {renderLocationTypeBadge(location.locationType)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="truncate max-w-xs">
                          {location.address}
                          {location.city && location.state && (
                            <span className="block text-xs text-muted-foreground">
                              {location.city}, {location.state}{" "}
                              {location.zipCode}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {showStatus && (
                        <TableCell>
                          {renderStatusBadge(
                            location.status,
                            location.approved,
                          )}
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {renderActionMenu(location)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for table view */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(
                        currentPage === 1 && "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>

                  {/* Same pagination as grid view */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageToShow: number;
                    if (totalPages <= 5) {
                      pageToShow = i + 1;
                    } else if (currentPage <= 3) {
                      if (i < 4) {
                        pageToShow = i + 1;
                      } else {
                        pageToShow = totalPages;
                      }
                    } else if (currentPage >= totalPages - 2) {
                      if (i === 0) {
                        pageToShow = 1;
                      } else {
                        pageToShow = totalPages - (4 - i);
                      }
                    } else {
                      if (i === 0) {
                        pageToShow = 1;
                      } else if (i === 4) {
                        pageToShow = totalPages;
                      } else {
                        pageToShow = currentPage + (i - 2);
                      }
                    }

                    if (
                      (i === 1 && pageToShow > 2) ||
                      (i === 3 && pageToShow < totalPages - 1)
                    ) {
                      return (
                        <PaginationItem key={`ellipsis-${i}`}>
                          <span className="h-9 w-9 flex items-center justify-center">
                            ...
                          </span>
                        </PaginationItem>
                      );
                    }

                    return (
                      <PaginationItem key={pageToShow}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageToShow)}
                          isActive={currentPage === pageToShow}
                        >
                          {pageToShow}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={cn(
                        currentPage === totalPages &&
                          "pointer-events-none opacity-50",
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Map View */}
        {viewMode === "map" && (
          <div className="bg-muted/30 rounded-md border h-[600px] flex items-center justify-center">
            <div className="text-center">
              <MapIcon className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Map View</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mt-2">
                The map view will be implemented using the LocationMap component
                to display all locations visually.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
