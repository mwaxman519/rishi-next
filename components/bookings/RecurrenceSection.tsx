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

import { useEffect, useMemo, useState } from "react";
import { format, addDays } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import {
  recurrenceEngine,
  RecurrenceFrequency,
  RecurrencePattern,
} from "@/app/services/recurrence-engine";

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
    <Card className="border-dashed mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Recurrence Pattern</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Frequency selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
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
          <div className="space-y-2">
            <Label>Number of Events</Label>
            <Select
              value={pattern.occurrences.toString()}
              onValueChange={handleOccurrenceChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 events</SelectItem>
                <SelectItem value="3">3 events</SelectItem>
                <SelectItem value="4">4 events</SelectItem>
                <SelectItem value="5">5 events</SelectItem>
                <SelectItem value="6">6 events</SelectItem>
                <SelectItem value="8">8 events</SelectItem>
                <SelectItem value="10">10 events</SelectItem>
                <SelectItem value="12">12 events</SelectItem>
                <SelectItem value="16">16 events</SelectItem>
                <SelectItem value="20">20 events</SelectItem>
                <SelectItem value="24">24 events</SelectItem>
                <SelectItem value="30">30 events</SelectItem>
                <SelectItem value="52">52 events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Preview of occurrences */}
        <div className="mt-4">
          <Label className="mb-2 block">Event Occurrences</Label>
          <div className="flex flex-wrap gap-2">
            {occurrences.slice(0, 8).map((occurrence, index) => (
              <Badge
                key={index}
                variant={
                  occurrence.isException
                    ? "outline"
                    : index === 0
                      ? "default"
                      : "secondary"
                }
                className={
                  occurrence.isException ? "line-through opacity-70" : ""
                }
              >
                {format(occurrence.date, "MMM d, yyyy")}
              </Badge>
            ))}
            {occurrences.length > 8 && (
              <Badge variant="outline">+{occurrences.length - 8} more</Badge>
            )}
          </div>

          <div className="flex items-start space-x-2 text-xs text-muted-foreground mt-3">
            <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
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
