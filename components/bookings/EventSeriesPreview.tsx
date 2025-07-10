"use client";

import { useState, useEffect, useMemo } from "react";
import { CalendarIcon, Clock, Info, ListFilter } from "lucide-react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// Function to parse RRule-like recurrence pattern
function parseRecurrencePattern(pattern: string): {
  frequency: string;
  interval: number;
  byDay?: string[];
  byMonthDay?: number;
} {
  const parts = pattern.split(";");
  const result: any = {};

  parts.forEach((part) => {
    const [key, value] = part.split("=");

    switch (key) {
      case "FREQ":
        result.frequency = value;
        break;
      case "INTERVAL":
        result.interval = parseInt(value, 10);
        break;
      case "BYDAY":
        result.byDay = value.split(",");
        break;
      case "BYMONTHDAY":
        result.byMonthDay = parseInt(value, 10);
        break;
      default:
        break;
    }
  });

  return result;
}

// Mapping of day codes to day indices (0 = Monday, 6 = Sunday)
const dayToIndex: Record<string, number> = {
  MO: 1,
  TU: 2,
  WE: 3,
  TH: 4,
  FR: 5,
  SA: 6,
  SU: 0,
};

interface EventSeriesPreviewProps {
  startDate: Date;
  recurrencePattern: string;
  endDate: Date | null;
  count: number | null;
  startTime?: string;
  endTime?: string;
  locationName?: string;
}

