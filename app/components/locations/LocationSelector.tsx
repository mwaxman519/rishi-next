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
import { apiFetch } from "@/lib/api";

// Location data will be fetched from database via API

interface LocationSelectorProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
}

export default function LocationSelector({
  selectedLocationId,
  onLocationChange,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await apiFetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        setLocations([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Find the initially selected location
  useEffect(() => {
    if (selectedLocationId && locations.length > 0) {
      const location = locations.find((loc) => loc.id === selectedLocationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [selectedLocationId, locations]);

  // Real API search implementation
  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    try {
      // Fetch locations from API with search query
      const response = await fetch(`/api/locations?search=${encodeURIComponent(query)}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setLocations(data.data || []);
      }
    } catch (error) {
      console.error('Error searching locations:', error);
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
