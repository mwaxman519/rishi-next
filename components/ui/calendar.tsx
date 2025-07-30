&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { ChevronLeft, ChevronRight } from &quot;lucide-react&quot;;
import { DayPicker } from &quot;react-day-picker&quot;;

import { cn } from &quot;@/lib/utils&quot;;
import { buttonVariants } from &quot;./button&quot;;

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(&quot;p-3&quot;, className)}
      classNames={{
        months: &quot;flex flex-col space-y-4&quot;,
        month: &quot;space-y-4&quot;,
        caption: &quot;flex justify-center pt-1 relative items-center px-10&quot;,
        caption_label: &quot;text-sm font-medium text-center&quot;,
        nav: &quot;space-x-1 flex items-center&quot;,
        nav_button: cn(
          buttonVariants({ variant: &quot;outline&quot; }),
          &quot;h-7 w-7 bg-transparent p-0 opacity-75 hover:opacity-100&quot;,
        ),
        nav_button_previous: &quot;absolute left-1&quot;,
        nav_button_next: &quot;absolute right-1&quot;,
        table: &quot;w-full border-collapse space-y-1&quot;,
        head_row: &quot;flex w-full justify-between&quot;,
        head_cell:
          &quot;text-muted-foreground w-10 font-normal text-[0.8rem] rounded-md&quot;,
        row: &quot;flex w-full justify-between mt-2&quot;,
        cell: &quot;text-center text-sm relative p-0&quot;,
        day: cn(
          buttonVariants({ variant: &quot;ghost&quot; }),
          &quot;h-9 w-9 p-0 font-normal aria-selected:opacity-100&quot;,
        ),
        day_selected:
          &quot;bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground&quot;,
        day_today: &quot;bg-accent text-accent-foreground&quot;,
        day_outside: &quot;text-muted-foreground opacity-50&quot;,
        day_disabled: &quot;text-muted-foreground opacity-50&quot;,
        day_range_middle:
          &quot;aria-selected:bg-accent aria-selected:text-accent-foreground&quot;,
        day_hidden: &quot;invisible&quot;,
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = &quot;Calendar&quot;;

export { Calendar };
