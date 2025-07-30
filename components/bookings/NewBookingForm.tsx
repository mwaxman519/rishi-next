&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { useMutation, useQuery, useQueryClient } from &quot;@tanstack/react-query&quot;;
import {
  BOOKING_PRIORITY,
  BOOKING_STATUS,
  insertBookingSchema,
  type ActivityType,
  type Location,
  type PromotionType,
  type KitTemplate,
} from &quot;@shared/schema&quot;;
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { format } from &quot;date-fns&quot;;
import { Calendar as CalendarIcon, Clock, Loader2 } from &quot;lucide-react&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import SimplifiedLocationMap from &quot;@/components/maps/SimplifiedLocationMap&quot;;

// Define an interface for form data
interface BookingFormData {
  activityTypes: ActivityType[];
  locations: Location[];
  promotionTypes: PromotionType[];
  kitTemplates: KitTemplate[];
}

// Adjust booking schema for client-side validation
const bookingFormSchema = insertBookingSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    approvedById: true,
    approvedAt: true,
    rejectedById: true,
    rejectedAt: true,
    rejectionReason: true,
    canceledById: true,
    canceledAt: true,
    cancelReason: true,
    createdById: true,
  })
  .extend({
    startDate: z.date({ required_error: &quot;Please select a date&quot; }),
    endDate: z.date({ required_error: &quot;Please select a date&quot; }),
    clientOrganizationId: z.string().uuid().optional(),
  });

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function NewBookingForm() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      title: "&quot;,
      description: &quot;&quot;,
      status: BOOKING_STATUS.DRAFT,
      startDate: undefined,
      endDate: undefined,
      startTime: &quot;&quot;,
      endTime: &quot;&quot;,
      priority: BOOKING_PRIORITY.MEDIUM,
      budget: 0,
      staffCount: 1,
      notes: &quot;&quot;,
      requiresTraining: false,
      attendeeEstimate: 0,
    },
  });

  // Fetch form data
  const { data: formData, isLoading: isLoadingFormData } =
    useQuery<BookingFormData>({
      queryKey: [&quot;/api/bookings/form-data&quot;],
      queryFn: async () => {
        const response = await fetch(&quot;/api/bookings/form-data&quot;);
        if (!response.ok) {
          throw new Error(&quot;Failed to fetch form data&quot;);
        }
        return response.json();
      },
      // Fallback to empty arrays if the API isn&apos;t implemented yet
      placeholderData: {
        activityTypes: [],
        locations: [],
        promotionTypes: [],
        kitTemplates: [],
      },
    });

  // Submit mutation
  const { mutate: submitBooking, isPending } = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      // Format dates properly
      const payload = {
        ...values,
        startDate: values.startDate
          ? values.startDate.toISOString().split(&quot;T&quot;)[0]
          : null,
        endDate: values.endDate
          ? values.endDate.toISOString().split(&quot;T&quot;)[0]
          : null,
      };

      const response = await fetch(&quot;/api/bookings&quot;, {
        method: &quot;POST&quot;,
        headers: {
          &quot;Content-Type&quot;: &quot;application/json&quot;,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || &quot;Failed to create booking&quot;);
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: &quot;Booking Created&quot;,
        description: &quot;Your booking request has been created successfully.&quot;,
      });

      // Invalidate bookings queries to refresh lists
      queryClient.invalidateQueries({ queryKey: [&quot;/api/bookings&quot;] });

      // Redirect to bookings list
      router.push(&quot;/bookings&quot;);
    },
    onError: (error: Error) => {
      toast({
        title: &quot;Error&quot;,
        description: error.message,
        variant: &quot;destructive&quot;,
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    submitBooking(values);
  };

  // Handle location selection from map
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
    form.setValue(&quot;locationId&quot;, locationId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-8&quot;>
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
          <div className=&quot;space-y-6&quot;>
            <FormField
              control={form.control}
              name=&quot;title&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Title</FormLabel>
                  <FormControl>
                    <Input placeholder=&quot;Enter booking title&quot; {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive title for this booking request
                  </FormDescription>
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
                      placeholder=&quot;Describe the purpose and goals of this booking&quot;
                      className=&quot;min-h-[120px]&quot;
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=&quot;grid grid-cols-1 sm:grid-cols-2 gap-4&quot;>
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
                              &quot;pl-3 text-left font-normal&quot;,
                              !field.value && &quot;text-muted-foreground&quot;,
                            )}
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
                name=&quot;startTime&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className=&quot;relative&quot;>
                      <FormControl>
                        <Input placeholder=&quot;e.g. 09:00 AM&quot; {...field} />
                      </FormControl>
                      <Clock className=&quot;absolute right-3 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className=&quot;grid grid-cols-1 sm:grid-cols-2 gap-4&quot;>
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
                            className={cn(
                              &quot;pl-3 text-left font-normal&quot;,
                              !field.value && &quot;text-muted-foreground&quot;,
                            )}
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
                name=&quot;endTime&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className=&quot;relative&quot;>
                      <FormControl>
                        <Input placeholder=&quot;e.g. 05:00 PM&quot; {...field} />
                      </FormControl>
                      <Clock className=&quot;absolute right-3 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name=&quot;activityTypeId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || &quot;&quot;}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select activity type&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFormData ? (
                        <SelectItem value=&quot;loading&quot; disabled>
                          <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
                          Loading...
                        </SelectItem>
                      ) : (
                        formData?.activityTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;promotionTypeId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || &quot;&quot;}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select promotion type&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFormData ? (
                        <SelectItem value=&quot;loading&quot; disabled>
                          <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
                          Loading...
                        </SelectItem>
                      ) : (
                        formData?.promotionTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;kitTemplateId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kit Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || &quot;&quot;}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select a kit template&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFormData ? (
                        <SelectItem value=&quot;loading&quot; disabled>
                          <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
                          Loading...
                        </SelectItem>
                      ) : (
                        formData?.kitTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Predefined equipment and materials for this activity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className=&quot;space-y-6&quot;>
            <FormField
              control={form.control}
              name=&quot;locationId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className=&quot;space-y-4&quot;>
                      <div className=&quot;rounded-md border h-[300px] overflow-hidden&quot;>
                        <SimplifiedLocationMap
                          selectedLocationId={selectedLocation}
                          onSelectLocation={handleLocationSelect}
                        />
                      </div>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedLocation(value);
                        }}
                        value={field.value || &quot;&quot;}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder=&quot;Select a location&quot; />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingFormData ? (
                            <SelectItem value=&quot;loading&quot; disabled>
                              <Loader2 className=&quot;h-4 w-4 animate-spin&quot; />
                              Loading...
                            </SelectItem>
                          ) : (
                            formData?.locations.map((location) => (
                              <SelectItem key={location.id} value={location.id}>
                                {location.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className=&quot;grid grid-cols-2 gap-4&quot;>
              <FormField
                control={form.control}
                name=&quot;staffCount&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Count</FormLabel>
                    <FormControl>
                      <Input
                        type=&quot;number&quot;
                        min={1}
                        value={field.value}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
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
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input
                        type=&quot;number&quot;
                        min={0}
                        step={100}
                        value={field.value?.toString() || &quot;0&quot;}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
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
              name=&quot;attendeeEstimate&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Attendees</FormLabel>
                  <FormControl>
                    <Input
                      type=&quot;number&quot;
                      min={0}
                      value={field.value?.toString() || &quot;0&quot;}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select priority&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={BOOKING_PRIORITY.LOW}>Low</SelectItem>
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

            <FormField
              control={form.control}
              name=&quot;notes&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=&quot;Add any additional information&quot;
                      className=&quot;min-h-[120px]&quot;
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className=&quot;flex justify-end space-x-4&quot;>
          <Button
            type=&quot;button&quot;
            variant=&quot;outline&quot;
            onClick={() => router.push(&quot;/bookings&quot;)}
          >
            Cancel
          </Button>

          <Button type=&quot;submit&quot; disabled={isPending}>
            {isPending && <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />}
            {form.getValues(&quot;status&quot;) === BOOKING_STATUS.DRAFT
              ? &quot;Save as Draft&quot;
              : &quot;Submit Booking&quot;}
          </Button>

          {form.getValues(&quot;status&quot;) === BOOKING_STATUS.DRAFT && (
            <Button
              type=&quot;button&quot;
              onClick={() => {
                form.setValue(&quot;status&quot;, BOOKING_STATUS.PENDING);
                form.handleSubmit(onSubmit)();
              }}
              disabled={isPending}
            >
              {isPending && <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin" />}
              Submit for Approval
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
