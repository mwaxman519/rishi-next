&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { Search } from &quot;lucide-react&quot;;
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from &quot;@/components/ui/command&quot;;
import { MapPin } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card } from &quot;@/components/ui/card&quot;;
import { ScrollArea } from &quot;@/components/ui/scroll-area&quot;;

// Location data will be fetched from database via API

interface LocationSelectorProps {
  selectedLocationId: string;
  onLocationChange: (locationId: string) => void;
}

export default function LocationSelector({
  selectedLocationId,
  onLocationChange,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [locations, setLocations] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch locations from database
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/locations');
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
    <div className=&quot;space-y-4&quot;>
      {/* Show selected location */}
      {selectedLocation && (
        <Card className=&quot;p-4 bg-muted/50&quot;>
          <div className=&quot;flex items-start gap-3&quot;>
            <MapPin className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
            <div>
              <div className=&quot;font-medium&quot;>{selectedLocation.name}</div>
              <div className=&quot;text-sm text-muted-foreground&quot;>
                {selectedLocation.address}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Location search and selection */}
      <Command className=&quot;rounded-lg border shadow-md&quot;>
        <div className=&quot;flex items-center border-b px-3&quot;>
          <Search className=&quot;mr-2 h-4 w-4 shrink-0 opacity-50&quot; />
          <CommandInput
            placeholder=&quot;Search locations...&quot;
            value={searchQuery}
            onValueChange={handleSearch}
            className=&quot;flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50&quot;
          />
        </div>
        <ScrollArea className=&quot;h-[300px]&quot;>
          <CommandList>
            <CommandEmpty>No locations found</CommandEmpty>
            <CommandGroup heading=&quot;Locations&quot;>
              {locations.map((location) => (
                <CommandItem
                  key={location.id}
                  onSelect={() => {
                    setSelectedLocation(location);
                    onLocationChange(location.id);
                  }}
                  className=&quot;cursor-pointer&quot;
                >
                  <div className=&quot;flex items-start gap-3 py-1&quot;>
                    <MapPin className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                    <div>
                      <div className=&quot;font-medium&quot;>{location.name}</div>
                      <div className=&quot;text-xs text-muted-foreground">
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
