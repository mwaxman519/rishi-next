&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { Search, X, Filter, MapPin, SlidersHorizontal } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from &quot;@/components/ui/command&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from &quot;@/components/ui/sheet&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Slider } from &quot;@/components/ui/slider&quot;;
import { cn } from &quot;@/lib/utils&quot;;

export interface LocationFilterValues {
  search: string;
  states: string[];
  cities: string[];
  zipCodes: string[];
  types: string[];
  status: string[];
  regions: string[];
  radiusMiles?: number | undefined;
  coordinates?:
    | {
        latitude: number;
        longitude: number;
      }
    | undefined;
}

interface LocationFilterProps {
  onFilterChange: (filters: LocationFilterValues) => void;
  initialValues?: Partial<LocationFilterValues>;
  showStatusFilter?: boolean;
  availableStates?: { id: string; name: string }[];
  availableCities?: { id: string; name: string }[];
  availableZipCodes?: { id: string; name: string }[];
  availableRegions?: { id: string; name: string }[];
  isLoading?: boolean;
  className?: string;
}

export function LocationFilter({
  onFilterChange,
  initialValues,
  showStatusFilter = false,
  availableStates = [],
  availableCities = [],
  availableZipCodes = [],
  availableRegions = [],
  isLoading = false,
  className,
}: LocationFilterProps) {
  const [filters, setFilters] = useState<LocationFilterValues>({
    search: initialValues?.search || "&quot;,
    states: initialValues?.states || [],
    cities: initialValues?.cities || [],
    zipCodes: initialValues?.zipCodes || [],
    types: initialValues?.types || [],
    status: initialValues?.status || [],
    regions: initialValues?.regions || [],
    radiusMiles: initialValues?.radiusMiles,
    coordinates: initialValues?.coordinates,
  });

  const [openFilters, setOpenFilters] = useState(false);
  const [openMobileFilters, setOpenMobileFilters] = useState(false);

  // Initialize location type options
  const locationTypeOptions = [
    { value: &quot;venue&quot;, label: &quot;Venue&quot; },
    { value: &quot;field&quot;, label: &quot;Field&quot; },
    { value: &quot;facility&quot;, label: &quot;Facility&quot; },
    { value: &quot;stadium&quot;, label: &quot;Stadium&quot; },
    { value: &quot;arena&quot;, label: &quot;Arena&quot; },
    { value: &quot;park&quot;, label: &quot;Park&quot; },
    { value: &quot;school&quot;, label: &quot;School&quot; },
    { value: &quot;business&quot;, label: &quot;Business&quot; },
    { value: &quot;other&quot;, label: &quot;Other&quot; },
  ];

  // Initialize status options
  const statusOptions = [
    { value: &quot;active&quot;, label: &quot;Active&quot; },
    { value: &quot;inactive&quot;, label: &quot;Inactive&quot; },
    { value: &quot;pending&quot;, label: &quot;Pending&quot; },
    { value: &quot;rejected&quot;, label: &quot;Rejected&quot; },
  ];

  // Pass filters up whenever they change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Handle search input changes
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: &quot;&quot;,
      states: [],
      cities: [],
      zipCodes: [],
      types: [],
      status: [],
      regions: [],
      radiusMiles: undefined,
      coordinates: undefined,
    });
  };

  // Handle state filter changes
  const toggleStateFilter = (stateId: string) => {
    setFilters((prev) => {
      if (prev.states.includes(stateId)) {
        return {
          ...prev,
          states: prev.states.filter((s) => s !== stateId),
        };
      } else {
        return {
          ...prev,
          states: [...prev.states, stateId],
        };
      }
    });
  };

  // Handle city filter changes
  const toggleCityFilter = (cityId: string) => {
    setFilters((prev) => {
      if (prev.cities.includes(cityId)) {
        return {
          ...prev,
          cities: prev.cities.filter((c) => c !== cityId),
        };
      } else {
        return {
          ...prev,
          cities: [...prev.cities, cityId],
        };
      }
    });
  };

  // Handle type filter changes
  const toggleTypeFilter = (type: string) => {
    setFilters((prev) => {
      if (prev.types.includes(type)) {
        return {
          ...prev,
          types: prev.types.filter((t) => t !== type),
        };
      } else {
        return {
          ...prev,
          types: [...prev.types, type],
        };
      }
    });
  };

  // Handle status filter changes
  const toggleStatusFilter = (status: string) => {
    setFilters((prev) => {
      if (prev.status.includes(status)) {
        return {
          ...prev,
          status: prev.status.filter((s) => s !== status),
        };
      } else {
        return {
          ...prev,
          status: [...prev.status, status],
        };
      }
    });
  };

  // Handle radius slider change
  const handleRadiusChange = (value: number[]) => {
    setFilters((prev) => ({
      ...prev,
      radiusMiles: value[0],
    }));
  };

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.states.length) count++;
    if (filters.cities.length) count++;
    if (filters.zipCodes.length) count++;
    if (filters.types.length) count++;
    if (filters.status.length) count++;
    if (filters.regions.length) count++;
    if (filters.radiusMiles !== undefined) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className={cn(&quot;flex flex-col space-y-4&quot;, className)}>
      {/* Desktop and tablet filters */}
      <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
        {/* Search input */}
        <div className=&quot;relative flex-1&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search locations...&quot;
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className=&quot;pl-9 w-full&quot;
          />
          {filters.search && (
            <Button
              variant=&quot;ghost&quot;
              size=&quot;sm&quot;
              className=&quot;absolute right-0 top-0 h-9 w-9 p-0&quot;
              onClick={() => setFilters((prev) => ({ ...prev, search: &quot;&quot; }))}
            >
              <X className=&quot;h-4 w-4&quot; />
              <span className=&quot;sr-only&quot;>Clear search</span>
            </Button>
          )}
        </div>

        {/* Filter button with popover */}
        <Popover open={openFilters} onOpenChange={setOpenFilters}>
          <PopoverTrigger asChild>
            <Button
              variant=&quot;outline&quot;
              size=&quot;sm&quot;
              className=&quot;hidden sm:flex items-center gap-1 whitespace-nowrap&quot;
            >
              <Filter className=&quot;h-4 w-4&quot; />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant=&quot;secondary&quot;
                  className=&quot;ml-1 h-5 rounded-full px-2 py-0&quot;
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className=&quot;w-72 sm:w-80 md:w-96&quot;>
            <div className=&quot;grid gap-4&quot;>
              <div className=&quot;space-y-2&quot;>
                <h4 className=&quot;font-medium leading-none&quot;>Location Filters</h4>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  Filter locations by state, city, type and more
                </p>
              </div>
              <div className=&quot;grid gap-2&quot;>
                {/* State filters */}
                {availableStates.length > 0 && (
                  <div className=&quot;space-y-2&quot;>
                    <Label className=&quot;text-xs font-medium&quot;>States</Label>
                    <div className=&quot;grid grid-cols-2 gap-2&quot;>
                      {availableStates.map((state) => (
                        <div
                          key={state.id}
                          className=&quot;flex items-center space-x-2&quot;
                        >
                          <Checkbox
                            id={`state-${state.id}`}
                            checked={filters.states.includes(state.id)}
                            onCheckedChange={() => toggleStateFilter(state.id)}
                          />
                          <Label
                            htmlFor={`state-${state.id}`}
                            className=&quot;text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&quot;
                          >
                            {state.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location type filters */}
                <div className=&quot;space-y-2&quot;>
                  <Label className=&quot;text-xs font-medium&quot;>Location Type</Label>
                  <div className=&quot;grid grid-cols-2 gap-2&quot;>
                    {locationTypeOptions.map((type) => (
                      <div
                        key={type.value}
                        className=&quot;flex items-center space-x-2&quot;
                      >
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={filters.types.includes(type.value)}
                          onCheckedChange={() => toggleTypeFilter(type.value)}
                        />
                        <Label
                          htmlFor={`type-${type.value}`}
                          className=&quot;text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&quot;
                        >
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status filters (admin only) */}
                {showStatusFilter && (
                  <div className=&quot;space-y-2&quot;>
                    <Label className=&quot;text-xs font-medium&quot;>Status</Label>
                    <div className=&quot;grid grid-cols-2 gap-2&quot;>
                      {statusOptions.map((status) => (
                        <div
                          key={status.value}
                          className=&quot;flex items-center space-x-2&quot;
                        >
                          <Checkbox
                            id={`status-${status.value}`}
                            checked={filters.status.includes(status.value)}
                            onCheckedChange={() =>
                              toggleStatusFilter(status.value)
                            }
                          />
                          <Label
                            htmlFor={`status-${status.value}`}
                            className=&quot;text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&quot;
                          >
                            {status.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proximity filter */}
                <div className=&quot;space-y-2&quot;>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <Label className=&quot;text-xs font-medium&quot;>
                      Distance Radius (miles)
                    </Label>
                    <span className=&quot;text-xs text-muted-foreground&quot;>
                      {filters.radiusMiles ?? 0} miles
                    </span>
                  </div>
                  <Slider
                    defaultValue={[filters.radiusMiles ?? 0]}
                    max={100}
                    step={5}
                    onValueChange={handleRadiusChange}
                    disabled={!filters.coordinates}
                  />
                  <p className=&quot;text-xs text-muted-foreground&quot;>
                    {!filters.coordinates
                      ? &quot;Set a center point to enable radius filtering&quot;
                      : `Center: ${filters.coordinates.latitude.toFixed(4)}, ${filters.coordinates.longitude.toFixed(4)}`}
                  </p>
                </div>
              </div>
              <div className=&quot;flex justify-between&quot;>
                <Button
                  variant=&quot;outline&quot;
                  size=&quot;sm&quot;
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear All
                </Button>
                <Button size=&quot;sm&quot; onClick={() => setOpenFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Mobile filters */}
        <Sheet open={openMobileFilters} onOpenChange={setOpenMobileFilters}>
          <SheetTrigger asChild>
            <Button
              variant=&quot;outline&quot;
              size=&quot;sm&quot;
              className=&quot;sm:hidden flex items-center gap-1&quot;
            >
              <SlidersHorizontal className=&quot;h-4 w-4&quot; />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant=&quot;secondary&quot;
                  className=&quot;ml-1 h-5 rounded-full px-2 py-0&quot;
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side=&quot;bottom&quot; className=&quot;h-[90vh] sm:h-[90vh]&quot;>
            <SheetHeader>
              <SheetTitle>Location Filters</SheetTitle>
              <SheetDescription>
                Filter locations by state, city, type and more
              </SheetDescription>
            </SheetHeader>
            <div className=&quot;py-6 overflow-y-auto&quot;>
              {/* State filters */}
              {availableStates.length > 0 && (
                <div className=&quot;mb-6&quot;>
                  <h4 className=&quot;text-sm font-medium mb-3&quot;>States</h4>
                  <div className=&quot;grid grid-cols-2 gap-3&quot;>
                    {availableStates.map((state) => (
                      <div
                        key={state.id}
                        className=&quot;flex items-center space-x-2&quot;
                      >
                        <Checkbox
                          id={`mobile-state-${state.id}`}
                          checked={filters.states.includes(state.id)}
                          onCheckedChange={() => toggleStateFilter(state.id)}
                        />
                        <Label
                          htmlFor={`mobile-state-${state.id}`}
                          className=&quot;text-sm font-normal&quot;
                        >
                          {state.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location type filters */}
              <div className=&quot;mb-6&quot;>
                <h4 className=&quot;text-sm font-medium mb-3&quot;>Location Type</h4>
                <div className=&quot;grid grid-cols-2 gap-3&quot;>
                  {locationTypeOptions.map((type) => (
                    <div
                      key={type.value}
                      className=&quot;flex items-center space-x-2&quot;
                    >
                      <Checkbox
                        id={`mobile-type-${type.value}`}
                        checked={filters.types.includes(type.value)}
                        onCheckedChange={() => toggleTypeFilter(type.value)}
                      />
                      <Label
                        htmlFor={`mobile-type-${type.value}`}
                        className=&quot;text-sm font-normal&quot;
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status filters (admin only) */}
              {showStatusFilter && (
                <div className=&quot;mb-6&quot;>
                  <h4 className=&quot;text-sm font-medium mb-3&quot;>Status</h4>
                  <div className=&quot;grid grid-cols-2 gap-3&quot;>
                    {statusOptions.map((status) => (
                      <div
                        key={status.value}
                        className=&quot;flex items-center space-x-2&quot;
                      >
                        <Checkbox
                          id={`mobile-status-${status.value}`}
                          checked={filters.status.includes(status.value)}
                          onCheckedChange={() =>
                            toggleStatusFilter(status.value)
                          }
                        />
                        <Label
                          htmlFor={`mobile-status-${status.value}`}
                          className=&quot;text-sm font-normal&quot;
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proximity filter */}
              <div className=&quot;mb-6&quot;>
                <div className=&quot;flex items-center justify-between mb-3&quot;>
                  <h4 className=&quot;text-sm font-medium&quot;>Distance Radius</h4>
                  <span className=&quot;text-sm text-muted-foreground&quot;>
                    {filters.radiusMiles ?? 0} miles
                  </span>
                </div>
                <Slider
                  defaultValue={[filters.radiusMiles ?? 0]}
                  max={100}
                  step={5}
                  onValueChange={handleRadiusChange}
                  disabled={!filters.coordinates}
                />
                <p className=&quot;text-xs text-muted-foreground mt-2&quot;>
                  {!filters.coordinates
                    ? &quot;Set a center point to enable radius filtering&quot;
                    : `Center: ${filters.coordinates.latitude.toFixed(4)}, ${filters.coordinates.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>
            <SheetFooter className=&quot;pt-2&quot;>
              <Button
                variant=&quot;outline&quot;
                onClick={clearAllFilters}
                disabled={activeFilterCount === 0}
              >
                Clear All
              </Button>
              <SheetClose asChild>
                <Button>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Active filters display */}
      {activeFilterCount > 0 && (
        <div className=&quot;flex flex-wrap gap-2 pt-2 items-center&quot;>
          <span className=&quot;text-xs font-medium text-muted-foreground mr-1&quot;>
            Active filters:
          </span>

          {/* Search filter */}
          {filters.search && (
            <Badge variant=&quot;secondary&quot; className=&quot;px-2 py-1 h-6&quot;>
              Search: {filters.search}
              <Button
                variant=&quot;ghost&quot;
                size=&quot;sm&quot;
                onClick={() => setFilters((prev) => ({ ...prev, search: &quot;&quot; }))}
                className=&quot;ml-1 h-4 w-4 p-0&quot;
              >
                <X className=&quot;h-3 w-3&quot; />
                <span className=&quot;sr-only&quot;>Remove</span>
              </Button>
            </Badge>
          )}

          {/* State filters */}
          {filters.states.map((stateId) => {
            const state = availableStates.find((s) => s.id === stateId);
            return (
              <Badge
                key={`badge-state-${stateId}`}
                variant=&quot;secondary&quot;
                className=&quot;px-2 py-1 h-6&quot;
              >
                State: {state?.name || stateId}
                <Button
                  variant=&quot;ghost&quot;
                  size=&quot;sm&quot;
                  onClick={() => toggleStateFilter(stateId)}
                  className=&quot;ml-1 h-4 w-4 p-0&quot;
                >
                  <X className=&quot;h-3 w-3&quot; />
                  <span className=&quot;sr-only&quot;>Remove</span>
                </Button>
              </Badge>
            );
          })}

          {/* Type filters */}
          {filters.types.map((type) => {
            const typeOption = locationTypeOptions.find(
              (t) => t.value === type,
            );
            return (
              <Badge
                key={`badge-type-${type}`}
                variant=&quot;secondary&quot;
                className=&quot;px-2 py-1 h-6&quot;
              >
                Type: {typeOption?.label || type}
                <Button
                  variant=&quot;ghost&quot;
                  size=&quot;sm&quot;
                  onClick={() => toggleTypeFilter(type)}
                  className=&quot;ml-1 h-4 w-4 p-0&quot;
                >
                  <X className=&quot;h-3 w-3&quot; />
                  <span className=&quot;sr-only&quot;>Remove</span>
                </Button>
              </Badge>
            );
          })}

          {/* Status filters */}
          {filters.status.map((status) => {
            const statusOption = statusOptions.find((s) => s.value === status);
            return (
              <Badge
                key={`badge-status-${status}`}
                variant=&quot;secondary&quot;
                className=&quot;px-2 py-1 h-6&quot;
              >
                Status: {statusOption?.label || status}
                <Button
                  variant=&quot;ghost&quot;
                  size=&quot;sm&quot;
                  onClick={() => toggleStatusFilter(status)}
                  className=&quot;ml-1 h-4 w-4 p-0&quot;
                >
                  <X className=&quot;h-3 w-3&quot; />
                  <span className=&quot;sr-only&quot;>Remove</span>
                </Button>
              </Badge>
            );
          })}

          {/* Radius filter */}
          {filters.radiusMiles !== undefined && filters.radiusMiles > 0 && (
            <Badge variant=&quot;secondary&quot; className=&quot;px-2 py-1 h-6&quot;>
              Within: {filters.radiusMiles} miles
              <Button
                variant=&quot;ghost&quot;
                size=&quot;sm&quot;
                onClick={() =>
                  setFilters((prev) => ({ ...prev, radiusMiles: undefined }))
                }
                className=&quot;ml-1 h-4 w-4 p-0&quot;
              >
                <X className=&quot;h-3 w-3&quot; />
                <span className=&quot;sr-only&quot;>Remove</span>
              </Button>
            </Badge>
          )}

          {/* Clear all filters button */}
          <Button
            variant=&quot;ghost&quot;
            size=&quot;sm&quot;
            onClick={clearAllFilters}
            className=&quot;h-6 px-2 text-xs font-medium"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
