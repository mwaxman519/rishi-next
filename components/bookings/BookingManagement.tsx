&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from &quot;@/components/ui/dialog&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Loader2, RefreshCw, Calendar, UserCog } from &quot;lucide-react&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;
import { apiRequest } from &quot;@/lib/queryClient&quot;;

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
  const [selectedActivityId, setSelectedActivityId] = useState<string>("&quot;);
  const [selectedManagerId, setSelectedManagerId] = useState<string>(&quot;&quot;);
  
  const queryClient = useQueryClient();

  // Fetch booking activities (replacing event instances)
  const {
    data: activities,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [&quot;/api/bookings&quot;, bookingId, &quot;activities&quot;],
    retry: false,
  });

  // Assign manager mutation
  const assignManagerMutation = useMutation({
    mutationFn: async ({ activityId, managerId }: { activityId: string; managerId: string }) => {
      await apiRequest(`/api/bookings/${bookingId}/activities/${activityId}/assign-manager`, {
        method: &quot;POST&quot;,
        body: { managerId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [&quot;/api/bookings&quot;, bookingId, &quot;activities&quot;] });
    },
  });

  // Handle manager assignment
  const handleAssignManager = (activityId: string) => {
    setSelectedActivityId(activityId);
    setSelectedManagerId(&quot;&quot;);
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
    <Card className=&quot;w-full&quot;>
      <CardHeader className=&quot;flex flex-row items-center justify-between pb-2&quot;>
        <div>
          <CardTitle className=&quot;text-xl font-bold&quot;>Booking Activity Management</CardTitle>
          <CardDescription>
            Manage the activities for this booking
          </CardDescription>
        </div>
        <Button
          variant=&quot;outline&quot;
          size=&quot;sm&quot;
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className=&quot;h-4 w-4 mr-1 animate-spin&quot; />
          ) : (
            <RefreshCw className=&quot;h-4 w-4 mr-1&quot; />
          )}
          Refresh
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className=&quot;space-y-3&quot;>
            <Skeleton className=&quot;h-10 w-full&quot; />
            <Skeleton className=&quot;h-64 w-full&quot; />
          </div>
        ) : isError ? (
          <div className=&quot;p-6 text-center&quot;>
            <p className=&quot;text-red-500 mb-2&quot;>
              Error loading activities:{&quot; &quot;}
              {error instanceof Error ? error.message : &quot;Unknown error&quot;}
            </p>
            <Button variant=&quot;outline&quot; onClick={() => refetch()}>
              Try Again
            </Button>
          </div>
        ) : !activities || activities.length === 0 ? (
          <div className=&quot;p-6 text-center border rounded-md bg-muted/30&quot;>
            <Calendar className=&quot;h-12 w-12 mx-auto text-muted-foreground mb-2&quot; />
            <h3 className=&quot;text-lg font-medium&quot;>No Activities Found</h3>
            <p className=&quot;text-muted-foreground mt-1 mb-4&quot;>
              There are no activities for this booking yet.
            </p>
            <Button>Add Activity</Button>
          </div>
        ) : (
          <div className=&quot;space-y-4&quot;>
            {activities.map((activity: any) => (
              <Card key={activity.id} className=&quot;border-l-4 border-l-blue-500&quot;>
                <CardContent className=&quot;pt-4&quot;>
                  <div className=&quot;flex justify-between items-start&quot;>
                    <div className=&quot;space-y-1&quot;>
                      <h4 className=&quot;font-medium&quot;>{activity.name || &quot;Activity&quot;}</h4>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {activity.description || &quot;No description&quot;}
                      </p>
                      <div className=&quot;flex gap-4 text-sm text-muted-foreground&quot;>
                        <span>Status: {activity.status || &quot;Pending&quot;}</span>
                        {activity.assignedManagerId && (
                          <span>Manager: {activity.assignedManagerName || &quot;Assigned&quot;}</span>
                        )}
                      </div>
                    </div>
                    <div className=&quot;flex gap-2&quot;>
                      <Button
                        variant=&quot;outline&quot;
                        size=&quot;sm&quot;
                        onClick={() => handleAssignManager(activity.id)}
                      >
                        <UserCog className=&quot;h-4 w-4 mr-1&quot; />
                        {activity.assignedManagerId ? &quot;Reassign&quot; : &quot;Assign&quot;} Manager
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

          <div className=&quot;py-4 space-y-4&quot;>
            <div>
              <p className=&quot;text-sm text-muted-foreground mb-2&quot;>
                Assigning a field manager for activity:
              </p>
              <p className=&quot;font-medium&quot;>
                {getSelectedActivity()?.name || &quot;Selected Activity&quot;}
              </p>
            </div>

            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;manager-select&quot;>Select Manager</Label>
              <Select value={selectedManagerId} onValueChange={setSelectedManagerId}>
                <SelectTrigger>
                  <SelectValue placeholder=&quot;Choose a field manager&quot; />
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
              variant=&quot;outline&quot;
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
                <Loader2 className=&quot;h-4 w-4 mr-1 animate-spin" />
              ) : null}
              Assign Manager
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}