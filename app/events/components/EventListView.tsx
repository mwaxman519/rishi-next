"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  MapPin,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  UserPlus,
  CheckCircle,
  X,
  Calendar,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface EventListViewProps {
  organizationId: string | undefined;
}

export default function EventListView({ organizationId }: EventListViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Fetch events from API
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events", organizationId],
    queryFn: async () => {
      const url = organizationId
        ? `/api/events?organizationId=${organizationId}`
        : "/api/events";

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch events");
      }

      return await response.json();
    },
  });

  // Filter events based on search term
  const filteredEvents = searchTerm
    ? events.filter(
        (event: any) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          event.status?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : events;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPp");
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default";
      case "in_progress":
        return "secondary";
      case "completed":
        return "success";
      case "canceled":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel event");
      }

      toast({
        title: "Event Cancelled",
        description: "The event has been successfully cancelled.",
      });

      // Refetch events
      // In a real implementation, you would use queryClient.invalidateQueries(['events'])
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[400px]" />;
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4">
        <p className="text-destructive">
          Error loading events: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search events..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                      {event.location?.name || "No location specified"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {formatDate(event.startDateTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getBadgeVariant(event.status)}>
                      {formatStatus(event.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.staffCount > 0
                      ? `${event.staffCount} assigned`
                      : "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/events/${event.id}`}>
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        {event.status !== "canceled" &&
                          event.status !== "completed" && (
                            <>
                              <Link href={`/events/${event.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Event
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/events/${event.id}/staff`}>
                                <DropdownMenuItem>
                                  <UserPlus className="h-4 w-4 mr-2" />
                                  Assign Staff
                                </DropdownMenuItem>
                              </Link>
                              {event.status === "scheduled" && (
                                <DropdownMenuItem
                                  onSelect={() => {
                                    // In a real implementation, update the event status to in_progress
                                    toast({
                                      title: "Not Implemented",
                                      description:
                                        "This feature is not implemented yet.",
                                    });
                                  }}
                                >
                                  <Clock className="h-4 w-4 mr-2" />
                                  Start Event
                                </DropdownMenuItem>
                              )}
                              {event.status === "in_progress" && (
                                <DropdownMenuItem
                                  onSelect={() => {
                                    // In a real implementation, update the event status to completed
                                    toast({
                                      title: "Not Implemented",
                                      description:
                                        "This feature is not implemented yet.",
                                    });
                                  }}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Complete Event
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onSelect={() => handleCancelEvent(event.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Cancel Event
                              </DropdownMenuItem>
                            </>
                          )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-4 text-muted-foreground"
                >
                  No events found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
