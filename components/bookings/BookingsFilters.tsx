"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Filter,
  RefreshCw,
  Search,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/command";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS, BOOKING_PRIORITY } from "@/shared/schema";

export interface BookingsFiltersProps {
  onFilterChange: (filters: BookingsFilterState) => void;
  organizations?: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string }>;
  activityTypes?: Array<{ id: string; name: string }>;
  promotionTypes?: Array<{ id: string; name: string }>;
  filterState: BookingsFilterState;
}

export interface BookingsFilterState {
  search: string;
  status: string | null;
  priority: string | null;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  organizationIds: string[];
  locationIds: string[];
  activityTypeIds: string[];
  promotionTypeIds: string[];
  showRecurringOnly: boolean;
  withAttachments: boolean;
}

// Default filter state
const defaultFilterState: BookingsFilterState = {
  search: "",
  status: null,
  priority: null,
  dateRange: {
    from: null,
    to: null,
  },
  organizationIds: [],
  locationIds: [],
  activityTypeIds: [],
  promotionTypeIds: [],
  showRecurringOnly: false,
  withAttachments: false,
};

export function BookingsFilters({
  onFilterChange,
  organizations = [],
  locations = [],
  activityTypes = [],
  promotionTypes = [],
  filterState = defaultFilterState,
}: BookingsFiltersProps) {
  const [filters, setFilters] = useState<BookingsFilterState>(filterState);
  const [isExpanded, setIsExpanded] = useState(false);

  // Count active filters (excluding search)
  const activeFilterCount =
    (filters.status ? 1 : 0) +
    (filters.priority ? 1 : 0) +
    (filters.dateRange.from || filters.dateRange.to ? 1 : 0) +
    filters.organizationIds.length +
    filters.locationIds.length +
    filters.activityTypeIds.length +
    filters.promotionTypeIds.length +
    (filters.showRecurringOnly ? 1 : 0) +
    (filters.withAttachments ? 1 : 0);

  // Update parent component when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Reset all filters
  const resetFilters = () => {
    setFilters(defaultFilterState);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Handle status selection
  const handleStatusChange = (value: string) => {
    setFilters((prev) => ({ ...prev, status: value || null }));
  };

  // Handle priority selection
  const handlePriorityChange = (value: string) => {
    setFilters((prev) => ({ ...prev, priority: value || null }));
  };

  // Handle date range selection
  const handleDateRangeChange = (range: {
    from: Date | null;
    to: Date | null;
  }) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
  };

  // Toggle array-based filters (organizations, locations, etc.)
  const toggleArrayFilter = (
    arrayName: keyof BookingsFilterState,
    id: string,
  ) => {
    setFilters((prev) => {
      const currentArray = prev[arrayName] as string[];
      return {
        ...prev,
        [arrayName]: currentArray.includes(id)
          ? currentArray.filter((item) => item !== id)
          : [...currentArray, id],
      };
    });
  };

  // Toggle boolean filters
  const toggleBooleanFilter = (filterName: keyof BookingsFilterState) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  // Helper to check if date range is active
  const isDateRangeActive = filters.dateRange.from || filters.dateRange.to;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            className="pl-8"
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Quick Filter Actions */}
        <div className="flex gap-2">
          {/* Status Filter */}
          <Select
            value={filters.status || ""}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value={BOOKING_STATUS.DRAFT}>Draft</SelectItem>
              <SelectItem value={BOOKING_STATUS.PENDING}>Pending</SelectItem>
              <SelectItem value={BOOKING_STATUS.APPROVED}>Approved</SelectItem>
              <SelectItem value={BOOKING_STATUS.REJECTED}>Rejected</SelectItem>
              <SelectItem value={BOOKING_STATUS.CANCELED}>Canceled</SelectItem>
              <SelectItem value={BOOKING_STATUS.COMPLETED}>
                Completed
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority || ""}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.LOW}>Low</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.MEDIUM}>Medium</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.HIGH}>High</SelectItem>
              <SelectItem value={BOOKING_PRIORITY.URGENT}>Urgent</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={isDateRangeActive ? "default" : "outline"}
                className="min-w-[130px]"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {isDateRangeActive ? (
                  <span className="text-xs">
                    {filters.dateRange.from
                      ? format(filters.dateRange.from, "MMM d")
                      : "From"}{" "}
                    -
                    {filters.dateRange.to
                      ? format(filters.dateRange.to, "MMM d")
                      : "To"}
                  </span>
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={filters.dateRange.from || undefined}
                selected={{
                  from: filters.dateRange.from || undefined,
                  to: filters.dateRange.to || undefined,
                }}
                onSelect={(range) =>
                  handleDateRangeChange({
                    from: range?.from || null,
                    to: range?.to || null,
                  })
                }
                numberOfMonths={2}
              />
              <div className="flex items-center justify-between px-3 py-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDateRangeChange({ from: null, to: null })
                  }
                  disabled={!isDateRangeActive}
                >
                  Clear
                </Button>
                <Button
                  size="sm"
                  onClick={() => document.body.click()} // Close the popover
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Advanced Filters Toggle */}
          <Button
            variant={isExpanded ? "default" : "outline"}
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && !isExpanded && (
              <Badge
                variant="secondary"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <Button variant="outline" onClick={resetFilters} size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md">
            {/* Client Organization Filter */}
            <div className="space-y-2">
              <Label>Client Organizations</Label>
              <ScrollableCheckboxList
                items={organizations}
                selectedIds={filters.organizationIds}
                onToggle={(id) => toggleArrayFilter("organizationIds", id)}
                placeholder="Search organizations..."
              />
            </div>

            {/* Locations Filter */}
            <div className="space-y-2">
              <Label>Locations</Label>
              <ScrollableCheckboxList
                items={locations}
                selectedIds={filters.locationIds}
                onToggle={(id) => toggleArrayFilter("locationIds", id)}
                placeholder="Search locations..."
              />
            </div>

            {/* Activity Types Filter */}
            <div className="space-y-2">
              <Label>Activity Types</Label>
              <ScrollableCheckboxList
                items={activityTypes}
                selectedIds={filters.activityTypeIds}
                onToggle={(id) => toggleArrayFilter("activityTypeIds", id)}
                placeholder="Search activity types..."
              />
            </div>

            {/* Boolean Filters */}
            <div className="space-y-2">
              <Label>Additional Filters</Label>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring-only"
                    checked={filters.showRecurringOnly}
                    onCheckedChange={() =>
                      toggleBooleanFilter("showRecurringOnly")
                    }
                  />
                  <label
                    htmlFor="recurring-only"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Show recurring bookings only
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="with-attachments"
                    checked={filters.withAttachments}
                    onCheckedChange={() =>
                      toggleBooleanFilter("withAttachments")
                    }
                  />
                  <label
                    htmlFor="with-attachments"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    With attachments
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filter Summary */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <FilterBadge
              label={`Status: ${filters.status}`}
              onRemove={() => handleStatusChange("")}
            />
          )}
          {filters.priority && (
            <FilterBadge
              label={`Priority: ${filters.priority}`}
              onRemove={() => handlePriorityChange("")}
            />
          )}
          {isDateRangeActive && (
            <FilterBadge
              label={`Date: ${filters.dateRange.from ? format(filters.dateRange.from, "MMM d") : "Any"} - ${
                filters.dateRange.to
                  ? format(filters.dateRange.to, "MMM d")
                  : "Any"
              }`}
              onRemove={() => handleDateRangeChange({ from: null, to: null })}
            />
          )}
          {filters.organizationIds.map((id) => (
            <FilterBadge
              key={`org-${id}`}
              label={`Org: ${organizations.find((o) => o.id === id)?.name || id}`}
              onRemove={() => toggleArrayFilter("organizationIds", id)}
            />
          ))}
          {filters.locationIds.map((id) => (
            <FilterBadge
              key={`loc-${id}`}
              label={`Location: ${locations.find((l) => l.id === id)?.name || id}`}
              onRemove={() => toggleArrayFilter("locationIds", id)}
            />
          ))}
          {filters.activityTypeIds.map((id) => (
            <FilterBadge
              key={`act-${id}`}
              label={`Activity: ${activityTypes.find((a) => a.id === id)?.name || id}`}
              onRemove={() => toggleArrayFilter("activityTypeIds", id)}
            />
          ))}
          {filters.showRecurringOnly && (
            <FilterBadge
              label="Recurring only"
              onRemove={() => toggleBooleanFilter("showRecurringOnly")}
            />
          )}
          {filters.withAttachments && (
            <FilterBadge
              label="With attachments"
              onRemove={() => toggleBooleanFilter("withAttachments")}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Helper component to display active filters as badges
function FilterBadge({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
      {label}
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-transparent"
        onClick={onRemove}
      >
        <RefreshCw className="h-3 w-3" />
        <span className="sr-only">Remove filter</span>
      </Button>
    </Badge>
  );
}

// Scrollable checkbox list component for multi-select filters
interface ScrollableCheckboxListProps {
  items: Array<{ id: string; name: string }>;
  selectedIds: string[];
  onToggle: (id: string) => void;
  placeholder?: string;
}

function ScrollableCheckboxList({
  items,
  selectedIds,
  onToggle,
  placeholder = "Search...",
}: ScrollableCheckboxListProps) {
  const [search, setSearch] = useState("");

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Command className="border rounded-md">
      <CommandInput
        placeholder={placeholder}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[200px] overflow-auto">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {filteredItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.id}
              onSelect={() => onToggle(item.id)}
              className="flex items-center"
            >
              <div className="flex items-center space-x-2 flex-1">
                <Checkbox checked={selectedIds.includes(item.id)} />
                <span>{item.name}</span>
              </div>
              {selectedIds.includes(item.id) && (
                <Check className="h-4 w-4 ml-auto" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
