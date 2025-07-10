"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Mock data for booking details - in real app, this would come from an API
const mockBookingDetails = {
  id: "1",
  title: "Product Demo at Westfield Mall",
  description:
    "Showcase our new product lineup with interactive demonstrations for mall visitors.",
  activityType: "event",
  activityStatus: "pending",
  location: {
    id: "1",
    name: "Westfield Mall",
    address: "865 Market St, San Francisco, CA 94103",
    coordinates: { lat: 37.7841, lng: -122.4077 },
  },
  startDate: new Date("2025-05-15T10:00:00"),
  endDate: new Date("2025-05-15T16:00:00"),
  allDay: false,
  createdBy: {
    id: "123",
    name: "Michael Scott",
    avatar: null,
  },
  createdAt: new Date("2025-05-01T08:34:21"),
  updatedAt: new Date("2025-05-02T14:22:58"),
  priority: "medium",
  budget: 1500,
  promotionType: "Product Launch",
  kitTemplate: {
    id: "5",
    name: "Event Standard Kit",
    items: 15,
  },
  requiredStaffCount: 3,
  specialInstructions:
    "Ensure all demo units are fully charged. Bring extra product literature.",
  assignments: [
    {
      id: "1",
      userId: "456",
      userName: "Jim Halpert",
      userAvatar: null,
      role: "lead",
      status: "accepted",
    },
    {
      id: "2",
      userId: "789",
      userName: "Pam Beesly",
      userAvatar: null,
      role: "assistant",
      status: "pending",
    },
  ],
  approvalHistory: [
    {
      id: "1",
      status: "draft",
      timestamp: new Date("2025-05-01T08:34:21"),
      user: "Michael Scott",
    },
    {
      id: "2",
      status: "pending",
      timestamp: new Date("2025-05-02T14:22:58"),
      user: "Michael Scott",
      notes: "Submitted for approval",
    },
  ],
};

