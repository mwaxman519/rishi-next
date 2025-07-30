&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { z } from &quot;zod&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { useForm, FormProvider } from &quot;react-hook-form&quot;;
import { ArrowLeft, ArrowRight, Calendar, Clock, Loader2 } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { DatePicker } from &quot;@/components/ui/date-picker&quot;;
import { TimeInput } from &quot;@/components/ui/time-input&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { RecurrenceForm } from &quot;./RecurrenceForm&quot;;
// EventSeriesPreview removed - Events business objects eliminated

// Define a schema for booking form validation
const bookingFormSchema = z.object({
  title: z.string().min(3, { message: &quot;Title must be at least 3 characters&quot; }),
  location: z.string().min(3, { message: &quot;Location is required&quot; }),
  date: z.date({ required_error: &quot;Date is required&quot; }),
  startTime: z.string().min(1, { message: &quot;Start time is required&quot; }),
  endTime: z.string().min(1, { message: &quot;End time is required&quot; }),
  attendeeEstimate: z.coerce
    .number()
    .min(1, { message: &quot;Must have at least 1 attendee&quot; }),
  budget: z.coerce
    .number()
    .min(0, { message: &quot;Budget must be a positive number&quot; }),
  activityType: z.string().min(1, { message: &quot;Activity type is required&quot; }),
  notes: z.string().optional(),
  sendCalendarInvite: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurrence: z.any().optional(),
  organizationId: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  initialValues?: Partial<BookingFormValues>;
  editMode?: boolean;
  onSubmit: (data: BookingFormValues) => void;
  onCancel: () => void;
}

export function BookingFormNew({
  initialValues,
  editMode = false,
  onSubmit,
  onCancel,
}: BookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState(&quot;details&quot;);

  // Initialize with default values
  const defaultFormValues: BookingFormValues = {
    title: "&quot;,
    location: &quot;&quot;,
    date: new Date(),
    startTime: &quot;09:00&quot;,
    endTime: &quot;17:00&quot;,
    attendeeEstimate: 10,
    budget: 0,
    activityType: &quot;&quot;,
    notes: &quot;&quot;,
    sendCalendarInvite: false,
    isRecurring: false,
    recurrence: undefined,
    ...initialValues,
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: defaultFormValues,
  });

  // Debug form values
  console.log(&quot;DEBUG Form state:&quot;, {
    values: form.getValues(),
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  });

  // Calculate form completion percentage
  const formCompletion = () => {
    const requiredFields = [
      &quot;title&quot;,
      &quot;location&quot;,
      &quot;date&quot;,
      &quot;startTime&quot;,
      &quot;endTime&quot;,
      &quot;attendeeEstimate&quot;,
      &quot;activityType&quot;,
    ];

    const values = form.getValues();
    let completedFields = 0;

    requiredFields.forEach((field) => {
      // @ts-ignore - Dynamic access
      if (values[field]) {
        completedFields++;
      }
    });

    return Math.floor((completedFields / requiredFields.length) * 100);
  };

  // Watch for recurring checkbox changes
  const isRecurring = form.watch(&quot;isRecurring&quot;);

  // Actual form submission handler
  const handleSubmit = (data: BookingFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmit(data);
    }, 1000);
  };

  // Activity type options
  const activityTypes = [
    { value: &quot;training&quot;, label: &quot;Training&quot; },
    { value: &quot;workshop&quot;, label: &quot;Workshop&quot; },
    { value: &quot;conference&quot;, label: &quot;Conference&quot; },
    { value: &quot;meeting&quot;, label: &quot;Meeting&quot; },
    { value: &quot;team_building&quot;, label: &quot;Team Building&quot; },
    { value: &quot;other&quot;, label: &quot;Other&quot; },
  ];

  return (
    <div className=&quot;w-full&quot;>
      <div className=&quot;bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm&quot;>
        {/* Form header */}
        <div className=&quot;p-6 border-b dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0&quot;>
          <div>
            <h1 className=&quot;text-2xl font-bold dark:text-white&quot;>
              {editMode ? &quot;Edit Booking&quot; : &quot;New Booking&quot;}
            </h1>
            <p className=&quot;text-muted-foreground dark:text-gray-400 mt-1&quot;>
              {editMode
                ? &quot;Update booking details&quot;
                : &quot;Create a new booking for your event&quot;}
            </p>
          </div>

          <div className=&quot;flex items-center space-x-2&quot;>
            <div className=&quot;hidden sm:block&quot;>
              <div className=&quot;flex items-center space-x-2&quot;>
                <div className=&quot;w-20 h-2 bg-muted dark:bg-gray-800 rounded-full overflow-hidden&quot;>
                  <div
                    className=&quot;h-full bg-primary transition-all&quot;
                    style={{ width: `${formCompletion()}%` }}
                  />
                </div>
                <span className=&quot;text-sm text-muted-foreground dark:text-gray-400&quot;>
                  {formCompletion()}%
                </span>
              </div>
            </div>

            <Button
              type=&quot;button&quot;
              variant=&quot;outline&quot;
              size=&quot;sm&quot;
              onClick={onCancel}
              className=&quot;ml-2 dark:border-gray-700 dark:hover:bg-gray-800&quot;
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Form content */}
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className=&quot;w-full&quot;
            >
              <div className=&quot;border-b dark:border-gray-800&quot;>
                <div className=&quot;px-6&quot;>
                  <TabsList className=&quot;grid grid-cols-2 mt-4 bg-transparent&quot;>
                    <TabsTrigger
                      value=&quot;details&quot;
                      className=&quot;rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none&quot;
                    >
                      Basic Details
                    </TabsTrigger>
                    <TabsTrigger
                      value=&quot;schedule&quot;
                      className=&quot;rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none&quot;
                    >
                      Schedule & Options
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <div className=&quot;p-6&quot;>
                <TabsContent value=&quot;details&quot; className=&quot;mt-0 p-0&quot;>
                  <div className=&quot;space-y-6&quot;>
                    <div className=&quot;grid grid-cols-1 gap-6&quot;>
                      <FormField
                        control={form.control}
                        name=&quot;title&quot;
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder=&quot;Enter event title&quot;
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name=&quot;location&quot;
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder=&quot;Enter location&quot; {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                        <FormField
                          control={form.control}
                          name=&quot;date&quot;
                          render={({ field }) => (
                            <FormItem className=&quot;flex flex-col&quot;>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <DatePicker
                                  date={field.value}
                                  setDate={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className=&quot;grid grid-cols-2 gap-4&quot;>
                          <FormField
                            control={form.control}
                            name=&quot;startTime&quot;
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Start Time</FormLabel>
                                <FormControl>
                                  <TimeInput
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
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
                                  <TimeInput
                                    value={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name=&quot;activityType&quot;
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder=&quot;Select activity type&quot; />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {activityTypes.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className=&quot;flex justify-end&quot;>
                      <Button
                        type=&quot;button&quot;
                        onClick={() => setActiveTab(&quot;schedule&quot;)}
                        className=&quot;bg-primary hover:bg-primary/90&quot;
                      >
                        Next Step
                        <ArrowRight className=&quot;ml-2 h-4 w-4&quot; />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value=&quot;schedule&quot; className=&quot;mt-0 p-0&quot;>
                  <div className=&quot;space-y-6&quot;>
                    <div className=&quot;grid grid-cols-1 gap-6&quot;>
                      <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                        <FormField
                          control={form.control}
                          name=&quot;attendeeEstimate&quot;
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Attendees</FormLabel>
                              <FormControl>
                                <Input
                                  type=&quot;number&quot;
                                  min={1}
                                  {...field}
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name=&quot;budget&quot;
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget (£)</FormLabel>
                              <FormControl>
                                <Input
                                  type=&quot;number&quot;
                                  min={0}
                                  {...field}
                                  value={field.value}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseInt(e.target.value) || 0,
                                    )
                                  }
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name=&quot;notes&quot;
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder=&quot;Enter any additional information&quot;
                                className=&quot;min-h-[100px]&quot;
                                {...field}
                                value={field.value || &quot;&quot;}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className=&quot;space-y-4&quot;>
                        <FormField
                          control={form.control}
                          name=&quot;isRecurring&quot;
                          render={({ field }) => (
                            <FormItem className=&quot;flex flex-row items-center justify-between rounded-md border dark:border-gray-800 p-4&quot;>
                              <div className=&quot;space-y-0.5&quot;>
                                <FormLabel className=&quot;text-base&quot;>
                                  Recurring Event
                                </FormLabel>
                                <FormDescription>
                                  Set this event to repeat on a schedule
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

                        {isRecurring && (
                          <Card className=&quot;border dark:border-gray-800&quot;>
                            <CardHeader>
                              <CardTitle>Recurrence Settings</CardTitle>
                              <CardDescription>
                                Define how often this event should repeat
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <RecurrenceForm />
                            </CardContent>
                            <CardFooter className=&quot;flex flex-col items-start&quot;>
                              <h4 className=&quot;text-sm font-medium mb-2&quot;>
                                Booking Preview
                              </h4>
                              <div className=&quot;text-sm text-muted-foreground p-3 bg-muted/30 rounded-md&quot;>
                                <p>Recurring booking will be created based on your settings.</p>
                                <p className=&quot;mt-1&quot;>Start Date: {form.getValues(&quot;date&quot;)?.toLocaleDateString()}</p>
                              </div>
                            </CardFooter>
                          </Card>
                        )}

                        <FormField
                          control={form.control}
                          name=&quot;sendCalendarInvite&quot;
                          render={({ field }) => (
                            <FormItem className=&quot;flex flex-row items-center justify-between rounded-md border dark:border-gray-800 p-4&quot;>
                              <div className=&quot;space-y-0.5&quot;>
                                <FormLabel className=&quot;text-base&quot;>
                                  Send Calendar Invites
                                </FormLabel>
                                <FormDescription>
                                  Automatically send calendar invites to
                                  participants
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
                      </div>
                    </div>

                    <div className=&quot;flex justify-between&quot;>
                      <Button
                        type=&quot;button&quot;
                        variant=&quot;outline&quot;
                        onClick={() => setActiveTab(&quot;details&quot;)}
                      >
                        <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; />
                        Back
                      </Button>

                      <Button type=&quot;submit&quot; disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                            Submitting...
                          </>
                        ) : (
                          &quot;Submit Booking"
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
