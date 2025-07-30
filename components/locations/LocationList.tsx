&quot;use client&quot;;

import { useState, useMemo, useCallback } from &quot;react&quot;;
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
} from &quot;lucide-react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import Link from &quot;next/link&quot;;
import Image from &quot;next/image&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from &quot;@/components/ui/pagination&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { LocationFilter, type LocationFilterValues } from &quot;./LocationFilter&quot;;
import { cn } from &quot;@/lib/utils&quot;;

import { Location as MapLocation } from &quot;./LocationMap&quot;;

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
  initialView?: &quot;grid&quot; | &quot;table&quot; | &quot;map&quot;;
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
  baseUrl = &quot;/locations&quot;,
  className,
  emptyStateMessage = &quot;No locations found&quot;,
  initialView = &quot;grid&quot;,
}: LocationListProps) {
  const router = useRouter();
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<&quot;grid&quot; | &quot;table&quot; | &quot;map&quot;>(
    initialView,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [sortField, setSortField] = useState<keyof Location>(&quot;name&quot;);
  const [sortDirection, setSortDirection] = useState<&quot;asc&quot; | &quot;desc&quot;>(&quot;asc&quot;);
  const [filters, setFilters] = useState<LocationFilterValues>({
    search: "&quot;,
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
        sortField === field && current === &quot;asc&quot; ? &quot;desc&quot; : &quot;asc&quot;,
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

      if (aValue === undefined) return sortDirection === &quot;asc&quot; ? -1 : 1;
      if (bValue === undefined) return sortDirection === &quot;asc&quot; ? 1 : -1;

      // Handle string comparison
      if (typeof aValue === &quot;string&quot; && typeof bValue === &quot;string&quot;) {
        return sortDirection === &quot;asc&quot;
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle number and boolean comparison
      if (aValue < bValue) return sortDirection === &quot;asc&quot; ? -1 : 1;
      if (aValue > bValue) return sortDirection === &quot;asc&quot; ? 1 : -1;
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
      | &quot;default&quot;
      | &quot;secondary&quot;
      | &quot;destructive&quot;
      | &quot;outline&quot;
      | null
      | undefined = &quot;secondary&quot;;
    let icon = null;

    switch (status.toLowerCase()) {
      case &quot;active&quot;:
        variant = &quot;default&quot;;
        icon = <CheckCircle2 className=&quot;h-3 w-3 mr-1&quot; />;
        break;
      case &quot;inactive&quot;:
        variant = &quot;secondary&quot;;
        icon = <CircleSlash className=&quot;h-3 w-3 mr-1&quot; />;
        break;
      case &quot;pending&quot;:
        variant = &quot;outline&quot;;
        icon = <Clock className=&quot;h-3 w-3 mr-1&quot; />;
        break;
      case &quot;rejected&quot;:
        variant = &quot;destructive&quot;;
        icon = <XCircle className=&quot;h-3 w-3 mr-1&quot; />;
        break;
      default:
        if (approved === true) {
          variant = &quot;default&quot;;
          icon = <CheckCircle2 className=&quot;h-3 w-3 mr-1&quot; />;
        } else if (approved === false) {
          variant = &quot;outline&quot;;
          icon = <Clock className=&quot;h-3 w-3 mr-1&quot; />;
        }
    }

    return (
      <Badge variant={variant} className=&quot;ml-2 text-xs&quot;>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Location type badge renderer
  const renderLocationTypeBadge = (locationType?: string) => {
    if (!locationType) return null;

    return (
      <Badge variant=&quot;outline&quot; className=&quot;text-xs font-normal&quot;>
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
          <Button variant=&quot;ghost&quot; className=&quot;h-8 w-8 p-0&quot;>
            <span className=&quot;sr-only&quot;>Open menu</span>
            <MoreHorizontal className=&quot;h-4 w-4&quot; />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align=&quot;end&quot;>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`${baseUrl}/${location.id}`} className=&quot;cursor-pointer&quot;>
              <Eye className=&quot;mr-2 h-4 w-4&quot; />
              View Details
            </Link>
          </DropdownMenuItem>

          {!viewOnly && (
            <>
              <DropdownMenuItem asChild>
                <Link
                  href={`${baseUrl}/${location.id}/edit`}
                  className=&quot;cursor-pointer&quot;
                >
                  <PencilLine className=&quot;mr-2 h-4 w-4&quot; />
                  Edit
                </Link>
              </DropdownMenuItem>

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  {location.status === &quot;pending&quot; && (
                    <>
                      {onApproveLocation && location.id && (
                        <DropdownMenuItem
                          onClick={() =>
                            onApproveLocation(location.id as string)
                          }
                          className=&quot;text-green-600 focus:text-green-600&quot;
                        >
                          <CheckCircle2 className=&quot;mr-2 h-4 w-4&quot; />
                          Approve
                        </DropdownMenuItem>
                      )}

                      {onRejectLocation && location.id && (
                        <DropdownMenuItem
                          onClick={() =>
                            onRejectLocation(location.id as string)
                          }
                          className=&quot;text-red-600 focus:text-red-600&quot;
                        >
                          <XCircle className=&quot;mr-2 h-4 w-4&quot; />
                          Reject
                        </DropdownMenuItem>
                      )}
                    </>
                  )}

                  {onDeleteLocation && location.id && (
                    <DropdownMenuItem
                      onClick={() => onDeleteLocation(location.id as string)}
                      className=&quot;text-red-600 focus:text-red-600&quot;
                    >
                      <Trash2 className=&quot;mr-2 h-4 w-4&quot; />
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
      <div className=&quot;flex items-center justify-center h-64&quot;>
        <div className=&quot;flex flex-col items-center space-y-2&quot;>
          <div className=&quot;animate-spin&quot;>
            <MapPin className=&quot;h-8 w-8 text-muted-foreground&quot; />
          </div>
          <p className=&quot;text-sm text-muted-foreground&quot;>Loading locations...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className=&quot;flex items-center justify-center h-64&quot;>
        <div className=&quot;flex flex-col items-center space-y-2 max-w-md text-center&quot;>
          <XCircle className=&quot;h-8 w-8 text-destructive&quot; />
          <h3 className=&quot;font-semibold&quot;>Error loading locations</h3>
          <p className=&quot;text-sm text-muted-foreground&quot;>{error.message}</p>
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
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
      <div className={cn(&quot;space-y-4&quot;, className)}>
        {showFilters && (
          <LocationFilter
            onFilterChange={handleFilterChange}
            initialValues={filters}
            showStatusFilter={isAdmin && showStatus}
            availableStates={availableStates}
            availableCities={availableCities}
          />
        )}

        <div className=&quot;flex flex-col items-center justify-center h-64 border border-dashed rounded-lg p-8 text-center&quot;>
          <MapPin className=&quot;h-10 w-10 text-muted-foreground mb-4&quot; />
          <h3 className=&quot;font-medium text-lg mb-2&quot;>No locations found</h3>
          <p className=&quot;text-sm text-muted-foreground max-w-md mb-6&quot;>
            {emptyStateMessage}
          </p>
          {!viewOnly && (
            <Button asChild>
              <Link href={`${baseUrl}/add`}>
                <MapPin className=&quot;mr-2 h-4 w-4&quot; />
                Add New Location
              </Link>
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(&quot;space-y-4&quot;, className)}>
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
      <div className=&quot;flex items-center justify-between&quot;>
        <p className=&quot;text-sm text-muted-foreground&quot;>
          Showing{&quot; &quot;}
          <span className=&quot;font-medium&quot;>{filteredLocations.length}</span> of{&quot; &quot;}
          <span className=&quot;font-medium&quot;>{locations.length}</span> locations
        </p>

        <div className=&quot;flex items-center space-x-2&quot;>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className=&quot;grid w-[200px] grid-cols-3&quot;>
              <TabsTrigger value=&quot;grid&quot;>
                <div className=&quot;flex items-center&quot;>
                  <Building2 className=&quot;h-3.5 w-3.5 mr-1&quot; />
                  <span className=&quot;hidden sm:inline&quot;>Grid</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value=&quot;table&quot;>
                <div className=&quot;flex items-center&quot;>
                  <ArrowUpDown className=&quot;h-3.5 w-3.5 mr-1&quot; />
                  <span className=&quot;hidden sm:inline&quot;>Table</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value=&quot;map&quot;>
                <div className=&quot;flex items-center&quot;>
                  <MapIcon className=&quot;h-3.5 w-3.5 mr-1&quot; />
                  <span className=&quot;hidden sm:inline&quot;>Map</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Views */}
      <div>
        {/* Grid View */}
        {viewMode === &quot;grid&quot; && (
          <>
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4&quot;>
              {paginatedLocations.map((location) => (
                <Card
                  key={location.id}
                  className={cn(
                    &quot;overflow-hidden transition-all duration-300&quot;,
                    selectedLocationId === location.id
                      ? &quot;ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg&quot;
                      : &quot;hover:scale-[1.03] hover:shadow-lg hover:-translate-y-1 hover:border-primary/40&quot;,
                  )}
                  style={{
                    transformOrigin: &quot;center&quot;,
                    animation:
                      selectedLocationId === location.id
                        ? &quot;pulse 2s infinite&quot;
                        : &quot;none&quot;,
                  }}
                  onClick={() =>
                    allowSelection && handleSelectLocation(location)
                  }
                >
                  <CardHeader className=&quot;p-0&quot;>
                    <div className=&quot;bg-muted h-32 flex items-center justify-center relative&quot;>
                      <MapPin className=&quot;h-8 w-8 text-muted-foreground&quot; />
                      {showStatus && location.status && (
                        <div className=&quot;absolute top-2 right-2&quot;>
                          {renderStatusBadge(
                            location.status,
                            location.approved,
                          )}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className=&quot;p-4&quot;>
                    <div className=&quot;flex justify-between items-start mb-2&quot;>
                      <div className=&quot;space-y-1&quot;>
                        <CardTitle className=&quot;text-base&quot;>
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
                    <p className=&quot;text-sm text-muted-foreground line-clamp-2&quot;>
                      {location.address}
                    </p>
                    {location.city && location.state && (
                      <p className=&quot;text-sm text-muted-foreground mt-1&quot;>
                        {location.city}, {location.state} {location.zipCode}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className=&quot;p-4 pt-0 flex justify-between&quot;>
                    <Button variant=&quot;outline&quot; size=&quot;sm&quot; asChild>
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
              <Pagination className=&quot;mt-8&quot;>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(
                        currentPage === 1 && &quot;pointer-events-none opacity-50&quot;,
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
                          <span className=&quot;h-9 w-9 flex items-center justify-center&quot;>
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
                          &quot;pointer-events-none opacity-50&quot;,
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Table View */}
        {viewMode === &quot;table&quot; && (
          <>
            <div className=&quot;rounded-md border&quot;>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className=&quot;w-[300px]&quot;>
                      <Button
                        variant=&quot;ghost&quot;
                        onClick={() => handleSort(&quot;name&quot;)}
                        className=&quot;flex items-center gap-1 hover:bg-transparent hover:underline&quot;
                      >
                        Location
                        {sortField === &quot;name&quot; && (
                          <span className=&quot;ml-1&quot;>
                            {sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant=&quot;ghost&quot;
                        onClick={() => handleSort(&quot;locationType&quot;)}
                        className=&quot;flex items-center gap-1 hover:bg-transparent hover:underline&quot;
                      >
                        Type
                        {sortField === &quot;locationType&quot; && (
                          <span className=&quot;ml-1&quot;>
                            {sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;}
                          </span>
                        )}
                      </Button>
                    </TableHead>
                    <TableHead className=&quot;hidden md:table-cell&quot;>
                      Address
                    </TableHead>
                    {showStatus && (
                      <TableHead className=&quot;w-[100px]&quot;>
                        <Button
                          variant=&quot;ghost&quot;
                          onClick={() => handleSort(&quot;status&quot;)}
                          className=&quot;flex items-center gap-1 hover:bg-transparent hover:underline&quot;
                        >
                          Status
                          {sortField === &quot;status&quot; && (
                            <span className=&quot;ml-1&quot;>
                              {sortDirection === &quot;asc&quot; ? &quot;↑&quot; : &quot;↓&quot;}
                            </span>
                          )}
                        </Button>
                      </TableHead>
                    )}
                    <TableHead className=&quot;w-[100px] text-right&quot;>
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLocations.map((location) => (
                    <TableRow
                      key={location.id}
                      className={cn(
                        &quot;transition-colors duration-200&quot;,
                        allowSelection && &quot;cursor-pointer&quot;,
                        selectedLocationId === location.id
                          ? &quot;bg-primary/10 border-l-2 border-l-primary&quot;
                          : &quot;hover:bg-muted/30&quot;,
                      )}
                      onClick={() =>
                        allowSelection && handleSelectLocation(location)
                      }
                      style={{
                        animation:
                          selectedLocationId === location.id
                            ? &quot;pulse-subtle 2s infinite&quot;
                            : &quot;none&quot;,
                      }}
                    >
                      <TableCell className=&quot;font-medium&quot;>
                        {location.name}
                      </TableCell>
                      <TableCell>
                        {renderLocationTypeBadge(location.locationType)}
                      </TableCell>
                      <TableCell className=&quot;hidden md:table-cell&quot;>
                        <div className=&quot;truncate max-w-xs&quot;>
                          {location.address}
                          {location.city && location.state && (
                            <span className=&quot;block text-xs text-muted-foreground&quot;>
                              {location.city}, {location.state}{&quot; &quot;}
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
                      <TableCell className=&quot;text-right&quot;>
                        {renderActionMenu(location)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination for table view */}
            {totalPages > 1 && (
              <Pagination className=&quot;mt-8&quot;>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={cn(
                        currentPage === 1 && &quot;pointer-events-none opacity-50&quot;,
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
                          <span className=&quot;h-9 w-9 flex items-center justify-center&quot;>
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
                          &quot;pointer-events-none opacity-50&quot;,
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}

        {/* Map View */}
        {viewMode === &quot;map&quot; && (
          <div className=&quot;bg-muted/30 rounded-md border h-[600px] flex items-center justify-center&quot;>
            <div className=&quot;text-center&quot;>
              <MapIcon className=&quot;h-10 w-10 mx-auto text-muted-foreground mb-4&quot; />
              <h3 className=&quot;text-lg font-medium&quot;>Map View</h3>
              <p className=&quot;text-sm text-muted-foreground max-w-md mx-auto mt-2">
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
