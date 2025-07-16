"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BookingApprovalProps {
  booking: {
    id: string;
    title: string;
    clientName: string;
    location?: string;
    startDate: string;
    endDate: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
    staffCount?: number;
    specialRequirements?: string;
  };
  onApproved: () => void;
  onRejected: () => void;
}

export default function BookingApproval({
  booking,
  onApproved,
  onRejected,
}: BookingApprovalProps) {
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [generateEvents, setGenerateEvents] = useState(true);

  // Format dates for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle booking approval
  const handleApprove = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/bookings/${booking.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          generateEvents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to approve booking");
      }

      toast({
        title: "Booking Approved",
        description: "The booking has been approved successfully.",
        variant: "default",
      });

      setIsApproveDialogOpen(false);
      onApproved();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description:
          error.message || "No error details available",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking rejection
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this booking.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/bookings/${booking.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reject booking");
      }

      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected successfully.",
        variant: "default",
      });

      setIsRejectDialogOpen(false);
      onRejected();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description:
          error.message || "No error details available",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
          Booking Approval Required
        </CardTitle>
        <CardDescription>
          This booking is pending approval. Review the details and approve or
          reject the request.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-4 pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
              <Calendar className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date Range</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(booking.startDate)} to{" "}
                  {formatDate(booking.endDate)}
                </p>
              </div>
            </div>

            {booking.recurrencePattern && (
              <div className="flex items-start">
                <Clock className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Recurrence</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.recurrencePattern}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start">
              <MapPin className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {booking.location || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <Users className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Staff Count</p>
                <p className="text-sm text-muted-foreground">
                  {booking.staffCount || 1} staff member(s)
                </p>
              </div>
            </div>

            {booking.specialRequirements && (
              <div className="flex items-start">
                <CheckCircle2 className="h-4 w-4 mt-1 mr-2 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Special Requirements</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.specialRequirements}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end gap-2 mt-4 pt-4 border-t">
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Booking</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this booking. This will be
                communicated to the client.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <Label htmlFor="rejection-reason" className="mb-2 block">
                Rejection Reason
              </Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejecting this booking..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-24"
              />
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={isApproveDialogOpen}
          onOpenChange={setIsApproveDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="default">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking Approval</DialogTitle>
              <DialogDescription>
                Are you sure you want to approve this booking? This will confirm
                the booking with the client.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center justify-between space-x-2">
                <Label
                  htmlFor="generate-events"
                  className="flex flex-col space-y-1 cursor-pointer"
                >
                  <span>Generate Event Instances</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Automatically create events for this booking based on its
                    schedule
                  </span>
                </Label>
                <Switch
                  id="generate-events"
                  checked={generateEvents}
                  onCheckedChange={setGenerateEvents}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIsApproveDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Booking
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