// Status badge mapper
const activityStatusMapper: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "Pending Approval", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  rejected: { label: "Rejected", variant: "destructive" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

// Activity type mapper
const activityTypeMapper: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  event: {
    label: "Event",
    icon: <Calendar className="h-4 w-4 mr-1" />,
  },
  merchandising: {
    label: "Merchandising",
    icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
  },
  secret_shopping: {
    label: "Secret Shopping",
    icon: <UserCircle className="h-4 w-4 mr-1" />,
  },
  training: {
    label: "Training",
    icon: <Users className="h-4 w-4 mr-1" />,
  },
  logistics: {
    label: "Logistics",
    icon: <Package className="h-4 w-4 mr-1" />,
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
  const [rejectionReason, setRejectionReason] = useState("");

  // In a real app, fetch data from API
  // useEffect(() => {
  //   const fetchDetails = async () => {
  //     const response = await fetch(`/api/activities/${id}`);
  //     const data = await response.json();
  //     setBookingDetails(data);
  //   };
  //   fetchDetails();
  // }, [id]);

  // Use mock data for now
  const booking = mockBookingDetails;

  const handleApprove = async () => {
    setIsLoading(true);

    try {
      // In a real app, call API to approve
      // await fetch(`/api/activities/${id}/approve`, {
      //   method: 'POST',
      // });

      // Mock the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowApproveDialog(false);

      // Refresh booking data
      // router.refresh();

      // For mock, alert
      alert("Booking approved successfully!");
    } catch (error) {
      console.error("Error approving booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    setIsLoading(true);

    try {
      // In a real app, call API to reject with reason
      // await fetch(`/api/activities/${id}/reject`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ reason: rejectionReason }),
      // });

      // Mock the API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowRejectDialog(false);
      setRejectionReason("");

      // Refresh booking data
      // router.refresh();

      // For mock, alert
      alert("Booking rejected successfully!");
    } catch (error) {
      console.error("Error rejecting booking:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this booking? This action cannot be undone.",
      )
    ) {
      setIsLoading(true);

      try {
        // In a real app, call API to delete
        // await fetch(`/api/activities/${id}`, {
        //   method: 'DELETE',
        // });

        // Mock the API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Navigate back to bookings list
        router.push("/bookings");
      } catch (error) {
        console.error("Error deleting booking:", error);
        setIsLoading(false);
      }
    }
  };

  // Format helpers
  const formatDate = (date: Date) => {
    return format(date, "MMMM d, yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const formatDateTime = (date: Date) => {
    return format(date, "MMM d, yyyy h:mm a");
  };

  // Check if user can approve/reject (in real app would check user role)
  const canApprove = true;
  const canEdit = true;
  const canDelete = true;

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">Booking Not Found</h3>
          <p className="text-muted-foreground mt-2">
            The booking you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight break-words">
            {booking.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              variant={
                activityStatusMapper[booking.activityStatus]?.variant ||
                "default"
              }
              className="px-2 py-1"
            >
              {activityStatusMapper[booking.activityStatus]?.label ||
                booking.activityStatus}
            </Badge>
            <Badge variant="outline" className="flex items-center px-2 py-1">
              {activityTypeMapper[booking.activityType]?.icon}
              {activityTypeMapper[booking.activityType]?.label ||
                booking.activityType}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center px-2 py-1 capitalize"
            >
              <AlarmClock className="h-3.5 w-3.5 mr-1" />
              {booking.priority} Priority
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Approval and status controls */}
          {booking.activityStatus === "pending" && canApprove && (
            <>
              <Button
                className="gap-1"
                onClick={() => setShowApproveDialog(true)}
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                className="gap-1"
                onClick={() => setShowRejectDialog(true)}
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {/* Edit and more actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              {canEdit && (
                <DropdownMenuItem
                  onClick={() => router.push(`/bookings/${id}/edit`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  /* Add to calendar functionality */
                }}
              >
                <CalendarCheck className="h-4 w-4 mr-2" />
                Add to Calendar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canDelete && (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Booking
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-3 max-w-md">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="staff">
            Staff ({booking.assignments.length})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6 space-y-6">
          {/* Main info card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Activity Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {booking.description && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Description
                  </h3>
                  <p className="text-sm">{booking.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Date & Time
                  </h3>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      {booking.startDate && (
                        <div className="font-medium">
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
                          <div className="text-sm text-muted-foreground">
                            {formatTime(booking.startDate)} -{" "}
                            {formatTime(booking.endDate)}
                          </div>
                        )}
                      {booking.allDay && (
                        <div className="text-sm text-muted-foreground">
                          All day
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Location
                  </h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium">{booking.location.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {booking.location.address}
                      </div>
                    </div>
                  </div>
                </div>

                {booking.activityType === "event" && booking.promotionType && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Promotion Type
                    </h3>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="font-medium">{booking.promotionType}</div>
                    </div>
                  </div>
                )}

                {booking.kitTemplate && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Kit Template
                    </h3>
                    <div className="flex items-start gap-3">
                      <Package className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium">
                          {booking.kitTemplate.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {booking.kitTemplate.items} items
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Required Staff
                  </h3>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="font-medium">
                      {booking.requiredStaffCount} staff members
                    </div>
                  </div>
                </div>

                {booking.budget !== undefined && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Budget
                    </h3>
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div className="font-medium">
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
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    Special Instructions
                  </h3>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
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

        <TabsContent value="staff" className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Staff Assignments</CardTitle>
              <Button size="sm">Assign Staff</Button>
            </CardHeader>
            <CardContent>
              {booking.assignments.length > 0 ? (
                <div className="space-y-4">
                  {booking.assignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 bg-muted/40 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={assignment.userAvatar || undefined}
                          />
                          <AvatarFallback>
                            {assignment.userName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {assignment.userName}
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {assignment.role}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant={
                          assignment.status === "accepted"
                            ? "default"
                            : "outline"
                        }
                      >
                        {assignment.status === "accepted"
                          ? "Accepted"
                          : "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No staff members assigned yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Activity History</CardTitle>
              <CardDescription>
                Timeline of changes and approvals for this booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {booking.approvalHistory.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      {index < booking.approvalHistory.length - 1 && (
                        <div className="w-0.5 h-full bg-muted-foreground/20 ml-[3px] mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(item.timestamp)}
                        </div>
                        <div className="font-medium">
                          <span className="capitalize">{item.status}</span>
                          {item.user && <> by {item.user}</>}
                        </div>
                        {item.notes && (
                          <div className="text-sm mt-1 text-muted-foreground">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-4">
                  <div className="mt-1">
                    <div className="w-2 h-2 rounded-full bg-primary/30"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col gap-1">
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(booking.createdAt)}
                      </div>
                      <div className="font-medium">
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
          <div className="py-4">
            <div className="rounded-md bg-muted p-4">
              <div className="font-medium">{booking.title}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatDate(booking.startDate)}
                {booking.startDate &&
                  booking.endDate &&
                  ` • ${formatTime(booking.startDate)} - ${formatTime(booking.endDate)}`}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? "Approving..." : "Approve Activity"}
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
          <div className="py-4 space-y-4">
            <div className="rounded-md bg-muted p-4">
              <div className="font-medium">{booking.title}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {formatDate(booking.startDate)}
                {booking.startDate &&
                  booking.endDate &&
                  ` • ${formatTime(booking.startDate)} - ${formatTime(booking.endDate)}`}
              </div>
            </div>

            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this activity is being rejected..."
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isLoading || !rejectionReason.trim()}
            >
              {isLoading ? "Rejecting..." : "Reject Activity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
