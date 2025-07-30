&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { format } from &quot;date-fns&quot;;
import { Calendar as CalendarIcon } from &quot;lucide-react&quot;;

import { cn } from &quot;../../lib/utils&quot;;
import { Button } from &quot;./button&quot;;
import { Calendar } from &quot;./calendar&quot;;
import { Popover, PopoverContent, PopoverTrigger } from &quot;./popover&quot;;

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  children?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  selected,
  onSelect,
  children,
  disabled = false,
  className,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(selected);

  React.useEffect(() => {
    setDate(selected);
  }, [selected]);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      if (onSelect) {
        onSelect(selectedDate);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <div className={cn(&quot;w-full&quot;, className)}>
          {children || (
            <Button
              variant={&quot;outline&quot;}
              className={cn(
                &quot;w-full justify-start text-left font-normal&quot;,
                !date && &quot;text-muted-foreground&quot;,
              )}
              disabled={disabled}
            >
              <CalendarIcon className=&quot;mr-2 h-4 w-4&quot; />
              {date ? format(date, &quot;PPP&quot;) : <span>Pick a date</span>}
            </Button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent className=&quot;w-auto p-0&quot; align=&quot;start&quot;>
        <Calendar
          mode=&quot;single&quot;
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
