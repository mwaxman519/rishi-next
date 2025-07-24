"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
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
} from "@/components/ui/command";

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
    search: "",
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
  const { data: statesData, isLoading: statesLoading } = useQuery({
    queryKey: ["locationStates"],
    queryFn: async () => {
      const res = await fetch("/api/locations/states");
      if (!res.ok) {
        throw new Error("Failed to fetch states");
      }
      return res.json();
    },
  });

  // Fetch regions for filter
  const { data: regionsData, isLoading: regionsLoading } = useQuery({
    queryKey: ["locationRegions"],
    queryFn: async () => {
      const res = await fetch("/api/locations/regions");
      if (!res.ok) {
        throw new Error("Failed to fetch regions");
      }
      return res.json();
    },
  });

  // Fetch cities for filter based on selected states
  const { data: citiesData, isLoading: citiesLoading } = useQuery({
    queryKey: ["locationCities", filters.states],
    queryFn: async () => {
      const statesParam =
        filters.states.length > 0 ? `?states=${filters.states.join(",")}` : "";
      const res = await fetch(`/api/locations/cities${statesParam}`);
      if (!res.ok) {
        throw new Error("Failed to fetch cities");
      }
      return res.json();
    },
    enabled: true, // Always fetch, even without states
  });

  // Fetch ZIP codes for filter based on selected states and cities
  const { data: zipCodesData, isLoading: zipCodesLoading } = useQuery({
    queryKey: ["locationZipCodes", filters.states, filters.cities],
    queryFn: async () => {
      const statesParam =
        filters.states.length > 0 ? `states=${filters.states.join(",")}` : "";
      const citiesParam =
        filters.cities.length > 0 ? `cities=${filters.cities.join(",")}` : "";

      let url = "/api/locations/zipcodes";
      if (statesParam || citiesParam) {
        url += "?";
        if (statesParam) url += statesParam;
        if (statesParam && citiesParam) url += "&";
        if (citiesParam) url += citiesParam;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error("Failed to fetch ZIP codes");
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
      search: "",
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
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="space-y-4">
            {/* Text search */}
            <div className="flex items-center space-x-2">
              <div className="w-full max-w-md">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, address, etc."
                    value={filters.search}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center h-10"
              >
                <Filter className="h-4 w-4 mr-1.5" />
                {showFilters ? "Hide" : "Filters"}
                <ChevronDown
                  className={`h-4 w-4 ml-1 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Expanded filters */}
            {showFilters && (
              <div className="p-3 border rounded-md bg-card/50 dark:bg-card/50">
                {/* Primary filters - 1st row */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {/* Status filter */}
                  <div className="min-w-[140px] max-w-[180px]">
                    <Select
                      onValueChange={(value) => {
                        setFilters((prev) => {
                          if (!value || value === "_all") {
                            return { ...prev, status: [] };
                          }
                          return { ...prev, status: [value] };
                        });
                      }}
                      value={filters.status[0] || "_all"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <div className="flex items-center gap-1.5">
                          <CircleIcon className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {filters.status[0]
                              ? `Status: ${filters.status[0].charAt(0).toUpperCase() + filters.status[0].slice(1)}`
                              : "Status: All"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All Statuses</SelectItem>
                        <SelectItem value="active">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></div>
                            Active
                          </div>
                        </SelectItem>
                        <SelectItem value="pending">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5"></div>
                            Pending
                          </div>
                        </SelectItem>
                        <SelectItem value="inactive">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500 mr-1.5"></div>
                            Inactive
                          </div>
                        </SelectItem>
                        <SelectItem value="flagged">
                          <div className="flex items-center">
                            <div className="h-2 w-2 rounded-full bg-red-500 dark:bg-red-400 mr-1.5"></div>
                            Flagged
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Type filter */}
                  <div className="min-w-[140px] max-w-[180px]">
                    <Select
                      onValueChange={(value) => {
                        setFilters((prev) => {
                          if (!value || value === "_all") {
                            return { ...prev, locationType: [] };
                          }
                          return { ...prev, locationType: [value] };
                        });
                      }}
                      value={filters.locationType[0] || "_all"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {filters.locationType[0]
                              ? `Type: ${filters.locationType[0].charAt(0).toUpperCase() + filters.locationType[0].slice(1)}`
                              : "Type: All"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All Types</SelectItem>
                        <SelectItem value="office">Office</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="venue">Venue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* States filter */}
                  <div className="min-w-[140px] max-w-[180px]">
                    <Select
                      onValueChange={(value) => {
                        // Clear existing state selections and set new one
                        if (!value || value === "_all") {
                          setFilters((prev) => ({ ...prev, states: [] }));
                        } else {
                          // Set single state selection
                          setFilters((prev) => ({ ...prev, states: [value] }));
                        }
                      }}
                      value={filters.states[0] || "_all"}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <div className="flex items-center gap-1.5">
                          <MapIcon className="h-3 w-3 text-muted-foreground" />
                          <span>
                            {filters.states[0]
                              ? `State: ${filters.states[0]}`
                              : "State: All"}
                          </span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="_all">All States</SelectItem>
                        {statesData?.states?.map((state: StateItem) => (
                          <SelectItem key={state.code} value={state.code}>
                            <div className="flex items-center justify-between w-full">
                              <span>{state.name}</span>
                              <span className="text-xs ml-2 text-muted-foreground">
                                ({state.count})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City typeahead - small compact popover */}
                  <div className="min-w-[110px] max-w-[140px]">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-8 px-2.5 w-full justify-between text-xs font-normal truncate"
                          size="sm"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <Building className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            <span className="truncate">
                              {filters.cities.length > 0
                                ? `City: ${filters.cities[0]}`
                                : "City: All"}
                            </span>
                          </div>
                          <ChevronDown className="h-3.5 w-3.5 opacity-50 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[240px] p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search city..."
                            className="h-8 text-xs"
                          />
                          <CommandEmpty>No city found.</CommandEmpty>
                          <CommandGroup className="max-h-[200px] overflow-auto">
                            <CommandItem
                              value="_all"
                              onSelect={() => {
                                setFilters((prev) => ({ ...prev, cities: [] }));
                              }}
                              className="text-xs"
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
                                  className="text-xs flex justify-between"
                                >
                                  <span>{city.name}</span>
                                  <span className="text-xs text-muted-foreground">
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
                  <div className="min-w-[100px] max-w-[130px]">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <Input
                        type="text"
                        placeholder="ZIP Code"
                        value={filters.zipCodes[0] || ""}
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
                        className="h-8 text-xs pl-7 pr-6"
                      />
                      {filters.zipCodes.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, zipCodes: [] }))
                          }
                          className="absolute inset-y-0 right-0 h-8 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Clear</span>
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
                  <div className="mt-3 flex flex-wrap gap-2 items-center">
                    {filters.status.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10"
                      >
                        Status: {filters.status[0]}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, status: [] }))
                          }
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-2.5 w-2.5" />
                          <span className="sr-only">Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.locationType.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10"
                      >
                        Type: {filters.locationType[0]}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setFilters((prev) => ({
                              ...prev,
                              locationType: [],
                            }))
                          }
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-2.5 w-2.5" />
                          <span className="sr-only">Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.states.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10"
                      >
                        State: {filters.states[0]}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, states: [] }))
                          }
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-2.5 w-2.5" />
                          <span className="sr-only">Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.cities.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10"
                      >
                        City: {filters.cities[0]}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, cities: [] }))
                          }
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-2.5 w-2.5" />
                          <span className="sr-only">Clear</span>
                        </Button>
                      </Badge>
                    )}

                    {filters.zipCodes.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-xs px-2 py-0 h-6 bg-opacity-20 dark:bg-opacity-20 bg-primary/10 dark:bg-primary/10"
                      >
                        ZIP: {filters.zipCodes[0]}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, zipCodes: [] }))
                          }
                          className="h-4 w-4 ml-1 p-0"
                        >
                          <X className="h-2.5 w-2.5" />
                          <span className="sr-only">Clear</span>
                        </Button>
                      </Badge>
                    )}

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="h-6 text-xs"
                    >
                      Clear all
                      <X className="ml-1 h-3 w-3" />
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
