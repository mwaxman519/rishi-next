&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import FullCalendar from &quot;@fullcalendar/react&quot;;
import dayGridPlugin from &quot;@fullcalendar/daygrid&quot;;
import timeGridPlugin from &quot;@fullcalendar/timegrid&quot;;
import interactionPlugin from &quot;@fullcalendar/interaction&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from &quot;@/components/ui/dialog&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { format, parseISO } from &quot;date-fns&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;

interface EventCalendarViewProps {
  organizationId: string | undefined;
}

// Helper to format event for FullCalendar
const formatEventsForCalendar = (events: any[]) => {
  return events.map((event) => {
    // Determine color based on status
    let backgroundColor = &quot;#4f46e5&quot;; // Default blue for scheduled
    let borderColor = &quot;#4338ca&quot;;

    if (event.status === &quot;in_progress&quot;) {
      backgroundColor = &quot;#0ea5e9&quot;; // Blue
      borderColor = &quot;#0284c7&quot;;
    } else if (event.status === &quot;completed&quot;) {
      backgroundColor = &quot;#10b981&quot;; // Green
      borderColor = &quot;#059669&quot;;
    } else if (event.status === &quot;canceled&quot;) {
      backgroundColor = &quot;#ef4444&quot;; // Red
      borderColor = &quot;#dc2626&quot;;
    }

    return {
      id: event.id,
      title: event.title,
      start: event.startDateTime,
      end: event.endDateTime,
      backgroundColor,
      borderColor,
      textColor: &quot;#fff&quot;,
      extendedProps: {
        location: event.location?.name || &quot;No location specified&quot;,
        status: event.status,
        description: event.description,
        staffAssigned: event.staffCount || 0,
      },
    };
  });
};

export default function EventCalendarView({
  organizationId,
}: EventCalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch events from API
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery<any[]>({
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

  // Handle event click to show details
  const handleEventClick = (info: any) => {
    const eventId = info.event.id;

    // Fetch detailed event information
    fetch(`/api/events/${eventId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(&quot;Failed to fetch event details&quot;);
        }
        return response.json();
      })
      .then((eventDetails) => {
        setSelectedEvent({
          ...eventDetails,
          title: info.event.title,
          extendedProps: info.event.extendedProps,
        });
        setIsDialogOpen(true);
      })
      .catch((error) => {
        toast({
          title: &quot;Error&quot;,
          description: error.message,
          variant: &quot;destructive&quot;,
        });
      });
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

  if (isLoading) {
    return <Skeleton className=&quot;w-full h-[600px]&quot; />;
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

  const calendarEvents = formatEventsForCalendar(events);

  return (
    <div>
      <Card className=&quot;mb-6&quot;>
        <CardContent className=&quot;p-0&quot;>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView=&quot;dayGridMonth&quot;
            headerToolbar={{
              left: &quot;prev,next today&quot;,
              center: &quot;title&quot;,
              right: &quot;dayGridMonth,timeGridWeek,timeGridDay&quot;,
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height=&quot;auto&quot;
            aspectRatio={1.5}
            contentHeight={600}
            expandRows={true}
            customButtons={{
              prev: {
                text: "&quot;,
                click: function (calendar) {
                  if (calendar.el) {
                    const calendarApi = calendar.view.calendar;
                    calendarApi.prev();
                  }
                },
                icon: &quot;chevron-left&quot;,
              },
              next: {
                text: &quot;&quot;,
                click: function (calendar) {
                  if (calendar.el) {
                    const calendarApi = calendar.view.calendar;
                    calendarApi.next();
                  }
                },
                icon: &quot;chevron-right&quot;,
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className=&quot;sm:max-w-[500px]&quot;>
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedEvent.startDateTime), &quot;PPp&quot;)} -
                  {format(new Date(selectedEvent.endDateTime), &quot;PPp&quot;)}
                </DialogDescription>
              </DialogHeader>
              <div className=&quot;py-4 space-y-4&quot;>
                <div className=&quot;flex items-start space-x-2&quot;>
                  <Badge
                    variant={getBadgeVariant(selectedEvent.status)}
                    className=&quot;mt-0.5&quot;
                  >
                    {formatStatus(selectedEvent.status)}
                  </Badge>
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className=&quot;text-sm font-medium mb-1&quot;>Description</h4>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className=&quot;grid grid-cols-1 gap-3&quot;>
                  <div className=&quot;flex items-center&quot;>
                    <MapPin className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                    <span>{selectedEvent.extendedProps.location}</span>
                  </div>

                  <div className=&quot;flex items-center&quot;>
                    <Clock className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                    <span>
                      {format(new Date(selectedEvent.startDateTime), &quot;PPp&quot;)} -
                      {format(new Date(selectedEvent.endDateTime), &quot;p&quot;)}
                    </span>
                  </div>

                  <div className=&quot;flex items-center&quot;>
                    <Users className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                    <span>
                      {selectedEvent.extendedProps.staffAssigned > 0
                        ? `${selectedEvent.extendedProps.staffAssigned} staff assigned`
                        : &quot;No staff assigned&quot;}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant=&quot;outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
                <Link href={`/events/${selectedEvent.id}`}>
                  <Button>View Details</Button>
                </Link>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
