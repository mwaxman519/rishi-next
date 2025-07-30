&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { useState } from &quot;react&quot;;
import { Search, MapPin } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from &quot;@/components/ui/dialog&quot;;
import { NewLocationRequestDialog } from &quot;./NewLocationRequestDialog&quot;;

// Importing the location types from the booking form
// In a real implementation, these would be imported from a shared schema
enum LocationType {
  VENUE = &quot;VENUE&quot;,
  OFFICE = &quot;OFFICE&quot;,
  STORAGE = &quot;STORAGE&quot;,
  OTHER = &quot;OTHER&quot;,
}

enum LocationStatus {
  PENDING = &quot;PENDING&quot;,
  APPROVED = &quot;APPROVED&quot;,
  REJECTED = &quot;REJECTED&quot;,
}

interface LocationDTO {
  id: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  stateId: string;
  zipcode: string;
  status: LocationStatus;
  type: string | LocationType;
  notes?: string;
  rejectionReason?: string;
}

// Mock data for demonstration
const mockLocations: LocationDTO[] = [
  {
    id: &quot;loc-1&quot;,
    name: &quot;Downtown Office&quot;,
    address1: &quot;123 Main St&quot;,
    city: &quot;San Francisco&quot;,
    stateId: &quot;CA&quot;,
    zipcode: &quot;94105&quot;,
    status: LocationStatus.APPROVED,
    type: LocationType.OFFICE,
  },
  {
    id: &quot;loc-2&quot;,
    name: &quot;Westside Venue&quot;,
    address1: &quot;456 Market St&quot;,
    address2: &quot;Suite 300&quot;,
    city: &quot;San Francisco&quot;,
    stateId: &quot;CA&quot;,
    zipcode: &quot;94103&quot;,
    status: LocationStatus.APPROVED,
    type: LocationType.VENUE,
  },
  {
    id: &quot;loc-3&quot;,
    name: &quot;North Beach Storage&quot;,
    address1: &quot;789 Beach Ave&quot;,
    city: &quot;San Francisco&quot;,
    stateId: &quot;CA&quot;,
    zipcode: &quot;94111&quot;,
    status: LocationStatus.PENDING,
    type: LocationType.STORAGE,
  },
  {
    id: &quot;loc-4&quot;,
    name: &quot;Rejected Location&quot;,
    address1: &quot;999 Problem St&quot;,
    city: &quot;San Francisco&quot;,
    stateId: &quot;CA&quot;,
    zipcode: &quot;94110&quot;,
    status: LocationStatus.REJECTED,
    type: LocationType.OTHER,
    rejectionReason: &quot;Building is no longer available for events&quot;,
  },
];

interface LocationSelectorProps {
  value?: string;
  onChange: (locationId: string, location?: LocationDTO) => void;
  onCreateLocation?: (data: {
    name: string;
    type: LocationType;
    address1: string;
    address2?: string;
    city: string;
    stateId: string;
    zipcode: string;
    notes?: string;
  }) => Promise<LocationDTO>;
}

export function LocationSelector({
  value,
  onChange,
  onCreateLocation,
}: LocationSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNewLocationDialogOpen, setIsNewLocationDialogOpen] = useState(false);

  // Filter locations based on search query
  const filteredLocations = mockLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Find the currently selected location
  const selectedLocation = mockLocations.find((loc) => loc.id === value);

  return (
    <div className=&quot;space-y-2&quot;>
      <div className=&quot;flex items-center gap-2&quot;>
        <Button
          variant=&quot;outline&quot;
          className=&quot;w-full justify-start text-left font-normal&quot;
          onClick={() => setIsDialogOpen(true)}
        >
          <MapPin className=&quot;mr-2 h-4 w-4&quot; />
          {selectedLocation
            ? `${selectedLocation.name}, ${selectedLocation.city}`
            : &quot;Select a location&quot;}
        </Button>
      </div>

      {/* Location Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className=&quot;sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background dark:bg-gray-900 border dark:border-gray-800&quot;>
          <DialogHeader>
            <DialogTitle>Select a Location</DialogTitle>
          </DialogHeader>

          <div className=&quot;relative&quot;>
            <Search className=&quot;absolute left-2 top-2.5 h-4 w-4 text-muted-foreground&quot; />
            <Input
              placeholder=&quot;Search locations...&quot;
              className=&quot;pl-8&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className=&quot;mt-4 space-y-2&quot;>
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors
                    ${value === location.id ? &quot;border-primary bg-primary/5&quot; : &quot;border-border&quot;}
                    ${location.status === LocationStatus.PENDING ? &quot;border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20&quot; : &quot;&quot;}
                    ${location.status === LocationStatus.REJECTED ? &quot;border-red-500/50 bg-red-50 dark:bg-red-950/20&quot; : &quot;&quot;}
                  `}
                  onClick={() => {
                    onChange(location.id, location);
                    setIsDialogOpen(false);
                  }}
                >
                  <div className=&quot;flex justify-between items-start&quot;>
                    <div>
                      <h4 className=&quot;font-medium&quot;>{location.name}</h4>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {location.address1}
                        {location.address2 && `, ${location.address2}`}
                      </p>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {location.city}, {location.stateId} {location.zipcode}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full
                        ${location.status === LocationStatus.APPROVED ? &quot;bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400&quot; : &quot;&quot;}
                        ${location.status === LocationStatus.PENDING ? &quot;bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400&quot; : &quot;&quot;}
                        ${location.status === LocationStatus.REJECTED ? &quot;bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400&quot; : &quot;&quot;}
                      `}
                      >
                        {location.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className=&quot;text-center py-4&quot;>
                <p className=&quot;text-muted-foreground&quot;>No locations found</p>
                {onCreateLocation && (
                  <Button
                    variant=&quot;outline&quot;
                    className=&quot;mt-2&quot;
                    onClick={() => {
                      setIsDialogOpen(false);
                      setIsNewLocationDialogOpen(true);
                    }}
                  >
                    Request a new location
                  </Button>
                )}
              </div>
            )}
          </div>

          <DialogFooter className=&quot;flex-col sm:flex-row gap-2&quot;>
            {onCreateLocation && (
              <Button
                variant=&quot;outline&quot;
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsNewLocationDialogOpen(true);
                }}
              >
                Request a new location
              </Button>
            )}
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Location Request Dialog */}
      {onCreateLocation && (
        <NewLocationRequestDialog
          open={isNewLocationDialogOpen}
          onOpenChange={setIsNewLocationDialogOpen}
          onSubmit={async (data) => {
            try {
              const newLocation = await onCreateLocation(data);
              onChange(newLocation.id, newLocation);
              setIsNewLocationDialogOpen(false);
              return true;
            } catch (error) {
              console.error(&quot;Failed to create location:", error);
              return false;
            }
          }}
        />
      )}
    </div>
  );
}

// The standalone NewLocationRequestDialog component is now being imported above
