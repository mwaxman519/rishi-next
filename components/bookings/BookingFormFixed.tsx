"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Minimal form schema for the example
const bookingFormSchema = z.object({
  date: z.date(),
  startTime: z.string(),
  endTime: z.string(),
  isRecurring: z.boolean().default(false),
  recurringFrequency: z.string().optional(),
  recurringCount: z.number().optional(),
  sendInvites: z.boolean().default(false),
  inviteEmails: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormValues) => void;
  onCancel: () => void;
}

export function BookingFormFixed({ onSubmit, onCancel }: BookingFormProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      date: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      isRecurring: false,
      recurringFrequency: "weekly",
      recurringCount: 4,
      sendInvites: false,
      inviteEmails: "",
    },
  });

  const handleSubmit = (data: BookingFormValues) => {
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      onSubmit(data);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-800 shadow-sm">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b">
              <div className="px-6">
                <TabsList className="grid grid-cols-2 mt-4 bg-transparent">
                  <TabsTrigger
                    value="details"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    Event Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="options"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary"
                  >
                    Options
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="details" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  {/* Date Field */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.getValues("date") && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues("date") ? (
                            format(form.getValues("date"), "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={form.getValues("date")}
                          onSelect={(date) =>
                            form.setValue("date", date as Date)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Start Time */}
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time</Label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              <span>
                                {form.watch("startTime") || "Select start time"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="custom-start-time">Time</Label>
                                <Input
                                  id="custom-start-time"
                                  type="time"
                                  value={form.watch("startTime")}
                                  onChange={(e) =>
                                    form.setValue("startTime", e.target.value)
                                  }
                                  className="mt-1 w-full"
                                />
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  "09:00",
                                  "10:00",
                                  "12:00",
                                  "13:00",
                                  "14:00",
                                  "15:00",
                                  "16:00",
                                  "17:00",
                                ].map((time) => (
                                  <Button
                                    key={time}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      form.watch("startTime") === time &&
                                        "bg-primary text-primary-foreground",
                                    )}
                                    onClick={() => {
                                      form.setValue("startTime", time);
                                    }}
                                    type="button"
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time</Label>
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4" />
                              <span>
                                {form.watch("endTime") || "Select end time"}
                              </span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4">
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="custom-end-time">Time</Label>
                                <Input
                                  id="custom-end-time"
                                  type="time"
                                  value={form.watch("endTime")}
                                  onChange={(e) =>
                                    form.setValue("endTime", e.target.value)
                                  }
                                  className="mt-1 w-full"
                                />
                              </div>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  "10:00",
                                  "11:00",
                                  "13:00",
                                  "14:00",
                                  "15:00",
                                  "16:00",
                                  "17:00",
                                  "18:00",
                                ].map((time) => (
                                  <Button
                                    key={time}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                      form.watch("endTime") === time &&
                                        "bg-primary text-primary-foreground",
                                    )}
                                    onClick={() => {
                                      form.setValue("endTime", time);
                                    }}
                                    type="button"
                                  >
                                    {time}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="options" className="mt-0 space-y-6">
                <div className="space-y-6">
                  {/* Recurring Event Option */}
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className={cn(
                        "w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors",
                        form.watch("isRecurring") && "border-b border-border",
                      )}
                      onClick={() =>
                        form.setValue("isRecurring", !form.watch("isRecurring"))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full",
                            form.watch("isRecurring")
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted-foreground/20 text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Recurring Event</div>
                          <p className="text-muted-foreground text-sm">
                            Set this event to repeat on a schedule
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-sm",
                            form.watch("isRecurring")
                              ? "text-primary font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {form.watch("isRecurring") ? "Enabled" : "Disabled"}
                        </span>
                        <div
                          className="transform transition-transform duration-200"
                          style={{
                            transform: form.watch("isRecurring")
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {form.watch("isRecurring") && (
                      <div className="p-4 grid grid-cols-2 gap-4">
                        {/* Frequency Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="recurringFrequency">Frequency</Label>
                          <Select
                            onValueChange={(value) =>
                              form.setValue("recurringFrequency", value)
                            }
                            value={form.watch("recurringFrequency")}
                          >
                            <SelectTrigger id="recurringFrequency">
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="biweekly">
                                Bi-weekly
                              </SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Count Selection */}
                        <div className="space-y-2">
                          <Label htmlFor="recurringCount">
                            Number of Events
                          </Label>
                          <Select
                            onValueChange={(value) =>
                              form.setValue("recurringCount", parseInt(value))
                            }
                            value={form.watch("recurringCount")?.toString()}
                          >
                            <SelectTrigger id="recurringCount">
                              <SelectValue placeholder="Select count" />
                            </SelectTrigger>
                            <SelectContent>
                              {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                                (count) => (
                                  <SelectItem
                                    key={count}
                                    value={count.toString()}
                                  >
                                    {count} events
                                  </SelectItem>
                                ),
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Calendar Invites Option */}
                  <div className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className={cn(
                        "w-full p-4 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors",
                        form.watch("sendInvites") && "border-b border-border",
                      )}
                      onClick={() =>
                        form.setValue("sendInvites", !form.watch("sendInvites"))
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full",
                            form.watch("sendInvites")
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted-foreground/20 text-muted-foreground",
                          )}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                            <polyline points="22,6 12,13 2,6"></polyline>
                          </svg>
                        </div>
                        <div className="text-left">
                          <div className="font-medium">
                            Send Calendar Invites
                          </div>
                          <p className="text-muted-foreground text-sm">
                            Send calendar invitations to all participants
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "text-sm",
                            form.watch("sendInvites")
                              ? "text-primary font-medium"
                              : "text-muted-foreground",
                          )}
                        >
                          {form.watch("sendInvites") ? "Enabled" : "Disabled"}
                        </span>
                        <div
                          className="transform transition-transform duration-200"
                          style={{
                            transform: form.watch("sendInvites")
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-muted-foreground"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </div>
                      </div>
                    </button>

                    {form.watch("sendInvites") && (
                      <div className="p-4 space-y-3">
                        <Label htmlFor="inviteEmails">
                          Participant Email Addresses
                        </Label>
                        <Textarea
                          id="inviteEmails"
                          placeholder="Enter email addresses separated by commas"
                          {...form.register("inviteEmails")}
                          className="min-h-[100px]"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("details")}
                  >
                    Back
                  </Button>

                  <div className="space-x-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
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
  );
}
