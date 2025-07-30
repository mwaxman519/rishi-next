import { useState, useEffect } from &quot;react&quot;;
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  Filter,
  RefreshCw,
  Search,
} from &quot;lucide-react&quot;;
import { format } from &quot;date-fns&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
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
} from &quot;@/components/ui/command&quot;;
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from &quot;@/components/ui/accordion&quot;;
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from &quot;@/components/ui/collapsible&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { BOOKING_STATUS, BOOKING_PRIORITY } from &quot;@shared/schema&quot;;

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
  search: "&quot;,
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
    <div className=&quot;space-y-4&quot;>
      <div className=&quot;flex flex-col sm:flex-row gap-3&quot;>
        {/* Search Input */}
        <div className=&quot;relative flex-grow&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            placeholder=&quot;Search bookings...&quot;
            className=&quot;pl-8&quot;
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Quick Filter Actions */}
        <div className=&quot;flex gap-2&quot;>
          {/* Status Filter */}
          <Select
            value={filters.status || &quot;&quot;}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className=&quot;w-[130px]&quot;>
              <SelectValue placeholder=&quot;Status&quot; />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=&quot;&quot;>All Statuses</SelectItem>
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
            value={filters.priority || &quot;&quot;}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger className=&quot;w-[130px]&quot;>
              <SelectValue placeholder=&quot;Priority&quot; />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=&quot;&quot;>All Priorities</SelectItem>
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
                variant={isDateRangeActive ? &quot;default&quot; : &quot;outline&quot;}
                className=&quot;min-w-[130px]&quot;
              >
                <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
                {isDateRangeActive ? (
                  <span className=&quot;text-xs&quot;>
                    {filters.dateRange.from
                      ? format(filters.dateRange.from, &quot;MMM d&quot;)
                      : &quot;From&quot;}{&quot; &quot;}
                    -
                    {filters.dateRange.to
                      ? format(filters.dateRange.to, &quot;MMM d&quot;)
                      : &quot;To&quot;}
                  </span>
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className=&quot;w-auto p-0&quot; align=&quot;end&quot;>
              <Calendar
                initialFocus
                mode=&quot;range&quot;
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
              <div className=&quot;flex items-center justify-between px-3 py-2 border-t&quot;>
                <Button
                  variant=&quot;ghost&quot;
                  size=&quot;sm&quot;
                  onClick={() =>
                    handleDateRangeChange({ from: null, to: null })
                  }
                  disabled={!isDateRangeActive}
                >
                  Clear
                </Button>
                <Button
                  size=&quot;sm&quot;
                  onClick={() => document.body.click()} // Close the popover
                >
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Advanced Filters Toggle */}
          <Button
            variant={isExpanded ? &quot;default&quot; : &quot;outline&quot;}
            size=&quot;icon&quot;
            onClick={() => setIsExpanded(!isExpanded)}
            className=&quot;relative&quot;
          >
            <Filter className=&quot;h-4 w-4&quot; />
            {activeFilterCount > 0 && !isExpanded && (
              <Badge
                variant=&quot;secondary&quot;
                className=&quot;absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center&quot;
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {/* Reset Filters Button */}
          {activeFilterCount > 0 && (
            <Button variant=&quot;outline&quot; onClick={resetFilters} size=&quot;icon&quot;>
              <RefreshCw className=&quot;h-4 w-4&quot; />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md&quot;>
            {/* Client Organization Filter */}
            <div className=&quot;space-y-2&quot;>
              <Label>Client Organizations</Label>
              <ScrollableCheckboxList
                items={organizations}
                selectedIds={filters.organizationIds}
                onToggle={(id) => toggleArrayFilter(&quot;organizationIds&quot;, id)}
                placeholder=&quot;Search organizations...&quot;
              />
            </div>

            {/* Locations Filter */}
            <div className=&quot;space-y-2&quot;>
              <Label>Locations</Label>
              <ScrollableCheckboxList
                items={locations}
                selectedIds={filters.locationIds}
                onToggle={(id) => toggleArrayFilter(&quot;locationIds&quot;, id)}
                placeholder=&quot;Search locations...&quot;
              />
            </div>

            {/* Activity Types Filter */}
            <div className=&quot;space-y-2&quot;>
              <Label>Activity Types</Label>
              <ScrollableCheckboxList
                items={activityTypes}
                selectedIds={filters.activityTypeIds}
                onToggle={(id) => toggleArrayFilter(&quot;activityTypeIds&quot;, id)}
                placeholder=&quot;Search activity types...&quot;
              />
            </div>

            {/* Boolean Filters */}
            <div className=&quot;space-y-2&quot;>
              <Label>Additional Filters</Label>
              <div className=&quot;flex flex-col space-y-2&quot;>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Checkbox
                    id=&quot;recurring-only&quot;
                    checked={filters.showRecurringOnly}
                    onCheckedChange={() =>
                      toggleBooleanFilter(&quot;showRecurringOnly&quot;)
                    }
                  />
                  <label
                    htmlFor=&quot;recurring-only&quot;
                    className=&quot;text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&quot;
                  >
                    Show recurring bookings only
                  </label>
                </div>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Checkbox
                    id=&quot;with-attachments&quot;
                    checked={filters.withAttachments}
                    onCheckedChange={() =>
                      toggleBooleanFilter(&quot;withAttachments&quot;)
                    }
                  />
                  <label
                    htmlFor=&quot;with-attachments&quot;
                    className=&quot;text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&quot;
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
        <div className=&quot;flex flex-wrap gap-2&quot;>
          {filters.status && (
            <FilterBadge
              label={`Status: ${filters.status}`}
              onRemove={() => handleStatusChange(&quot;&quot;)}
            />
          )}
          {filters.priority && (
            <FilterBadge
              label={`Priority: ${filters.priority}`}
              onRemove={() => handlePriorityChange(&quot;&quot;)}
            />
          )}
          {isDateRangeActive && (
            <FilterBadge
              label={`Date: ${filters.dateRange.from ? format(filters.dateRange.from, &quot;MMM d&quot;) : &quot;Any&quot;} - ${
                filters.dateRange.to
                  ? format(filters.dateRange.to, &quot;MMM d&quot;)
                  : &quot;Any&quot;
              }`}
              onRemove={() => handleDateRangeChange({ from: null, to: null })}
            />
          )}
          {filters.organizationIds.map((id) => (
            <FilterBadge
              key={`org-${id}`}
              label={`Org: ${organizations.find((o) => o.id === id)?.name || id}`}
              onRemove={() => toggleArrayFilter(&quot;organizationIds&quot;, id)}
            />
          ))}
          {filters.locationIds.map((id) => (
            <FilterBadge
              key={`loc-${id}`}
              label={`Location: ${locations.find((l) => l.id === id)?.name || id}`}
              onRemove={() => toggleArrayFilter(&quot;locationIds&quot;, id)}
            />
          ))}
          {filters.activityTypeIds.map((id) => (
            <FilterBadge
              key={`act-${id}`}
              label={`Activity: ${activityTypes.find((a) => a.id === id)?.name || id}`}
              onRemove={() => toggleArrayFilter(&quot;activityTypeIds&quot;, id)}
            />
          ))}
          {filters.showRecurringOnly && (
            <FilterBadge
              label=&quot;Recurring only&quot;
              onRemove={() => toggleBooleanFilter(&quot;showRecurringOnly&quot;)}
            />
          )}
          {filters.withAttachments && (
            <FilterBadge
              label=&quot;With attachments&quot;
              onRemove={() => toggleBooleanFilter(&quot;withAttachments&quot;)}
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
    <Badge variant=&quot;secondary&quot; className=&quot;flex items-center gap-1 px-2 py-1&quot;>
      {label}
      <Button
        variant=&quot;ghost&quot;
        size=&quot;sm&quot;
        className=&quot;h-4 w-4 p-0 hover:bg-transparent&quot;
        onClick={onRemove}
      >
        <RefreshCw className=&quot;h-3 w-3&quot; />
        <span className=&quot;sr-only&quot;>Remove filter</span>
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
  placeholder = &quot;Search...&quot;,
}: ScrollableCheckboxListProps) {
  const [search, setSearch] = useState(&quot;&quot;);

  // Filter items based on search
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Command className=&quot;border rounded-md&quot;>
      <CommandInput
        placeholder={placeholder}
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className=&quot;max-h-[200px] overflow-auto&quot;>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {filteredItems.map((item) => (
            <CommandItem
              key={item.id}
              value={item.id}
              onSelect={() => onToggle(item.id)}
              className=&quot;flex items-center&quot;
            >
              <div className=&quot;flex items-center space-x-2 flex-1&quot;>
                <Checkbox checked={selectedIds.includes(item.id)} />
                <span>{item.name}</span>
              </div>
              {selectedIds.includes(item.id) && (
                <Check className=&quot;h-4 w-4 ml-auto" />
              )}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
