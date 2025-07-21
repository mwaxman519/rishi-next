"use client";

import { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, Filter, Plus } from "lucide-react";
import Link from "next/link";

// Import CSS for react-big-calendar
// CSS import removed for Autoscale deployment compatibility

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Mock booking data - react-big-calendar format
const mockBookings = [
  {
    id: 1,
    title: "Product Demo - Best Buy",
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 15, 18, 0),
    status: "confirmed",
    location: "Best Buy - Downtown SF",
    staff: ["Sarah Johnson", "Mike Chen"],
  },
  {
    id: 2,
    title: "Brand Activation - Whole Foods",
    start: new Date(2025, 0, 17, 9, 0),
    end: new Date(2025, 0, 17, 17, 0),
    status: "pending",
    location: "Whole Foods - Mission Bay",
    staff: ["Jessica Smith"],
  },
  {
    id: 3,
    title: "Trade Show Setup",
    start: new Date(2025, 0, 20, 8, 0),
    end: new Date(2025, 0, 22, 20, 0),
    status: "confirmed",
    location: "Moscone Center",
    staff: ["Alex Rodriguez", "Sarah Johnson", "Mike Chen"],
  },
  {
    id: 4,
    title: "Store Demo - Target",
    start: new Date(2025, 0, 23, 11, 0),
    end: new Date(2025, 0, 23, 19, 0),
    status: "confirmed",
    location: "Target - Union Square",
    staff: ["Jessica Smith", "Alex Rodriguez"],
  },
];

const statusColors = {
  confirmed: "bg-green-500",
  pending: "bg-yellow-500",
  cancelled: "bg-red-500",
  completed: "bg-blue-500",
};

export default function BookingsCalendarPage() {
  const [view, setView] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredBookings = mockBookings.filter(booking => 
    statusFilter === "all" || booking.status === statusFilter
  );

  // Event styling based on status
  const eventStyleGetter = (event) => {
    let backgroundColor = "#3174ad";
    let borderColor = "#3174ad";

    switch (event.status) {
      case "confirmed":
        backgroundColor = "#10b981";
        borderColor = "#059669";
        break;
      case "pending":
        backgroundColor = "#f59e0b";
        borderColor = "#d97706";
        break;
      case "cancelled":
        backgroundColor = "#ef4444";
        borderColor = "#dc2626";
        break;
      case "completed":
        backgroundColor = "#3b82f6";
        borderColor = "#2563eb";
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: "white",
      },
    };
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <CalendarIcon className="h-8 w-8 mr-3 text-primary" />
            Bookings Calendar
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all bookings in calendar format
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/bookings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Calendar Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Status Filter:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">View:</label>
              <Select value={view} onValueChange={setView}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="agenda">Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Legend */}
            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-sm font-medium">Status:</span>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-xs">Confirmed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span className="text-xs">Pending</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs">Completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: "600px" }}>
            <Calendar
              localizer={localizer}
              events={filteredBookings}
              startAccessor="start"
              endAccessor="end"
              view={view}
              onView={setView}
              onSelectEvent={(event) => setSelectedEvent(event)}
              eventPropGetter={eventStyleGetter}
              popup
              components={{
                event: ({ event }) => (
                  <div className="text-xs">
                    <div className="font-medium truncate">{event.title}</div>
                    <div className="truncate">{event.location}</div>
                  </div>
                ),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockBookings.filter(b => b.status === "confirmed").length}
            </div>
            <div className="text-sm text-muted-foreground">Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {mockBookings.filter(b => b.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mockBookings.filter(b => b.status === "completed").length}
            </div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {mockBookings.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Bookings</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}