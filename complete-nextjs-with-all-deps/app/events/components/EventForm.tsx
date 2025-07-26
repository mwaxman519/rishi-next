"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  AlertCircle,
  CalendarIcon,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Form validation schema
const formSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Event title must be at least 3 characters" }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  locationId: z.string({ required_error: "Please select a location" }),
  organizationId: z.string({ required_error: "Organization is required" }),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  startTime: z.string({ required_error: "Start time is required" }),
  endTime: z.string({ required_error: "End time is required" }),
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
          description: event.description || "",
          locationId: event.locationId,
          organizationId: event.organizationId,
          startDate: new Date(event.startDateTime),
          endDate: new Date(event.endDateTime),
          startTime: format(new Date(event.startDateTime), "HH:mm"),
          endTime: format(new Date(event.endDateTime), "HH:mm"),
          expectedAttendees: event.expectedAttendees?.toString() || "1",
          notes: event.notes || "",
          isRecurring: event.isSeriesParent || false,
          recurringPattern: event.recurringPattern || "weekly",
          recurringFrequency: event.recurringFrequency || "1",
          numberOfOccurrences: event.numberOfOccurrences?.toString() || "4",
        }
      : {
          title: "",
          description: "",
          locationId: "",
          organizationId: organizationId || "",
          startDate: new Date(),
          endDate: new Date(),
          startTime: "09:00",
          endTime: "11:00",
          expectedAttendees: "1",
          notes: "",
          isRecurring: false,
          recurringPattern: "weekly",
          recurringFrequency: "1",
          numberOfOccurrences: "4",
        },
  });

  // Set isRecurring state from form values
  useEffect(() => {
    setIsRecurring(form.watch("isRecurring"));
  }, [form.watch("isRecurring")]);

  // Fetch organizations if needed (for users with access to multiple orgs)
  const { data: organizations = [] } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const response = await fetch("/api/organizations/user");
      if (!response.ok) {
        throw new Error("Failed to fetch organizations");
      }
      return await response.json();
    },
    enabled: !organizationId, // Only fetch if no organizationId is provided
  });

  // Fetch locations for the selected organization
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ["locations", form.watch("organizationId")],
    queryFn: async () => {
      const orgId = form.watch("organizationId");
      if (!orgId) return [];

      const response = await fetch(`/api/locations?organizationId=${orgId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch locations");
      }
      return await response.json();
    },
    enabled: !!form.watch("organizationId"),
  });

  // Create/Update event mutation
  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = event ? `/api/events/${event.id}` : "/api/events";
      const method = event ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        // Handle location conflict
        const conflictData = await response.json();
        throw new Error("location_conflict", { cause: conflictData });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save event");
      }

      return await response.json();
    },
    onSuccess: () => {
      // Invalidate events query to refetch
      queryClient.invalidateQueries({ queryKey: ["events"] });

      // Show success toast
      toast({
        title: event ? "Event Updated" : "Event Created",
        description: event
          ? "Your event has been successfully updated."
          : "Your event has been successfully created.",
      });

      // Navigate back to events list
      router.push("/events");
    },
    onError: (error: any) => {
      if (error.message === "location_conflict" && error.cause) {
        // Set location conflict data
        setLocationConflict(error.cause);

        // Show conflict toast
        toast({
          title: "Location Conflict",
          description:
            "The selected location is not available for the chosen time.",
          variant: "destructive",
        });

        return;
      }

      // Show error toast
      toast({
        title: "Error",
        description:
          error.message || "An error occurred while saving the event.",
        variant: "destructive",
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
        .split(":")
        .map(Number);
      startDateTime.setHours(startHours, startMinutes);

      const endDateTime = new Date(values.endDate);
      const [endHours, endMinutes] = values.endTime.split(":").map(Number);
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
      console.error("Error submitting form:", error);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Organization Selection - Only show if no organizationId is provided */}
            {!organizationId && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an organization" />
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter event description"
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
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={
                      isLoadingLocations || !form.watch("organizationId")
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            isLoadingLocations
                              ? "Loading locations..."
                              : !form.watch("organizationId")
                                ? "Select an organization first"
                                : "Select a location"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
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
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Location Conflict</AlertTitle>
                <AlertDescription>
                  The selected location is already booked during this time.
                  {locationConflict.conflicts &&
                    locationConflict.conflicts.length > 0 && (
                      <div className="mt-2">
                        <p className="font-semibold">Conflicting Events:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {locationConflict.conflicts.map(
                            (conflict: any, index: number) => (
                              <li key={index}>
                                {conflict.title} (
                                {format(
                                  new Date(conflict.startDateTime),
                                  "PPp",
                                )}{" "}
                                - {format(new Date(conflict.endDateTime), "p")})
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            className={"w-full pl-3 text-left font-normal"}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
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
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={"w-full pl-3 text-left font-normal"}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < form.getValues("startDate")
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Expected Attendees */}
            <FormField
              control={form.control}
              name="expectedAttendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expected Attendees</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" {...field} />
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional notes about the event"
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
              <div className="flex items-center space-x-2 mb-3">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>This is a recurring event</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {isRecurring && (
                <div className="pl-6 space-y-4">
                  {/* Recurring Pattern */}
                  <FormField
                    control={form.control}
                    name="recurringPattern"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number of Occurrences */}
                  <FormField
                    control={form.control}
                    name="numberOfOccurrences"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of Occurrences</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="52" {...field} />
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
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.push("/events")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {event ? "Update Event" : "Create Event"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
