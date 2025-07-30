&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useQuery, useMutation, useQueryClient } from &quot;@tanstack/react-query&quot;;

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import {
  AlertCircle,
  CalendarIcon,
  Loader2,
  MapPin,
  Users,
} from &quot;lucide-react&quot;;
import { format } from &quot;date-fns&quot;;
import { useToast } from &quot;@/components/ui/use-toast&quot;;
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;

// Form validation schema
const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: &quot;Event title must be at least 3 characters&quot; }),
  description: z
    .string()
    .min(10, { message: &quot;Description must be at least 10 characters&quot; }),
  locationId: z.string({ required_error: &quot;Please select a location&quot; }),
  organizationId: z.string({ required_error: &quot;Organization is required&quot; }),
  startDate: z.date({ required_error: &quot;Start date is required&quot; }),
  endDate: z.date({ required_error: &quot;End date is required&quot; }),
  startTime: z.string({ required_error: &quot;Start time is required&quot; }),
  endTime: z.string({ required_error: &quot;End time is required&quot; }),
  expectedAttendees: z.string().transform((val) => parseInt(val) || 0),
  notes: z.string().optional(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  recurringFrequency: z.string().optional(),
  numberOfOccurrences: z
    .string()
    .transform((val) => parseInt(val) || 0)
    .optional(),
});

// FormValues type from the schema
type FormValues = z.infer<typeof formSchema>;

// Props for the EventForm component
interface EventFormProps {
  event?: any; // For editing existing events
  organizationId: string | undefined; // For creating events within a specific organization
}

