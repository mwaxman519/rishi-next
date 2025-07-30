&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  Search,
  Filter,
  X,
  MapPin,
  Building,
  MapIcon,
  Map,
  Loader2,
  Clock,
  Tag,
  ChevronDown,
  CircleIcon,
} from &quot;lucide-react&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { ScrollArea } from &quot;@/components/ui/scroll-area&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
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
} from &quot;@/components/ui/command&quot;;

export interface LocationFilterValues {
  search: string;
  states: string[];
  regions: string[];
  cities: string[];
  zipCodes: string[];
  status: string[];
  locationType: string[];
}

interface LocationFiltersProps {
  onFilterChange: (filters: LocationFilterValues) => void;
  initialValues?: LocationFilterValues;
}

interface StateItem {
  id: string;
  code: string;
  name: string;
  count: number;
}

interface RegionItem {
  id: string;
  name: string;
  count: number;
}

interface CityItem {
  name: string;
  state: string;
  count: number;
}

interface ZipCodeItem {
  code: string;
  city: string;
  state: string;
  count: number;
}

export function LocationFilters({
  onFilterChange,
  initialValues = {
    search: "&quot;,
    states: [],
    regions: [],
    cities: [],
    zipCodes: [],
    status: [],
    locationType: [],
  },
}: LocationFiltersProps) {
  const [filters, setFilters] = useState<LocationFilterValues>(initialValues);

  const [showFilters, setShowFilters] = useState(false);

  // Fetch states for filter
  const { data: statesData, isLoading: statesLoading } = useQuery<{
    states?: StateItem[];
  }>({
    queryKey: [&quot;locationStates&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/locations/states&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch states&quot;);
      }
      return res.json();
    },
  });

  // Fetch regions for filter
  const { data: regionsData, isLoading: regionsLoading } = useQuery<{
    regions?: RegionItem[];
  }>({
    queryKey: [&quot;locationRegions&quot;],
    queryFn: async () => {
      const res = await fetch(&quot;/api/locations/regions&quot;);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch regions&quot;);
      }
      return res.json();
    },
  });

  // Fetch cities for filter based on selected states
  const { data: citiesData, isLoading: citiesLoading } = useQuery<{
    cities?: CityItem[];
  }>({
    queryKey: [&quot;locationCities&quot;, filters.states],
    queryFn: async () => {
      const statesParam =
        filters.states.length > 0 ? `?states=${filters.states.join(&quot;,&quot;)}` : &quot;&quot;;
      const res = await fetch(`/api/locations/cities${statesParam}`);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch cities&quot;);
      }
      return res.json();
    },
    enabled: true, // Always fetch, even without states
  });

  // Fetch ZIP codes for filter based on selected states and cities
  const { data: zipCodesData, isLoading: zipCodesLoading } = useQuery<{
    zipCodes?: ZipCodeItem[];
  }>({
    queryKey: [&quot;locationZipCodes&quot;, filters.states, filters.cities],
    queryFn: async () => {
      const statesParam =
        filters.states.length > 0 ? `states=${filters.states.join(&quot;,&quot;)}` : &quot;&quot;;
      const citiesParam =
        filters.cities.length > 0 ? `cities=${filters.cities.join(&quot;,&quot;)}` : &quot;&quot;;

      let url = &quot;/api/locations/zipcodes&quot;;
      if (statesParam || citiesParam) {
        url += &quot;?&quot;;
        if (statesParam) url += statesParam;
        if (statesParam && citiesParam) url += &quot;&&quot;;
        if (citiesParam) url += citiesParam;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(&quot;Failed to fetch ZIP codes&quot;);
      }
      return res.json();
    },
    enabled: true, // Always fetch, even without states/cities
  });

  // Handle search query directly
  const handleSearchQueryChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  // Toggle state selection
  const toggleState = (stateCode: string) => {
    setFilters((prev) => {
      const newStates = prev.states.includes(stateCode)
        ? prev.states.filter((code) => code !== stateCode)
        : [...prev.states, stateCode];

      // If a state is deselected, also remove its cities and ZIP codes
      let newCities = [...prev.cities];
      let newZipCodes = [...prev.zipCodes];

      if (prev.states.includes(stateCode) && citiesData?.cities) {
        const stateCities = citiesData.cities
          .filter((city: CityItem) => city.state === stateCode)
          .map((city: CityItem) => city.name);

        newCities = newCities.filter(
          (city: string) => !stateCities.includes(city),
        );

        if (zipCodesData?.zipCodes) {
          const stateZipCodes = zipCodesData.zipCodes
            .filter((zip: ZipCodeItem) => zip.state === stateCode)
            .map((zip: ZipCodeItem) => zip.code);

          newZipCodes = newZipCodes.filter(
            (code: string) => !stateZipCodes.includes(code),
          );
        }
      }

      return {
        ...prev,
        states: newStates,
        cities: newCities,
        zipCodes: newZipCodes,
      };
    });
  };

  // Toggle region selection
  const toggleRegion = (regionId: string) => {
    setFilters((prev) => {
      const newRegions = prev.regions.includes(regionId)
        ? prev.regions.filter((id) => id !== regionId)
        : [...prev.regions, regionId];

      return { ...prev, regions: newRegions };
    });
  };

  // Toggle city selection
  const toggleCity = (cityName: string) => {
    setFilters((prev) => {
      const newCities = prev.cities.includes(cityName)
        ? prev.cities.filter((name) => name !== cityName)
        : [...prev.cities, cityName];

      // If a city is deselected, also remove its ZIP codes
      let newZipCodes = [...prev.zipCodes];

      if (prev.cities.includes(cityName) && zipCodesData?.zipCodes) {
        const cityZipCodes = zipCodesData.zipCodes
          .filter((zip: ZipCodeItem) => zip.city === cityName)
          .map((zip: ZipCodeItem) => zip.code);

        newZipCodes = newZipCodes.filter(
          (code: string) => !cityZipCodes.includes(code),
        );
      }

      return {
        ...prev,
        cities: newCities,
        zipCodes: newZipCodes,
      };
    });
  };

  // Toggle ZIP code selection
  const toggleZipCode = (zipCode: string) => {
    setFilters((prev) => {
      const newZipCodes = prev.zipCodes.includes(zipCode)
        ? prev.zipCodes.filter((code) => code !== zipCode)
        : [...prev.zipCodes, zipCode];

      return { ...prev, zipCodes: newZipCodes };
    });
  };

  // Toggle status selection
  const toggleStatus = (statusValue: string) => {
    setFilters((prev) => {
      const newStatus = prev.status.includes(statusValue)
        ? prev.status.filter((status) => status !== statusValue)
        : [...prev.status, statusValue];

      return { ...prev, status: newStatus };
    });
  };

  // Toggle location type selection
  const toggleLocationType = (typeValue: string) => {
    setFilters((prev) => {
      const newTypes = prev.locationType.includes(typeValue)
        ? prev.locationType.filter((type) => type !== typeValue)
        : [...prev.locationType, typeValue];

      return { ...prev, locationType: newTypes };
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      search: &quot;&quot;,
      states: [],
      regions: [],
      cities: [],
      zipCodes: [],
      status: [],
      locationType: [],
    });
  };

  // Update parent component with filter changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Loading indicator for all data
  const isLoading =
    statesLoading || regionsLoading || citiesLoading || zipCodesLoading;

  return (
    <div className=&quot;space-y-4&quot;>
      {isLoading ? (
        <div className=&quot;flex justify-center py-4&quot;>
          <Loader2 className=&quot;h-6 w-6 animate-spin text-primary&quot; />
        </div>
      ) : (
        <div className=&quot;space-y-4&quot;>
          {/* Filters */}
          <div className=&quot;space-y-4&quot;>
            {/* Text search */}
            <div className=&quot;flex items-center space-x-2&quot;>
              <div className=&quot;w-full max-w-md&quot;>
                <div className=&quot;relative&quot;>
                  <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                  <Input
                    type=&quot;text&quot;
                    placeholder=&quot;Search by name, address, etc.&quot;
                    value={filters.search}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                    className=&quot;pl-9&quot;
                  />
                </div>
              </div>

              <Button
                variant=&quot;outline&quot;
                size=&quot;sm&quot;
                onClick={() => setShowFilters(!showFilters)}
                className=&quot;flex items-center h-10&quot;
              >
                <Filter className=&quot;h-4 w-4 mr-1.5&quot; />
                {showFilters ? &quot;Hide&quot; : &quot;Filters&quot;}
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${showFilters ? &quot;rotate-180&quot; : &quot;&quot;}`}
                />
              </Button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className=&quot;p-3 border rounded-md bg-card/50 dark:bg-card/50&quot;>
                {/* Primary filters - 1st row */}
                <div className=&quot;flex flex-wrap gap-2 mb-4&quot;>
                  {/* Status filter */}
                  <div className=&quot;min-w-[140px] max-w-[180px]&quot;>
                    <Select
                      onValueChange={(value) => {
                        setFilters((prev) => {
                          if (!value || value === &quot;_all&quot;) {
                            return { ...prev, status: [] };
                          }
                          return { ...prev, status: [value] };
                        });
                      }}
                      value={filters.status[0] || &quot;_all&quot;}
                    >
                      <SelectTrigger className=&quot;h-8 text-xs&quot;>
                        <div className=&quot;flex items-center gap-1.5&quot;>
                          <CircleIcon className=&quot;h-3 w-3 text-muted-foreground&quot; />
                          <span>
                            {filters.status[0]
                              ? `Status: ${filters.status[0].charAt(0).toUpperCase() + filters.status[0].slice(1)}`
                              : &quot;Status: All&quot;}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;_all&quot;>All Statuses</SelectItem>
                        <SelectItem value=&quot;active&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <div className=&quot;h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-1.5&quot;></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value=&quot;pending&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <div className=&quot;h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5&quot;></div>
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value=&quot;inactive&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <div className=&quot;h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 mr-1.5&quot;></div>
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value=&quot;flagged&quot;>
                          <div className=&quot;flex items-center&quot;>
                            <div className=&quot;h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 mr-1.5&quot;></div>
                            Flagged
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Type filter */}
                  <div className=&quot;min-w-[140px] max-w-[180px]&quot;>
                    <Select
                      onValueChange={(value) => {
                        setFilters((prev) => {
                          if (!value || value === &quot;_all&quot;) {
                            return { ...prev, locationType: [] };
                          }
                          return { ...prev, locationType: [value] };
                        });
                      }}
                      value={filters.locationType[0] || &quot;_all&quot;}
                    >
                      <SelectTrigger className=&quot;h-8 text-xs&quot;>
                        <div className=&quot;flex items-center gap-1.5&quot;>
                          <Tag className=&quot;h-3 w-3 text-muted-foreground&quot; />
                          <span>
                            {filters.locationType[0]
                              ? `Type: ${filters.locationType[0].charAt(0).toUpperCase() + filters.locationType[0].slice(1)}`
                              : &quot;Type: All&quot;}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;_all&quot;>All Types</SelectItem>
                        <SelectItem value=&quot;office&quot;>Office</SelectItem>
                        <SelectItem value=&quot;retail&quot;>Retail</SelectItem>
                        <SelectItem value=&quot;warehouse&quot;>Warehouse</SelectItem>
                        <SelectItem value=&quot;venue&quot;>Venue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* States filter */}
                  <div className=&quot;min-w-[140px] max-w-[180px]&quot;>
                    <Select
                      onValueChange={(value) => {
                        // Clear existing state selections and set new one
                        if (!value || value === &quot;_all&quot;) {
                          setFilters((prev) => ({ ...prev, states: [] }));
                        } else {
                          // Set single state selection
                          setFilters((prev) => ({ ...prev, states: [value] }));
                        }
                      }}
                      value={filters.states[0] || &quot;_all&quot;}
                    >
                      <SelectTrigger className=&quot;h-8 text-xs&quot;>
                        <div className=&quot;flex items-center gap-1.5&quot;>
                          <MapIcon className=&quot;h-3 w-3 text-muted-foreground&quot; />
                          <span>
                            {filters.states[0]
                              ? `State: ${filters.states[0]}`
                              : &quot;State: All&quot;}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;_all&quot;>All States</SelectItem>
                        {statesData?.states?.map((state: StateItem) => (
                          <SelectItem key={state.code} value={state.code}>
                            <div className=&quot;flex items-center justify-between w-full&quot;>
                              <span>{state.name}</span>
                              <span className=&quot;text-xs ml-2 text-muted-foreground&quot;>
                                ({state.count})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City typeahead - small compact popover */}
                  <div className=&quot;min-w-[110px] max-w-[140px]&quot;>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant=&quot;outline&quot;
                          className=&quot;h-8 px-2.5 w-full justify-between text-xs font-normal truncate&quot;
                          size=&quot;sm&quot;
                        >
                          <div className=&quot;flex items-center gap-1.5 truncate&quot;>
                            <Building className=&quot;h-3 w-3 flex-shrink-0 text-muted-foreground&quot; />
                            <span className=&quot;truncate&quot;>
                              {filters.cities.length > 0
                                ? `City: ${filters.cities[0]}`
                                : &quot;City: All&quot;}
                            </span>
                          </div>
                          <ChevronDown className=&quot;h-3.5 w-3.5 opacity-50 flex-shrink-0&quot; />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=&quot;w-[240px] p-0&quot;>
                        <Command>
                          <CommandInput
                            placeholder=&quot;Search city...&quot;
                            className=&quot;h-8 text-xs&quot;
                          />
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup className=&quot;max-h-[200px] overflow-auto&quot;>
                            <CommandItem
                              value=&quot;_all&quot;
                              onSelect={() => {
                                setFilters((prev) => ({ ...prev, cities: [] }));
                              }}
                              className=&quot;text-xs&quot;
                            >
                              All Cities
                            </CommandItem>
                            {citiesData?.cities
                              ?.filter(
                                (city: CityItem) =>
                                  filters.states.length === 0 ||
                                  filters.states.includes(city.state),
                              )
                              .map((city: CityItem) => (
                                <CommandItem
                                  key={`${city.name}-${city.state}`}
                                  value={city.name}
                                  onSelect={(value) => {
                                    setFilters((prev) => ({
                                      ...prev,
                                      cities: [value],
                                    }));
                                  }}
                                  className=&quot;text-xs flex justify-between&quot;
                                >
                                  <span>{city.name}</span>
                                  <span className=&quot;text-xs text-muted-foreground&quot;>
                                    ({city.count})
                                  </span>
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* ZIP Code - small input */}
                  <div className=&quot;min-w-[100px] max-w-[130px]&quot;>
                    <div className=&quot;relative&quot;>
                      <div className=&quot;absolute inset-y-0 left-2 flex items-center pointer-events-none&quot;>
                        <MapPin className=&quot;h-3 w-3 text-muted-foreground&quot; />
                      </div>
                      <Input
                        type=&quot;text&quot;
                        placeholder=&quot;ZIP Code&quot;
                        value={filters.zipCodes[0] || &quot;&quot;}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          if (value) {
                            setFilters((prev) => ({
                              ...prev,
                              zipCodes: [value],
                            }));
                          } else {
                            setFilters((prev) => ({ ...prev, zipCodes: [] }));
                          }
                        }}
                        className=&quot;h-8 text-xs pl-7 pr-6&quot;
                      />
                      {filters.zipCodes.length > 0 && (
                        <Button
                          type=&quot;button&quot;
                          variant=&quot;ghost&quot;
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, zipCodes: [] }))
                          }
                          className=&quot;absolute inset-y-0 right-0 h-8 w-6 p-0&quot;
                        >
                          <X className=&quot;h-3 w-3&quot; />
                          <span className=&quot;sr-only&quot;>Clear</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Active filters */}
                {(filters.status.length > 0 ||
                  filters.locationType.length > 0 ||
                  filters.states.length > 0 ||
                  filters.cities.length > 0 ||
                  filters.zipCodes.length > 0) && (
                  <div className=&quot;mt-3 flex flex-wrap gap-2 items-center&quot;>
                    {filters.status.length > 0 && (
                      <Badge
                        variant=&quot;outline&quot;
                        className=&quot;text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10&quot;
                      >
                        Status: {filters.status[0]}
                        <Button
                          type=&quot;button&quot;
                          variant=&quot;ghost&quot;
                          size=&quot;icon&quot;
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: [] }))
                          }
                          className=&quot;h-4 w-4 ml-1 p-0&quot;
                        >
                          <X className=&quot;h-2.5 w-2.5&quot; />
                          <span className=&quot;sr-only&quot;>Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.locationType.length > 0 && (
                      <Badge
                        variant=&quot;outline&quot;
                        className=&quot;text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10&quot;
                      >
                        Type: {filters.locationType[0]}
                        <Button
                          type=&quot;button&quot;
                          variant=&quot;ghost&quot;
                          size=&quot;icon&quot;
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              locationType: [],
                            }))
                          }
                          className=&quot;h-4 w-4 ml-1 p-0&quot;
                        >
                          <X className=&quot;h-2.5 w-2.5&quot; />
                          <span className=&quot;sr-only&quot;>Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.states.length > 0 && (
                      <Badge
                        variant=&quot;outline&quot;
                        className=&quot;text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10&quot;
                      >
                        State: {filters.states[0]}
                        <Button
                          type=&quot;button&quot;
                          variant=&quot;ghost&quot;
                          size=&quot;icon&quot;
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, states: [] }))
                          }
                          className=&quot;h-4 w-4 ml-1 p-0&quot;
                        >
                          <X className=&quot;h-2.5 w-2.5&quot; />
                          <span className=&quot;sr-only&quot;>Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.cities.length > 0 && (
                      <Badge
                        variant=&quot;outline&quot;
                        className=&quot;text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10&quot;
                      >
                        City: {filters.cities[0]}
                        <Button
                          type=&quot;button&quot;
                          variant=&quot;ghost&quot;
                          size=&quot;icon&quot;
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, cities: [] }))
                          }
                          className=&quot;h-4 w-4 ml-1 p-0&quot;
                        >
                          <X className=&quot;h-2.5 w-2.5&quot; />
                          <span className=&quot;sr-only&quot;>Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.zipCodes.length > 0 && (
                      <Badge
                        variant=&quot;outline&quot;
                        className=&quot;text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10&quot;
                      >
                        ZIP: {filters.zipCodes[0]}
                        <Button
                          type=&quot;button&quot;
                          variant=&quot;ghost&quot;
                          size=&quot;icon&quot;
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, zipCodes: [] }))
                          }
                          className=&quot;h-4 w-4 ml-1 p-0&quot;
                        >
                          <X className=&quot;h-2.5 w-2.5&quot; />
                          <span className=&quot;sr-only&quot;>Clear</span>
                        </Button>
                      </Badge>
                    )}

                    <Button
                      type=&quot;button&quot;
                      variant=&quot;ghost&quot;
                      size=&quot;sm&quot;
                      onClick={clearAllFilters}
                      className=&quot;h-6 text-xs&quot;
                    >
                      Clear all
                      <X className=&quot;ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
