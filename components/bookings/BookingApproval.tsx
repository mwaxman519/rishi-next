&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from &quot;@/components/ui/dialog&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  AlertTriangle,
  Loader2,
} from &quot;lucide-react&quot;;
import { toast } from &quot;@/hooks/use-toast&quot;;

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
  const [rejectionReason, setRejectionReason] = useState("&quot;);
  const [generateEvents, setGenerateEvents] = useState(true);

  // Format dates for display
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(&quot;en-US&quot;, {
      weekday: &quot;long&quot;,
      year: &quot;numeric&quot;,
      month: &quot;long&quot;,
      day: &quot;numeric&quot;,
    });
  };

  // Handle booking approval
  const handleApprove = async () => {
    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/bookings/${booking.id}/approve`, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          generateEvents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || &quot;Failed to approve booking&quot;);
      }

      toast({
        title: &quot;Booking Approved&quot;,
        description: &quot;The booking has been approved successfully.&quot;,
        variant: &quot;default&quot;,
      });

      setIsApproveDialogOpen(false);
      onApproved();
    } catch (error: any) {
      toast({
        title: &quot;Approval Failed&quot;,
        description:
          error.message || &quot;An error occurred while approving the booking.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle booking rejection
  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: &quot;Rejection Reason Required&quot;,
        description: &quot;Please provide a reason for rejecting this booking.&quot;,
        variant: &quot;destructive&quot;,
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/bookings/${booking.id}/reject`, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify({
          reason: rejectionReason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || &quot;Failed to reject booking&quot;);
      }

      toast({
        title: &quot;Booking Rejected&quot;,
        description: &quot;The booking has been rejected successfully.&quot;,
        variant: &quot;default&quot;,
      });

      setIsRejectDialogOpen(false);
      onRejected();
    } catch (error: any) {
      toast({
        title: &quot;Rejection Failed&quot;,
        description:
          error.message || &quot;An error occurred while rejecting the booking.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className=&quot;border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50&quot;>
      <CardHeader className=&quot;pb-2&quot;>
        <CardTitle className=&quot;text-lg font-semibold flex items-center&quot;>
          <AlertTriangle className=&quot;h-5 w-5 mr-2 text-amber-500&quot; />
          Booking Approval Required
        </CardTitle>
        <CardDescription>
          This booking is pending approval. Review the details and approve or
          reject the request.
        </CardDescription>
      </CardHeader>

      <CardContent className=&quot;pt-4 pb-0&quot;>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
          <div className=&quot;space-y-3&quot;>
            <div className=&quot;flex items-start&quot;>
              <Calendar className=&quot;h-4 w-4 mt-1 mr-2 text-muted-foreground&quot; />
              <div>
                <p className=&quot;text-sm font-medium&quot;>Date Range</p>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  {formatDate(booking.startDate)} to{&quot; &quot;}
                  {formatDate(booking.endDate)}
                </p>
              </div>
            </div>

            {booking.recurrencePattern && (
              <div className=&quot;flex items-start&quot;>
                <Clock className=&quot;h-4 w-4 mt-1 mr-2 text-muted-foreground&quot; />
                <div>
                  <p className=&quot;text-sm font-medium&quot;>Recurrence</p>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    {booking.recurrencePattern}
                  </p>
                </div>
              </div>
            )}

            <div className=&quot;flex items-start&quot;>
              <MapPin className=&quot;h-4 w-4 mt-1 mr-2 text-muted-foreground&quot; />
              <div>
                <p className=&quot;text-sm font-medium&quot;>Location</p>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  {booking.location || &quot;Not specified&quot;}
                </p>
              </div>
            </div>
          </div>

          <div className=&quot;space-y-3&quot;>
            <div className=&quot;flex items-start&quot;>
              <Users className=&quot;h-4 w-4 mt-1 mr-2 text-muted-foreground&quot; />
              <div>
                <p className=&quot;text-sm font-medium&quot;>Staff Count</p>
                <p className=&quot;text-sm text-muted-foreground&quot;>
                  {booking.staffCount || 1} staff member(s)
                </p>
              </div>
            </div>

            {booking.specialRequirements && (
              <div className=&quot;flex items-start&quot;>
                <CheckCircle2 className=&quot;h-4 w-4 mt-1 mr-2 text-muted-foreground&quot; />
                <div>
                  <p className=&quot;text-sm font-medium&quot;>Special Requirements</p>
                  <p className=&quot;text-sm text-muted-foreground&quot;>
                    {booking.specialRequirements}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className=&quot;flex justify-end gap-2 mt-4 pt-4 border-t&quot;>
        <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant=&quot;outline&quot;
              className=&quot;text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600&quot;
            >
              <XCircle className=&quot;h-4 w-4 mr-2&quot; />
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

            <div className=&quot;py-4&quot;>
              <Label htmlFor=&quot;rejection-reason&quot; className=&quot;mb-2 block&quot;>
                Rejection Reason
              </Label>
              <Textarea
                id=&quot;rejection-reason&quot;
                placeholder=&quot;Enter the reason for rejecting this booking...&quot;
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className=&quot;min-h-24&quot;
              />
            </div>

            <DialogFooter>
              <Button
                variant=&quot;ghost&quot;
                onClick={() => setIsRejectDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant=&quot;destructive&quot;
                onClick={handleReject}
                disabled={isSubmitting || !rejectionReason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className=&quot;mr-2 h-4 w-4&quot; />
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
            <Button variant=&quot;default&quot;>
              <CheckCircle2 className=&quot;h-4 w-4 mr-2&quot; />
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

            <div className=&quot;py-4&quot;>
              <div className=&quot;flex items-center justify-between space-x-2&quot;>
                <Label
                  htmlFor=&quot;generate-events&quot;
                  className=&quot;flex flex-col space-y-1 cursor-pointer&quot;
                >
                  <span>Generate Event Instances</span>
                  <span className=&quot;font-normal text-xs text-muted-foreground&quot;>
                    Automatically create events for this booking based on its
                    schedule
                  </span>
                </Label>
                <Switch
                  id=&quot;generate-events&quot;
                  checked={generateEvents}
                  onCheckedChange={setGenerateEvents}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant=&quot;ghost&quot;
                onClick={() => setIsApproveDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant=&quot;default&quot;
                onClick={handleApprove}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className=&quot;mr-2 h-4 w-4" />
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
