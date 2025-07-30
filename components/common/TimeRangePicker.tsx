"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  minTime = "00:00",
  maxTime = "23:59",
  step = 15,
  className,
}: TimeRangePickerProps) {
  const [isStartTimeOpen, setIsStartTimeOpen] = useState(false);
  const [isEndTimeOpen, setIsEndTimeOpen] = useState(false);
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  // Generate time options in the format "HH:MM"
  useEffect(() => {
    const options: string[] = [];

    // Safely parse min and max times
    const minParts = minTime.split(":");
    const maxParts = maxTime.split(":");

    const minHour = minParts[0] ? parseInt(minParts[0], 10) : 0;
    const minMinute = minParts[1] ? parseInt(minParts[1], 10) : 0;
    const maxHour = maxParts[0] ? parseInt(maxParts[0], 10) : 23;
    const maxMinute = maxParts[1] ? parseInt(maxParts[1], 10) : 59;

    const minMinutes = minHour * 60 + minMinute;
    const maxMinutes = maxHour * 60 + maxMinute;

    for (let mins = minMinutes; mins <= maxMinutes; mins += step) {
      const hours = Math.floor(mins / 60);
      const minutes = mins % 60;
      const timeString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
      options.push(timeString);
    }

    setTimeOptions(options);
  }, [minTime, maxTime, step]);

  // Format time for display
  const formatTimeForDisplay = (time: string) => {
    try {
      const timeParts = time.split(":");
      const hours = timeParts[0] ? parseInt(timeParts[0], 10) : 0;
      const minutes = timeParts[1] ? parseInt(timeParts[1], 10) : 0;

      const date = new Date();
      date.setHours(hours, minutes, 0);
      return format(date, "h:mm a");
    } catch (error) {
      return time || "Select time";
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <div className="flex-1 space-y-2">
        <Label htmlFor="start-time">Start Time</Label>
        <Popover open={isStartTimeOpen} onOpenChange={setIsStartTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              id="start-time"
              variant="outline"
              className="w-full justify-start text-left"
            >
              <Clock className="mr-2 h-4 w-4" />
              {startTime
                ? formatTimeForDisplay(startTime)
                : "Select start time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <div className="p-4 space-y-2">
              <h4 className="font-medium">Select Start Time</h4>
              <Select
                value={startTime}
                onValueChange={(value) => {
                  onStartTimeChange(value);
                  setIsStartTimeOpen(false);

                  // Automatically update end time if it's before start time
                  if (endTime < value) {
                    onEndTimeChange(value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
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

      <div className="flex-1 space-y-2">
        <Label htmlFor="end-time">End Time</Label>
        <Popover open={isEndTimeOpen} onOpenChange={setIsEndTimeOpen}>
          <PopoverTrigger asChild>
            <Button
              id="end-time"
              variant="outline"
              className="w-full justify-start text-left"
            >
              <Clock className="mr-2 h-4 w-4" />
              {endTime ? formatTimeForDisplay(endTime) : "Select end time"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[240px] p-0" align="start">
            <div className="p-4 space-y-2">
              <h4 className="font-medium">Select End Time</h4>
              <Select
                value={endTime}
                onValueChange={(value) => {
                  onEndTimeChange(value);
                  setIsEndTimeOpen(false);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
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
