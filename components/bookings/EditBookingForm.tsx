&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import * as z from &quot;zod&quot;;
import { addHours, format, parse } from &quot;date-fns&quot;;
import { CalendarIcon } from &quot;lucide-react&quot;;
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
import { Button } from &quot;@/components/ui/button&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import LocationSelector from &quot;@/components/locations/LocationSelector&quot;;
// TimeRangePicker is imported but not used, using native time inputs instead

// Data will be fetched from database via API

// Activity types
const activityTypes = [
  { id: &quot;event&quot;, name: &quot;Event&quot; },
  { id: &quot;merchandising&quot;, name: &quot;Merchandising&quot; },
  { id: &quot;secret_shopping&quot;, name: &quot;Secret Shopping&quot; },
  { id: &quot;training&quot;, name: &quot;Training&quot; },
  { id: &quot;logistics&quot;, name: &quot;Logistics&quot; },
  { id: &quot;other&quot;, name: &quot;Other&quot; },
];

// Promotion types
const promotionTypes = [
  { id: &quot;product_launch&quot;, name: &quot;Product Launch&quot; },
  { id: &quot;seasonal&quot;, name: &quot;Seasonal Campaign&quot; },
  { id: &quot;discount&quot;, name: &quot;Discount Promotion&quot; },
  { id: &quot;brand_awareness&quot;, name: &quot;Brand Awareness&quot; },
  { id: &quot;sampling&quot;, name: &quot;Product Sampling&quot; },
  { id: &quot;demonstration&quot;, name: &quot;Product Demonstration&quot; },
];

// Priority levels
const priorityLevels = [
  { id: &quot;low&quot;, name: &quot;Low&quot; },
  { id: &quot;medium&quot;, name: &quot;Medium&quot; },
  { id: &quot;high&quot;, name: &quot;High&quot; },
  { id: &quot;urgent&quot;, name: &quot;Urgent&quot; },
];

// Form validation schema
const formSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: &quot;Title must be at least 3 characters long&quot; }),
    description: z.string().optional(),
    activityType: z.string(),
    locationId: z.string().min(1, { message: &quot;Please select a location&quot; }),
    startDate: z.date(),
    endDate: z.date(),
    allDay: z.boolean().default(false),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    priority: z.string(),
    budget: z.number().min(0).optional(),
    promotionType: z.string().optional(),
    kitTemplateId: z.string().optional(),
    requiredStaffCount: z.number().int().min(0).default(0),
    specialInstructions: z.string().optional(),
  })
  .refine(
    (data) => {
      // If not all day, require start and end times
      if (!data.allDay) {
        return data.startTime && data.endTime;
      }
      return true;
    },
    {
      message: &quot;Start and end times are required when not an all-day event&quot;,
      path: [&quot;startTime&quot;],
    },
  )
  .refine(
    (data) => {
      // For events, require promotion type
      if (data.activityType === &quot;event&quot;) {
        return !!data.promotionType;
      }
      return true;
    },
    {
      message: &quot;Promotion type is required for events&quot;,
      path: [&quot;promotionType&quot;],
    },
  );

type FormValues = z.infer<typeof formSchema>;

interface EditBookingFormProps {
  id: string;
}

