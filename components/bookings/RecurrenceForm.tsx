&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { z } from &quot;zod&quot;;
import { FormControl, FormLabel } from &quot;@/components/ui/form&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Checkbox } from &quot;@/components/ui/checkbox&quot;;
import { DatePicker } from &quot;@/components/ui/date-picker&quot;;
import { RadioGroup, RadioGroupItem } from &quot;@/components/ui/radio-group&quot;;
import { addDays, addMonths, addWeeks, format } from &quot;date-fns&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Calendar, Info } from &quot;lucide-react&quot;;
import { CheckedState } from &quot;@radix-ui/react-checkbox&quot;;

// Define form schema using Zod
const recurrenceFormSchema = z.object({
  frequency: z.enum([&quot;daily&quot;, &quot;weekly&quot;, &quot;monthly&quot;], {
    required_error: &quot;Please select a recurrence frequency&quot;,
  }),
  interval: z.coerce.number().min(1).default(1),
  weekdays: z.array(z.string()).optional(),
  monthDay: z.coerce.number().min(1).max(31).optional(),
  endType: z.enum([&quot;never&quot;, &quot;after&quot;, &quot;on&quot;], {
    required_error: &quot;Please select when the recurrence ends&quot;,
  }),
  occurrences: z.coerce.number().min(1).optional(),
  endDate: z.date().optional(),
});

type RecurrenceFormValues = z.infer<typeof recurrenceFormSchema>;

