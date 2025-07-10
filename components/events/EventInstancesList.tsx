"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MapPin,
  Calendar,
  Clock,
  Clipboard,
  UserCog,
  MoreHorizontal,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EventInstance } from "@/hooks/use-event-instances";
import { format } from "date-fns";

interface EventInstancesListProps {
  bookingId: string;
  events: EventInstance[];
  onAssignManager: (eventId: string) => void;
  onViewDetails: (eventId: string) => void;
}

export default function EventInstancesList({
  bookingId,
  events,
  onAssignManager,
  onViewDetails,
}: EventInstancesListProps) {
  // Format date and time for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, MMMM d, yyyy");
  };

  const formatTime = (timeStr: string) => {
    // Handle both 24-hour and 12-hour formats
    if (timeStr && timeStr.includes(":")) {
      const [hours, minutes] = timeStr.split(":");
      if (hours && minutes) {
        const date = new Date();
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        return format(date, "h:mm a");
      }
    }
    return timeStr || "";
  };

  // Determine status badge variant
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return <Badge variant="outline">Scheduled</Badge>;
      case "in_progress":
        return <Badge variant="secondary">In Progress</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Determine preparation status badge variant
  const getPreparationStatusBadge = (status?: string) => {
    if (!status) return null;

    switch (status.toLowerCase()) {
      case "not_started":
        return (
          <Badge variant="outline" className="bg-gray-100">
            Not Started
          </Badge>
        );
      case "in_progress":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100"
          >
            In Progress
          </Badge>
        );
      case "ready":
        return (
          <Badge
            variant="success"
            className="bg-green-100 text-green-800 hover:bg-green-100"
          >
            Ready
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="w-full overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Field Manager</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Preparation</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No events found
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span className="font-medium">
                        {formatDate(event.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>
                        {formatTime(event.startTime)} -{" "}
                        {formatTime(event.endTime)}
                      </span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  {event.location ? (
                    <div className="flex flex-col">
                      <div className="font-medium">{event.location.name}</div>
                      {event.location.address && (
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate max-w-[180px]">
                            {event.location.address}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not assigned</span>
                  )}
                </TableCell>

                <TableCell>
                  {event.fieldManager ? (
                    <div className="flex flex-col">
                      <div className="font-medium">
                        {event.fieldManager.name}
                      </div>
                      {event.fieldManager.email && (
                        <div className="text-sm text-muted-foreground mt-1 truncate max-w-[120px]">
                          {event.fieldManager.email}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => onAssignManager(event.id)}
                    >
                      <UserCog className="h-4 w-4 mr-1" />
                      Assign Manager
                    </Button>
                  )}
                </TableCell>

                <TableCell>{getStatusBadge(event.status)}</TableCell>

                <TableCell>
                  {getPreparationStatusBadge(event.preparationStatus)}
                </TableCell>

                <TableCell className="text-right">
                  <TooltipProvider>
                    <DropdownMenu>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Actions</p>
                        </TooltipContent>
                      </Tooltip>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewDetails(event.id)}
                        >
                          <Clipboard className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {!event.fieldManager && (
                          <DropdownMenuItem
                            onClick={() => onAssignManager(event.id)}
                          >
                            <UserCog className="h-4 w-4 mr-2" />
                            Assign Manager
                          </DropdownMenuItem>
                        )}
                        {event.preparationStatus === "not_started" && (
                          <DropdownMenuItem>
                            <Loader2 className="h-4 w-4 mr-2" />
                            Start Preparation
                          </DropdownMenuItem>
                        )}
                        {event.preparationStatus === "in_progress" && (
                          <DropdownMenuItem>
                            <Check className="h-4 w-4 mr-2" />
                            Mark as Ready
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Report Issue
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
