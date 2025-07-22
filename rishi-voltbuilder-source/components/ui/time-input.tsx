"use client";

import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface TimeInputProps {
  value: string | undefined;
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimeInput({
  value,
  onChange,
  className,
  placeholder = "Select time",
}: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState("12");
  const [minutes, setMinutes] = useState("00");
  const [period, setPeriod] = useState<"AM" | "PM">("AM");

  useEffect(() => {
    if (value) {
      const timeRegex = /^(\d{1,2}):(\d{2}) (AM|PM)$/;
      const match = value.match(timeRegex);

      if (match && match[1] && match[2] && match[3]) {
        const matchedHours = match[1];
        const matchedMinutes = match[2];
        const matchedPeriod = match[3] as "AM" | "PM";

        setHours(matchedHours);
        setMinutes(matchedMinutes);
        setPeriod(matchedPeriod);
      }
    }
  }, [value]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHours = e.target.value;

    // Ensure only numbers are entered
    if (!/^\d*$/.test(newHours)) return;

    // Limit to 2 characters
    if (newHours.length > 2) return;

    // Handle hour limits (1-12)
    if (newHours !== "") {
      const numHours = parseInt(newHours, 10);
      if (numHours < 1) newHours = "1";
      if (numHours > 12) newHours = "12";
    }

    setHours(newHours);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinutes = e.target.value;

    // Ensure only numbers are entered
    if (!/^\d*$/.test(newMinutes)) return;

    // Limit to 2 characters
    if (newMinutes.length > 2) return;

    // Handle minute limits (0-59)
    if (newMinutes !== "") {
      const numMinutes = parseInt(newMinutes, 10);
      if (numMinutes > 59) newMinutes = "59";
    }

    setMinutes(newMinutes);
  };

  const handlePeriodToggle = () => {
    setPeriod((prev) => (prev === "AM" ? "PM" : "AM"));
  };

  const handleApply = () => {
    // Ensure hours and minutes are formatted correctly
    const formattedHours = hours.padStart(2, "0");
    const formattedMinutes = minutes.padStart(2, "0");

    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-end gap-2">
            <div className="grid gap-1">
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                value={hours}
                onChange={handleHoursChange}
                className="w-16"
                placeholder="HH"
              />
            </div>
            <div className="mt-6">:</div>
            <div className="grid gap-1">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                value={minutes}
                onChange={handleMinutesChange}
                className="w-16"
                placeholder="MM"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="period">Period</Label>
              <Button
                id="period"
                type="button"
                variant="outline"
                onClick={handlePeriodToggle}
                className="w-16"
              >
                {period}
              </Button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