export default function EditBookingForm({ id }: EditBookingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>(null);
  const [kitTemplates, setKitTemplates] = useState<any[]>([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch kit templates
        const kitResponse = await fetch('/api/kit-templates');
        if (kitResponse.ok) {
          const kitData = await kitResponse.json();
          setKitTemplates(kitData.data || []);
        }
        
        // Fetch booking details if editing
        if (id && id !== &quot;new&quot;) {
          const bookingResponse = await fetch(`/api/bookings/${id}`);
          if (bookingResponse.ok) {
            const bookingData = await bookingResponse.json();
            setInitialData(bookingData.data);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Create form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "&quot;,
      description: &quot;&quot;,
      activityType: &quot;&quot;,
      locationId: &quot;&quot;,
      startDate: new Date(),
      endDate: new Date(),
      allDay: false,
      startTime: &quot;09:00&quot;,
      endTime: &quot;17:00&quot;,
      priority: &quot;medium&quot;,
      budget: 0,
      promotionType: &quot;&quot;,
      kitTemplateId: &quot;&quot;,
      requiredStaffCount: 1,
      specialInstructions: &quot;&quot;,
    },
  });

  // Set form values when initial data is loaded
  useEffect(() => {
    if (initialData) {
      const startTime = initialData.startDate
        ? format(initialData.startDate, &quot;HH:mm&quot;)
        : &quot;09:00&quot;;
      const endTime = initialData.endDate
        ? format(initialData.endDate, &quot;HH:mm&quot;)
        : &quot;17:00&quot;;

      form.reset({
        title: initialData.title,
        description: initialData.description || &quot;&quot;,
        activityType: initialData.activityType,
        locationId: initialData.location.id,
        startDate: initialData.startDate,
        endDate: initialData.endDate,
        allDay: initialData.allDay,
        startTime,
        endTime,
        priority: initialData.priority,
        budget: initialData.budget,
        promotionType: initialData.promotionType || undefined,
        kitTemplateId: initialData.kitTemplateId,
        requiredStaffCount: initialData.requiredStaffCount,
        specialInstructions: initialData.specialInstructions || &quot;&quot;,
      });
    }
  }, [initialData, form]);

  // Watch form values for conditional rendering
  const activityType = form.watch(&quot;activityType&quot;);
  const allDay = form.watch(&quot;allDay&quot;);
  const startDate = form.watch(&quot;startDate&quot;);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      // Prepare the data - combine dates and times
      const formattedData = {
        ...values,
      };

      if (!allDay && values.startTime && values.endTime) {
        // Parse times and combine with dates
        const [startHourStr, startMinuteStr] = values.startTime.split(&quot;:&quot;);
        const [endHourStr, endMinuteStr] = values.endTime.split(&quot;:&quot;);

        // Make sure we have valid numbers before using them
        const startHours = startHourStr ? parseInt(startHourStr, 10) : 0;
        const startMinutes = startMinuteStr ? parseInt(startMinuteStr, 10) : 0;
        const endHours = endHourStr ? parseInt(endHourStr, 10) : 0;
        const endMinutes = endMinuteStr ? parseInt(endMinuteStr, 10) : 0;

        const startDateTime = new Date(values.startDate);
        startDateTime.setHours(startHours, startMinutes, 0);

        const endDateTime = new Date(values.endDate);
        endDateTime.setHours(endHours, endMinutes, 0);

        formattedData.startDate = startDateTime;
        formattedData.endDate = endDateTime;
      } else {
        // For all-day events, set standard times
        const startDateTime = new Date(values.startDate);
        startDateTime.setHours(0, 0, 0, 0);

        const endDateTime = new Date(values.endDate);
        endDateTime.setHours(23, 59, 59, 999);

        formattedData.startDate = startDateTime;
        formattedData.endDate = endDateTime;
      }

      // Remove unused fields before sending to API
      delete formattedData.startTime;
      delete formattedData.endTime;

      // Send data to API
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (response.ok) {
        toast({
          title: &quot;Booking updated&quot;,
          description: &quot;The booking has been successfully updated.&quot;,
        });

        // Redirect to booking detail page
        router.push(`/bookings/${id}`);
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      console.error(&quot;Error updating activity:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to update the activity. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel/back
  const handleCancel = () => {
    router.push(`/bookings/${id}`);
  };

  // Loading state
  if (!initialData) {
    return (
      <div className=&quot;flex justify-center py-10&quot;>
        <p>Loading booking details...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=&quot;space-y-8 max-w-3xl&quot;
      >
        <div className=&quot;space-y-6&quot;>
          <div>
            <h2 className=&quot;text-xl font-semibold tracking-tight&quot;>
              Basic Information
            </h2>
            <p className=&quot;text-muted-foreground text-sm mt-1&quot;>
              General details about the activity
            </p>
          </div>

          <FormField
            control={form.control}
            name=&quot;title&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Title</FormLabel>
                <FormControl>
                  <Input placeholder=&quot;Enter a descriptive title&quot; {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name=&quot;description&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder=&quot;Describe the purpose and details of this activity&quot;
                    className=&quot;min-h-[120px]&quot;
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
            <FormField
              control={form.control}
              name=&quot;activityType&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || &quot;&quot;}
                    value={field.value || &quot;&quot;}
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

            <FormField
              control={form.control}
              name=&quot;priority&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || &quot;&quot;}
                    value={field.value || &quot;&quot;}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select priority level&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityLevels.map((level) => (
                        <SelectItem key={level.id} value={level.id}>
                          {level.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Location selection */}
        <div className=&quot;space-y-6&quot;>
          <div>
            <h2 className=&quot;text-xl font-semibold tracking-tight&quot;>Location</h2>
            <p className=&quot;text-muted-foreground text-sm mt-1&quot;>
              Where this activity will take place
            </p>
          </div>

          <FormField
            control={form.control}
            name=&quot;locationId&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className=&quot;space-y-2&quot;>
                    <LocationSelector
                      selectedLocationId={field.value}
                      onLocationChange={(id: string) => field.onChange(id)}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Search and select from existing locations
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Date and time selection */}
        <div className=&quot;space-y-6&quot;>
          <div>
            <h2 className=&quot;text-xl font-semibold tracking-tight&quot;>Schedule</h2>
            <p className=&quot;text-muted-foreground text-sm mt-1&quot;>
              When this activity will take place
            </p>
          </div>

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
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
                          variant=&quot;outline&quot;
                          className=&quot;w-full pl-3 text-left font-normal&quot;
                        >
                          {field.value ? (
                            format(field.value, &quot;MMMM d, yyyy&quot;)
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
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);

                            // If end date is before start date, update it
                            const endDate = form.getValues(&quot;endDate&quot;);
                            if (endDate < date) {
                              form.setValue(&quot;endDate&quot;, date);
                            }
                          }
                        }}
                        disabled={(date) => date < new Date(&quot;1900-01-01&quot;)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          variant=&quot;outline&quot;
                          className=&quot;w-full pl-3 text-left font-normal&quot;
                        >
                          {field.value ? (
                            format(field.value, &quot;MMMM d, yyyy&quot;)
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
                        onSelect={(date) => date && field.onChange(date)}
                        disabled={(date) =>
                          date < startDate || date < new Date(&quot;1900-01-01&quot;)
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

          <FormField
            control={form.control}
            name=&quot;allDay&quot;
            render={({ field }) => (
              <FormItem className=&quot;flex flex-row items-center justify-between rounded-lg border p-4&quot;>
                <div className=&quot;space-y-0.5&quot;>
                  <FormLabel className=&quot;text-base&quot;>All-day Event</FormLabel>
                  <FormDescription>
                    Toggle if this activity runs for the entire day(s)
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {!allDay && (
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
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
          )}
        </div>

        <Separator />

        {/* Activity-specific fields */}
        <div className=&quot;space-y-6&quot;>
          <div>
            <h2 className=&quot;text-xl font-semibold tracking-tight&quot;>
              Activity Details
            </h2>
            <p className=&quot;text-muted-foreground text-sm mt-1&quot;>
              Specific information for this activity type
            </p>
          </div>

          {activityType === &quot;event&quot; && (
            <FormField
              control={form.control}
              name=&quot;promotionType&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || &quot;&quot;}
                    value={field.value || &quot;&quot;}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select promotion type&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {promotionTypes.map((type) => (
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
          )}

          <FormField
            control={form.control}
            name=&quot;kitTemplateId&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kit Template</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || &quot;&quot;}
                  value={field.value || &quot;&quot;}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;Select a kit template&quot; />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value=&quot;&quot;>None</SelectItem>
                    {kitTemplates.map((kit) => (
                      <SelectItem key={kit.id} value={kit.id}>
                        {kit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Pre-defined set of items needed for this activity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
            <FormField
              control={form.control}
              name=&quot;budget&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type=&quot;number&quot;
                      placeholder=&quot;0.00&quot;
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Allocated budget for this activity (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;requiredStaffCount&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Staff</FormLabel>
                  <FormControl>
                    <Input
                      type=&quot;number&quot;
                      min={0}
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Number of staff members needed
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name=&quot;specialInstructions&quot;
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder=&quot;Any specific instructions or notes for this activity&quot;
                    className=&quot;min-h-[120px]&quot;
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Additional information to help staff prepare for this activity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Submit buttons */}
        <div className=&quot;flex items-center justify-end gap-4 pt-4&quot;>
          <Button
            type=&quot;button&quot;
            variant=&quot;outline&quot;
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type=&quot;submit&quot; disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? &quot;Saving...&quot; : &quot;Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
