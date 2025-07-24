"use client";

import { useState } from "react";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface BookingManagementProps {
  bookingId: string;
  managers?: Array<{ id: string; name: string }>;
}

export default function BookingManagement({
  bookingId,
  managers = [],
}: BookingManagementProps) {
  const [isAssignManagerDialogOpen, setIsAssignManagerDialogOpen] =
    useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");
  const [selectedManagerId, setSelectedManagerId] = useState<string>("");
  
  const queryClient = useQueryClient();

  // Fetch booking activities (replacing event instances)
  const {
    data: activities,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["/api/bookings", bookingId, "activities"],
    retry: false,
  });

  // Assign manager mutation
  const assignManagerMutation = useMutation({
    mutationFn: async ({ activityId, managerId }: { activityId: string; managerId: string }) => {
      await apiRequest(`/api/bookings/${bookingId}/activities/${activityId}/assign-manager`, {
        method: "POST",
        body: { managerId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings", bookingId, "activities"] });
    },
  });

  // Handle manager assignment
  const handleAssignManager = (activityId: string) => {
    setSelectedActivityId(activityId);
    setSelectedManagerId("");
    setIsAssignManagerDialogOpen(true);
  };

  // Submit manager assignment
  const submitManagerAssignment = async () => {
    if (!selectedActivityId || !selectedManagerId) return;

    try {
      await assignManagerMutation.mutateAsync({
        activityId: selectedActivityId,
        managerId: selectedManagerId,
      });

      setIsAssignManagerDialogOpen(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  // Get selected activity for display in dialog
  const getSelectedActivity = () => {
    return activities?.find((activity: any) => activity.id === selectedActivityId);
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl font-bold">Booking Activity Management</CardTitle>
          <CardDescription>
            Manage the activities for this booking
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
              Error loading activities:{" "}
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className="p-6 text-center border rounded-md bg-muted/30">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Activities Found</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              There are no activities for this booking yet.
            </p>
            <Button>Add Activity</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity: any) => (
              <Card key={activity.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="font-medium">{activity.name || "Activity"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {activity.description || "No description"}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Status: {activity.status || "Pending"}</span>
                        {activity.assignedManagerId && (
                          <span>Manager: {activity.assignedManagerName || "Assigned"}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignManager(activity.id)}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        {activity.assignedManagerId ? "Reassign" : "Assign"} Manager
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
                Assigning a field manager for activity:
              </p>
              <p className="font-medium">
                {getSelectedActivity()?.name || "Selected Activity"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manager-select">Select Manager</Label>
              <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a field manager" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignManagerDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={submitManagerAssignment}
              disabled={
                !selectedManagerId ||
                assignManagerMutation.isPending
              }
            >
              {assignManagerMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Assign Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}