// Default values for the form
const defaultValues: RecurrenceFormValues = {
  frequency: &quot;weekly&quot;,
  interval: 1,
  weekdays: [&quot;monday&quot;],
  endType: &quot;after&quot;,
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
  const [previewText, setPreviewText] = useState<string>("&quot;);
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
      endType === &quot;after&quot; && occurrences
        ? Math.min(occurrences, maxPreviewDates)
        : maxPreviewDates;

    let currentDate = new Date(startDate);

    for (let i = 0; i < maxDatesToCalculate; i++) {
      if (frequency === &quot;daily&quot;) {
        currentDate = addDays(currentDate, interval);
      } else if (frequency === &quot;weekly&quot;) {
        // For weekly, we need to account for selected days
        if (weekdays && weekdays.length > 0) {
          // This is simplified - in a real app you'd need more robust day-of-week handling
          currentDate = addDays(currentDate, 7 * interval);
        } else {
          currentDate = addWeeks(currentDate, interval);
        }
      } else if (frequency === &quot;monthly&quot;) {
        currentDate = addMonths(currentDate, interval);
      }

      // If we have an end date and we've passed it, stop adding dates
      if (endType === &quot;on&quot; && endDate && currentDate > endDate) {
        break;
      }

      dates.push(new Date(currentDate));
    }

    setPreviewDates(dates);
  }, [formData, startDate]);

  // Update preview text when form values change
  useEffect(() => {
    let preview = &quot;Occurs &quot;;
    const { frequency, interval, weekdays, endType, occurrences, endDate } =
      formData;

    // Frequency and interval
    if (frequency === &quot;daily&quot;) {
      preview += interval === 1 ? &quot;daily&quot; : `every ${interval} days`;
    } else if (frequency === &quot;weekly&quot;) {
      preview += interval === 1 ? &quot;weekly&quot; : `every ${interval} weeks`;

      if (weekdays && weekdays.length > 0) {
        const daysText = weekdays
          .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
          .join(&quot;, &quot;);
        preview += ` on ${daysText}`;
      }
    } else if (frequency === &quot;monthly&quot;) {
      preview += interval === 1 ? &quot;monthly&quot; : `every ${interval} months`;
    }

    // End date
    if (endType === &quot;never&quot;) {
      preview += &quot; with no end date&quot;;
    } else if (endType === &quot;after&quot; && occurrences) {
      preview += ` for ${occurrences} occurrences`;

      // Calculate end date based on occurrences
      let lastDate = new Date(startDate);
      for (let i = 0; i < occurrences; i++) {
        if (frequency === &quot;daily&quot;) {
          lastDate = addDays(lastDate, interval || 1);
        } else if (frequency === &quot;weekly&quot;) {
          lastDate = addWeeks(lastDate, interval || 1);
        } else if (frequency === &quot;monthly&quot;) {
          lastDate = addMonths(lastDate, interval || 1);
        }
      }

      preview += ` (until ${format(lastDate, &quot;MMMM d, yyyy&quot;)})`;
    } else if (endType === &quot;on&quot; && endDate) {
      preview += ` until ${format(endDate, &quot;MMMM d, yyyy&quot;)}`;
    }

    setPreviewText(preview);
  }, [formData, startDate]);

  const handleChange = (field: keyof RecurrenceFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
        <div>
          <div className=&quot;space-y-4&quot;>
            <div>
              <FormLabel>Repeats</FormLabel>
              <Select
                value={formData.frequency || &quot;weekly&quot;}
                onValueChange={(value: &quot;daily&quot; | &quot;weekly&quot; | &quot;monthly&quot;) =>
                  handleChange(&quot;frequency&quot;, value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder=&quot;Select frequency&quot; />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;daily&quot;>Daily</SelectItem>
                  <SelectItem value=&quot;weekly&quot;>Weekly</SelectItem>
                  <SelectItem value=&quot;monthly&quot;>Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className=&quot;flex items-center space-x-2&quot;>
              <span className=&quot;text-sm text-muted-foreground&quot;>Every</span>
              <div className=&quot;w-16&quot;>
                <Input
                  type=&quot;number&quot;
                  min={1}
                  value={formData.interval || 1}
                  onChange={(e) =>
                    handleChange(&quot;interval&quot;, Number(e.target.value))
                  }
                  className=&quot;h-9&quot;
                />
              </div>
              <span className=&quot;text-sm text-muted-foreground&quot;>
                {formData.frequency === &quot;daily&quot;
                  ? &quot;days&quot;
                  : formData.frequency === &quot;weekly&quot;
                    ? &quot;weeks&quot;
                    : &quot;months&quot;}
              </span>
            </div>

            {formData.frequency === &quot;weekly&quot; && (
              <div>
                <FormLabel className=&quot;mb-2 block&quot;>On these days</FormLabel>
                <div className=&quot;grid grid-cols-7 gap-2&quot;>
                  {[
                    &quot;monday&quot;,
                    &quot;tuesday&quot;,
                    &quot;wednesday&quot;,
                    &quot;thursday&quot;,
                    &quot;friday&quot;,
                    &quot;saturday&quot;,
                    &quot;sunday&quot;,
                  ].map((day) => (
                    <div
                      key={day}
                      className=&quot;flex flex-col items-center space-y-2&quot;
                    >
                      <Checkbox
                        checked={formData.weekdays?.includes(day) || false}
                        onCheckedChange={(checked: CheckedState) => {
                          if (checked) {
                            handleChange(&quot;weekdays&quot;, [
                              ...(formData.weekdays || []),
                              day,
                            ]);
                          } else {
                            handleChange(
                              &quot;weekdays&quot;,
                              formData.weekdays?.filter((d) => d !== day) || [],
                            );
                          }
                        }}
                        id={`day-${day}`}
                      />
                      <FormLabel
                        htmlFor={`day-${day}`}
                        className=&quot;text-xs cursor-pointer&quot;
                      >
                        {day.slice(0, 3)}
                      </FormLabel>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className=&quot;space-y-3&quot;>
              <FormLabel>End</FormLabel>
              <RadioGroup
                value={formData.endType || &quot;after&quot;}
                onValueChange={(value: &quot;never&quot; | &quot;after&quot; | &quot;on&quot;) =>
                  handleChange(&quot;endType&quot;, value)
                }
                className=&quot;flex flex-col space-y-3&quot;
              >
                <div className=&quot;flex items-center space-x-3 space-y-0&quot;>
                  <RadioGroupItem value=&quot;never&quot; id=&quot;never&quot; />
                  <FormLabel
                    htmlFor=&quot;never&quot;
                    className=&quot;font-normal cursor-pointer&quot;
                  >
                    Never
                  </FormLabel>
                </div>
                <div className=&quot;flex items-center space-x-3&quot;>
                  <RadioGroupItem value=&quot;after&quot; id=&quot;after&quot; />
                  <FormLabel
                    htmlFor=&quot;after&quot;
                    className=&quot;font-normal cursor-pointer&quot;
                  >
                    After
                  </FormLabel>
                  <div className=&quot;w-16&quot;>
                    <Input
                      type=&quot;number&quot;
                      min={1}
                      disabled={formData.endType !== &quot;after&quot;}
                      value={formData.occurrences || 6}
                      onChange={(e) =>
                        handleChange(&quot;occurrences&quot;, Number(e.target.value))
                      }
                      className=&quot;h-9&quot;
                    />
                  </div>
                  <span className=&quot;text-sm text-muted-foreground&quot;>
                    occurrences
                  </span>
                </div>
                <div className=&quot;flex items-center space-x-3&quot;>
                  <RadioGroupItem value=&quot;on&quot; id=&quot;on&quot; />
                  <FormLabel
                    htmlFor=&quot;on&quot;
                    className=&quot;font-normal cursor-pointer&quot;
                  >
                    On date
                  </FormLabel>
                  <DatePicker
                    date={formData.endDate}
                    setDate={(date) => handleChange(&quot;endDate&quot;, date)}
                    disabled={formData.endType !== &quot;on&quot;}
                  />
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className=&quot;bg-muted/20 rounded-md p-4 space-y-4&quot;>
          <div className=&quot;flex items-center space-x-2&quot;>
            <Calendar className=&quot;h-4 w-4 text-primary&quot; />
            <h3 className=&quot;text-sm font-medium&quot;>Pattern Summary</h3>
          </div>

          <div className=&quot;rounded-md border border-dashed border-muted-foreground/30 p-3&quot;>
            <p className=&quot;text-sm text-muted-foreground&quot;>{previewText}</p>
          </div>

          {previewDates.length > 0 && (
            <div>
              <p className=&quot;text-sm mb-2 font-medium&quot;>
                Next {previewDates.length} occurrences:
              </p>
              <div className=&quot;flex flex-wrap gap-2&quot;>
                {previewDates.map((date, i) => (
                  <Badge key={i} variant=&quot;outline&quot; className=&quot;font-normal&quot;>
                    {format(date, &quot;MMM d, yyyy&quot;)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className=&quot;flex items-start space-x-2 text-xs text-muted-foreground mt-2&quot;>
            <Info className=&quot;h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
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
