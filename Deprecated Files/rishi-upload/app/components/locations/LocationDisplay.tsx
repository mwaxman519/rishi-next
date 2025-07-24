"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LocationData } from "./LocationSelector";
import { useGoogleMaps } from "@/contexts/GoogleMapsContext";

interface LocationDisplayProps {
  location: LocationData;
  showMap?: boolean;
  statusBadge?: string;
  actions?: React.ReactNode;
  title?: string;
  onEdit?: () => void;
}

export default function LocationDisplay({
  location,
  showMap = true,
  statusBadge,
  actions,
  title,
  onEdit,
}: LocationDisplayProps) {
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { isLoaded, isError, errorMessage } = useGoogleMaps();

  useEffect(() => {
    // Initialize map when Google Maps is loaded
    if (
      isLoaded &&
      !mapInitialized &&
      showMap &&
      location.latitude &&
      location.longitude
    ) {
      try {
        // Initialize the map
        const mapElement = document.getElementById("location-map");
        if (mapElement) {
          const map = new google.maps.Map(mapElement, {
            center: { lat: location.latitude, lng: location.longitude },
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });

          // Add a marker
          new google.maps.Marker({
            position: { lat: location.latitude, lng: location.longitude },
            map,
            title: location.name || location.address1,
          });

          setMapInitialized(true);
        }
      } catch (err) {
        console.error("Error initializing map:", err);
        setMapError(
          `Error initializing map: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }, [isLoaded, location, showMap, mapInitialized]);

  // Set error from context if available
  useEffect(() => {
    if (isError && errorMessage) {
      setMapError(errorMessage);
    }
  }, [isError, errorMessage]);

  const formattedAddress = () => {
    let address = location.address1;
    if (location.address2) address += `, ${location.address2}`;
    return `${address}, ${location.city}, ${location.state} ${location.zipcode}`;
  };

  return (
    <Card className="w-full dark:bg-gray-800 dark:text-gray-100">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{title || location.name || "Location Details"}</CardTitle>
          <CardDescription className="dark:text-gray-300">
            {formattedAddress()}
          </CardDescription>
        </div>

        {statusBadge && (
          <Badge
            variant={
              statusBadge === "Approved"
                ? "success"
                : statusBadge === "Pending"
                  ? "warning"
                  : statusBadge === "Rejected"
                    ? "destructive"
                    : "outline"
            }
          >
            {statusBadge}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {showMap && (
          <div className="w-full rounded-md overflow-hidden h-[200px] relative dark:bg-gray-700">
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                <p>{mapError}</p>
              </div>
            )}

            {!mapInitialized && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                <Skeleton className="h-full w-full dark:bg-gray-600" />
              </div>
            )}

            <div
              id="location-map"
              className="w-full h-full"
              style={{
                display: !mapInitialized || mapError ? "none" : "block",
              }}
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Address</p>
            <p>{location.address1}</p>
            {location.address2 && <p>{location.address2}</p>}
          </div>

          <div>
            <p className="text-gray-500 dark:text-gray-400">City, State, ZIP</p>
            <p>
              {location.city}, {location.state} {location.zipcode}
            </p>
          </div>

          {location.latitude && location.longitude && (
            <div className="col-span-2">
              <p className="text-gray-500 dark:text-gray-400">Coordinates</p>
              <p>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
        )}

        {actions}
      </CardFooter>
    </Card>
  );
}
