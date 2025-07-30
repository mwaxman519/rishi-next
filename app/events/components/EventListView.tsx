&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
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
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { format } from &quot;date-fns&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;

interface EventListViewProps {
  organizationId: string | undefined;
}

export default function EventListView({ organizationId }: EventListViewProps) {
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const { toast } = useToast();

  // Fetch events from API
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [&quot;events&quot;, organizationId],
    queryFn: async () => {
      const url = organizationId
        ? `/api/events?organizationId=${organizationId}`
        : &quot;/api/events&quot;;

      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to fetch events&quot;);
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
    return format(date, &quot;PPp&quot;);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split(&quot;_&quot;)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(&quot; &quot;);
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case &quot;scheduled&quot;:
        return &quot;default&quot;;
      case &quot;in_progress&quot;:
        return &quot;secondary&quot;;
      case &quot;completed&quot;:
        return &quot;success&quot;;
      case &quot;canceled&quot;:
        return &quot;destructive&quot;;
      default:
        return &quot;outline&quot;;
    }
  };

  // Handle cancel event
  const handleCancelEvent = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: &quot;DELETE&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to cancel event&quot;);
      }

      toast({
        title: &quot;Event Cancelled&quot;,
        description: &quot;The event has been successfully cancelled.&quot;,
      });

      // Refetch events
      // In a real implementation, you would use queryClient.invalidateQueries(['events'])
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description: (error as Error).message,
        variant: &quot;destructive&quot;,
      });
    }
  };

  if (isLoading) {
    return <Skeleton className=&quot;w-full h-[400px]&quot; />;
  }

  if (error) {
    return (
      <div className=&quot;rounded-md bg-destructive/15 p-4&quot;>
        <p className=&quot;text-destructive&quot;>
          Error loading events: {(error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className=&quot;flex items-center justify-between mb-4&quot;>
        <div className=&quot;relative w-72&quot;>
          <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
          <Input
            type=&quot;search&quot;
            placeholder=&quot;Search events...&quot;
            className=&quot;pl-8&quot;
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className=&quot;rounded-md border&quot;>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead className=&quot;w-[80px]&quot;>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event: any) => (
                <TableRow key={event.id}>
                  <TableCell className=&quot;font-medium&quot;>{event.title}</TableCell>
                  <TableCell>
                    <div className=&quot;flex items-center&quot;>
                      <MapPin className=&quot;h-4 w-4 mr-1 text-muted-foreground&quot; />
                      {event.location?.name || &quot;No location specified&quot;}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className=&quot;flex items-center&quot;>
                      <Calendar className=&quot;h-4 w-4 mr-1 text-muted-foreground&quot; />
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
                      : &quot;Unassigned&quot;}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant=&quot;ghost&quot; className=&quot;h-8 w-8 p-0&quot;>
                          <span className=&quot;sr-only&quot;>Open menu</span>
                          <MoreHorizontal className=&quot;h-4 w-4&quot; />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align=&quot;end&quot;>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <Link href={`/events/${event.id}`}>
                          <DropdownMenuItem>
                            <Eye className=&quot;h-4 w-4 mr-2&quot; />
                            View Details
                          </DropdownMenuItem>
                        </Link>
                        {event.status !== &quot;canceled&quot; &&
                          event.status !== &quot;completed&quot; && (
                            <>
                              <Link href={`/events/${event.id}/edit`}>
                                <DropdownMenuItem>
                                  <Edit className=&quot;h-4 w-4 mr-2&quot; />
                                  Edit Event
                                </DropdownMenuItem>
                              </Link>
                              <Link href={`/events/${event.id}/staff`}>
                                <DropdownMenuItem>
                                  <UserPlus className=&quot;h-4 w-4 mr-2&quot; />
                                  Assign Staff
                                </DropdownMenuItem>
                              </Link>
                              {event.status === &quot;scheduled&quot; && (
                                <DropdownMenuItem
                                  onSelect={() => {
                                    // In a real implementation, update the event status to in_progress
                                    toast({
                                      title: &quot;Not Implemented&quot;,
                                      description:
                                        &quot;This feature is not implemented yet.&quot;,
                                    });
                                  }}
                                >
                                  <Clock className=&quot;h-4 w-4 mr-2&quot; />
                                  Start Event
                                </DropdownMenuItem>
                              )}
                              {event.status === &quot;in_progress&quot; && (
                                <DropdownMenuItem
                                  onSelect={() => {
                                    // In a real implementation, update the event status to completed
                                    toast({
                                      title: &quot;Not Implemented&quot;,
                                      description:
                                        &quot;This feature is not implemented yet.&quot;,
                                    });
                                  }}
                                >
                                  <CheckCircle className=&quot;h-4 w-4 mr-2&quot; />
                                  Complete Event
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className=&quot;text-destructive focus:text-destructive&quot;
                                onSelect={() => handleCancelEvent(event.id)}
                              >
                                <X className=&quot;h-4 w-4 mr-2&quot; />
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
                  className=&quot;text-center py-4 text-muted-foreground"
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
