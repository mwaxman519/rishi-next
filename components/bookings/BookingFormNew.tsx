"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { ArrowLeft, ArrowRight, Calendar, Clock, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { DatePicker } from "../ui/date-picker";
import { TimeInput } from "../ui/time-input";
import { Checkbox } from "../ui/checkbox";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { RecurrenceForm } from "./RecurrenceForm";
// EventSeriesPreview removed - Events business objects eliminated

// Define a schema for booking form validation
const bookingFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  location: z.string().min(3, { message: "Location is required" }),
  date: z.date({ required_error: "Date is required" }),
  startTime: z.string().min(1, { message: "Start time is required" }),
  endTime: z.string().min(1, { message: "End time is required" }),
  attendeeEstimate: z.coerce
    .number()
    .min(1, { message: "Must have at least 1 attendee" }),
  budget: z.coerce
    .number()
    .min(0, { message: "Budget must be a positive number" }),
  activityType: z.string().min(1, { message: "Activity type is required" }),
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
  const [activeTab, setActiveTab] = useState("details");

  // Initialize with default values
  const defaultFormValues: BookingFormValues = {
    title: "",
    location: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "17:00",
    attendeeEstimate: 10,
    budget: 0,
    activityType: "",
    notes: "",
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
  console.log("DEBUG Form state:", {
    values: form.getValues(),
    isValid: form.formState.isValid,
    errors: form.formState.errors,
  });

  // Calculate form completion percentage
  const formCompletion = () => {
    const requiredFields = [
      "title",
      "location",
      "date",
      "startTime",
      "endTime",
      "attendeeEstimate",
      "activityType",
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
  const isRecurring = form.watch("isRecurring");

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
    { value: "training", label: "Training" },
    { value: "workshop", label: "Workshop" },
    { value: "conference", label: "Conference" },
    { value: "meeting", label: "Meeting" },
    { value: "team_building", label: "Team Building" },
    { value: "other", label: "Other" },
  ];

  return (
    <div className="w-full">
      <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
        {/* Form header */}
        <div className="p-6 border-b dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-2xl font-bold dark:text-white">
              {editMode ? "Edit Booking" : "New Booking"}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400 mt-1">
              {editMode
                ? "Update booking details"
                : "Create a new booking for your event"}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:block">
              <div className="flex items-center space-x-2">
                <div className="w-20 h-2 bg-muted dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${formCompletion()}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground dark:text-gray-400">
                  {formCompletion()}%
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="ml-2 dark:border-gray-700 dark:hover:bg-gray-800"
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
              className="w-full"
            >
              <div className="border-b dark:border-gray-800">
                <div className="px-6">
                  <TabsList className="grid grid-cols-2 mt-4 bg-transparent">
                    <TabsTrigger
                      value="details"
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                      Basic Details
                    </TabsTrigger>
                    <TabsTrigger
                      value="schedule"
                      className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                    >
                      Schedule & Options
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>
              <div className="p-6">
                <TabsContent value="details" className="mt-0 p-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter event title"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter location" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
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

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="startTime"
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
                            name="endTime"
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
                        name="activityType"
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
                                  <SelectValue placeholder="Select activity type" />
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

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setActiveTab("schedule")}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Next Step
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="mt-0 p-0">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="attendeeEstimate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Estimated Attendees</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
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
                          name="budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget (£)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
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
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Notes</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Enter any additional information"
                                className="min-h-[100px]"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="isRecurring"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border dark:border-gray-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
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
                          <Card className="border dark:border-gray-800">
                            <CardHeader>
                              <CardTitle>Recurrence Settings</CardTitle>
                              <CardDescription>
                                Define how often this event should repeat
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <RecurrenceForm />
                            </CardContent>
                            <CardFooter className="flex flex-col items-start">
                              <h4 className="text-sm font-medium mb-2">
                                Booking Preview
                              </h4>
                              <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-md">
                                <p>Recurring booking will be created based on your settings.</p>
                                <p className="mt-1">Start Date: {form.getValues("date")?.toLocaleDateString()}</p>
                              </div>
                            </CardFooter>
                          </Card>
                        )}

                        <FormField
                          control={form.control}
                          name="sendCalendarInvite"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-md border dark:border-gray-800 p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
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

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab("details")}
                      >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                      </Button>

                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Booking"
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
