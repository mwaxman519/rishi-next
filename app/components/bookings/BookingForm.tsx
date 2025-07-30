import { useState, useEffect } from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { format } from &quot;date-fns&quot;;
import { CalendarIcon, Clock, MapPin, Plus, AlertCircle } from &quot;lucide-react&quot;;

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
import { Alert, AlertDescription, AlertTitle } from &quot;@/components/ui/alert&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { ScrollArea } from &quot;@/components/ui/scroll-area&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import { RecurrenceForm } from &quot;./RecurrenceForm&quot;;

import {
  insertBookingSchema,
  InsertBooking,
  BOOKING_PRIORITY,
  BOOKING_STATUS,
} from &quot;@shared/schema&quot;;
import {
  RecurrencePattern,
  RecurrenceFrequency,
  RecurrenceDays,
  formatRecurrencePattern,
} from &quot;@/lib/recurrence&quot;;

// Extend the insert schema with additional validation for the form
const bookingFormSchema = insertBookingSchema
  .extend({
    // Convert date strings to Date objects for the form
    startDate: z.date({
      required_error: &quot;Start date is required&quot;,
    }),
    endDate: z
      .date({
        required_error: &quot;End date is required&quot;,
      })
      .optional()
      .nullable(),
    // Override the schema to handle UI-specific fields
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine((data) => !data.endDate || data.startDate <= data.endDate, {
    message: &quot;End date must be after start date&quot;,
    path: [&quot;endDate&quot;],
  });

// Define the type for our form values
type BookingFormValues = z.infer<typeof bookingFormSchema>;

// Props for the BookingForm component
interface BookingFormProps {
  onSave: (booking: InsertBooking) => Promise<void>;
  onCancel: () => void;
  initialValues?: Partial<InsertBooking>;
  isEdit?: boolean;
  organizations?: Array<{ id: string; name: string }>;
  locations?: Array<{ id: string; name: string; address?: string }>;
  activityTypes?: Array<{ id: string; name: string }>;
  promotionTypes?: Array<{ id: string; name: string }>;
  kitTemplates?: Array<{ id: string; name: string }>;
}

export function BookingForm({
  onSave,
  onCancel,
  initialValues = {},
  isEdit = false,
  organizations = [],
  locations = [],
  activityTypes = [],
  promotionTypes = [],
  kitTemplates = [],
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(&quot;basic&quot;);
  const [isRecurring, setIsRecurring] = useState(
    initialValues.isRecurring || false,
  );
  const [recurrencePattern, setRecurrencePattern] =
    useState<RecurrencePattern | null>(null);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(
    initialValues.recurrenceEndDate
      ? new Date(initialValues.recurrenceEndDate)
      : null,
  );

  // Parse recurrence pattern if it exists
  useEffect(() => {
    if (initialValues.recurrencePattern) {
      // This would use the parseRecurrencePattern utility
      // For now we'll just set a basic weekly pattern
      setRecurrencePattern({
        frequency: RecurrenceFrequency.WEEKLY,
        interval: 1,
        byday: [RecurrenceDays.MO],
      });
    }
  }, [initialValues.recurrencePattern]);

  // Initialize form with default or provided values
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: initialValues.title || "&quot;,
      description: initialValues.description || &quot;&quot;,
      clientOrganizationId: initialValues.clientOrganizationId || &quot;&quot;,
      locationId: initialValues.locationId || &quot;&quot;,
      activityTypeId: initialValues.activityTypeId || &quot;&quot;,
      startDate: initialValues.startDate
        ? new Date(initialValues.startDate)
        : new Date(),
      endDate: initialValues.endDate
        ? new Date(initialValues.endDate)
        : new Date(),
      startTime: initialValues.startTime || &quot;09:00&quot;,
      endTime: initialValues.endTime || &quot;17:00&quot;,
      budget: initialValues.budget || undefined,
      attendeeEstimate: initialValues.attendeeEstimate || undefined,
      status: initialValues.status || BOOKING_STATUS.DRAFT,
      priority: initialValues.priority || BOOKING_PRIORITY.MEDIUM,
      notes: initialValues.notes || &quot;&quot;,
      promotionTypeId: initialValues.promotionTypeId || &quot;&quot;,
      kitTemplateId: initialValues.kitTemplateId || &quot;&quot;,
      staffCount: initialValues.staffCount || 1,
      requiresTraining: initialValues.requiresTraining || false,
    },
  });

  // Get form values for preview
  const startDate = form.watch(&quot;startDate&quot;);
  const startTime = form.watch(&quot;startTime&quot;);
  const endTime = form.watch(&quot;endTime&quot;);
  const locationId = form.watch(&quot;locationId&quot;);

  // Get location name for preview if available
  const selectedLocation = locations.find((loc) => loc.id === locationId);
  const locationName = selectedLocation ? selectedLocation.name : undefined;

  // Handle form submission
  const onSubmit = async (values: BookingFormValues) => {
    try {
      setIsSubmitting(true);

      // Prepare data for saving
      const bookingData: InsertBooking = {
        ...values,
        // For edit operations, preserve the original ID
        ...(isEdit && initialValues.id ? { id: initialValues.id } : {}),
        // Convert dates back to ISO strings for API
        startDate: values.startDate,
        endDate: values.endDate || values.startDate,
        // Add recurrence fields
        isRecurring,
        recurrencePattern: recurrencePattern
          ? formatRecurrencePattern(recurrencePattern)
          : null,
        recurrenceEndDate: recurrenceEndDate,
      };

      await onSave(bookingData);
    } catch (error) {
      console.error(&quot;Error saving booking:&quot;, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <Tabs
        defaultValue=&quot;basic&quot;
        value={activeTab}
        onValueChange={setActiveTab}
        className=&quot;w-full&quot;
      >
        <TabsList className=&quot;grid w-full grid-cols-3&quot;>
          <TabsTrigger value=&quot;basic&quot;>Basic Info</TabsTrigger>
          <TabsTrigger value=&quot;recurrence&quot;>Recurrence</TabsTrigger>
          <TabsTrigger value=&quot;preview&quot;>
            Preview
            {isRecurring && (
              <Badge variant=&quot;outline&quot; className=&quot;ml-2&quot;>
                Series
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Basic Information Tab */}
            <TabsContent value=&quot;basic&quot; className=&quot;space-y-6 py-4&quot;>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                {/* Title */}
                <FormField
                  control={form.control}
                  name=&quot;title&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;col-span-full&quot;>
                      <FormLabel>Booking Title</FormLabel>
                      <FormControl>
                        <Input placeholder=&quot;Enter booking title&quot; {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organization */}
                <FormField
                  control={form.control}
                  name=&quot;clientOrganizationId&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Organization</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select organization&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
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
                          {locations.map((location) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Activity Type */}
                <FormField
                  control={form.control}
                  name=&quot;activityTypeId&quot;
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

                {/* Time Range */}
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

                {/* Budget */}
                <FormField
                  control={form.control}
                  name=&quot;budget&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input
                          type=&quot;number&quot;
                          step=&quot;0.01&quot;
                          placeholder=&quot;Enter budget amount&quot;
                          {...field}
                          value={field.value ?? &quot;&quot;}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === &quot;&quot; ? undefined : parseFloat(value),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Attendee Estimate */}
                <FormField
                  control={form.control}
                  name=&quot;attendeeEstimate&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Attendees</FormLabel>
                      <FormControl>
                        <Input
                          type=&quot;number&quot;
                          placeholder=&quot;Enter estimated number of attendees&quot;
                          {...field}
                          value={field.value ?? &quot;&quot;}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === &quot;&quot; ? undefined : parseInt(value, 10),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Priority */}
                <FormField
                  control={form.control}
                  name=&quot;priority&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select priority&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={BOOKING_PRIORITY.LOW}>
                            Low
                          </SelectItem>
                          <SelectItem value={BOOKING_PRIORITY.MEDIUM}>
                            Medium
                          </SelectItem>
                          <SelectItem value={BOOKING_PRIORITY.HIGH}>
                            High
                          </SelectItem>
                          <SelectItem value={BOOKING_PRIORITY.URGENT}>
                            Urgent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Promotion Type */}
                <FormField
                  control={form.control}
                  name=&quot;promotionTypeId&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
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

                {/* Kit Template */}
                <FormField
                  control={form.control}
                  name=&quot;kitTemplateId&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kit Template</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder=&quot;Select kit template&quot; />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {kitTemplates.map((template) => (
                            <SelectItem key={template.id} value={template.id}>
                              {template.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Staff Count */}
                <FormField
                  control={form.control}
                  name=&quot;staffCount&quot;
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Count</FormLabel>
                      <FormControl>
                        <Input
                          type=&quot;number&quot;
                          min=&quot;1&quot;
                          {...field}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            field.onChange(
                              isNaN(value) ? 1 : Math.max(1, value),
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description - Full width */}
                <FormField
                  control={form.control}
                  name=&quot;description&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;col-span-full&quot;>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=&quot;Enter booking details&quot;
                          {...field}
                          rows={3}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes - Full width */}
                <FormField
                  control={form.control}
                  name=&quot;notes&quot;
                  render={({ field }) => (
                    <FormItem className=&quot;col-span-full&quot;>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder=&quot;Enter any additional notes&quot;
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className=&quot;flex justify-between mt-6&quot;>
                <Button type=&quot;button&quot; variant=&quot;outline&quot; onClick={onCancel}>
                  Cancel
                </Button>
                <div className=&quot;space-x-2&quot;>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;secondary&quot;
                    onClick={() => setActiveTab(&quot;recurrence&quot;)}
                  >
                    Next: Recurrence
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Recurrence Tab */}
            <TabsContent value=&quot;recurrence&quot; className=&quot;space-y-6 py-4&quot;>
              <RecurrenceForm
                isRecurring={isRecurring}
                onIsRecurringChange={setIsRecurring}
                recurrencePattern={recurrencePattern}
                onRecurrencePatternChange={setRecurrencePattern}
                recurrenceEndDate={recurrenceEndDate}
                onRecurrenceEndDateChange={setRecurrenceEndDate}
              />

              {isRecurring && (
                <Alert>
                  <AlertCircle className=&quot;h-4 w-4&quot; />
                  <AlertTitle>Recurring Booking</AlertTitle>
                  <AlertDescription>
                    This booking will generate multiple events according to your
                    recurrence pattern. You can see a preview in the next tab.
                  </AlertDescription>
                </Alert>
              )}

              <div className=&quot;flex justify-between mt-6&quot;>
                <Button
                  type=&quot;button&quot;
                  variant=&quot;outline&quot;
                  onClick={() => setActiveTab(&quot;basic&quot;)}
                >
                  Back: Basic Info
                </Button>
                <div className=&quot;space-x-2&quot;>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;secondary&quot;
                    onClick={() => setActiveTab(&quot;preview&quot;)}
                  >
                    Next: Preview
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value=&quot;preview&quot; className=&quot;space-y-6 py-4&quot;>
              <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>
                      Review your booking details before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className=&quot;space-y-4&quot;>
                    <div className=&quot;space-y-1&quot;>
                      <h4 className=&quot;text-sm font-medium&quot;>Title</h4>
                      <p>{form.watch(&quot;title&quot;) || &quot;Untitled Booking&quot;}</p>
                    </div>

                    <div className=&quot;space-y-1&quot;>
                      <h4 className=&quot;text-sm font-medium&quot;>Description</h4>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {form.watch(&quot;description&quot;) || &quot;No description provided&quot;}
                      </p>
                    </div>

                    <div className=&quot;grid grid-cols-2 gap-4&quot;>
                      <div className=&quot;space-y-1&quot;>
                        <h4 className=&quot;text-sm font-medium&quot;>Organization</h4>
                        <p className=&quot;text-sm&quot;>
                          {organizations.find(
                            (o) => o.id === form.watch(&quot;clientOrganizationId&quot;),
                          )?.name || &quot;Not specified&quot;}
                        </p>
                      </div>

                      <div className=&quot;space-y-1&quot;>
                        <h4 className=&quot;text-sm font-medium&quot;>Activity Type</h4>
                        <p className=&quot;text-sm&quot;>
                          {activityTypes.find(
                            (t) => t.id === form.watch(&quot;activityTypeId&quot;),
                          )?.name || &quot;Not specified&quot;}
                        </p>
                      </div>

                      <div className=&quot;space-y-1&quot;>
                        <h4 className=&quot;text-sm font-medium&quot;>Budget</h4>
                        <p className=&quot;text-sm&quot;>
                          {form.watch(&quot;budget&quot;)
                            ? `$${form.watch(&quot;budget&quot;).toFixed(2)}`
                            : &quot;Not specified&quot;}
                        </p>
                      </div>

                      <div className=&quot;space-y-1&quot;>
                        <h4 className=&quot;text-sm font-medium&quot;>Priority</h4>
                        <p className=&quot;text-sm&quot;>
                          {form.watch(&quot;priority&quot;).charAt(0).toUpperCase() +
                            form.watch(&quot;priority&quot;).slice(1)}
                        </p>
                      </div>

                      <div className=&quot;space-y-1&quot;>
                        <h4 className=&quot;text-sm font-medium&quot;>Staff Count</h4>
                        <p className=&quot;text-sm&quot;>{form.watch(&quot;staffCount&quot;)}</p>
                      </div>

                      <div className=&quot;space-y-1&quot;>
                        <h4 className=&quot;text-sm font-medium&quot;>
                          Estimated Attendees
                        </h4>
                        <p className=&quot;text-sm&quot;>
                          {form.watch(&quot;attendeeEstimate&quot;) || &quot;Not specified&quot;}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Booking preview - Events business objects removed */}
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className=&quot;space-y-2&quot;>
                      <div>
                        <strong>Date:</strong> {startDate ? format(startDate, &quot;PPP&quot;) : &quot;Not set&quot;}
                      </div>
                      <div>
                        <strong>Time:</strong> {startTime || &quot;Not set&quot;} - {endTime || &quot;Not set&quot;}
                      </div>
                      <div>
                        <strong>Location:</strong> {locationName || &quot;Not specified&quot;}
                      </div>
                      {isRecurring && (
                        <div>
                          <strong>Recurrence:</strong> {formatRecurrencePattern(recurrencePattern)}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className=&quot;flex justify-between mt-6&quot;>
                <Button
                  type=&quot;button&quot;
                  variant=&quot;outline&quot;
                  onClick={() => setActiveTab(&quot;recurrence&quot;)}
                >
                  Back: Recurrence
                </Button>
                <div className=&quot;space-x-2&quot;>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;outline&quot;
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type=&quot;submit&quot; disabled={isSubmitting}>
                    {isSubmitting
                      ? &quot;Saving...&quot;
                      : isEdit
                        ? &quot;Update Booking&quot;
                        : &quot;Create Booking"}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </form>
        </Form>
      </Tabs>
    </div>
  );
}
