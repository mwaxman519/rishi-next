"use client";

import { useState } from "react";
import EventInstancesList from "../events/EventInstancesList";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, RefreshCw, Calendar, UserCog } from "lucide-react";
import {
  useEventInstances,
  useAssignEventManager,
  EventInstance,
} from "@/hooks/use-event-instances";

interface EventManagementProps {
  bookingId: string;
  managers?: Array<{ id: string; name: string }>;
}

export default function EventManagement({
  bookingId,
  managers = [],
}: EventManagementProps) {
  const [isAssignManagerDialogOpen, setIsAssignManagerDialogOpen] =
    useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");

  // Fetch event instances
  const {
    data: events,
    isLoading,
    isError,
    error,
    refetch,
  } = useEventInstances(bookingId);

  // Assign manager mutation
  const assignManagerMutation = useAssignEventManager();

  // Handle manager assignment
  const handleAssignManager = (eventId: string) => {
    setSelectedEventId(eventId);
    setSelectedManagerId("");
    setIsAssignManagerDialogOpen(true);
  };

  // Submit manager assignment
  const submitManagerAssignment = async () => {
    if (!selectedEventId || !selectedManagerId) return;

    try {
      await assignManagerMutation.mutateAsync({
        eventId: selectedEventId,
        managerId: selectedManagerId,
      });

      setIsAssignManagerDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  // Get selected event for display in dialog
  const getSelectedEvent = (): EventInstance | undefined => {
    return events?.find((event: EventInstance) => event.id === selectedEventId);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Event Management</CardTitle>
          <CardDescription>
            Manage the events generated from this booking
          </CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-1" />
          )}
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-2">
              Error loading events:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : events?.length === 0 ? (
          <div className="p-6 text-center border rounded-md bg-muted/30">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Events Found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              There are no event instances generated for this booking yet.
            </p>
            <Button>Generate Events</Button>
          </div>
        ) : (
          <EventInstancesList
            bookingId={bookingId}
            events={events || []}
            onAssignManager={handleAssignManager}
            onViewDetails={(eventId: string) =>
              console.log("View details:", eventId)
            }
          />
        )}
      </CardContent>

      {/* Manager Assignment Dialog */}
      <Dialog
        open={isAssignManagerDialogOpen}
        onOpenChange={setIsAssignManagerDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Field Manager</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Assigning a field manager for event on:
              </p>
              <p className="font-medium">
                {getSelectedEvent()?.date &&
                  new Date(getSelectedEvent()?.date!).toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    },
                  )}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-select">Select Field Manager</Label>
              <Select
                value={selectedManagerId}
                onValueChange={setSelectedManagerId}
              >
                <SelectTrigger id="manager-select" className="w-full">
                  <SelectValue placeholder="Select a manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.length === 0 ? (
                    <SelectItem value="no-managers" disabled>
                      No managers available
                    </SelectItem>
                  ) : (
                    managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignManagerDialogOpen(false)}
              disabled={assignManagerMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={submitManagerAssignment}
              disabled={assignManagerMutation.isPending || !selectedManagerId}
            >
              {assignManagerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <UserCog className="mr-2 h-4 w-4" />
                  Assign Manager
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
