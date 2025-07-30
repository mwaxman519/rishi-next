import { useState, useEffect } from &quot;react&quot;;
import {
  RecurrenceFrequency,
  RecurrenceDays,
  RecurrencePattern,
  formatRecurrencePattern,
  getRecurrenceDescription,
} from &quot;@/lib/recurrence&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Calendar } from &quot;@/components/ui/calendar&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import { format } from &quot;date-fns&quot;;
import { CalendarIcon, CheckIcon } from &quot;lucide-react&quot;;
import { cn } from &quot;@/lib/utils&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { RadioGroup, RadioGroupItem } from &quot;@/components/ui/radio-group&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from &quot;@/components/ui/tooltip&quot;;

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

  const [endType, setEndType] = useState<&quot;never&quot; | &quot;on&quot; | &quot;after&quot;>(
    recurrenceEndDate ? &quot;on&quot; : &quot;never&quot;,
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
    if (endType === &quot;on&quot;) {
      delete newPattern.count;
    } else if (endType === &quot;after&quot;) {
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
        setEndType(&quot;after&quot;);
        setOccurrenceCount(recurrencePattern.count);
      } else if (recurrenceEndDate) {
        setEndType(&quot;on&quot;);
      } else {
        setEndType(&quot;never&quot;);
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

  const handleEndTypeChange = (value: &quot;never&quot; | &quot;on&quot; | &quot;after&quot;) => {
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
      <div className=&quot;space-y-4&quot;>
        <div className=&quot;flex items-center justify-between&quot;>
          <div>
            <h3 className=&quot;text-md font-medium&quot;>Repeat</h3>
            <p className=&quot;text-sm text-muted-foreground&quot;>
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
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h3 className=&quot;text-md font-medium&quot;>Repeat</h3>
          <p className=&quot;text-sm text-muted-foreground&quot;>
            Configure recurring event pattern
          </p>
        </div>
        <Switch checked={isRecurring} onCheckedChange={onIsRecurringChange} />
      </div>

      {isRecurring && (
        <>
          <Card className=&quot;border-dashed&quot;>
            <CardHeader className=&quot;pb-2&quot;>
              <CardTitle className=&quot;text-md&quot;>Recurrence Pattern</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              {/* Frequency selection */}
              <div className=&quot;space-y-2&quot;>
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
              <div className=&quot;space-y-2&quot;>
                <Label>Repeat every</Label>
                <div className=&quot;flex items-center space-x-2&quot;>
                  <Input
                    type=&quot;number&quot;
                    value={currentPattern.interval}
                    onChange={(e) => handleIntervalChange(e.target.value)}
                    min={1}
                    max={99}
                    className=&quot;w-20&quot;
                  />
                  <span>
                    {currentPattern.frequency === RecurrenceFrequency.DAILY &&
                      &quot;days&quot;}
                    {currentPattern.frequency === RecurrenceFrequency.WEEKLY &&
                      &quot;weeks&quot;}
                    {currentPattern.frequency === RecurrenceFrequency.MONTHLY &&
                      &quot;months&quot;}
                    {currentPattern.frequency === RecurrenceFrequency.YEARLY &&
                      &quot;years&quot;}
                  </span>
                </div>
              </div>

              {/* Weekly days selection */}
              {currentPattern.frequency === RecurrenceFrequency.WEEKLY && (
                <div className=&quot;space-y-2&quot;>
                  <Label>Repeat on</Label>
                  <div className=&quot;flex flex-wrap gap-2&quot;>
                    {Object.values(RecurrenceDays).map((day) => {
                      const dayLabels: Record<RecurrenceDays, string> = {
                        [RecurrenceDays.SU]: &quot;S&quot;,
                        [RecurrenceDays.MO]: &quot;M&quot;,
                        [RecurrenceDays.TU]: &quot;T&quot;,
                        [RecurrenceDays.WE]: &quot;W&quot;,
                        [RecurrenceDays.TH]: &quot;T&quot;,
                        [RecurrenceDays.FR]: &quot;F&quot;,
                        [RecurrenceDays.SA]: &quot;S&quot;,
                      };

                      const dayFullLabels: Record<RecurrenceDays, string> = {
                        [RecurrenceDays.SU]: &quot;Sunday&quot;,
                        [RecurrenceDays.MO]: &quot;Monday&quot;,
                        [RecurrenceDays.TU]: &quot;Tuesday&quot;,
                        [RecurrenceDays.WE]: &quot;Wednesday&quot;,
                        [RecurrenceDays.TH]: &quot;Thursday&quot;,
                        [RecurrenceDays.FR]: &quot;Friday&quot;,
                        [RecurrenceDays.SA]: &quot;Saturday&quot;,
                      };

                      const isSelected = currentPattern.byday?.includes(day);

                      return (
                        <TooltipProvider key={day}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={isSelected ? &quot;default&quot; : &quot;outline&quot;}
                                className={cn(
                                  &quot;h-8 w-8 cursor-pointer rounded-full p-0 flex items-center justify-center&quot;,
                                  isSelected ? &quot;bg-primary&quot; : &quot;hover:bg-muted&quot;,
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
              <div className=&quot;space-y-2&quot;>
                <Label>Ends</Label>
                <RadioGroup
                  value={endType}
                  onValueChange={handleEndTypeChange as any}
                  className=&quot;space-y-3&quot;
                >
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <RadioGroupItem value=&quot;never&quot; id=&quot;never&quot; />
                    <Label htmlFor=&quot;never&quot; className=&quot;font-normal&quot;>
                      Never
                    </Label>
                  </div>

                  <div className=&quot;flex items-center space-x-2&quot;>
                    <RadioGroupItem value=&quot;on&quot; id=&quot;on&quot; />
                    <Label htmlFor=&quot;on&quot; className=&quot;font-normal&quot;>
                      On date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant=&quot;outline&quot;
                          className={cn(
                            &quot;w-[180px] justify-start text-left font-normal&quot;,
                            !recurrenceEndDate && &quot;text-muted-foreground&quot;,
                            endType !== &quot;on&quot; &&
                              &quot;opacity-50 pointer-events-none&quot;,
                          )}
                        >
                          <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
                          {recurrenceEndDate ? (
                            format(recurrenceEndDate, &quot;PPP&quot;)
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className=&quot;w-auto p-0&quot;>
                        <Calendar
                          mode=&quot;single&quot;
                          selected={recurrenceEndDate || undefined}
                          onSelect={(date) => onRecurrenceEndDateChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className=&quot;flex items-center space-x-2&quot;>
                    <RadioGroupItem value=&quot;after&quot; id=&quot;after&quot; />
                    <Label htmlFor=&quot;after&quot; className=&quot;font-normal&quot;>
                      After
                    </Label>
                    <Input
                      type=&quot;number&quot;
                      value={occurrenceCount}
                      onChange={(e) =>
                        handleOccurrenceCountChange(e.target.value)
                      }
                      min={1}
                      max={999}
                      className={cn(
                        &quot;w-20&quot;,
                        endType !== &quot;after&quot; && &quot;opacity-50 pointer-events-none&quot;,
                      )}
                    />
                    <span>occurrences</span>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>

          <div className=&quot;text-sm text-muted-foreground italic&quot;>
            This will create a series of events based on this pattern.
          </div>
        </>
      )}
    </div>
  );
}
