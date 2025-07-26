import { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Activity, ActivityType } from "@shared/schema";

interface ActivityListProps {
  activities: Activity[];
  activityTypes?: Record<string, ActivityType>;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activityId: string) => void;
}

export function ActivityList({
  activities,
  activityTypes = {},
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: ActivityListProps) {
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  const handleDeleteClick = (activityId: string) => {
    setActivityToDelete(activityId);
  };

  const handleConfirmDelete = () => {
    if (activityToDelete) {
      onDeleteActivity(activityToDelete);
      setActivityToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setActivityToDelete(null);
  };

  // Group activities by date for better organization
  const groupedActivities: Record<string, Activity[]> = {};

  activities.forEach((activity) => {
    const date = format(new Date(activity.startDateTime), "yyyy-MM-dd");
    if (!groupedActivities[date]) {
      groupedActivities[date] = [];
    }
    groupedActivities[date].push(activity);
  });

  // Sort activities within each group by start time
  Object.keys(groupedActivities).forEach((date) => {
    groupedActivities[date].sort((a, b) => {
      return (
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
      );
    });
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Activities</h3>
        <Button onClick={onAddActivity} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Add Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No activities yet</p>
              <Button variant="outline" onClick={onAddActivity}>
                <Plus className="mr-2 h-4 w-4" /> Add first activity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                {format(new Date(date), "EEEE, MMMM d, yyyy")}
              </h4>
              <div className="space-y-2">
                {dateActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    activityType={
                      activityTypes[activity.typeId]?.name || "Activity"
                    }
                    onEdit={() => onEditActivity(activity)}
                    onDelete={() => handleDeleteClick(activity.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={!!activityToDelete}
        onOpenChange={(open) => !open && handleCancelDelete()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this activity. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface ActivityCardProps {
  activity: Activity;
  activityType: string;
  onEdit: () => void;
  onDelete: () => void;
}

function ActivityCard({
  activity,
  activityType,
  onEdit,
  onDelete,
}: ActivityCardProps) {
  // Format times for display
  const startTime = format(new Date(activity.startDateTime), "h:mm a");
  const endTime = format(new Date(activity.endDateTime), "h:mm a");

  return (
    <Card className="relative group">
      <CardHeader className="pb-2 flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle className="text-base">{activity.title}</CardTitle>
          <CardDescription>{activityType}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash className="mr-2 h-4 w-4" /> Delete activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              {startTime} - {endTime}
            </span>
          </div>
          {activity.locationId && (
            <div className="flex items-center text-muted-foreground">
              <MapPin className="mr-2 h-4 w-4" />
              <span>Location details</span>
            </div>
          )}
          {activity.description && (
            <p className="text-sm mt-2">{activity.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
