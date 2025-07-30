"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BOOKING_PRIORITY,
  BOOKING_STATUS,
  insertBookingSchema,
  type ActivityType,
  type Location,
  type PromotionType,
  type KitTemplate,
} from "@shared/schema";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SimplifiedLocationMap from "@/components/maps/SimplifiedLocationMap";

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
    startDate: z.date({ required_error: "Please select a date" }),
    endDate: z.date({ required_error: "Please select a date" }),
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
      title: "",
      description: "",
      status: BOOKING_STATUS.DRAFT,
      startDate: undefined,
      endDate: undefined,
      startTime: "",
      endTime: "",
      priority: BOOKING_PRIORITY.MEDIUM,
      budget: 0,
      staffCount: 1,
      notes: "",
      requiresTraining: false,
      attendeeEstimate: 0,
    },
  });

  // Fetch form data
  const { data: formData, isLoading: isLoadingFormData } =
    useQuery<BookingFormData>({
      queryKey: ["/api/bookings/form-data"],
      queryFn: async () => {
        const response = await fetch("/api/bookings/form-data");
        if (!response.ok) {
          throw new Error("Failed to fetch form data");
        }
        return response.json();
      },
      // Fallback to empty arrays if the API isn't implemented yet
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
          ? values.startDate.toISOString().split("T")[0]
          : null,
        endDate: values.endDate
          ? values.endDate.toISOString().split("T")[0]
          : null,
      };

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create booking");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Your booking request has been created successfully.",
      });

      // Invalidate bookings queries to refresh lists
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });

      // Redirect to bookings list
      router.push("/bookings");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
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
    form.setValue("locationId", locationId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Booking Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter booking title" {...field} />
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the purpose and goals of this booking"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
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
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g. 09:00 AM" {...field} />
                      </FormControl>
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
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
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="e.g. 05:00 PM" {...field} />
                      </FormControl>
                      <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="activityTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFormData ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
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
              name="promotionTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select promotion type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFormData ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
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
              name="kitTemplateId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kit Template</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a kit template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingFormData ? (
                        <SelectItem value="loading" disabled>
                          <Loader2 className="h-4 w-4 animate-spin" />
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

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="rounded-md border h-[300px] overflow-hidden">
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
                        value={field.value || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingFormData ? (
                            <SelectItem value="loading" disabled>
                              <Loader2 className="h-4 w-4 animate-spin" />
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="staffCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Staff Count</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
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
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={100}
                        value={field.value?.toString() || "0"}
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
              name="attendeeEstimate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Attendees</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      value={field.value?.toString() || "0"}
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/bookings")}
          >
            Cancel
          </Button>

          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {form.getValues("status") === BOOKING_STATUS.DRAFT
              ? "Save as Draft"
              : "Submit Booking"}
          </Button>

          {form.getValues("status") === BOOKING_STATUS.DRAFT && (
            <Button
              type="button"
              onClick={() => {
                form.setValue("status", BOOKING_STATUS.PENDING);
                form.handleSubmit(onSubmit)();
              }}
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit for Approval
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
