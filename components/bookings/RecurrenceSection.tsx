/**
 * Recurrence Section Component
 *
 * Part of the Booking Microservice architecture, this component handles
 * the UI for configuring recurring events. It integrates with the
 * recurrence engine service for efficient calculation and preview
 * of recurring event dates.
 *
 * This component implements:
 * - Recurrence pattern configuration
 * - Visual preview of event occurrences
 * - Memory-efficient date generation
 */

import { useEffect, useMemo, useState } from &quot;react&quot;;
import { format, addDays } from &quot;date-fns&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Info } from &quot;lucide-react&quot;;
import {
  recurrenceEngine,
  RecurrenceFrequency,
  RecurrencePattern,
} from &quot;@/app/services/recurrence-engine&quot;;

interface RecurrenceSectionProps {
  isRecurring: boolean;
  startDate: Date;
  onChange: (pattern: RecurrencePattern) => void;
}

export default function RecurrenceSection({
  isRecurring,
  startDate,
  onChange,
}: RecurrenceSectionProps) {
  // Don't render anything if recurrence is disabled
  if (!isRecurring) return null;

  // Initialize state for recurrence pattern
  const [pattern, setPattern] = useState<RecurrencePattern>({
    frequency: RecurrenceFrequency.WEEKLY,
    occurrences: 4,
    startDate: startDate || new Date(),
  });

  // Update pattern when props change
  useEffect(() => {
    setPattern((prev) => ({
      ...prev,
      startDate: startDate || new Date(),
    }));
  }, [startDate]);

  // Generate occurrences using the recurrence engine
  // This uses memoization for performance optimization
  const occurrences = useMemo(() => {
    if (!recurrenceEngine.validatePattern(pattern)) {
      return [];
    }
    return recurrenceEngine.generateOccurrences(pattern);
  }, [pattern]);

  // Get a human-readable description
  const description = useMemo(() => {
    return recurrenceEngine.getPatternDescription(pattern);
  }, [pattern]);

  // Handler for frequency changes
  const handleFrequencyChange = (value: string) => {
    const newPattern = {
      ...pattern,
      frequency: value as RecurrenceFrequency,
    };
    setPattern(newPattern);
    onChange(newPattern);
  };

  // Handler for occurrence count changes
  const handleOccurrenceChange = (value: string) => {
    const count = parseInt(value, 10);
    const newPattern = {
      ...pattern,
      occurrences: count,
    };
    setPattern(newPattern);
    onChange(newPattern);
  };

  return (
    <Card className=&quot;border-dashed mt-4&quot;>
      <CardHeader className=&quot;pb-2&quot;>
        <CardTitle className=&quot;text-md&quot;>Recurrence Pattern</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className=&quot;space-y-4&quot;>
        {/* Frequency selection */}
        <div className=&quot;grid grid-cols-2 gap-4&quot;>
          <div className=&quot;space-y-2&quot;>
            <Label>Frequency</Label>
            <Select
              value={pattern.frequency}
              onValueChange={handleFrequencyChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RecurrenceFrequency.DAILY}>Daily</SelectItem>
                <SelectItem value={RecurrenceFrequency.WEEKLY}>
                  Weekly
                </SelectItem>
                <SelectItem value={RecurrenceFrequency.MONTHLY}>
                  Monthly
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Occurrences selection */}
          <div className=&quot;space-y-2&quot;>
            <Label>Number of Events</Label>
            <Select
              value={pattern.occurrences.toString()}
              onValueChange={handleOccurrenceChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;2&quot;>2 events</SelectItem>
                <SelectItem value=&quot;3&quot;>3 events</SelectItem>
                <SelectItem value=&quot;4&quot;>4 events</SelectItem>
                <SelectItem value=&quot;5&quot;>5 events</SelectItem>
                <SelectItem value=&quot;6&quot;>6 events</SelectItem>
                <SelectItem value=&quot;8&quot;>8 events</SelectItem>
                <SelectItem value=&quot;10&quot;>10 events</SelectItem>
                <SelectItem value=&quot;12&quot;>12 events</SelectItem>
                <SelectItem value=&quot;16&quot;>16 events</SelectItem>
                <SelectItem value=&quot;20&quot;>20 events</SelectItem>
                <SelectItem value=&quot;24&quot;>24 events</SelectItem>
                <SelectItem value=&quot;30&quot;>30 events</SelectItem>
                <SelectItem value=&quot;52&quot;>52 events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview of occurrences */}
        <div className=&quot;mt-4&quot;>
          <Label className=&quot;mb-2 block&quot;>Event Occurrences</Label>
          <div className=&quot;flex flex-wrap gap-2&quot;>
            {occurrences.slice(0, 8).map((occurrence, index) => (
              <Badge
                key={index}
                variant={
                  occurrence.isException
                    ? &quot;outline&quot;
                    : index === 0
                      ? &quot;default&quot;
                      : &quot;secondary&quot;
                }
                className={
                  occurrence.isException ? &quot;line-through opacity-70&quot; : "&quot;
                }
              >
                {format(occurrence.date, &quot;MMM d, yyyy&quot;)}
              </Badge>
            ))}
            {occurrences.length > 8 && (
              <Badge variant=&quot;outline&quot;>+{occurrences.length - 8} more</Badge>
            )}
          </div>

          <div className=&quot;flex items-start space-x-2 text-xs text-muted-foreground mt-3&quot;>
            <Info className=&quot;h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
            <p>
              This is a preview of your recurring pattern. The actual events
              will be created when you submit the booking form.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