export function EventSeriesPreview({
  startDate,
  recurrencePattern,
  endDate,
  count,
  startTime,
  endTime,
  locationName,
}: EventSeriesPreviewProps) {
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [visibleCount, setVisibleCount] = useState<number>(10);

  // Generate all occurrences based on the recurrence pattern
  const occurrences = useMemo(() => {
    if (!recurrencePattern) return [startDate];

    const pattern = parseRecurrencePattern(recurrencePattern);
    const dates: Date[] = [new Date(startDate)];
    const startDay = startDate.getDay(); // 0 = Sunday, 6 = Saturday

    let maxCount = count || 100; // Default to 100 occurrences if count not specified
    if (maxCount > 100) maxCount = 100; // Limit to prevent excessive calculations

    // For end date, calculate approximate count
    if (endDate && !count) {
      const endDateObj = new Date(endDate);

      // Rough estimate based on frequency
      if (pattern.frequency === "DAILY") {
        const days = Math.round(
          (endDateObj.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        maxCount = Math.min(Math.ceil(days / pattern.interval), 100);
      } else if (pattern.frequency === "WEEKLY") {
        const weeks = Math.round(
          (endDateObj.getTime() - startDate.getTime()) /
            (1000 * 60 * 60 * 24 * 7),
        );
        maxCount = Math.min(Math.ceil(weeks / pattern.interval), 100);
      } else if (pattern.frequency === "MONTHLY") {
        const months =
          (endDateObj.getFullYear() - startDate.getFullYear()) * 12 +
          (endDateObj.getMonth() - startDate.getMonth());
        maxCount = Math.min(Math.ceil(months / pattern.interval), 100);
      } else if (pattern.frequency === "YEARLY") {
        const years = endDateObj.getFullYear() - startDate.getFullYear();
        maxCount = Math.min(Math.ceil(years / pattern.interval), 100);
      }

      // Ensure at least the start date is included
      maxCount = Math.max(maxCount, 1);
    }

    let currentDate = new Date(startDate);
    let currentCount = 1; // Start date is already in the array

    // Calculate next occurrence based on frequency
    while (currentCount < maxCount) {
      let nextDate: Date | null = null;

      switch (pattern.frequency) {
        case "DAILY":
          nextDate = addDays(currentDate, pattern.interval);
          break;

        case "WEEKLY":
          if (pattern.byDay && pattern.byDay.length > 0) {
            // Find the next occurrence based on selected days
            // Start with the next day after current date
            let tempDate = addDays(currentDate, 1);
            let foundNextDate = false;

            // Check up to 7 * interval days ahead
            for (let i = 0; i < 7 * pattern.interval && !foundNextDate; i++) {
              const dayIndex = tempDate.getDay(); // 0 = Sunday, 6 = Saturday
              const dayCode = Object.keys(dayToIndex).find(
                (key) => dayToIndex[key] === dayIndex,
              );

              if (dayCode && pattern.byDay.includes(dayCode)) {
                // If we've gone past the interval, this is the next occurrence
                const weekDiff = Math.floor(i / 7);
                if (weekDiff >= pattern.interval) {
                  nextDate = tempDate;
                  foundNextDate = true;
                }
              }

              if (!foundNextDate) {
                tempDate = addDays(tempDate, 1);
              }
            }

            // If no next date found using the day pattern, just add weeks
            if (!nextDate) {
              nextDate = addWeeks(currentDate, pattern.interval);
            }
          } else {
            // Simple case - just add weeks
            nextDate = addWeeks(currentDate, pattern.interval);
          }
          break;

        case "MONTHLY":
          if (pattern.byMonthDay) {
            // Add months and set to specific day
            nextDate = addMonths(currentDate, pattern.interval);
            nextDate.setDate(
              Math.min(
                pattern.byMonthDay,
                new Date(
                  nextDate.getFullYear(),
                  nextDate.getMonth() + 1,
                  0,
                ).getDate(),
              ),
            ); // Adjust for shorter months
          } else {
            // Simple case - just add months
            nextDate = addMonths(currentDate, pattern.interval);
          }
          break;

        case "YEARLY":
          nextDate = addYears(currentDate, pattern.interval);
          break;

        default:
          nextDate = addWeeks(currentDate, pattern.interval);
      }

      // If we have an end date, stop if we exceed it
      if (endDate && nextDate && isAfter(nextDate, new Date(endDate))) {
        break;
      }

      if (nextDate) {
        dates.push(nextDate);
        currentDate = nextDate;
        currentCount++;
      } else {
        // Failsafe to prevent infinite loops
        break;
      }
    }

    return dates;
  }, [startDate, recurrencePattern, endDate, count]);

  // Format the time range for display
  const timeRange = useMemo(() => {
    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }
    return "All day";
  }, [startTime, endTime]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">
          Event Series Preview
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 ml-2 inline text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p className="max-w-xs">
                  This shows a preview of when events in this series will occur
                  based on your recurrence settings.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Select
            value={visibleCount.toString()}
            onValueChange={(value) => setVisibleCount(parseInt(value, 10))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Show" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 events</SelectItem>
              <SelectItem value="10">10 events</SelectItem>
              <SelectItem value="20">20 events</SelectItem>
              <SelectItem value="50">50 events</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            className="px-2"
            onClick={() =>
              setViewMode(viewMode === "list" ? "calendar" : "list")
            }
          >
            {viewMode === "list" ? (
              <CalendarIcon className="h-4 w-4" />
            ) : (
              <ListFilter className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {occurrences.length === 0 ? (
          <div className="flex items-center justify-center h-40 border border-dashed rounded-md">
            <p className="text-muted-foreground">
              No recurring events to display
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Occurrences:</span>
              <Badge variant="outline">{occurrences.length}</Badge>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
              {occurrences.slice(0, visibleCount).map((date, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50"
                >
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium text-primary">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {format(date, "EEEE, MMMM d, yyyy")}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{timeRange}</span>
                        {locationName && (
                          <span className="ml-2 text-xs">{locationName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge className="bg-primary-foreground text-primary">
                      Start
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {occurrences.length > visibleCount && (
              <Button
                variant="outline"
                className="w-full text-sm"
                onClick={() =>
                  setVisibleCount(
                    Math.min(visibleCount + 10, occurrences.length),
                  )
                }
              >
                Show more events
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
