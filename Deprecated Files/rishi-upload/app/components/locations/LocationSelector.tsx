"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock location data
const mockLocations = [
  {
    id: "1",
    name: "Westfield Mall",
    address: "865 Market St, San Francisco, CA 94103",
    coordinates: { lat: 37.7841, lng: -122.4077 },
  },
  {
    id: "2",
    name: "Union Square",
    address: "333 Post St, San Francisco, CA 94108",
    coordinates: { lat: 37.7879, lng: -122.4075 },
  },
  {
    id: "3",
    name: "Embarcadero Center",
    address: "4 Embarcadero Center, San Francisco, CA 94111",
    coordinates: { lat: 37.7952, lng: -122.3996 },
  },
  {
    id: "4",
    name: "Stonestown Galleria",
    address: "3251 20th Ave, San Francisco, CA 94132",
    coordinates: { lat: 37.7285, lng: -122.4778 },
  },
  {
    id: "5",
    name: "Fisherman's Wharf",
    address: "Beach Street & The Embarcadero, San Francisco, CA 94133",
    coordinates: { lat: 37.8087, lng: -122.4098 },
  },
];

interface LocationSelectorProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
}

export default function LocationSelector({
  selectedLocationId,
  onLocationChange,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState(mockLocations);
  const [selectedLocation, setSelectedLocation] = useState<
    (typeof mockLocations)[0] | null
  >(null);

  // Find the initially selected location
  useEffect(() => {
    if (selectedLocationId) {
      const location = locations.find((loc) => loc.id === selectedLocationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [selectedLocationId, locations]);

  // In a real app, this would fetch locations from API based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Filter locations based on search query
    if (query) {
      const filteredLocations = mockLocations.filter(
        (location) =>
          location.name.toLowerCase().includes(query.toLowerCase()) ||
          location.address.toLowerCase().includes(query.toLowerCase()),
      );
      setLocations(filteredLocations);
    } else {
      setLocations(mockLocations);
    }
  };

  return (
    <div className="space-y-4">
      {/* Show selected location */}
      {selectedLocation && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">{selectedLocation.name}</div>
              <div className="text-sm text-muted-foreground">
                {selectedLocation.address}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Location search and selection */}
      <Command className="rounded-lg border shadow-md">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder="Search locations..."
            value={searchQuery}
            onValueChange={handleSearch}
            className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <ScrollArea className="h-[300px]">
          <CommandList>
            <CommandEmpty>No locations found</CommandEmpty>
            <CommandGroup heading="Locations">
              {locations.map((location) => (
                <CommandItem
                  key={location.id}
                  onSelect={() => {
                    setSelectedLocation(location);
                    onLocationChange(location.id);
                  }}
                  className="cursor-pointer"
                >
                  <div className="flex items-start gap-3 py-1">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{location.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {location.address}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </ScrollArea>
      </Command>
    </div>
  );
}
