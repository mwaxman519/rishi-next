&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { useParams, useRouter } from &quot;next/navigation&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import Link from &quot;next/link&quot;;
import { format } from &quot;date-fns&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from &quot;@/components/ui/breadcrumb&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
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
} from &quot;lucide-react&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(&quot;overview&quot;);
  const eventId = params.id as string;

  // Fetch event details
  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: [&quot;events&quot;, eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to fetch event details&quot;);
      }

      return await response.json();
    },
  });

  // Fetch staff assignments
  const { data: staffAssignments = [], isLoading: isLoadingStaff } = useQuery({
    queryKey: [&quot;events&quot;, eventId, &quot;staff&quot;],
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
    queryKey: [&quot;events&quot;, eventId, &quot;activities&quot;],
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
    if (!dateString) return "&quot;;
    return format(new Date(dateString), &quot;PPpp&quot;);
  };

  // Format date only for display
  const formatDate = (dateString: string) => {
    if (!dateString) return &quot;&quot;;
    return format(new Date(dateString), &quot;PPP&quot;);
  };

  // Format time only for display
  const formatTime = (dateString: string) => {
    if (!dateString) return &quot;&quot;;
    return format(new Date(dateString), &quot;p&quot;);
  };

  // Format event status for display
  const formatStatus = (status: string) => {
    if (!status) return &quot;&quot;;
    return status
      .split(&quot;_&quot;)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(&quot; &quot;);
  };

  // Get badge variant based on status
  const getBadgeVariant = (status: string) => {
    if (!status) return &quot;outline&quot;;

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

  // Handle start event
  const handleStartEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/start`, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to start event&quot;);
      }

      toast({
        title: &quot;Event Started&quot;,
        description: &quot;The event has been successfully started.&quot;,
      });

      // Refetch event data
      // In a real implementation, you would use queryClient.invalidateQueries(['events', eventId])
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description: (error as Error).message,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Handle complete event
  const handleCompleteEvent = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/complete`, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to complete event&quot;);
      }

      toast({
        title: &quot;Event Completed&quot;,
        description: &quot;The event has been successfully completed.&quot;,
      });

      // Refetch event data
      // In a real implementation, you would use queryClient.invalidateQueries(['events', eventId])
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description: (error as Error).message,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Handle cancel event
  const handleCancelEvent = async () => {
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

      // Navigate back to events list
      router.push(&quot;/events&quot;);
    } catch (error) {
      toast({
        title: &quot;Error&quot;,
        description: (error as Error).message,
        variant: &quot;destructive&quot;,
      });
    }
  };

  if (isLoading) {
    return (
      <div className=&quot;container mx-auto py-6 space-y-8&quot;>
        <Skeleton className=&quot;h-[28px] w-[250px] mb-6&quot; />
        <div className=&quot;space-y-6&quot;>
          <Skeleton className=&quot;h-[300px] w-full&quot; />
          <Skeleton className=&quot;h-[400px] w-full&quot; />
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className=&quot;container mx-auto py-6&quot;>
        <Alert variant=&quot;destructive&quot;>
          <AlertCircle className=&quot;h-4 w-4&quot; />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error ? (error as Error).message : &quot;Failed to load event details&quot;}
          </AlertDescription>
        </Alert>
        <div className=&quot;mt-4&quot;>
          <Button variant=&quot;outline&quot; onClick={() => router.push(&quot;/events&quot;)}>
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href=&quot;/dashboard&quot;>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href=&quot;/events&quot;>Events</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{event.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className=&quot;flex flex-col md:flex-row justify-between items-start md:items-center gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>{event.title}</h1>
          <div className=&quot;flex items-center mt-2 space-x-2&quot;>
            <Badge variant={getBadgeVariant(event.status)}>
              {formatStatus(event.status)}
            </Badge>
            {event.isSeriesParent && (
              <Badge variant=&quot;outline&quot;>Recurring Event</Badge>
            )}
          </div>
        </div>

        <div className=&quot;flex items-center space-x-2&quot;>
          {event.status !== &quot;canceled&quot; && event.status !== &quot;completed&quot; && (
            <>
              <Link href={`/events/${eventId}/edit`}>
                <Button variant=&quot;outline&quot;>
                  <Edit className=&quot;mr-2 h-4 w-4&quot; />
                  Edit
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant=&quot;outline&quot;>
                    Actions
                    <ChevronDown className=&quot;ml-2 h-4 w-4&quot; />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align=&quot;end&quot;>
                  <Link href={`/events/${eventId}/staff`}>
                    <DropdownMenuItem>
                      <Users className=&quot;mr-2 h-4 w-4&quot; />
                      Manage Staff
                    </DropdownMenuItem>
                  </Link>

                  {event.status === &quot;scheduled&quot; && (
                    <DropdownMenuItem onSelect={handleStartEvent}>
                      <PlayCircle className=&quot;mr-2 h-4 w-4&quot; />
                      Start Event
                    </DropdownMenuItem>
                  )}

                  {event.status === &quot;in_progress&quot; && (
                    <DropdownMenuItem onSelect={handleCompleteEvent}>
                      <CheckCircle className=&quot;mr-2 h-4 w-4&quot; />
                      Complete Event
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    className=&quot;text-destructive focus:text-destructive&quot;
                    onSelect={handleCancelEvent}
                  >
                    <X className=&quot;mr-2 h-4 w-4&quot; />
                    Cancel Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          {(event.status === &quot;canceled&quot; || event.status === &quot;completed&quot;) && (
            <Button variant=&quot;outline&quot; onClick={() => router.push(&quot;/events&quot;)}>
              <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
              Back to Events
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue=&quot;overview&quot;
        onValueChange={setActiveTab}
        className=&quot;space-y-4&quot;
      >
        <TabsList>
          <TabsTrigger value=&quot;overview&quot;>
            <ScrollText className=&quot;mr-2 h-4 w-4&quot; />
            Overview
          </TabsTrigger>
          <TabsTrigger value=&quot;staff&quot;>
            <Users className=&quot;mr-2 h-4 w-4&quot; />
            Staff ({staffAssignments.length})
          </TabsTrigger>
          <TabsTrigger value=&quot;activities&quot;>
            <CheckCircle className=&quot;mr-2 h-4 w-4&quot; />
            Activities ({activities.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
          {/* Event Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;flex items-center&quot;>
                <Calendar className=&quot;mr-2 h-5 w-5&quot; />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                {/* Date & Time */}
                <Card>
                  <CardHeader className=&quot;pb-2&quot;>
                    <CardTitle className=&quot;text-base font-medium flex items-center&quot;>
                      <CalendarClock className=&quot;mr-2 h-4 w-4 text-muted-foreground&quot; />
                      Date & Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;space-y-2&quot;>
                      <div>
                        <span className=&quot;text-sm text-muted-foreground&quot;>
                          Start:
                        </span>
                        <p>{formatDateTime(event.startDateTime)}</p>
                      </div>
                      <div>
                        <span className=&quot;text-sm text-muted-foreground&quot;>
                          End:
                        </span>
                        <p>{formatDateTime(event.endDateTime)}</p>
                      </div>
                      <div>
                        <span className=&quot;text-sm text-muted-foreground&quot;>
                          Duration:
                        </span>
                        <p>
                          {event.duration
                            ? `${event.duration} hours`
                            : &quot;Not specified&quot;}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader className=&quot;pb-2&quot;>
                    <CardTitle className=&quot;text-base font-medium flex items-center&quot;>
                      <MapPin className=&quot;mr-2 h-4 w-4 text-muted-foreground&quot; />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;space-y-2&quot;>
                      <div>
                        <span className=&quot;text-sm text-muted-foreground&quot;>
                          Name:
                        </span>
                        <p>{event.location?.name || &quot;No location specified&quot;}</p>
                      </div>
                      <div>
                        <span className=&quot;text-sm text-muted-foreground&quot;>
                          Address:
                        </span>
                        <p>
                          {event.location?.address || &quot;No address available&quot;}
                        </p>
                      </div>
                      {event.location?.notes && (
                        <div>
                          <span className=&quot;text-sm text-muted-foreground&quot;>
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
                <CardHeader className=&quot;pb-2&quot;>
                  <CardTitle className=&quot;text-base font-medium&quot;>
                    Description & Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=&quot;space-y-4&quot;>
                    <div>
                      <h4 className=&quot;text-sm font-medium mb-1&quot;>Description</h4>
                      <p className=&quot;text-sm&quot;>
                        {event.description || &quot;No description provided&quot;}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h4 className=&quot;text-sm font-medium mb-1&quot;>Notes</h4>
                      <p className=&quot;text-sm&quot;>
                        {event.notes || &quot;No additional notes&quot;}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Organization & Attendance */}
              <Card>
                <CardHeader className=&quot;pb-2&quot;>
                  <CardTitle className=&quot;text-base font-medium&quot;>
                    Organization & Attendance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                    <div>
                      <h4 className=&quot;text-sm font-medium mb-1&quot;>Organization</h4>
                      <p>{event.organization?.name || &quot;Not specified&quot;}</p>
                    </div>

                    <div>
                      <h4 className=&quot;text-sm font-medium mb-1&quot;>
                        Expected Attendees
                      </h4>
                      <p>{event.expectedAttendees || &quot;Not specified&quot;}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recurring Event Information (if applicable) */}
              {event.isSeriesParent && (
                <Card>
                  <CardHeader className=&quot;pb-2&quot;>
                    <CardTitle className=&quot;text-base font-medium flex items-center&quot;>
                      <CalendarClock className=&quot;mr-2 h-4 w-4 text-muted-foreground&quot; />
                      Recurring Event Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                      <div>
                        <h4 className=&quot;text-sm font-medium mb-1&quot;>Pattern</h4>
                        <p className=&quot;capitalize&quot;>
                          {event.recurringPattern || &quot;Not specified&quot;}
                        </p>
                      </div>

                      <div>
                        <h4 className=&quot;text-sm font-medium mb-1&quot;>Frequency</h4>
                        <p>{event.recurringFrequency || &quot;Not specified&quot;}</p>
                      </div>

                      <div>
                        <h4 className=&quot;text-sm font-medium mb-1&quot;>
                          Occurrences
                        </h4>
                        <p>{event.numberOfOccurrences || &quot;Not specified&quot;}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value=&quot;staff&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between&quot;>
              <div>
                <CardTitle>Staff Assignments</CardTitle>
                <CardDescription>
                  Staff members assigned to this event
                </CardDescription>
              </div>

              {event.status !== &quot;canceled&quot; && event.status !== &quot;completed&quot; && (
                <Link href={`/events/${eventId}/staff`}>
                  <Button>
                    <Users className=&quot;mr-2 h-4 w-4&quot; />
                    Manage Staff
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingStaff ? (
                <div className=&quot;space-y-2&quot;>
                  <Skeleton className=&quot;h-12 w-full&quot; />
                  <Skeleton className=&quot;h-12 w-full&quot; />
                  <Skeleton className=&quot;h-12 w-full&quot; />
                </div>
              ) : staffAssignments.length > 0 ? (
                <div className=&quot;space-y-4&quot;>
                  {staffAssignments.map((staff: any) => (
                    <div
                      key={staff.id}
                      className=&quot;flex items-center justify-between p-4 border rounded-md&quot;
                    >
                      <div className=&quot;flex items-center&quot;>
                        <div className=&quot;h-10 w-10 rounded-full bg-muted flex items-center justify-center&quot;>
                          <User className=&quot;h-5 w-5&quot; />
                        </div>
                        <div className=&quot;ml-4&quot;>
                          <p className=&quot;font-medium&quot;>{staff.user?.name}</p>
                          <p className=&quot;text-sm text-muted-foreground&quot;>
                            {staff.role || &quot;No role specified&quot;}
                          </p>
                        </div>
                      </div>
                      <Badge>{staff.status || &quot;Assigned&quot;}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className=&quot;text-center py-8&quot;>
                  <Users className=&quot;h-12 w-12 mx-auto text-muted-foreground mb-4&quot; />
                  <h3 className=&quot;text-lg font-medium&quot;>No Staff Assigned</h3>
                  <p className=&quot;text-muted-foreground mb-4&quot;>
                    This event doesn&apos;t have any staff members assigned yet.
                  </p>

                  {event.status !== &quot;canceled&quot; &&
                    event.status !== &quot;completed&quot; && (
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
        <TabsContent value=&quot;activities&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between&quot;>
              <div>
                <CardTitle>Event Activities</CardTitle>
                <CardDescription>
                  Tasks and activities scheduled for this event
                </CardDescription>
              </div>

              {event.status !== &quot;canceled&quot; && event.status !== &quot;completed&quot; && (
                <Link href={`/events/${eventId}/activities/new`}>
                  <Button>
                    <PenSquare className=&quot;mr-2 h-4 w-4&quot; />
                    Add Activity
                  </Button>
                </Link>
              )}
            </CardHeader>
            <CardContent>
              {isLoadingActivities ? (
                <div className=&quot;space-y-2&quot;>
                  <Skeleton className=&quot;h-16 w-full&quot; />
                  <Skeleton className=&quot;h-16 w-full&quot; />
                  <Skeleton className=&quot;h-16 w-full&quot; />
                </div>
              ) : activities.length > 0 ? (
                <div className=&quot;space-y-4&quot;>
                  {activities.map((activity: any) => (
                    <Card key={activity.id}>
                      <CardHeader className=&quot;pb-2&quot;>
                        <div className=&quot;flex justify-between items-start&quot;>
                          <CardTitle className=&quot;text-base&quot;>
                            {activity.title}
                          </CardTitle>
                          <Badge variant={getBadgeVariant(activity.status)}>
                            {formatStatus(activity.status)}
                          </Badge>
                        </div>
                        <CardDescription>
                          {activity.startTime && activity.endTime
                            ? `${formatTime(activity.startTime)} - ${formatTime(activity.endTime)}`
                            : &quot;No time specified&quot;}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className=&quot;pb-2&quot;>
                        <p className=&quot;text-sm&quot;>
                          {activity.description || &quot;No description provided&quot;}
                        </p>
                      </CardContent>
                      <CardFooter className=&quot;pt-0&quot;>
                        <div className=&quot;flex items-center text-sm text-muted-foreground&quot;>
                          <User className=&quot;h-4 w-4 mr-1&quot; />
                          <span>
                            {activity.assignedTo
                              ? activity.assignedTo.name
                              : &quot;Unassigned&quot;}
                          </span>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className=&quot;text-center py-8&quot;>
                  <CheckCircle className=&quot;h-12 w-12 mx-auto text-muted-foreground mb-4&quot; />
                  <h3 className=&quot;text-lg font-medium&quot;>No Activities</h3>
                  <p className=&quot;text-muted-foreground mb-4&quot;>
                    This event doesn&apos;t have any activities defined yet.
                  </p>

                  {event.status !== &quot;canceled&quot; &&
                    event.status !== &quot;completed" && (
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
