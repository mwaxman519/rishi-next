&quot;use client&quot;;

import React from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Loader2,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { usePendingLocations, useApproveLocation } from &quot;@/hooks/useLocations&quot;;
import { formatDistanceToNow } from &quot;date-fns&quot;;

export function PendingLocationsList() {
  const { data, isLoading, error } = usePendingLocations();
  const locations = data?.pendingLocations || [];

  if (isLoading) {
    return (
      <div className=&quot;space-y-4&quot;>
        {[1, 2, 3].map((i) => (
          <Card key={i} className=&quot;relative overflow-hidden&quot;>
            <CardHeader className=&quot;pb-2&quot;>
              <Skeleton className=&quot;h-6 w-48 mb-1&quot; />
              <Skeleton className=&quot;h-4 w-72&quot; />
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-2&quot;>
                <Skeleton className=&quot;h-4 w-full&quot; />
                <Skeleton className=&quot;h-4 w-5/6&quot; />
                <div className=&quot;flex gap-2 pt-2&quot;>
                  <Skeleton className=&quot;h-9 w-20&quot; />
                  <Skeleton className=&quot;h-9 w-20&quot; />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className=&quot;border-destructive&quot;>
        <CardHeader>
          <CardTitle className=&quot;text-destructive&quot;>
            Error Loading Pending Locations
          </CardTitle>
          <CardDescription>
            An error occurred while fetching pending locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className=&quot;text-sm text-muted-foreground&quot;>
            {error instanceof Error ? error.message : &quot;Unknown error&quot;}
          </p>
          <Button
            variant=&quot;outline&quot;
            size=&quot;sm&quot;
            className=&quot;mt-4&quot;
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Pending Locations</CardTitle>
          <CardDescription>
            There are no locations awaiting approval at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className=&quot;space-y-4&quot;>
      {locations.map((location) => (
        <PendingLocationCard key={location.id} location={location} />
      ))}
    </div>
  );
}

interface PendingLocationCardProps {
  location: any;
}

function PendingLocationCard({ location }: PendingLocationCardProps) {
  const { mutate: approve, isPending: isApproving } = useApproveLocation(
    location.id,
  );

  const handleApproval = (status: &quot;approved&quot; | &quot;rejected&quot;) => {
    approve({ status });
  };

  // Format the submitted date
  const submittedDate = location.createdAt
    ? formatDistanceToNow(new Date(location.createdAt), { addSuffix: true })
    : &quot;Recently&quot;;

  return (
    <Card className=&quot;relative overflow-hidden&quot;>
      {/* Status indicator */}
      <div className=&quot;absolute top-0 left-0 w-1 h-full bg-amber-500&quot; />

      <CardHeader className=&quot;pb-2&quot;>
        <div className=&quot;flex justify-between items-start&quot;>
          <div>
            <CardTitle className=&quot;flex items-center&quot;>
              {location.name}
              <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
                Pending
              </Badge>
            </CardTitle>
            <CardDescription className=&quot;flex items-center mt-1&quot;>
              <MapPin className=&quot;h-3 w-3 mr-1&quot; />
              {location.address1}
              {location.address2 && `, ${location.address2}`}
              {location.city && `, ${location.city}`}
              {location.state && `, ${location.state}`}
            </CardDescription>
          </div>
          <Badge variant=&quot;secondary&quot; className=&quot;flex items-center&quot;>
            <Clock className=&quot;mr-1 h-3 w-3&quot; />
            {submittedDate}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className=&quot;space-y-3&quot;>
          {/* Additional location info */}
          <div className=&quot;grid grid-cols-2 gap-x-4 gap-y-2 text-sm&quot;>
            <div className=&quot;flex items-center text-muted-foreground&quot;>
              <User className=&quot;h-3.5 w-3.5 mr-1.5&quot; />
              Submitted by:{&quot; &quot;}
              <span className=&quot;font-medium ml-1&quot;>
                {location.requestedBy || &quot;Unknown&quot;}
              </span>
            </div>
            <div className=&quot;flex items-center text-muted-foreground&quot;>
              <Calendar className=&quot;h-3.5 w-3.5 mr-1.5&quot; />
              Type:{&quot; &quot;}
              <span className=&quot;font-medium ml-1&quot;>
                {location.type || &quot;Venue&quot;}
              </span>
            </div>
          </div>

          {/* Notes if available */}
          {location.notes && (
            <div className=&quot;text-sm border-l-2 border-muted pl-3 py-1 mt-2&quot;>
              <p className=&quot;text-muted-foreground&quot;>{location.notes}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className=&quot;flex justify-between pt-2&quot;>
            <div className=&quot;space-x-2&quot;>
              <Button
                variant=&quot;default&quot;
                size=&quot;sm&quot;
                onClick={() => handleApproval(&quot;approved&quot;)}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className=&quot;mr-2 h-4 w-4&quot; />
                    Approve
                  </>
                )}
              </Button>
              <Button
                variant=&quot;outline&quot;
                size=&quot;sm&quot;
                onClick={() => handleApproval(&quot;rejected&quot;)}
                disabled={isApproving}
              >
                <XCircle className=&quot;mr-2 h-4 w-4&quot; />
                Reject
              </Button>
            </div>

            <Button variant=&quot;ghost&quot; size=&quot;sm&quot; asChild>
              <Link href={`/locations/${location.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
