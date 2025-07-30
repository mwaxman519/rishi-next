&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import {
  Calendar,
  Clock,
  MapPin,
  UserCircle,
  Package,
  FileText,
  AlertCircle,
  AlarmClock,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Users,
  CalendarCheck,
} from &quot;lucide-react&quot;;
import { format } from &quot;date-fns&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Avatar, AvatarFallback, AvatarImage } from &quot;@/components/ui/avatar&quot;;

// Booking details will be fetched from database via API

// Status badge mapper
const activityStatusMapper: Record<
  string,
  {
    label: string;
    variant: &quot;default&quot; | &quot;secondary&quot; | &quot;destructive&quot; | &quot;outline&quot;;
  }
> = {
  draft: { label: &quot;Draft&quot;, variant: &quot;outline&quot; },
  pending: { label: &quot;Pending Approval&quot;, variant: &quot;secondary&quot; },
  approved: { label: &quot;Approved&quot;, variant: &quot;default&quot; },
  in_progress: { label: &quot;In Progress&quot;, variant: &quot;default&quot; },
  completed: { label: &quot;Completed&quot;, variant: &quot;outline&quot; },
  rejected: { label: &quot;Rejected&quot;, variant: &quot;destructive&quot; },
  cancelled: { label: &quot;Cancelled&quot;, variant: &quot;destructive&quot; },
};

// Activity type mapper
const activityTypeMapper: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  event: {
    label: &quot;Event&quot;,
    icon: <Calendar className=&quot;h-4 w-4 mr-1&quot; />,
  },
  merchandising: {
    label: &quot;Merchandising&quot;,
    icon: <CheckCircle2 className=&quot;h-4 w-4 mr-1&quot; />,
  },
  secret_shopping: {
    label: &quot;Secret Shopping&quot;,
    icon: <UserCircle className=&quot;h-4 w-4 mr-1&quot; />,
  },
  training: {
    label: &quot;Training&quot;,
    icon: <Users className=&quot;h-4 w-4 mr-1&quot; />,
  },
  logistics: {
    label: &quot;Logistics&quot;,
    icon: <Package className=&quot;h-4 w-4 mr-1&quot; />,
  },
};

interface BookingDetailsProps {
  id: string;
}

