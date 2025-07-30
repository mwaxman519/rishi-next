&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import { Clock } from &quot;lucide-react&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from &quot;@/components/ui/popover&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (time: string) => void;
  onEndTimeChange: (time: string) => void;
  minTime?: string;
  maxTime?: string;
  step?: number;
  className?: string;
}

export default function TimeRangePicker({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  minTime = &quot;00:00&quot;,
  maxTime = &quot;23:59&quot;,
  step = 15,
  className,
}: TimeRangePickerProps) {
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  // Generate time options in the format &quot;HH:MM&quot;
  useEffect(() => {
    const options: string[] = [];

    // Safely parse min and max times
    const minParts = minTime.split(&quot;:&quot;);
    const maxParts = maxTime.split(&quot;:&quot;);

    const minHour = minParts[0] ? parseInt(minParts[0], 10) : 0;
    const minMinute = minParts[1] ? parseInt(minParts[1], 10) : 0;
    const maxHour = maxParts[0] ? parseInt(maxParts[0], 10) : 23;
    const maxMinute = maxParts[1] ? parseInt(maxParts[1], 10) : 59;

    const minMinutes = minHour * 60 + minMinute;
    const maxMinutes = maxHour * 60 + maxMinute;

    for (let mins = minMinutes; mins <= maxMinutes; mins += step) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      const timeString = `${hours.toString().padStart(2, &quot;0&quot;)}:${minutes.toString().padStart(2, &quot;0&quot;)}`;
      options.push(timeString);
    }

    setTimeOptions(options);
  }, [minTime, maxTime, step]);

  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    try {
      const timeParts = time.split(&quot;:&quot;);
      const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
      const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;

      const date = new Date();
      date.setHours(hours, minutes, 0);
      return format(date, &quot;h:mm a&quot;);
    } catch (error) {
      return time || &quot;Select time&quot;;
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className=&quot;flex-1 space-y-2&quot;>
        <Label htmlFor=&quot;start-time&quot;>Start Time</Label>
        <Popover open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              id=&quot;start-time&quot;
              variant=&quot;outline&quot;
              className=&quot;w-full justify-start text-left&quot;
            >
              <Clock className=&quot;mr-2 h-4 w-4&quot; />
              {startTime
                ? formatTimeForDisplay(startTime)
                : &quot;Select start time&quot;}
            </Button>
          </PopoverTrigger>
          <PopoverContent className=&quot;w-[240px] p-0&quot; align=&quot;start&quot;>
            <div className=&quot;p-4 space-y-2&quot;>
              <h4 className=&quot;font-medium&quot;>Select Start Time</h4>
              <Select
                value={startTime}
                onValueChange={(value) => {
                  onStartTimeChange(value);
                  setIsStartTimeOpen(false);

                  // Automatically update end time if it&apos;s before start time
                  if (endTime < value) {
                    onEndTimeChange(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=&quot;Select a time&quot; />
                </SelectTrigger>
                <SelectContent className=&quot;max-h-[200px]&quot;>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {formatTimeForDisplay(time)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className=&quot;flex-1 space-y-2&quot;>
        <Label htmlFor=&quot;end-time&quot;>End Time</Label>
        <Popover open={isEndTimeOpen} onOpenChange={setIsEndTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              id=&quot;end-time&quot;
              variant=&quot;outline&quot;
              className=&quot;w-full justify-start text-left&quot;
            >
              <Clock className=&quot;mr-2 h-4 w-4&quot; />
              {endTime ? formatTimeForDisplay(endTime) : &quot;Select end time&quot;}
            </Button>
          </PopoverTrigger>
          <PopoverContent className=&quot;w-[240px] p-0&quot; align=&quot;start&quot;>
            <div className=&quot;p-4 space-y-2&quot;>
              <h4 className=&quot;font-medium&quot;>Select End Time</h4>
              <Select
                value={endTime}
                onValueChange={(value) => {
                  onEndTimeChange(value);
                  setIsEndTimeOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder=&quot;Select a time&quot; />
                </SelectTrigger>
                <SelectContent className=&quot;max-h-[200px]&quot;>
                  {timeOptions
                    .filter((time) => time >= startTime) // Only show times after start time
                    .map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTimeForDisplay(time)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
