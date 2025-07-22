"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CalendarClock,
  CheckCircle,
  ChevronDown,
  Clock,
  Edit,
  Map,
  MapPin,
  MoreHorizontal,
  PenSquare,
  PlayCircle,
  ScrollText,
  User,
  Users,
  X,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const eventId = params.id as string;

  // Fetch event details
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["events", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch event details");
      }

      return await response.json();
    },
  });

  // Fetch staff assignments
  const { data: staffAssignments = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: ["events", eventId, "staff"],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/staff`);

      if (!response.ok) {
        return [];
      }

      return await response.json();
    },
    enabled: !!eventId,
  });

  // Fetch event activities
  const { data: activities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ["events", eventId, "activities"],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/activities`);

      if (!response.ok) {
        return [];
      }

      return await response.json();
    },
    enabled: !!eventId,
  });

  // Format date for display
  const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "PPpp");
  };

  // Format date only for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "PPP");
  };

  // Format time only for display
  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "p");
  };

  // Format event status for display
  const formatStatus = (status: string) => {
    if (!status) return "";
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    if (!status) return "outline";

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

  // Handle start event
  const handleStartEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to start event");
      }

      toast({
        title: "Event Started",
        description: "The event has been successfully started.",
      });

      // Refetch event data
      // In a real implementation, you would use queryClient.invalidateQueries(['events', eventId])
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Handle complete event
  const handleCompleteEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to complete event");
      }

      toast({
        title: "Event Completed",
        description: "The event has been successfully completed.",
      });

      // Refetch event data
      // In a real implementation, you would use queryClient.invalidateQueries(['events', eventId])
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  // Handle cancel event
  const handleCancelEvent = async () => {
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

      // Navigate back to events list
      router.push("/events");
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <Skeleton className="h-[28px] w-[250px] mb-6" />
        <div className="space-y-6">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ? (error as Error).message : "Failed to load event details"}
          </AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/events">Events</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{event.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <Badge variant={getBadgeVariant(event.status)}>
              {formatStatus(event.status)}
            </Badge>
            {event.isSeriesParent && (
              <Badge variant="outline">Recurring Event</Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {event.status !== "canceled" && event.status !== "completed" && (
            <>
              <Link href={`/events/${eventId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Actions
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={`/events/${eventId}/staff`}>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Staff
                    </DropdownMenuItem>
                  </Link>

                  {event.status === "scheduled" && (
                    <DropdownMenuItem onSelect={handleStartEvent}>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Start Event
                    </DropdownMenuItem>
                  )}

                  {event.status === "in_progress" && (
                    <DropdownMenuItem onSelect={handleCompleteEvent}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Event
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={handleCancelEvent}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {(event.status === "canceled" || event.status === "completed") && (
            <Button variant="outline" onClick={() => router.push("/events")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue="overview"
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">
            <ScrollText className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="staff">
            <Users className="mr-2 h-4 w-4" />
            Staff ({staffAssignments.length})
          </TabsTrigger>
          <TabsTrigger value="activities">
            <CheckCircle className="mr-2 h-4 w-4" />
            Activities ({activities.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Date & Time */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                      Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Start:
                        </span>
                        <p>{formatDateTime(event.startDateTime)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          End:
                        </span>
                        <p>{formatDateTime(event.endDateTime)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Duration:
                        </span>
                        <p>
                          {event.duration
                            ? `${event.duration} hours`
                            : "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Name:
                        </span>
                        <p>{event.location?.name || "No location specified"}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Address:
                        </span>
                        <p>
                          {event.location?.address || "No address available"}
                        </p>
                      </div>
                      {event.location?.notes && (
                        <div>
                          <span className="text-sm text-muted-foreground">
                            Notes:
                          </span>
                          <p>{event.location.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description & Notes */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Description & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Description</h4>
                      <p className="text-sm">
                        {event.description || "No description provided"}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes</h4>
                      <p className="text-sm">
                        {event.notes || "No additional notes"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization & Attendance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">
                    Organization & Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-1">Organization</h4>
                      <p>{event.organization?.name || "Not specified"}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        Expected Attendees
                      </h4>
                      <p>{event.expectedAttendees || "Not specified"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Event Information (if applicable) */}
              {event.isSeriesParent && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center">
                      <CalendarClock className="mr-2 h-4 w-4 text-muted-foreground" />
                      Recurring Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Pattern</h4>
                        <p className="capitalize">
                          {event.recurringPattern || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Frequency</h4>
                        <p>{event.recurringFrequency || "Not specified"}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">
                          Occurrences
                        </h4>
                        <p>{event.numberOfOccurrences || "Not specified"}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Staff Assignments</CardTitle>
                <CardDescription>
                  Staff members assigned to this event
                </CardDescription>
              </div>

              {event.status !== "canceled" && event.status !== "completed" && (
                <Link href={`/events/${eventId}/staff`}>
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Manage Staff
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingStaff ? (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : staffAssignments.length > 0 ? (
                <div className="space-y-4">
                  {staffAssignments.map((staff: any) => (
                    <div
                      key={staff.id}
                      className="flex items-center justify-between p-4 border rounded-md"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-5 w-5" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{staff.user?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {staff.role || "No role specified"}
                          </p>
                        </div>
                      </div>
                      <Badge>{staff.status || "Assigned"}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Staff Assigned</h3>
                  <p className="text-muted-foreground mb-4">
                    This event doesn't have any staff members assigned yet.
                  </p>

                  {event.status !== "canceled" &&
                    event.status !== "completed" && (
                      <Link href={`/events/${eventId}/staff`}>
                        <Button>Assign Staff</Button>
                      </Link>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activities Tab */}
        <TabsContent value="activities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Event Activities</CardTitle>
                <CardDescription>
                  Tasks and activities scheduled for this event
                </CardDescription>
              </div>

              {event.status !== "canceled" && event.status !== "completed" && (
                <Link href={`/events/${eventId}/activities/new`}>
                  <Button>
                    <PenSquare className="mr-2 h-4 w-4" />
                    Add Activity
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">
                            {activity.title}
                          </CardTitle>
                          <Badge variant={getBadgeVariant(activity.status)}>
                            {formatStatus(activity.status)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {activity.startTime && activity.endTime
                            ? `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`
                            : "No time specified"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm">
                          {activity.description || "No description provided"}
                        </p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="h-4 w-4 mr-1" />
                          <span>
                            {activity.assignedTo
                              ? activity.assignedTo.name
                              : "Unassigned"}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Activities</h3>
                  <p className="text-muted-foreground mb-4">
                    This event doesn't have any activities defined yet.
                  </p>

                  {event.status !== "canceled" &&
                    event.status !== "completed" && (
                      <Link href={`/events/${eventId}/activities/new`}>
                        <Button>Add Activity</Button>
                      </Link>
                    )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
