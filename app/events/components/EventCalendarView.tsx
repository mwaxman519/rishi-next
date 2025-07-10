"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface EventCalendarViewProps {
  organizationId: string | undefined;
}

// Helper to format event for FullCalendar
const formatEventsForCalendar = (events: any[]) => {
  return events.map((event) => {
    // Determine color based on status
    let backgroundColor = "#4f46e5"; // Default blue for scheduled
    let borderColor = "#4338ca";

    if (event.status === "in_progress") {
      backgroundColor = "#0ea5e9"; // Blue
      borderColor = "#0284c7";
    } else if (event.status === "completed") {
      backgroundColor = "#10b981"; // Green
      borderColor = "#059669";
    } else if (event.status === "canceled") {
      backgroundColor = "#ef4444"; // Red
      borderColor = "#dc2626";
    }

    return {
      id: event.id,
      title: event.title,
      start: event.startDateTime,
      end: event.endDateTime,
      backgroundColor,
      borderColor,
      textColor: "#fff",
      extendedProps: {
        location: event.location?.name || "No location specified",
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

  // Handle event click to show details
  const handleEventClick = (info: any) => {
    const eventId = info.event.id;

    // Fetch detailed event information
    fetch(`/api/events/${eventId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch event details");
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
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      });
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

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />;
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

  const calendarEvents = formatEventsForCalendar(events);

  return (
    <div>
      <Card className="mb-6">
        <CardContent className="p-0">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height="auto"
            aspectRatio={1.5}
            contentHeight={600}
            expandRows={true}
            customButtons={{
              prev: {
                text: "",
                click: function (calendar) {
                  if (calendar.el) {
                    const calendarApi = calendar.view.calendar;
                    calendarApi.prev();
                  }
                },
                icon: "chevron-left",
              },
              next: {
                text: "",
                click: function (calendar) {
                  if (calendar.el) {
                    const calendarApi = calendar.view.calendar;
                    calendarApi.next();
                  }
                },
                icon: "chevron-right",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedEvent && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
                <DialogDescription>
                  {format(new Date(selectedEvent.startDateTime), "PPp")} -
                  {format(new Date(selectedEvent.endDateTime), "PPp")}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="flex items-start space-x-2">
                  <Badge
                    variant={getBadgeVariant(selectedEvent.status)}
                    className="mt-0.5"
                  >
                    {formatStatus(selectedEvent.status)}
                  </Badge>
                </div>

                {selectedEvent.description && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{selectedEvent.extendedProps.location}</span>
                  </div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {format(new Date(selectedEvent.startDateTime), "PPp")} -
                      {format(new Date(selectedEvent.endDateTime), "p")}
                    </span>
                  </div>

                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>
                      {selectedEvent.extendedProps.staffAssigned > 0
                        ? `${selectedEvent.extendedProps.staffAssigned} staff assigned`
                        : "No staff assigned"}
                    </span>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
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
