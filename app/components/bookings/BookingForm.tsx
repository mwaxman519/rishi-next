import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Plus, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecurrenceForm } from "./RecurrenceForm";
import { EventSeriesPreview } from "./EventSeriesPreview";
import {
  insertBookingSchema,
  InsertBooking,
  BOOKING_PRIORITY,
  BOOKING_STATUS,
} from "@shared/schema";
import {
  RecurrencePattern,
  RecurrenceFrequency,
  RecurrenceDays,
  formatRecurrencePattern,
} from "@/lib/recurrence";

// Extend the insert schema with additional validation for the form
const bookingFormSchema = insertBookingSchema
  .extend({
    // Convert date strings to Date objects for the form
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z
      .date({
        required_error: "End date is required",
      })
      .optional()
      .nullable(),
    // Override the schema to handle UI-specific fields
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  })
  .refine((data) => !data.endDate || data.startDate <= data.endDate, {
    message: "End date must be after start date",
    path: ["endDate"],
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
  const [activeTab, setActiveTab] = useState("basic");
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
      title: initialValues.title || "",
      description: initialValues.description || "",
      clientOrganizationId: initialValues.clientOrganizationId || "",
      locationId: initialValues.locationId || "",
      activityTypeId: initialValues.activityTypeId || "",
      startDate: initialValues.startDate
        ? new Date(initialValues.startDate)
        : new Date(),
      endDate: initialValues.endDate
        ? new Date(initialValues.endDate)
        : new Date(),
      startTime: initialValues.startTime || "09:00",
      endTime: initialValues.endTime || "17:00",
      budget: initialValues.budget || undefined,
      attendeeEstimate: initialValues.attendeeEstimate || undefined,
      status: initialValues.status || BOOKING_STATUS.DRAFT,
      priority: initialValues.priority || BOOKING_PRIORITY.MEDIUM,
      notes: initialValues.notes || "",
      promotionTypeId: initialValues.promotionTypeId || "",
      kitTemplateId: initialValues.kitTemplateId || "",
      staffCount: initialValues.staffCount || 1,
      requiresTraining: initialValues.requiresTraining || false,
    },
  });

  // Get form values for preview
  const startDate = form.watch("startDate");
  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const locationId = form.watch("locationId");

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
      console.error("Error saving booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="basic"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="recurrence">Recurrence</TabsTrigger>
          <TabsTrigger value="preview">
            Preview
            {isRecurring && (
              <Badge variant="outline" className="ml-2">
                Series
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Booking Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter booking title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Organization */}
                <FormField
                  control={form.control}
                  name="clientOrganizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Organization</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select organization" />
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
                  name="locationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
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
                  name="activityTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
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
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
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
                <div className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Start Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="mt-8">-</span>
                  <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>End Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Budget */}
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Enter budget amount"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : parseFloat(value),
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
                  name="attendeeEstimate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Attendees</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter estimated number of attendees"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : parseInt(value, 10),
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
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
                  name="promotionTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promotion Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select promotion type" />
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
                  name="kitTemplateId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kit Template</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select kit template" />
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
                  name="staffCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staff Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
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
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter booking details"
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
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any additional notes"
                          {...field}
                          rows={2}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab("recurrence")}
                  >
                    Next: Recurrence
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Recurrence Tab */}
            <TabsContent value="recurrence" className="space-y-6 py-4">
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
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Recurring Booking</AlertTitle>
                  <AlertDescription>
                    This booking will generate multiple events according to your
                    recurrence pattern. You can see a preview in the next tab.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("basic")}
                >
                  Back: Basic Info
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setActiveTab("preview")}
                  >
                    Next: Preview
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6 py-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Booking Summary</CardTitle>
                    <CardDescription>
                      Review your booking details before submitting
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Title</h4>
                      <p>{form.watch("title") || "Untitled Booking"}</p>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {form.watch("description") || "No description provided"}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Organization</h4>
                        <p className="text-sm">
                          {organizations.find(
                            (o) => o.id === form.watch("clientOrganizationId"),
                          )?.name || "Not specified"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Activity Type</h4>
                        <p className="text-sm">
                          {activityTypes.find(
                            (t) => t.id === form.watch("activityTypeId"),
                          )?.name || "Not specified"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Budget</h4>
                        <p className="text-sm">
                          {form.watch("budget")
                            ? `$${form.watch("budget").toFixed(2)}`
                            : "Not specified"}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Priority</h4>
                        <p className="text-sm">
                          {form.watch("priority").charAt(0).toUpperCase() +
                            form.watch("priority").slice(1)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Staff Count</h4>
                        <p className="text-sm">{form.watch("staffCount")}</p>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">
                          Estimated Attendees
                        </h4>
                        <p className="text-sm">
                          {form.watch("attendeeEstimate") || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <EventSeriesPreview
                  startDate={startDate}
                  startTime={startTime}
                  endTime={endTime}
                  isRecurring={isRecurring}
                  recurrencePattern={recurrencePattern}
                  recurrenceEndDate={recurrenceEndDate}
                  location={locationName}
                />
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab("recurrence")}
                >
                  Back: Recurrence
                </Button>
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving..."
                      : isEdit
                        ? "Update Booking"
                        : "Create Booking"}
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
