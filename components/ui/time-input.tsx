&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import { Clock } from &quot;lucide-react&quot;;

import { cn } from &quot;@/lib/utils&quot;;
import { Button } from &quot;./button&quot;;
import { Input } from &quot;./input&quot;;
import { Label } from &quot;./label&quot;;
import { Popover, PopoverContent, PopoverTrigger } from &quot;./popover&quot;;

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
  placeholder = &quot;Select time&quot;,
}: TimeInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(&quot;12&quot;);
  const [minutes, setMinutes] = useState(&quot;00&quot;);
  const [period, setPeriod] = useState<&quot;AM&quot; | &quot;PM&quot;>(&quot;AM&quot;);

  useEffect(() => {
    if (value) {
      const timeRegex = /^(\d{1,2}):(\d{2}) (AM|PM)$/;
      const match = value.match(timeRegex);

      if (match && match[1] && match[2] && match[3]) {
        const matchedHours = match[1];
        const matchedMinutes = match[2];
        const matchedPeriod = match[3] as &quot;AM&quot; | &quot;PM&quot;;

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
    if (newHours !== "&quot;) {
      const numHours = parseInt(newHours, 10);
      if (numHours < 1) newHours = &quot;1&quot;;
      if (numHours > 12) newHours = &quot;12&quot;;
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
    if (newMinutes !== &quot;&quot;) {
      const numMinutes = parseInt(newMinutes, 10);
      if (numMinutes > 59) newMinutes = &quot;59&quot;;
    }

    setMinutes(newMinutes);
  };

  const handlePeriodToggle = () => {
    setPeriod((prev) => (prev === &quot;AM&quot; ? &quot;PM&quot; : &quot;AM&quot;));
  };

  const handleApply = () => {
    // Ensure hours and minutes are formatted correctly
    const formattedHours = hours.padStart(2, &quot;0&quot;);
    const formattedMinutes = minutes.padStart(2, &quot;0&quot;);

    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={&quot;outline&quot;}
          className={cn(
            &quot;w-full justify-start text-left font-normal&quot;,
            !value && &quot;text-muted-foreground&quot;,
            className,
          )}
        >
          <Clock className=&quot;mr-2 h-4 w-4&quot; />
          {value || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className=&quot;w-auto p-4&quot;>
        <div className=&quot;space-y-4&quot;>
          <div className=&quot;flex justify-between items-end gap-2&quot;>
            <div className=&quot;grid gap-1&quot;>
              <Label htmlFor=&quot;hours&quot;>Hours</Label>
              <Input
                id=&quot;hours&quot;
                value={hours}
                onChange={handleHoursChange}
                className=&quot;w-16&quot;
                placeholder=&quot;HH&quot;
              />
            </div>
            <div className=&quot;mt-6&quot;>:</div>
            <div className=&quot;grid gap-1&quot;>
              <Label htmlFor=&quot;minutes&quot;>Minutes</Label>
              <Input
                id=&quot;minutes&quot;
                value={minutes}
                onChange={handleMinutesChange}
                className=&quot;w-16&quot;
                placeholder=&quot;MM&quot;
              />
            </div>
            <div className=&quot;grid gap-1&quot;>
              <Label htmlFor=&quot;period&quot;>Period</Label>
              <Button
                id=&quot;period&quot;
                type=&quot;button&quot;
                variant=&quot;outline&quot;
                onClick={handlePeriodToggle}
                className=&quot;w-16&quot;
              >
                {period}
              </Button>
            </div>
          </div>
          <div className=&quot;flex justify-end">
            <Button onClick={handleApply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