export default function EventForm({ event, organizationId }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [locationConflict, setLocationConflict] = useState<any>(null);
  const [isRecurring, setIsRecurring] = useState(false);

  // Initialize the form with default values or existing event data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: event
      ? {
          title: event.title,
          description: event.description || "&quot;,
          locationId: event.locationId,
          organizationId: event.organizationId,
          startDate: new Date(event.startDateTime),
          endDate: new Date(event.endDateTime),
          startTime: format(new Date(event.startDateTime), &quot;HH:mm&quot;),
          endTime: format(new Date(event.endDateTime), &quot;HH:mm&quot;),
          expectedAttendees: event.expectedAttendees?.toString() || &quot;1&quot;,
          notes: event.notes || &quot;&quot;,
          isRecurring: event.isSeriesParent || false,
          recurringPattern: event.recurringPattern || &quot;weekly&quot;,
          recurringFrequency: event.recurringFrequency || &quot;1&quot;,
          numberOfOccurrences: event.numberOfOccurrences?.toString() || &quot;4&quot;,
        }
      : {
          title: &quot;&quot;,
          description: &quot;&quot;,
          locationId: &quot;&quot;,
          organizationId: organizationId || &quot;&quot;,
          startDate: new Date(),
          endDate: new Date(),
          startTime: &quot;09:00&quot;,
          endTime: &quot;11:00&quot;,
          expectedAttendees: &quot;1&quot;,
          notes: &quot;&quot;,
          isRecurring: false,
          recurringPattern: &quot;weekly&quot;,
          recurringFrequency: &quot;1&quot;,
          numberOfOccurrences: &quot;4&quot;,
        },
  });

  // Set isRecurring state from form values
  useEffect(() => {
    setIsRecurring(form.watch(&quot;isRecurring&quot;));
  }, [form.watch(&quot;isRecurring&quot;)]);

  // Fetch organizations if needed (for users with access to multiple orgs)
  const { data: organizations = [] } = useQuery({
    queryKey: [&quot;organizations&quot;],
    queryFn: async () => {
      const response = await fetch(&quot;/api/organizations/user&quot;);
      if (!response.ok) {
        throw new Error(&quot;Failed to fetch organizations&quot;);
      }
      return await response.json();
    },
    enabled: !organizationId, // Only fetch if no organizationId is provided
  });

  // Fetch locations for the selected organization
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: [&quot;locations&quot;, form.watch(&quot;organizationId&quot;)],
    queryFn: async () => {
      const orgId = form.watch(&quot;organizationId&quot;);
      if (!orgId) return [];

      const response = await fetch(`/api/locations?organizationId=${orgId}`);
      if (!response.ok) {
        throw new Error(&quot;Failed to fetch locations&quot;);
      }
      return await response.json();
    },
    enabled: !!form.watch(&quot;organizationId&quot;),
  });

  // Create/Update event mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = event ? `/api/events/${event.id}` : &quot;/api/events&quot;;
      const method = event ? &quot;PUT&quot; : &quot;POST&quot;;

      const response = await fetch(endpoint, {
        method,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        // Handle location conflict
        const conflictData = await response.json();
        throw new Error(&quot;location_conflict&quot;, { cause: conflictData });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || &quot;Failed to save event&quot;);
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate events query to refetch
      queryClient.invalidateQueries({ queryKey: [&quot;events&quot;] });

      // Show success toast
      toast({
        title: event ? &quot;Event Updated&quot; : &quot;Event Created&quot;,
        description: event
          ? &quot;Your event has been successfully updated.&quot;
          : &quot;Your event has been successfully created.&quot;,
      });

      // Navigate back to events list
      router.push(&quot;/events&quot;);
    },
    onError: (error: any) => {
      if (error.message === &quot;location_conflict&quot; && error.cause) {
        // Set location conflict data
        setLocationConflict(error.cause);

        // Show conflict toast
        toast({
          title: &quot;Location Conflict&quot;,
          description:
            &quot;The selected location is not available for the chosen time.&quot;,
          variant: &quot;destructive&quot;,
        });

        return;
      }

      // Show error toast
      toast({
        title: &quot;Error&quot;,
        description:
          error.message || &quot;An error occurred while saving the event.&quot;,
        variant: &quot;destructive&quot;,
      });
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      // Clear any previous location conflicts
      setLocationConflict(null);

      // Combine date and time values
      const startDateTime = new Date(values.startDate);
      const [startHours, startMinutes] = values.startTime
        .split(&quot;:&quot;)
        .map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(values.endDate);
      const [endHours, endMinutes] = values.endTime.split(&quot;:&quot;).map(Number);
      endDateTime.setHours(endHours, endMinutes);

      // Prepare data for API
      const eventData = {
        title: values.title,
        description: values.description,
        locationId: values.locationId,
        organizationId: values.organizationId,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        expectedAttendees: values.expectedAttendees,
        notes: values.notes,
      };

      // Add recurring event properties if needed
      if (values.isRecurring) {
        Object.assign(eventData, {
          isSeriesParent: true,
          recurringPattern: values.recurringPattern,
          recurringFrequency: values.recurringFrequency,
          numberOfOccurrences: values.numberOfOccurrences,
        });
      }

      // Submit the data
      await mutation.mutateAsync(eventData);
    } catch (error) {
      // Error handling is done in mutation onError
      console.error(&quot;Error submitting form:&quot;, error);
    }
  }

  return (
    <Card>
      <CardContent className=&quot;pt-6&quot;>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-6&quot;>
            {/* Organization Selection - Only show if no organizationId is provided */}
            {!organizationId && (
              <FormField
                control={form.control}
                name=&quot;organizationId&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder=&quot;Select an organization&quot; />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizations.map((org: any) => (
                          <SelectItem key={org.id} value={org.id}>
                            {org.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the organization this event belongs to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Event Title */}
            <FormField
              control={form.control}
              name=&quot;title&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder=&quot;Enter event title&quot; {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your event as it will appear on the calendar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Event Description */}
            <FormField
              control={form.control}
              name=&quot;description&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=&quot;Enter event description&quot;
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about what this event entails.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Selection */}
            <FormField
              control={form.control}
              name=&quot;locationId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      isLoadingLocations || !form.watch(&quot;organizationId&quot;)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingLocations
                              ? &quot;Loading locations...&quot;
                              : !form.watch(&quot;organizationId&quot;)
                                ? &quot;Select an organization first&quot;
                                : &quot;Select a location&quot;
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className=&quot;flex items-center&quot;>
                            <MapPin className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                            <span>{location.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select where this event will take place.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Location Conflict Alert */}
            {locationConflict && (
              <Alert variant=&quot;destructive&quot;>
                <AlertCircle className=&quot;h-4 w-4&quot; />
                <AlertTitle>Location Conflict</AlertTitle>
                <AlertDescription>
                  The selected location is already booked during this time.
                  {locationConflict.conflicts &&
                    locationConflict.conflicts.length > 0 && (
                      <div className=&quot;mt-2&quot;>
                        <p className=&quot;font-semibold&quot;>Conflicting Events:</p>
                        <ul className=&quot;list-disc pl-5 mt-1&quot;>
                          {locationConflict.conflicts.map(
                            (conflict: any, index: number) => (
                              <li key={index}>
                                {conflict.title} (
                                {format(
                                  new Date(conflict.startDateTime),
                                  &quot;PPp&quot;,
                                )}{&quot; &quot;}
                                - {format(new Date(conflict.endDateTime), &quot;p&quot;)})
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}
                </AlertDescription>
              </Alert>
            )}

            {/* Date Selection */}
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
              {/* Start Date */}
              <FormField
                control={form.control}
                name=&quot;startDate&quot;
                render={({ field }) => (
                  <FormItem className=&quot;flex flex-col&quot;>
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={&quot;outline&quot;}
                            className={&quot;w-full pl-3 text-left font-normal&quot;}
                          >
                            {field.value ? (
                              format(field.value, &quot;PPP&quot;)
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className=&quot;ml-auto h-4 w-4 opacity-50&quot; />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className=&quot;w-auto p-0&quot; align=&quot;start&quot;>
                        <Calendar
                          mode=&quot;single&quot;
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name=&quot;endDate&quot;
                render={({ field }) => (
                  <FormItem className=&quot;flex flex-col&quot;>
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={&quot;outline&quot;}
                            className={&quot;w-full pl-3 text-left font-normal&quot;}
                          >
                            {field.value ? (
                              format(field.value, &quot;PPP&quot;)
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className=&quot;ml-auto h-4 w-4 opacity-50&quot; />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className=&quot;w-auto p-0&quot; align=&quot;start&quot;>
                        <Calendar
                          mode=&quot;single&quot;
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < form.getValues(&quot;startDate&quot;)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Time Selection */}
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
              {/* Start Time */}
              <FormField
                control={form.control}
                name=&quot;startTime&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type=&quot;time&quot; {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name=&quot;endTime&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type=&quot;time&quot; {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expected Attendees */}
            <FormField
              control={form.control}
              name=&quot;expectedAttendees&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Attendees</FormLabel>
                  <FormControl>
                    <Input type=&quot;number&quot; min=&quot;1&quot; {...field} />
                  </FormControl>
                  <FormDescription>
                    Estimate how many people will attend this event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name=&quot;notes&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=&quot;Any additional notes about the event&quot;
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add any special instructions or additional information.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recurring Event Option */}
            <div>
              <div className=&quot;flex items-center space-x-2 mb-3&quot;>
                <FormField
                  control={form.control}
                  name=&quot;isRecurring&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;flex flex-row items-start space-x-3 space-y-0&quot;>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className=&quot;space-y-1 leading-none&quot;>
                        <FormLabel>This is a recurring event</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {isRecurring && (
                <div className=&quot;pl-6 space-y-4&quot;>
                  {/* Recurring Pattern */}
                  <FormField
                    control={form.control}
                    name=&quot;recurringPattern&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder=&quot;Select frequency&quot; />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value=&quot;daily&quot;>Daily</SelectItem>
                            <SelectItem value=&quot;weekly&quot;>Weekly</SelectItem>
                            <SelectItem value=&quot;biweekly&quot;>Bi-weekly</SelectItem>
                            <SelectItem value=&quot;monthly&quot;>Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number of Occurrences */}
                  <FormField
                    control={form.control}
                    name=&quot;numberOfOccurrences&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Occurrences</FormLabel>
                        <FormControl>
                          <Input type=&quot;number&quot; min=&quot;1&quot; max=&quot;52&quot; {...field} />
                        </FormControl>
                        <FormDescription>
                          How many times this event will repeat (max 52).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className=&quot;flex justify-end space-x-2&quot;>
              <Button
                variant=&quot;outline&quot;
                type=&quot;button&quot;
                onClick={() => router.push(&quot;/events&quot;)}
              >
                Cancel
              </Button>
              <Button type=&quot;submit&quot; disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                )}
                {event ? &quot;Update Event&quot; : &quot;Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
