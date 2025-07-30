import { useState, useEffect } from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { format } from &quot;date-fns&quot;;
import { CalendarIcon, Clock, MapPin, Plus, X } from &quot;lucide-react&quot;;

import { Button } from &quot;@/components/ui/button&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import {
  insertActivitySchema,
  InsertActivity,
  DEFAULT_ACTIVITY_TYPES,
} from &quot;@shared/schema&quot;;

// Extend the insert schema with additional validation
const activityFormSchema = insertActivitySchema.extend({
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  // Ensure dates are valid Date objects
  date: z.date({
    required_error: &quot;A date is required&quot;,
  }),
});

// Define the type for our form values
type ActivityFormValues = z.infer<typeof activityFormSchema>;

// Props for the ActivityForm component
interface ActivityFormProps {
  eventId: string; // ID of the event this activity belongs to
  locationId?: string; // Optional default location ID
  activityTypes?: Array<{ id: string; name: string; description?: string }>;
  onSave: (activity: InsertActivity) => void;
  onCancel: () => void;
}

export function ActivityForm({
  eventId,
  locationId,
  activityTypes = [],
  onSave,
  onCancel,
}: ActivityFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: "&quot;,
      description: &quot;&quot;,
      eventId,
      locationId: locationId || &quot;&quot;,
      typeId: &quot;&quot;,
      startTime: &quot;09:00&quot;,
      endTime: &quot;17:00&quot;,
      date: new Date(),
    },
  });

  // Handle form submission
  const onSubmit = async (values: ActivityFormValues) => {
    try {
      setIsSubmitting(true);

      // Convert date and time to startDateTime and endDateTime
      const { date, startTime, endTime, ...rest } = values;

      // Create ISO date strings
      const dateStr = format(date, &quot;yyyy-MM-dd&quot;);
      const startDateTimeStr = `${dateStr}T${startTime || &quot;00:00&quot;}:00`;
      const endDateTimeStr = `${dateStr}T${endTime || &quot;23:59&quot;}:00`;

      // Create the activity data to save
      const activityData: InsertActivity = {
        ...rest,
        startDateTime: new Date(startDateTimeStr),
        endDateTime: new Date(endDateTimeStr),
      };

      onSave(activityData);
    } catch (error) {
      console.error(&quot;Error saving activity:&quot;, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className=&quot;w-full&quot;>
      <CardHeader>
        <CardTitle>Add Activity</CardTitle>
        <CardDescription>Create a new activity for this event</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-6&quot;>
            {/* Activity Title */}
            <FormField
              control={form.control}
              name=&quot;title&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Title</FormLabel>
                  <FormControl>
                    <Input placeholder=&quot;Enter activity title&quot; {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Activity Type */}
            <FormField
              control={form.control}
              name=&quot;typeId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select activity type&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activityTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
              {/* Date */}
              <FormField
                control={form.control}
                name=&quot;date&quot;
                render={({ field }) => (
                  <FormItem className=&quot;flex flex-col&quot;>
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={&quot;outline&quot;}
                            className={cn(
                              &quot;w-full pl-3 text-left font-normal&quot;,
                              !field.value && &quot;text-muted-foreground&quot;,
                            )}
                          >
                            <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
                            {field.value ? (
                              format(field.value, &quot;PPP&quot;)
                            ) : (
                              <span>Pick a date</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className=&quot;w-auto p-0&quot; align=&quot;start&quot;>
                        <Calendar
                          mode=&quot;single&quot;
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time range */}
              <div className=&quot;flex items-center space-x-2&quot;>
                <FormField
                  control={form.control}
                  name=&quot;startTime&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;flex-1&quot;>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type=&quot;time&quot; {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className=&quot;mt-8&quot;>-</span>
                <FormField
                  control={form.control}
                  name=&quot;endTime&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;flex-1&quot;>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type=&quot;time&quot; {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Location - Show this if needed */}
            {!locationId && (
              <FormField
                control={form.control}
                name=&quot;locationId&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder=&quot;Select location&quot; />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Location options would go here */}
                        <SelectItem value=&quot;location-1&quot;>Location 1</SelectItem>
                        <SelectItem value=&quot;location-2&quot;>Location 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Description */}
            <FormField
              control={form.control}
              name=&quot;description&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=&quot;Enter activity details&quot;
                      {...field}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit and Cancel Buttons */}
            <div className=&quot;flex justify-end space-x-2&quot;>
              <Button
                type=&quot;button&quot;
                variant=&quot;outline&quot;
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type=&quot;submit&quot; disabled={isSubmitting}>
                {isSubmitting ? &quot;Saving...&quot; : &quot;Save Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
