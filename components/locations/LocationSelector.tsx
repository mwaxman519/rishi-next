"use client";

import * as React from "react";
import { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { NewLocationRequestDialog } from "./NewLocationRequestDialog";

// Importing the location types from the booking form
// In a real implementation, these would be imported from a shared schema
enum LocationType {
  VENUE = "VENUE",
  OFFICE = "OFFICE",
  STORAGE = "STORAGE",
  OTHER = "OTHER",
}

enum LocationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
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
    id: "loc-1",
    name: "Downtown Office",
    address1: "123 Main St",
    city: "San Francisco",
    stateId: "CA",
    zipcode: "94105",
    status: LocationStatus.APPROVED,
    type: LocationType.OFFICE,
  },
  {
    id: "loc-2",
    name: "Westside Venue",
    address1: "456 Market St",
    address2: "Suite 300",
    city: "San Francisco",
    stateId: "CA",
    zipcode: "94103",
    status: LocationStatus.APPROVED,
    type: LocationType.VENUE,
  },
  {
    id: "loc-3",
    name: "North Beach Storage",
    address1: "789 Beach Ave",
    city: "San Francisco",
    stateId: "CA",
    zipcode: "94111",
    status: LocationStatus.PENDING,
    type: LocationType.STORAGE,
  },
  {
    id: "loc-4",
    name: "Rejected Location",
    address1: "999 Problem St",
    city: "San Francisco",
    stateId: "CA",
    zipcode: "94110",
    status: LocationStatus.REJECTED,
    type: LocationType.OTHER,
    rejectionReason: "Building is no longer available for events",
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
  const [searchQuery, setSearchQuery] = useState("");
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
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
          onClick={() => setIsDialogOpen(true)}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {selectedLocation
            ? `${selectedLocation.name}, ${selectedLocation.city}`
            : "Select a location"}
        </Button>
      </div>

      {/* Location Selection Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-background dark:bg-gray-900 border dark:border-gray-800">
          <DialogHeader>
            <DialogTitle>Select a Location</DialogTitle>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="mt-4 space-y-2">
            {filteredLocations.length > 0 ? (
              filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors
                    ${value === location.id ? "border-primary bg-primary/5" : "border-border"}
                    ${location.status === LocationStatus.PENDING ? "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20" : ""}
                    ${location.status === LocationStatus.REJECTED ? "border-red-500/50 bg-red-50 dark:bg-red-950/20" : ""}
                  `}
                  onClick={() => {
                    onChange(location.id, location);
                    setIsDialogOpen(false);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{location.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {location.address1}
                        {location.address2 && `, ${location.address2}`}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {location.city}, {location.stateId} {location.zipcode}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`text-xs px-2 py-1 rounded-full
                        ${location.status === LocationStatus.APPROVED ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                        ${location.status === LocationStatus.PENDING ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" : ""}
                        ${location.status === LocationStatus.REJECTED ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : ""}
                      `}
                      >
                        {location.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No locations found</p>
                {onCreateLocation && (
                  <Button
                    variant="outline"
                    className="mt-2"
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

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {onCreateLocation && (
              <Button
                variant="outline"
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
              console.error("Failed to create location:", error);
              return false;
            }
          }}
        />
      )}
    </div>
  );
}

// The standalone NewLocationRequestDialog component is now being imported above
