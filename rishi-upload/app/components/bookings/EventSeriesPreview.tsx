import React, { useMemo } from "react";
import {
  RecurrencePattern,
  generateOccurrences,
  getRecurrenceDescription,
} from "@/lib/recurrence";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isAfter, isBefore, isEqual } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface EventSeriesPreviewProps {
  startDate: Date;
  startTime?: string;
  endTime?: string;
  isRecurring: boolean;
  recurrencePattern: RecurrencePattern | null;
  recurrenceEndDate: Date | null;
  location?: string;
  showTimeOfDay?: boolean;
}

export function EventSeriesPreview({
  startDate,
  startTime = "09:00",
  endTime = "17:00",
  isRecurring,
  recurrencePattern,
  recurrenceEndDate,
  location,
  showTimeOfDay = true,
}: EventSeriesPreviewProps) {
  // Create a datetime from date and time
  const startDateTime = useMemo(() => {
    if (!startDate) return new Date();

    const date = new Date(startDate);
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      date.setHours(hours || 0, minutes || 0, 0, 0);
    }
    return date;
  }, [startDate, startTime]);

  // Generate occurrences
  const occurrences = useMemo(() => {
    if (!isRecurring || !recurrencePattern) {
      return [startDateTime];
    }

    return generateOccurrences(
      startDateTime,
      recurrencePattern,
      recurrenceEndDate || undefined,
    );
  }, [isRecurring, recurrencePattern, startDateTime, recurrenceEndDate]);

  // Get event durations
  const eventDurations = useMemo(() => {
    if (!startTime || !endTime) return "All day";

    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    const startMins = startHours * 60 + startMinutes;
    const endMins = endHours * 60 + endMinutes;
    const durationMins = endMins - startMins;

    if (durationMins <= 0) return "Invalid duration";

    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;

    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ""}` : `${mins}m`;
  }, [startTime, endTime]);

  // Group occurrences by month for easier viewing
  const groupedOccurrences = useMemo(() => {
    const groups: Record<string, Date[]> = {};

    occurrences.forEach((date) => {
      const month = format(date, "MMMM yyyy");
      if (!groups[month]) {
        groups[month] = [];
      }
      groups[month].push(date);
    });

    return groups;
  }, [occurrences]);

  // If not recurring, don't show full preview
  if (!isRecurring) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Event Date & Time</CardTitle>
          <CardDescription>
            This is a one-time event that will occur on:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {format(startDateTime, "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            {showTimeOfDay && (
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {startTime} - {endTime} ({eventDurations})
                </span>
              </div>
            )}
            {location && (
              <div className="text-sm text-muted-foreground">
                Location: {location}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Description of the recurrence pattern
  const recurrenceDescription = recurrencePattern
    ? getRecurrenceDescription(recurrencePattern)
    : "One-time event";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Event Series Preview</CardTitle>
        <CardDescription>
          <Badge variant="outline" className="mr-2">
            {occurrences.length} events
          </Badge>
          {recurrenceDescription}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Time information */}
        {showTimeOfDay && (
          <div className="flex items-center text-sm">
            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
            <span>
              Each event: {startTime} - {endTime} ({eventDurations})
            </span>
          </div>
        )}

        {/* Location if provided */}
        {location && (
          <div className="text-sm text-muted-foreground">
            Location: {location}
          </div>
        )}

        {/* Event occurrences by month */}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {Object.entries(groupedOccurrences).map(([month, dates]) => (
            <div key={month} className="space-y-2">
              <h4 className="font-medium text-sm sticky top-0 bg-card z-10 py-1">
                {month}
              </h4>
              <ul className="space-y-1">
                {dates.map((date, index) => (
                  <li
                    key={date.toISOString()}
                    className="text-sm flex justify-between items-center py-1 px-2 hover:bg-accent rounded-md"
                  >
                    <span>
                      {format(date, "EEEE, MMMM d")}
                      {index === 0 && (
                        <Badge variant="outline" className="ml-2">
                          First
                        </Badge>
                      )}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      #{index + 1}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {occurrences.length > 10 && (
          <div className="text-xs text-muted-foreground italic text-center">
            Showing all {occurrences.length} occurrences in this series
          </div>
        )}
      </CardContent>
    </Card>
  );
}
