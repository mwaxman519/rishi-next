"use client";

import React, { useState, useEffect } from "react";
import { z } from "zod";
import { FormControl, FormLabel } from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { DatePicker } from "../ui/date-picker";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { addDays, addMonths, addWeeks, format } from "date-fns";
import { Badge } from "../ui/badge";
import { Calendar, Info } from "lucide-react";
import { CheckedState } from "@radix-ui/react-checkbox";

// Define form schema using Zod
const recurrenceFormSchema = z.object({
  frequency: z.enum(["daily", "weekly", "monthly"], {
    required_error: "Please select a recurrence frequency",
  }),
  interval: z.coerce.number().min(1).default(1),
  weekdays: z.array(z.string()).optional(),
  monthDay: z.coerce.number().min(1).max(31).optional(),
  endType: z.enum(["never", "after", "on"], {
    required_error: "Please select when the recurrence ends",
  }),
  occurrences: z.coerce.number().min(1).optional(),
  endDate: z.date().optional(),
});

type RecurrenceFormValues = z.infer<typeof recurrenceFormSchema>;

// Default values for the form
const defaultValues: RecurrenceFormValues = {
  frequency: "weekly",
  interval: 1,
  weekdays: ["monday"],
  endType: "after",
  occurrences: 6,
  monthDay: 1,
  endDate: undefined,
};

interface RecurrenceFormProps {
  value?: Partial<RecurrenceFormValues>;
  onChange?: (data: Partial<RecurrenceFormValues>) => void;
  startDate?: Date;
}