export default function BookingDetails({ id }: BookingDetailsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("&quot;);

  // In a real app, fetch data from API
  // useEffect(() => {
  //   const fetchDetails = async () => {
  //     const response = await fetch(`/api/activities/${id}`);
  //     const data = await response.json();
  //     setBookingDetails(data);
  //   };
  //   fetchDetails();
  // }, [id]);

  // State for booking data
  const [booking, setBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch booking details from API
  useEffect(() => {
    const fetchBooking = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/bookings/${bookingId}`);
        if (response.ok) {
          const data = await response.json();
          setBooking(data.data);
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId]);

  const handleApprove = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: 'Approved via booking details' }),
      });

      if (response.ok) {
        setShowApproveDialog(false);
        
        // Refresh booking data
        const updatedResponse = await fetch(`/api/bookings/${bookingId}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setBooking(updatedData.data);
        }
        
        toast({
          title: &quot;Booking Approved&quot;,
          description: &quot;The booking has been approved successfully.&quot;,
        });
      } else {
        throw new Error('Failed to approve booking');
      }
    } catch (error) {
      console.error(&quot;Error approving booking:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to approve the booking. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (response.ok) {
        setShowRejectDialog(false);
        setRejectionReason(&quot;&quot;);

        // Refresh booking data
        const updatedResponse = await fetch(`/api/bookings/${bookingId}`);
        if (updatedResponse.ok) {
          const updatedData = await updatedResponse.json();
          setBooking(updatedData.data);
        }

        toast({
          title: &quot;Booking Rejected&quot;,
          description: &quot;The booking has been rejected successfully.&quot;,
        });
      } else {
        throw new Error('Failed to reject booking');
      }
    } catch (error) {
      console.error(&quot;Error rejecting booking:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to reject the booking. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        &quot;Are you sure you want to delete this booking? This action cannot be undone.&quot;,
      )
    ) {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast({
            title: &quot;Booking Deleted&quot;,
            description: &quot;The booking has been deleted successfully.&quot;,
          });
          // Navigate back to bookings list
          router.push(&quot;/bookings&quot;);
        } else {
          throw new Error('Failed to delete booking');
        }
      } catch (error) {
        console.error(&quot;Error deleting booking:&quot;, error);
        toast({
          title: &quot;Error&quot;,
          description: &quot;Failed to delete the booking. Please try again.&quot;,
          variant: &quot;destructive&quot;,
        });
        setIsLoading(false);
      }
    }
  };

  // Format helpers
  const formatDate = (date: Date) => {
    return format(date, &quot;MMMM d, yyyy&quot;);
  };

  const formatTime = (date: Date) => {
    return format(date, &quot;h:mm a&quot;);
  };

  const formatDateTime = (date: Date) => {
    return format(date, &quot;MMM d, yyyy h:mm a&quot;);
  };

  // Check if user can approve/reject (in real app would check user role)
  const canApprove = true;
  const canEdit = true;
  const canDelete = true;

  if (!booking) {
    return (
      <div className=&quot;flex items-center justify-center h-[400px]&quot;>
        <div className=&quot;text-center&quot;>
          <AlertCircle className=&quot;h-10 w-10 text-muted-foreground mx-auto mb-4&quot; />
          <h3 className=&quot;text-lg font-medium&quot;>Booking Not Found</h3>
          <p className=&quot;text-muted-foreground mt-2&quot;>
            The booking you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex flex-col lg:flex-row lg:items-start justify-between gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight break-words&quot;>
            {booking.title}
          </h1>
          <div className=&quot;flex flex-wrap gap-2 mt-2&quot;>
            <Badge
              variant={
                activityStatusMapper[booking.activityStatus]?.variant ||
                &quot;default&quot;
              }
              className=&quot;px-2 py-1&quot;
            >
              {activityStatusMapper[booking.activityStatus]?.label ||
                booking.activityStatus}
            </Badge>
            <Badge variant=&quot;outline&quot; className=&quot;flex items-center px-2 py-1&quot;>
              {activityTypeMapper[booking.activityType]?.icon}
              {activityTypeMapper[booking.activityType]?.label ||
                booking.activityType}
            </Badge>
            <Badge
              variant=&quot;outline&quot;
              className=&quot;flex items-center px-2 py-1 capitalize&quot;
            >
              <AlarmClock className=&quot;h-3.5 w-3.5 mr-1&quot; />
              {booking.priority} Priority
            </Badge>
          </div>
        </div>

        <div className=&quot;flex flex-wrap gap-2&quot;>
          {/* Approval and status controls */}
          {booking.activityStatus === &quot;pending&quot; && canApprove && (
            <>
              <Button
                className=&quot;gap-1&quot;
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle2 className=&quot;h-4 w-4&quot; />
                Approve
              </Button>
              <Button
                variant=&quot;outline&quot;
                className=&quot;gap-1&quot;
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className=&quot;h-4 w-4&quot; />
                Reject
              </Button>
            </>
          )}

          {/* Edit and more actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant=&quot;outline&quot; size=&quot;icon&quot;>
                <MoreHorizontal className=&quot;h-4 w-4&quot; />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align=&quot;end&quot;>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => router.push(`/bookings/${id}/edit`)}
                >
                  <Edit className=&quot;h-4 w-4 mr-2&quot; />
                  Edit Booking
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  /* Add to calendar functionality */
                }}
              >
                <CalendarCheck className=&quot;h-4 w-4 mr-2&quot; />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem
                  className=&quot;text-destructive focus:text-destructive&quot;
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className=&quot;h-4 w-4 mr-2&quot; />
                  Delete Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue=&quot;details&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;grid grid-cols-3 max-w-md&quot;>
          <TabsTrigger value=&quot;details&quot;>Details</TabsTrigger>
          <TabsTrigger value=&quot;staff&quot;>
            Staff ({booking.assignments.length})
          </TabsTrigger>
          <TabsTrigger value=&quot;history&quot;>History</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;details&quot; className=&quot;mt-6 space-y-6&quot;>
          {/* Main info card */}
          <Card>
            <CardHeader>
              <CardTitle className=&quot;text-xl&quot;>Activity Information</CardTitle>
            </CardHeader>
            <CardContent className=&quot;space-y-6&quot;>
              {booking.description && (
                <div>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground mb-2&quot;>
                    Description
                  </h3>
                  <p className=&quot;text-sm&quot;>{booking.description}</p>
                </div>
              )}

              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                <div className=&quot;space-y-3&quot;>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Date & Time
                  </h3>
                  <div className=&quot;flex items-start gap-3&quot;>
                    <Calendar className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                    <div>
                      {booking.startDate && (
                        <div className=&quot;font-medium&quot;>
                          {formatDate(booking.startDate)}
                          {booking.endDate &&
                            booking.endDate.toDateString() !==
                              booking.startDate.toDateString() &&
                            ` to ${formatDate(booking.endDate)}`}
                        </div>
                      )}
                      {!booking.allDay &&
                        booking.startDate &&
                        booking.endDate && (
                          <div className=&quot;text-sm text-muted-foreground&quot;>
                            {formatTime(booking.startDate)} -{&quot; &quot;}
                            {formatTime(booking.endDate)}
                          </div>
                        )}
                      {booking.allDay && (
                        <div className=&quot;text-sm text-muted-foreground&quot;>
                          All day
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className=&quot;space-y-3&quot;>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Location
                  </h3>
                  <div className=&quot;flex items-start gap-3&quot;>
                    <MapPin className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                    <div>
                      <div className=&quot;font-medium&quot;>{booking.location.name}</div>
                      <div className=&quot;text-sm text-muted-foreground&quot;>
                        {booking.location.address}
                      </div>
                    </div>
                  </div>
                </div>

                {booking.activityType === &quot;event&quot; && booking.promotionType && (
                  <div className=&quot;space-y-3&quot;>
                    <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Promotion Type
                    </h3>
                    <div className=&quot;flex items-start gap-3&quot;>
                      <FileText className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                      <div className=&quot;font-medium&quot;>{booking.promotionType}</div>
                    </div>
                  </div>
                )}

                {booking.kitTemplate && (
                  <div className=&quot;space-y-3&quot;>
                    <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Kit Template
                    </h3>
                    <div className=&quot;flex items-start gap-3&quot;>
                      <Package className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                      <div>
                        <div className=&quot;font-medium&quot;>
                          {booking.kitTemplate.name}
                        </div>
                        <div className=&quot;text-sm text-muted-foreground&quot;>
                          {booking.kitTemplate.items} items
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className=&quot;space-y-3&quot;>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                    Required Staff
                  </h3>
                  <div className=&quot;flex items-start gap-3&quot;>
                    <Users className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                    <div className=&quot;font-medium&quot;>
                      {booking.requiredStaffCount} staff members
                    </div>
                  </div>
                </div>

                {booking.budget !== undefined && (
                  <div className=&quot;space-y-3&quot;>
                    <h3 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                      Budget
                    </h3>
                    <div className=&quot;flex items-start gap-3&quot;>
                      <FileText className=&quot;h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5&quot; />
                      <div className=&quot;font-medium&quot;>
                        $
                        {booking.budget.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {booking.specialInstructions && (
                <div className=&quot;pt-4 border-t&quot;>
                  <h3 className=&quot;text-sm font-medium text-muted-foreground mb-2&quot;>
                    Special Instructions
                  </h3>
                  <Alert>
                    <AlertCircle className=&quot;h-4 w-4&quot; />
                    <AlertTitle>Note</AlertTitle>
                    <AlertDescription>
                      {booking.specialInstructions}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;staff&quot; className=&quot;mt-6 space-y-6&quot;>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between&quot;>
              <CardTitle className=&quot;text-xl&quot;>Staff Assignments</CardTitle>
              <Button size=&quot;sm&quot;>Assign Staff</Button>
            </CardHeader>
            <CardContent>
              {booking.assignments.length > 0 ? (
                <div className=&quot;space-y-4&quot;>
                  {booking.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className=&quot;flex items-center justify-between p-3 bg-muted/40 rounded-md&quot;
                    >
                      <div className=&quot;flex items-center gap-3&quot;>
                        <Avatar>
                          <AvatarImage
                            src={assignment.userAvatar || undefined}
                          />
                          <AvatarFallback>
                            {assignment.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className=&quot;font-medium&quot;>
                            {assignment.userName}
                          </div>
                          <div className=&quot;text-xs text-muted-foreground capitalize&quot;>
                            {assignment.role}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          assignment.status === &quot;accepted&quot;
                            ? &quot;default&quot;
                            : &quot;outline&quot;
                        }
                      >
                        {assignment.status === &quot;accepted&quot;
                          ? &quot;Accepted&quot;
                          : &quot;Pending&quot;}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className=&quot;text-center py-6 text-muted-foreground&quot;>
                  <Users className=&quot;h-8 w-8 mx-auto mb-2 opacity-50&quot; />
                  <p>No staff members assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;history&quot; className=&quot;mt-6 space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle className=&quot;text-xl&quot;>Activity History</CardTitle>
              <CardDescription>
                Timeline of changes and approvals for this booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;space-y-4&quot;>
                {booking.approvalHistory.map((item, index) => (
                  <div key={item.id} className=&quot;flex gap-4&quot;>
                    <div className=&quot;mt-1&quot;>
                      <div className=&quot;w-2 h-2 rounded-full bg-primary&quot;></div>
                      {index < booking.approvalHistory.length - 1 && (
                        <div className=&quot;w-0.5 h-full bg-muted-foreground/20 ml-[3px] mt-1&quot;></div>
                      )}
                    </div>
                    <div className=&quot;flex-1 pb-4&quot;>
                      <div className=&quot;flex flex-col gap-1&quot;>
                        <div className=&quot;text-sm text-muted-foreground&quot;>
                          {formatDateTime(item.timestamp)}
                        </div>
                        <div className=&quot;font-medium&quot;>
                          <span className=&quot;capitalize&quot;>{item.status}</span>
                          {item.user && <> by {item.user}</>}
                        </div>
                        {item.notes && (
                          <div className=&quot;text-sm mt-1 text-muted-foreground&quot;>
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className=&quot;flex gap-4&quot;>
                  <div className=&quot;mt-1&quot;>
                    <div className=&quot;w-2 h-2 rounded-full bg-primary/30&quot;></div>
                  </div>
                  <div className=&quot;flex-1&quot;>
                    <div className=&quot;flex flex-col gap-1&quot;>
                      <div className=&quot;text-sm text-muted-foreground&quot;>
                        {formatDateTime(booking.createdAt)}
                      </div>
                      <div className=&quot;font-medium&quot;>
                        Created by {booking.createdBy.name}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approve dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Activity</DialogTitle>
            <DialogDescription>
              This will approve the activity and notify the assigned staff. Are
              you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <div className=&quot;py-4&quot;>
            <div className=&quot;rounded-md bg-muted p-4&quot;>
              <div className=&quot;font-medium&quot;>{booking.title}</div>
              <div className=&quot;text-sm text-muted-foreground mt-1&quot;>
                {formatDate(booking.startDate)}
                {booking.startDate &&
                  booking.endDate &&
                  ` • ${formatTime(booking.startDate)} - ${formatTime(booking.endDate)}`}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant=&quot;outline&quot;
              onClick={() => setShowApproveDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? &quot;Approving...&quot; : &quot;Approve Activity&quot;}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Activity</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this activity. This
              information will be shared with the creator.
            </DialogDescription>
          </DialogHeader>
          <div className=&quot;py-4 space-y-4&quot;>
            <div className=&quot;rounded-md bg-muted p-4&quot;>
              <div className=&quot;font-medium&quot;>{booking.title}</div>
              <div className=&quot;text-sm text-muted-foreground mt-1&quot;>
                {formatDate(booking.startDate)}
                {booking.startDate &&
                  booking.endDate &&
                  ` • ${formatTime(booking.startDate)} - ${formatTime(booking.endDate)}`}
              </div>
            </div>

            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder=&quot;Explain why this activity is being rejected...&quot;
              className=&quot;min-h-[120px]&quot;
            />
          </div>
          <DialogFooter>
            <Button
              variant=&quot;outline&quot;
              onClick={() => setShowRejectDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant=&quot;destructive&quot;
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              {isLoading ? &quot;Rejecting...&quot; : &quot;Reject Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
