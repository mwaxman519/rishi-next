&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import { Calendar as CalendarIcon } from &quot;lucide-react&quot;;

import { cn } from &quot;@/lib/utils&quot;;
import { Button } from &quot;./button&quot;;
import { Calendar } from &quot;./calendar&quot;;
import { Popover, PopoverContent, PopoverTrigger } from &quot;./popover&quot;;

interface DatePickerProps {
  date?: Date;
  setDate: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = &quot;Pick a date&quot;,
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={&quot;outline&quot;}
          className={cn(
            &quot;w-[280px] justify-start text-left font-normal&quot;,
            !date && &quot;text-muted-foreground&quot;,
            className,
          )}
        >
          <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
          {date ? format(date, &quot;PPP&quot;) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className=&quot;w-auto p-0&quot;>
        <Calendar
          mode=&quot;single&quot;
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
