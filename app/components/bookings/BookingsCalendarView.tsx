"use client";

import React, { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "date-fns";
import Link from "next/link";

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
  draft: "bg-gray-200 text-gray-800",
  pending: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-purple-100 text-purple-800",
  cancelled: "bg-red-100 text-red-800",
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

  const dateFormat = "d";
  const monthFormat = "MMMM yyyy";

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Filter bookings for the selected date
  const selectedDateBookings = bookings.filter((booking) =>
    isSameDay(booking.startDate, selectedDate),
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold">{format(currentMonth, monthFormat)}</h2>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={handlePreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentMonth(new Date())}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center border-b">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="py-2 font-medium text-sm text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-grow text-sm">
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
                ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : ""} 
                ${isToday ? "bg-muted/50" : ""} 
                ${isSelected ? "ring-2 ring-inset ring-primary" : ""}
              `}
              onClick={() => setSelectedDate(day)}
            >
              <div className="text-right p-1">
                <span
                  className={`
                    text-xs inline-flex items-center justify-center h-6 w-6 rounded-full 
                    ${isToday ? "bg-primary text-primary-foreground font-semibold" : ""}
                  `}
                >
                  {format(day, dateFormat)}
                </span>
              </div>

              <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                {dateBookings.length > 0
                  ? dateBookings.slice(0, 3).map((booking) => (
                      <Link
                        key={booking.id}
                        href={`/bookings/${booking.id}`}
                        className="block"
                      >
                        <div
                          className={`
                          text-xs px-1 py-0.5 rounded truncate 
                          ${activityStatusColorMapper[booking.activityStatus] || "bg-gray-100"}
                          hover:brightness-95 transition-all
                        `}
                        >
                          {format(booking.startDate, "h:mm a")} {booking.title}
                        </div>
                      </Link>
                    ))
                  : null}

                {dateBookings.length > 3 && (
                  <div className="text-xs text-center text-muted-foreground px-1">
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
        <div className="border-t p-4">
          <h3 className="font-medium mb-2">
            {format(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <div className="space-y-2">
            {selectedDateBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {booking.title}
                      </Link>
                      <div className="text-sm text-muted-foreground">
                        {format(booking.startDate, "h:mm a")} -{" "}
                        {format(booking.endDate, "h:mm a")}
                        {booking.location && <span> • {booking.location}</span>}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`
                        text-xs px-2 py-0.5 h-5 
                        ${activityStatusColorMapper[booking.activityStatus] || "bg-gray-100"}
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
