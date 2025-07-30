import { useState } from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import {
  Calendar,
  Clock,
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
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
} from &quot;@/components/ui/alert-dialog&quot;;
import { Activity, ActivityType } from &quot;@shared/schema&quot;;

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
    const date = format(new Date(activity.startDateTime), &quot;yyyy-MM-dd&quot;);
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
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex justify-between items-center&quot;>
        <h3 className=&quot;text-lg font-semibold&quot;>Activities</h3>
        <Button onClick={onAddActivity} size=&quot;sm&quot;>
          <Plus className=&quot;mr-2 h-4 w-4&quot; /> Add Activity
        </Button>
      </div>

      {activities.length === 0 ? (
        <Card className=&quot;border-dashed&quot;>
          <CardContent className=&quot;pt-6 text-center&quot;>
            <div className=&quot;flex flex-col items-center space-y-2&quot;>
              <Calendar className=&quot;h-10 w-10 text-muted-foreground&quot; />
              <p className=&quot;text-sm text-muted-foreground&quot;>No activities yet</p>
              <Button variant=&quot;outline&quot; onClick={onAddActivity}>
                <Plus className=&quot;mr-2 h-4 w-4&quot; /> Add first activity
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className=&quot;space-y-6&quot;>
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date} className=&quot;space-y-2&quot;>
              <h4 className=&quot;text-sm font-medium text-muted-foreground&quot;>
                {format(new Date(date), &quot;EEEE, MMMM d, yyyy&quot;)}
              </h4>
              <div className=&quot;space-y-2&quot;>
                {dateActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    activity={activity}
                    activityType={
                      activityTypes[activity.typeId]?.name || &quot;Activity&quot;
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
              className=&quot;bg-destructive text-destructive-foreground&quot;
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
  const startTime = format(new Date(activity.startDateTime), &quot;h:mm a&quot;);
  const endTime = format(new Date(activity.endDateTime), &quot;h:mm a&quot;);

  return (
    <Card className=&quot;relative group&quot;>
      <CardHeader className=&quot;pb-2 flex flex-row justify-between items-start space-y-0&quot;>
        <div>
          <CardTitle className=&quot;text-base&quot;>{activity.title}</CardTitle>
          <CardDescription>{activityType}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant=&quot;ghost&quot; className=&quot;h-8 w-8 p-0&quot;>
              <MoreHorizontal className=&quot;h-4 w-4&quot; />
              <span className=&quot;sr-only&quot;>Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align=&quot;end&quot;>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onEdit}>
              <Edit className=&quot;mr-2 h-4 w-4&quot; /> Edit activity
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className=&quot;text-destructive&quot;>
              <Trash className=&quot;mr-2 h-4 w-4&quot; /> Delete activity
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className=&quot;space-y-2 text-sm&quot;>
          <div className=&quot;flex items-center text-muted-foreground&quot;>
            <Clock className=&quot;mr-2 h-4 w-4&quot; />
            <span>
              {startTime} - {endTime}
            </span>
          </div>
          {activity.locationId && (
            <div className=&quot;flex items-center text-muted-foreground&quot;>
              <MapPin className=&quot;mr-2 h-4 w-4&quot; />
              <span>Location details</span>
            </div>
          )}
          {activity.description && (
            <p className=&quot;text-sm mt-2&quot;>{activity.description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
