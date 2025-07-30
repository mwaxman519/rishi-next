&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { LocationData } from &quot;./LocationSelector&quot;;
import { useGoogleMaps } from &quot;@/contexts/GoogleMapsContext&quot;;

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
  const { isLoaded, loadError } = useGoogleMaps();

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
        const mapElement = document.getElementById(&quot;location-map&quot;);
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
        console.error(&quot;Error initializing map:&quot;, err);
        setMapError(
          `Error initializing map: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
  }, [isLoaded, location, showMap, mapInitialized]);

  // Set error from context if available
  useEffect(() => {
    if (loadError) {
      setMapError(loadError.message);
    }
  }, [loadError]);

  const formattedAddress = () => {
    let address = location.address1;
    if (location.address2) address += `, ${location.address2}`;
    return `${address}, ${location.city}, ${location.state} ${location.zipcode}`;
  };

  return (
    <Card className=&quot;w-full dark:bg-gray-800 dark:text-gray-100&quot;>
      <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
        <div>
          <CardTitle>{title || location.name || &quot;Location Details&quot;}</CardTitle>
          <CardDescription className=&quot;dark:text-gray-300&quot;>
            {formattedAddress()}
          </CardDescription>
        </div>

        {statusBadge && (
          <Badge
            variant={
              statusBadge === &quot;Approved&quot;
                ? &quot;success&quot;
                : statusBadge === &quot;Pending&quot;
                  ? &quot;warning&quot;
                  : statusBadge === &quot;Rejected&quot;
                    ? &quot;destructive&quot;
                    : &quot;outline&quot;
            }
          >
            {statusBadge}
          </Badge>
        )}
      </CardHeader>

      <CardContent className=&quot;space-y-4&quot;>
        {showMap && (
          <div className=&quot;w-full rounded-md overflow-hidden h-[200px] relative dark:bg-gray-700&quot;>
            {mapError && (
              <div className=&quot;absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300&quot;>
                <p>{mapError}</p>
              </div>
            )}

            {!mapInitialized && !mapError && (
              <div className=&quot;absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700&quot;>
                <Skeleton className=&quot;h-full w-full dark:bg-gray-600&quot; />
              </div>
            )}

            <div
              id=&quot;location-map&quot;
              className=&quot;w-full h-full&quot;
              style={{
                display: !mapInitialized || mapError ? &quot;none&quot; : &quot;block&quot;,
              }}
            />
          </div>
        )}

        <div className=&quot;grid grid-cols-2 gap-2 text-sm&quot;>
          <div>
            <p className=&quot;text-gray-500 dark:text-gray-400&quot;>Address</p>
            <p>{location.address1}</p>
            {location.address2 && <p>{location.address2}</p>}
          </div>

          <div>
            <p className=&quot;text-gray-500 dark:text-gray-400&quot;>City, State, ZIP</p>
            <p>
              {location.city}, {location.state} {location.zipcode}
            </p>
          </div>

          {location.latitude && location.longitude && (
            <div className=&quot;col-span-2&quot;>
              <p className=&quot;text-gray-500 dark:text-gray-400&quot;>Coordinates</p>
              <p>
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className=&quot;flex justify-end space-x-2&quot;>
        {onEdit && (
          <Button variant=&quot;outline&quot; onClick={onEdit}>
            Edit
          </Button>
        )}

        {actions}
      </CardFooter>
    </Card>
  );
}
