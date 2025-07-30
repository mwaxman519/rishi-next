&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Card, CardContent } from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from &quot;date-fns&quot;;
import Link from &quot;next/link&quot;;

interface Booking {
  id: string;
  title: string;
  activityType: string;
  activityStatus: string;
  location: string;
  startDate: Date;
  endDate: Date;
  assignee: string;
}

interface BookingsCalendarViewProps {
  bookings: Booking[];
}

// Activity status color mapper
const activityStatusColorMapper: Record<string, string> = {
  draft: &quot;bg-gray-200 text-gray-800&quot;,
  pending: &quot;bg-amber-100 text-amber-800&quot;,
  approved: &quot;bg-emerald-100 text-emerald-800&quot;,
  in_progress: &quot;bg-blue-100 text-blue-800&quot;,
  completed: &quot;bg-purple-100 text-purple-800&quot;,
  cancelled: &quot;bg-red-100 text-red-800&quot;,
};

export default function BookingsCalendarView({
  bookings,
}: BookingsCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = &quot;d&quot;;
  const monthFormat = &quot;MMMM yyyy&quot;;

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter bookings for the selected date
  const selectedDateBookings = bookings.filter((booking) =>
    isSameDay(booking.startDate, selectedDate),
  );

  return (
    <div className=&quot;flex flex-col h-full&quot;>
      <div className=&quot;flex items-center justify-between p-4 border-b&quot;>
        <h2 className=&quot;font-semibold&quot;>{format(currentMonth, monthFormat)}</h2>
        <div className=&quot;flex gap-1&quot;>
          <Button size=&quot;icon&quot; variant=&quot;ghost&quot; onClick={handlePreviousMonth}>
            <ChevronLeft className=&quot;h-4 w-4&quot; />
          </Button>
          <Button
            size=&quot;icon&quot;
            variant=&quot;ghost&quot;
            onClick={() => setCurrentMonth(new Date())}
          >
            <CalendarIcon className=&quot;h-4 w-4&quot; />
          </Button>
          <Button size=&quot;icon&quot; variant=&quot;ghost&quot; onClick={handleNextMonth}>
            <ChevronRight className=&quot;h-4 w-4&quot; />
          </Button>
        </div>
      </div>

      <div className=&quot;grid grid-cols-7 text-center border-b&quot;>
        {[&quot;Sun&quot;, &quot;Mon&quot;, &quot;Tue&quot;, &quot;Wed&quot;, &quot;Thu&quot;, &quot;Fri&quot;, &quot;Sat&quot;].map((day) => (
          <div
            key={day}
            className=&quot;py-2 font-medium text-sm text-muted-foreground&quot;
          >
            {day}
          </div>
        ))}
      </div>

      <div className=&quot;grid grid-cols-7 flex-grow text-sm&quot;>
        {days.map((day, index) => {
          const dateBookings = bookings.filter((booking) =>
            isSameDay(booking.startDate, day),
          );

          const isCurrentMonth = isSameMonth(day, monthStart);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);

          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-1 border-r border-b relative 
                ${!isCurrentMonth ? &quot;bg-muted/30 text-muted-foreground&quot; : "&quot;} 
                ${isToday ? &quot;bg-muted/50&quot; : &quot;&quot;} 
                ${isSelected ? &quot;ring-2 ring-inset ring-primary&quot; : &quot;&quot;}
              `}
              onClick={() => setSelectedDate(day)}
            >
              <div className=&quot;text-right p-1&quot;>
                <span
                  className={`
                    text-xs inline-flex items-center justify-center h-6 w-6 rounded-full 
                    ${isToday ? &quot;bg-primary text-primary-foreground font-semibold&quot; : &quot;&quot;}
                  `}
                >
                  {format(day, dateFormat)}
                </span>
              </div>

              <div className=&quot;mt-1 space-y-1 max-h-[80px] overflow-y-auto&quot;>
                {dateBookings.length > 0
                  ? dateBookings.slice(0, 3).map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/bookings/${booking.id}`}
                        className=&quot;block&quot;
                      >
                        <div
                          className={`
                          text-xs px-1 py-0.5 rounded truncate 
                          ${activityStatusColorMapper[booking.activityStatus] || &quot;bg-gray-100&quot;}
                          hover:brightness-95 transition-all
                        `}
                        >
                          {format(booking.startDate, &quot;h:mm a&quot;)} {booking.title}
                        </div>
                      </Link>
                    ))
                  : null}

                {dateBookings.length > 3 && (
                  <div className=&quot;text-xs text-center text-muted-foreground px-1&quot;>
                    +{dateBookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Date Details */}
      {selectedDateBookings.length > 0 && (
        <div className=&quot;border-t p-4&quot;>
          <h3 className=&quot;font-medium mb-2&quot;>
            {format(selectedDate, &quot;EEEE, MMMM d, yyyy&quot;)}
          </h3>
          <div className=&quot;space-y-2&quot;>
            {selectedDateBookings.map((booking) => (
              <Card key={booking.id} className=&quot;overflow-hidden&quot;>
                <CardContent className=&quot;p-3&quot;>
                  <div className=&quot;flex justify-between&quot;>
                    <div>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className=&quot;font-medium hover:text-primary transition-colors&quot;
                      >
                        {booking.title}
                      </Link>
                      <div className=&quot;text-sm text-muted-foreground&quot;>
                        {format(booking.startDate, &quot;h:mm a&quot;)} -{&quot; &quot;}
                        {format(booking.endDate, &quot;h:mm a&quot;)}
                        {booking.location && <span> • {booking.location}</span>}
                      </div>
                    </div>
                    <Badge
                      variant=&quot;outline&quot;
                      className={`
                        text-xs px-2 py-0.5 h-5 
                        ${activityStatusColorMapper[booking.activityStatus] || &quot;bg-gray-100"}
                      `}
                    >
                      {booking.activityStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
