"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter, MapPin, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

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
    search: initialValues?.search || "",
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
    { value: "venue", label: "Venue" },
    { value: "field", label: "Field" },
    { value: "facility", label: "Facility" },
    { value: "stadium", label: "Stadium" },
    { value: "arena", label: "Arena" },
    { value: "park", label: "Park" },
    { value: "school", label: "School" },
    { value: "business", label: "Business" },
    { value: "other", label: "Other" },
  ];

  // Initialize status options
  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
    { value: "rejected", label: "Rejected" },
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
      search: "",
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
    <div className={cn("flex flex-col space-y-4", className)}>
      {/* Desktop and tablet filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 w-full"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 p-0"
              onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        {/* Filter button with popover */}
        <Popover open={openFilters} onOpenChange={setOpenFilters}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-1 whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 rounded-full px-2 py-0"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 sm:w-80 md:w-96">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Location Filters</h4>
                <p className="text-sm text-muted-foreground">
                  Filter locations by state, city, type and more
                </p>
              </div>
              <div className="grid gap-2">
                {/* State filters */}
                {availableStates.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">States</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {availableStates.map((state) => (
                        <div
                          key={state.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`state-${state.id}`}
                            checked={filters.states.includes(state.id)}
                            onCheckedChange={() => toggleStateFilter(state.id)}
                          />
                          <Label
                            htmlFor={`state-${state.id}`}
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {state.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location type filters */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium">Location Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {locationTypeOptions.map((type) => (
                      <div
                        key={type.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`type-${type.value}`}
                          checked={filters.types.includes(type.value)}
                          onCheckedChange={() => toggleTypeFilter(type.value)}
                        />
                        <Label
                          htmlFor={`type-${type.value}`}
                          className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {type.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status filters (admin only) */}
                {showStatusFilter && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Status</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {statusOptions.map((status) => (
                        <div
                          key={status.value}
                          className="flex items-center space-x-2"
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
                            className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {status.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proximity filter */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">
                      Distance Radius (miles)
                    </Label>
                    <span className="text-xs text-muted-foreground">
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
                  <p className="text-xs text-muted-foreground">
                    {!filters.coordinates
                      ? "Set a center point to enable radius filtering"
                      : `Center: ${filters.coordinates.latitude.toFixed(4)}, ${filters.coordinates.longitude.toFixed(4)}`}
                  </p>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={activeFilterCount === 0}
                >
                  Clear All
                </Button>
                <Button size="sm" onClick={() => setOpenFilters(false)}>
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
              variant="outline"
              size="sm"
              className="sm:hidden flex items-center gap-1"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 rounded-full px-2 py-0"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] sm:h-[90vh]">
            <SheetHeader>
              <SheetTitle>Location Filters</SheetTitle>
              <SheetDescription>
                Filter locations by state, city, type and more
              </SheetDescription>
            </SheetHeader>
            <div className="py-6 overflow-y-auto">
              {/* State filters */}
              {availableStates.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">States</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {availableStates.map((state) => (
                      <div
                        key={state.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`mobile-state-${state.id}`}
                          checked={filters.states.includes(state.id)}
                          onCheckedChange={() => toggleStateFilter(state.id)}
                        />
                        <Label
                          htmlFor={`mobile-state-${state.id}`}
                          className="text-sm font-normal"
                        >
                          {state.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Location type filters */}
              <div className="mb-6">
                <h4 className="text-sm font-medium mb-3">Location Type</h4>
                <div className="grid grid-cols-2 gap-3">
                  {locationTypeOptions.map((type) => (
                    <div
                      key={type.value}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`mobile-type-${type.value}`}
                        checked={filters.types.includes(type.value)}
                        onCheckedChange={() => toggleTypeFilter(type.value)}
                      />
                      <Label
                        htmlFor={`mobile-type-${type.value}`}
                        className="text-sm font-normal"
                      >
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status filters (admin only) */}
              {showStatusFilter && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Status</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {statusOptions.map((status) => (
                      <div
                        key={status.value}
                        className="flex items-center space-x-2"
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
                          className="text-sm font-normal"
                        >
                          {status.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proximity filter */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Distance Radius</h4>
                  <span className="text-sm text-muted-foreground">
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
                <p className="text-xs text-muted-foreground mt-2">
                  {!filters.coordinates
                    ? "Set a center point to enable radius filtering"
                    : `Center: ${filters.coordinates.latitude.toFixed(4)}, ${filters.coordinates.longitude.toFixed(4)}`}
                </p>
              </div>
            </div>
            <SheetFooter className="pt-2">
              <Button
                variant="outline"
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
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          <span className="text-xs font-medium text-muted-foreground mr-1">
            Active filters:
          </span>

          {/* Search filter */}
          {filters.search && (
            <Badge variant="secondary" className="px-2 py-1 h-6">
              Search: {filters.search}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}

          {/* State filters */}
          {filters.states.map((stateId) => {
            const state = availableStates.find((s) => s.id === stateId);
            return (
              <Badge
                key={`badge-state-${stateId}`}
                variant="secondary"
                className="px-2 py-1 h-6"
              >
                State: {state?.name || stateId}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStateFilter(stateId)}
                  className="ml-1 h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
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
                variant="secondary"
                className="px-2 py-1 h-6"
              >
                Type: {typeOption?.label || type}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTypeFilter(type)}
                  className="ml-1 h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
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
                variant="secondary"
                className="px-2 py-1 h-6"
              >
                Status: {statusOption?.label || status}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleStatusFilter(status)}
                  className="ml-1 h-4 w-4 p-0"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove</span>
                </Button>
              </Badge>
            );
          })}

          {/* Radius filter */}
          {filters.radiusMiles !== undefined && filters.radiusMiles > 0 && (
            <Badge variant="secondary" className="px-2 py-1 h-6">
              Within: {filters.radiusMiles} miles
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setFilters((prev) => ({ ...prev, radiusMiles: undefined }))
                }
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove</span>
              </Button>
            </Badge>
          )}

          {/* Clear all filters button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs font-medium"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
