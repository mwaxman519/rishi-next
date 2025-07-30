import { useState, useEffect } from "react";
import {
  RecurrenceFrequency,
  RecurrenceDays,
  RecurrencePattern,
  formatRecurrencePattern,
  getRecurrenceDescription,
} from "@/lib/recurrence";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RecurrenceFormProps {
  isRecurring: boolean;
  onIsRecurringChange: (isRecurring: boolean) => void;
  recurrencePattern: RecurrencePattern | null;
  onRecurrencePatternChange: (pattern: RecurrencePattern | null) => void;
  recurrenceEndDate: Date | null;
  onRecurrenceEndDateChange: (date: Date | null) => void;
}

export function RecurrenceForm({
  isRecurring,
  onIsRecurringChange,
  recurrencePattern,
  onRecurrencePatternChange,
  recurrenceEndDate,
  onRecurrenceEndDateChange,
}: RecurrenceFormProps) {
  // Default pattern if none provided
  const [currentPattern, setCurrentPattern] = useState<RecurrencePattern>(
    recurrencePattern || {
      frequency: RecurrenceFrequency.WEEKLY,
      interval: 1,
      byday: [RecurrenceDays.MO],
    },
  );

  const [endType, setEndType] = useState<"never" | "on" | "after">(
    recurrenceEndDate ? "on" : "never",
  );

  const [occurrenceCount, setOccurrenceCount] = useState<number>(10);

  // Update the pattern when internal state changes
  useEffect(() => {
    if (!isRecurring) {
      onRecurrencePatternChange(null);
      return;
    }

    const newPattern = { ...currentPattern };

    // Handle end conditions
    if (endType === "on") {
      delete newPattern.count;
    } else if (endType === "after") {
      newPattern.count = occurrenceCount;
      onRecurrenceEndDateChange(null);
    } else {
      delete newPattern.count;
      onRecurrenceEndDateChange(null);
    }

    onRecurrencePatternChange(newPattern);
  }, [currentPattern, endType, occurrenceCount, isRecurring]);

  // Update state when props change
  useEffect(() => {
    if (recurrencePattern) {
      setCurrentPattern(recurrencePattern);

      if (recurrencePattern.count) {
        setEndType("after");
        setOccurrenceCount(recurrencePattern.count);
      } else if (recurrenceEndDate) {
        setEndType("on");
      } else {
        setEndType("never");
      }
    }
  }, [recurrencePattern, recurrenceEndDate]);

  const handleFrequencyChange = (value: string) => {
    setCurrentPattern((prev) => ({
      ...prev,
      frequency: value as RecurrenceFrequency,
      // Reset byday when not weekly
      byday: value === RecurrenceFrequency.WEEKLY ? prev.byday : undefined,
    }));
  };

  const handleIntervalChange = (value: string) => {
    const interval = parseInt(value, 10);
    if (!isNaN(interval) && interval > 0) {
      setCurrentPattern((prev) => ({
        ...prev,
        interval,
      }));
    }
  };

  const handleDayToggle = (day: RecurrenceDays) => {
    setCurrentPattern((prev) => {
      const byday = prev.byday || [];
      const newByday = byday.includes(day)
        ? byday.filter((d) => d !== day)
        : [...byday, day];

      // Ensure at least one day is selected
      if (newByday.length === 0) {
        return prev;
      }

      return {
        ...prev,
        byday: newByday,
      };
    });
  };

  const handleEndTypeChange = (value: "never" | "on" | "after") => {
    setEndType(value);
  };

  const handleOccurrenceCountChange = (value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      setOccurrenceCount(count);
    }
  };

  if (!isRecurring) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-medium">Repeat</h3>
            <p className="text-sm text-muted-foreground">
              Is this a recurring event?
            </p>
          </div>
          <Switch checked={isRecurring} onCheckedChange={onIsRecurringChange} />
        </div>
      </div>
    );
  }

  // Get human-readable description
  const description = getRecurrenceDescription(currentPattern);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-md font-medium">Repeat</h3>
          <p className="text-sm text-muted-foreground">
            Configure recurring event pattern
          </p>
        </div>
        <Switch checked={isRecurring} onCheckedChange={onIsRecurringChange} />
      </div>

      {isRecurring && (
        <>
          <Card className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-md">Recurrence Pattern</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Frequency selection */}
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={currentPattern.frequency}
                  onValueChange={handleFrequencyChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RecurrenceFrequency.DAILY}>
                      Daily
                    </SelectItem>
                    <SelectItem value={RecurrenceFrequency.WEEKLY}>
                      Weekly
                    </SelectItem>
                    <SelectItem value={RecurrenceFrequency.MONTHLY}>
                      Monthly
                    </SelectItem>
                    <SelectItem value={RecurrenceFrequency.YEARLY}>
                      Yearly
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Interval */}
              <div className="space-y-2">
                <Label>Repeat every</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="number"
                    value={currentPattern.interval}
                    onChange={(e) => handleIntervalChange(e.target.value)}
                    min={1}
                    max={99}
                    className="w-20"
                  />
                  <span>
                    {currentPattern.frequency === RecurrenceFrequency.DAILY &&
                      "days"}
                    {currentPattern.frequency === RecurrenceFrequency.WEEKLY &&
                      "weeks"}
                    {currentPattern.frequency === RecurrenceFrequency.MONTHLY &&
                      "months"}
                    {currentPattern.frequency === RecurrenceFrequency.YEARLY &&
                      "years"}
                  </span>
                </div>
              </div>

              {/* Weekly days selection */}
              {currentPattern.frequency === RecurrenceFrequency.WEEKLY && (
                <div className="space-y-2">
                  <Label>Repeat on</Label>
                  <div className="flex flex-wrap gap-2">
                    {Object.values(RecurrenceDays).map((day) => {
                      const dayLabels: Record<RecurrenceDays, string> = {
                        [RecurrenceDays.SU]: "S",
                        [RecurrenceDays.MO]: "M",
                        [RecurrenceDays.TU]: "T",
                        [RecurrenceDays.WE]: "W",
                        [RecurrenceDays.TH]: "T",
                        [RecurrenceDays.FR]: "F",
                        [RecurrenceDays.SA]: "S",
                      };

                      const dayFullLabels: Record<RecurrenceDays, string> = {
                        [RecurrenceDays.SU]: "Sunday",
                        [RecurrenceDays.MO]: "Monday",
                        [RecurrenceDays.TU]: "Tuesday",
                        [RecurrenceDays.WE]: "Wednesday",
                        [RecurrenceDays.TH]: "Thursday",
                        [RecurrenceDays.FR]: "Friday",
                        [RecurrenceDays.SA]: "Saturday",
                      };

                      const isSelected = currentPattern.byday?.includes(day);

                      return (
                        <TooltipProvider key={day}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={isSelected ? "default" : "outline"}
                                className={cn(
                                  "h-8 w-8 cursor-pointer rounded-full p-0 flex items-center justify-center",
                                  isSelected ? "bg-primary" : "hover:bg-muted",
                                )}
                                onClick={() => handleDayToggle(day)}
                              >
                                {dayLabels[day]}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{dayFullLabels[day]}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* End condition */}
              <div className="space-y-2">
                <Label>Ends</Label>
                <RadioGroup
                  value={endType}
                  onValueChange={handleEndTypeChange as any}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="never" />
                    <Label htmlFor="never" className="font-normal">
                      Never
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="on" id="on" />
                    <Label htmlFor="on" className="font-normal">
                      On date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[180px] justify-start text-left font-normal",
                            !recurrenceEndDate && "text-muted-foreground",
                            endType !== "on" &&
                              "opacity-50 pointer-events-none",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurrenceEndDate ? (
                            format(recurrenceEndDate, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={recurrenceEndDate || undefined}
                          onSelect={(date) => onRecurrenceEndDateChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="after" id="after" />
                    <Label htmlFor="after" className="font-normal">
                      After
                    </Label>
                    <Input
                      type="number"
                      value={occurrenceCount}
                      onChange={(e) =>
                        handleOccurrenceCountChange(e.target.value)
                      }
                      min={1}
                      max={999}
                      className={cn(
                        "w-20",
                        endType !== "after" && "opacity-50 pointer-events-none",
                      )}
                    />
                    <span>occurrences</span>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground italic">
            This will create a series of events based on this pattern.
          </div>
        </>
      )}
    </div>
  );
}
