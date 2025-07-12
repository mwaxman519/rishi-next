"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { addHours, format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import LocationSelector from "@/app/components/locations/LocationSelector";
// TimeRangePicker is imported but not used, using native time inputs instead

// Data will be fetched from database via API

// Activity types
const activityTypes = [
  { id: "event", name: "Event" },
  { id: "merchandising", name: "Merchandising" },
  { id: "secret_shopping", name: "Secret Shopping" },
  { id: "training", name: "Training" },
  { id: "logistics", name: "Logistics" },
  { id: "other", name: "Other" },
];

// Promotion types
const promotionTypes = [
  { id: "product_launch", name: "Product Launch" },
  { id: "seasonal", name: "Seasonal Campaign" },
  { id: "discount", name: "Discount Promotion" },
  { id: "brand_awareness", name: "Brand Awareness" },
  { id: "sampling", name: "Product Sampling" },
  { id: "demonstration", name: "Product Demonstration" },
];

// Priority levels
const priorityLevels = [
  { id: "low", name: "Low" },
  { id: "medium", name: "Medium" },
  { id: "high", name: "High" },
  { id: "urgent", name: "Urgent" },
];

// Form validation schema
const formSchema = z
  .object({
    title: z
      .string()
      .min(3, { message: "Title must be at least 3 characters long" }),
    description: z.string().optional(),
    activityType: z.string(),
    locationId: z.string().min(1, { message: "Please select a location" }),
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
      message: "Start and end times are required when not an all-day event",
      path: ["startTime"],
    },
  )
  .refine(
    (data) => {
      // For events, require promotion type
      if (data.activityType === "event") {
        return !!data.promotionType;
      }
      return true;
    },
    {
      message: "Promotion type is required for events",
      path: ["promotionType"],
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
        if (id && id !== "new") {
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
      title: "",
      description: "",
      activityType: "",
      locationId: "",
      startDate: new Date(),
      endDate: new Date(),
      allDay: false,
      startTime: "09:00",
      endTime: "17:00",
      priority: "medium",
      budget: 0,
      promotionType: "",
      kitTemplateId: "",
      requiredStaffCount: 1,
      specialInstructions: "",
    },
  });

  // Set form values when initial data is loaded
  useEffect(() => {
    if (initialData) {
      const startTime = initialData.startDate
        ? format(initialData.startDate, "HH:mm")
        : "09:00";
      const endTime = initialData.endDate
        ? format(initialData.endDate, "HH:mm")
        : "17:00";

      form.reset({
        title: initialData.title,
        description: initialData.description || "",
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
        specialInstructions: initialData.specialInstructions || "",
      });
    }
  }, [initialData, form]);

  // Watch form values for conditional rendering
  const activityType = form.watch("activityType");
  const allDay = form.watch("allDay");
  const startDate = form.watch("startDate");

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
        const [startHourStr, startMinuteStr] = values.startTime.split(":");
        const [endHourStr, endMinuteStr] = values.endTime.split(":");

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
          title: "Booking updated",
          description: "The booking has been successfully updated.",
        });

        // Redirect to booking detail page
        router.push(`/bookings/${id}`);
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      console.error("Error updating activity:", error);
      toast({
        title: "Error",
        description: "Failed to update the activity. Please try again.",
        variant: "destructive",
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
      <div className="flex justify-center py-10">
        <p>Loading booking details...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 max-w-3xl"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Basic Information
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              General details about the activity
            </p>
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activity Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter a descriptive title" {...field} />
                </FormControl>
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
                    placeholder="Describe the purpose and details of this activity"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="activityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                    value={field.value || ""}
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

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                    value={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority level" />
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
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Location</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Where this activity will take place
            </p>
          </div>

          <FormField
            control={form.control}
            name="locationId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className="space-y-2">
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
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Schedule</h2>
            <p className="text-muted-foreground text-sm mt-1">
              When this activity will take place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
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
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(date);

                            // If end date is before start date, update it
                            const endDate = form.getValues("endDate");
                            if (endDate < date) {
                              form.setValue("endDate", date);
                            }
                          }
                        }}
                        disabled={(date) => date < new Date("1900-01-01")}
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
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full pl-3 text-left font-normal"
                        >
                          {field.value ? (
                            format(field.value, "MMMM d, yyyy")
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
                        onSelect={(date) => date && field.onChange(date)}
                        disabled={(date) =>
                          date < startDate || date < new Date("1900-01-01")
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
            name="allDay"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">All-day Event</FormLabel>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          )}
        </div>

        <Separator />

        {/* Activity-specific fields */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Activity Details
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Specific information for this activity type
            </p>
          </div>

          {activityType === "event" && (
            <FormField
              control={form.control}
              name="promotionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Promotion Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value || ""}
                    value={field.value || ""}
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
          )}

          <FormField
            control={form.control}
            name="kitTemplateId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kit Template</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || ""}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a kit template" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Budget</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
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
              name="requiredStaffCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Staff</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
            name="specialInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Special Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any specific instructions or notes for this activity"
                    className="min-h-[120px]"
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
        <div className="flex items-center justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !form.formState.isDirty}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