export function RecurrenceForm({
  value = {},
  onChange,
  startDate = new Date(),
}: RecurrenceFormProps) {
  // Merge provided value with defaults
  const initialData = { ...defaultValues, ...value };
  const [formData, setFormData] = useState<RecurrenceFormValues>(initialData);
  const [previewText, setPreviewText] = useState<string>("");
  const [previewDates, setPreviewDates] = useState<Date[]>([]);

  // Update the parent form when our local state changes
  useEffect(() => {
    if (onChange) {
      onChange(formData);
    }
  }, [formData, onChange]);

  // Calculate preview dates based on recurrence pattern
  useEffect(() => {
    const dates: Date[] = [];
    const { frequency, interval, weekdays, endType, occurrences, endDate } =
      formData;

    if (!frequency) return;

    // Number of dates to preview (limited to reasonable number)
    const maxPreviewDates = 10;
    const maxDatesToCalculate =
      endType === "after" && occurrences
        ? Math.min(occurrences, maxPreviewDates)
        : maxPreviewDates;

    let currentDate = new Date(startDate);

    for (let i = 0; i < maxDatesToCalculate; i++) {
      if (frequency === "daily") {
        currentDate = addDays(currentDate, interval);
      } else if (frequency === "weekly") {
        // For weekly, we need to account for selected days
        if (weekdays && weekdays.length > 0) {
          // This is simplified - in a real app you'd need more robust day-of-week handling
          currentDate = addDays(currentDate, 7 * interval);
        } else {
          currentDate = addWeeks(currentDate, interval);
        }
      } else if (frequency === "monthly") {
        currentDate = addMonths(currentDate, interval);
      }

      // If we have an end date and we've passed it, stop adding dates
      if (endType === "on" && endDate && currentDate > endDate) {
        break;
      }

      dates.push(new Date(currentDate));
    }

    setPreviewDates(dates);
  }, [formData, startDate]);

  // Update preview text when form values change
  useEffect(() => {
    let preview = "Occurs ";
    const { frequency, interval, weekdays, endType, occurrences, endDate } =
      formData;

    // Frequency and interval
    if (frequency === "daily") {
      preview += interval === 1 ? "daily" : `every ${interval} days`;
    } else if (frequency === "weekly") {
      preview += interval === 1 ? "weekly" : `every ${interval} weeks`;

      if (weekdays && weekdays.length > 0) {
        const daysText = weekdays
          .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(", ");
        preview += ` on ${daysText}`;
      }
    } else if (frequency === "monthly") {
      preview += interval === 1 ? "monthly" : `every ${interval} months`;
    }

    // End date
    if (endType === "never") {
      preview += " with no end date";
    } else if (endType === "after" && occurrences) {
      preview += ` for ${occurrences} occurrences`;

      // Calculate end date based on occurrences
      let lastDate = new Date(startDate);
      for (let i = 0; i < occurrences; i++) {
        if (frequency === "daily") {
          lastDate = addDays(lastDate, interval || 1);
        } else if (frequency === "weekly") {
          lastDate = addWeeks(lastDate, interval || 1);
        } else if (frequency === "monthly") {
          lastDate = addMonths(lastDate, interval || 1);
        }
      }

      preview += ` (until ${format(lastDate, "MMMM d, yyyy")})`;
    } else if (endType === "on" && endDate) {
      preview += ` until ${format(endDate, "MMMM d, yyyy")}`;
    }

    setPreviewText(preview);
  }, [formData, startDate]);

  const handleChange = (field: keyof RecurrenceFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="space-y-4">
            <div>
              <FormLabel>Repeats</FormLabel>
              <Select
                value={formData.frequency || "weekly"}
                onValueChange={(value: "daily" | "weekly" | "monthly") =>
                  handleChange("frequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Every</span>
              <div className="w-16">
                <Input
                  type="number"
                  min={1}
                  value={formData.interval || 1}
                  onChange={(e) =>
                    handleChange("interval", Number(e.target.value))
                  }
                  className="h-9"
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {formData.frequency === "daily"
                  ? "days"
                  : formData.frequency === "weekly"
                    ? "weeks"
                    : "months"}
              </span>
            </div>

            {formData.frequency === "weekly" && (
              <div>
                <FormLabel className="mb-2 block">On these days</FormLabel>
                <div className="grid grid-cols-7 gap-2">
                  {[
                    "monday",
                    "tuesday",
                    "wednesday",
                    "thursday",
                    "friday",
                    "saturday",
                    "sunday",
                  ].map((day) => (
                    <div
                      key={day}
                      className="flex flex-col items-center space-y-2"
                    >
                      <Checkbox
                        checked={formData.weekdays?.includes(day) || false}
                        onCheckedChange={(checked: CheckedState) => {
                          if (checked) {
                            handleChange("weekdays", [
                              ...(formData.weekdays || []),
                              day,
                            ]);
                          } else {
                            handleChange(
                              "weekdays",
                              formData.weekdays?.filter((d) => d !== day) || [],
                            );
                          }
                        }}
                        id={`day-${day}`}
                      />
                      <FormLabel
                        htmlFor={`day-${day}`}
                        className="text-xs cursor-pointer"
                      >
                        {day.slice(0, 3)}
                      </FormLabel>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <FormLabel>End</FormLabel>
              <RadioGroup
                value={formData.endType || "after"}
                onValueChange={(value: "never" | "after" | "on") =>
                  handleChange("endType", value)
                }
                className="flex flex-col space-y-3"
              >
                <div className="flex items-center space-x-3 space-y-0">
                  <RadioGroupItem value="never" id="never" />
                  <FormLabel
                    htmlFor="never"
                    className="font-normal cursor-pointer"
                  >
                    Never
                  </FormLabel>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="after" id="after" />
                  <FormLabel
                    htmlFor="after"
                    className="font-normal cursor-pointer"
                  >
                    After
                  </FormLabel>
                  <div className="w-16">
                    <Input
                      type="number"
                      min={1}
                      disabled={formData.endType !== "after"}
                      value={formData.occurrences || 6}
                      onChange={(e) =>
                        handleChange("occurrences", Number(e.target.value))
                      }
                      className="h-9"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">
                    occurrences
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="on" id="on" />
                  <FormLabel
                    htmlFor="on"
                    className="font-normal cursor-pointer"
                  >
                    On date
                  </FormLabel>
                  <DatePicker
                    date={formData.endDate}
                    setDate={(date) => handleChange("endDate", date)}
                    disabled={formData.endType !== "on"}
                  />
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="bg-muted/20 rounded-md p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-medium">Pattern Summary</h3>
          </div>

          <div className="rounded-md border border-dashed border-muted-foreground/30 p-3">
            <p className="text-sm text-muted-foreground">{previewText}</p>
          </div>

          {previewDates.length > 0 && (
            <div>
              <p className="text-sm mb-2 font-medium">
                Next {previewDates.length} occurrences:
              </p>
              <div className="flex flex-wrap gap-2">
                {previewDates.map((date, i) => (
                  <Badge key={i} variant="outline" className="font-normal">
                    {format(date, "MMM d, yyyy")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start space-x-2 text-xs text-muted-foreground mt-2">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p>
              This is a preview of your recurring pattern. The actual events
              will be created when you submit the booking form.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
