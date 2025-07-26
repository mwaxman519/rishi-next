"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePendingLocations, useApproveLocation } from "@/hooks/useLocations";
import { formatDistanceToNow } from "date-fns";

export function PendingLocationsList() {
  const { data, isLoading, error } = usePendingLocations();
  const locations = data?.pendingLocations || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-48 mb-1" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
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
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Error Loading Pending Locations
          </CardTitle>
          <CardDescription>
            An error occurred while fetching pending locations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
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
    <div className="space-y-4">
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

  const handleApproval = (status: "approved" | "rejected") => {
    approve({ status });
  };

  // Format the submitted date
  const submittedDate = location.createdAt
    ? formatDistanceToNow(new Date(location.createdAt), { addSuffix: true })
    : "Recently";

  return (
    <Card className="relative overflow-hidden">
      {/* Status indicator */}
      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              {location.name}
              <Badge variant="outline" className="ml-2">
                Pending
              </Badge>
            </CardTitle>
            <CardDescription className="flex items-center mt-1">
              <MapPin className="h-3 w-3 mr-1" />
              {location.address1}
              {location.address2 && `, ${location.address2}`}
              {location.city && `, ${location.city}`}
              {location.state && `, ${location.state}`}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {submittedDate}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {/* Additional location info */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center text-muted-foreground">
              <User className="h-3.5 w-3.5 mr-1.5" />
              Submitted by:{" "}
              <span className="font-medium ml-1">
                {location.requestedBy || "Unknown"}
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Type:{" "}
              <span className="font-medium ml-1">
                {location.type || "Venue"}
              </span>
            </div>
          </div>

          {/* Notes if available */}
          {location.notes && (
            <div className="text-sm border-l-2 border-muted pl-3 py-1 mt-2">
              <p className="text-muted-foreground">{location.notes}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex justify-between pt-2">
            <div className="space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => handleApproval("approved")}
                disabled={isApproving}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApproval("rejected")}
                disabled={isApproving}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>

            <Button variant="ghost" size="sm" asChild>
              <Link href={`/locations/${location.id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
