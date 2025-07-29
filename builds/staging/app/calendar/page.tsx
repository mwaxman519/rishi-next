"use client";

import React, { useState } from "react";
import { AppLayout } from "../components/app-layout";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  MapPin,
  Users,
  Clock,
  Star,
  TrendingUp,
  List,
  Grid,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";

// Cannabis booking data
const mockBookings = [
  {
    id: "550e8400-e29b-41d4-a716-446655440001",
    title: "California Dispensary Product Demo",
    date: "2024-12-18",
    time: "10:00 AM",
    location: "Bay Area Cannabis Collective, San Francisco, CA",
    client: "Green Valley Dispensary",
    status: "confirmed",
    agents: 3,
    priority: "high",
    budget: "$2,500",
    revenue: "$3,200",
    rating: "4.8",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002",
    title: "Colorado Cannabis Conference Booth",
    date: "2024-12-19",
    time: "09:00 AM",
    location: "Denver Convention Center, Denver, CO",
    client: "Rocky Mountain Events",
    status: "staff_assigned",
    agents: 6,
    priority: "medium",
    budget: "$5,000",
    revenue: "$6,800",
    rating: "4.9",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440003",
    title: "Oregon Cultivation Training",
    date: "2024-12-20",
    time: "1:00 PM",
    location: "Portland Training Facility, Portland, OR",
    client: "Pacific Northwest Growers",
    status: "pending_approval",
    agents: 2,
    priority: "low",
    budget: "$1,800",
    revenue: "$2,100",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004",
    title: "Nevada Cannabis Trade Show",
    date: "2024-12-21",
    time: "11:00 AM",
    location: "Las Vegas Convention Center, Las Vegas, NV",
    client: "Desert Bloom Cannabis",
    status: "completed",
    agents: 4,
    priority: "high",
    budget: "$3,200",
    revenue: "$4,100",
    rating: "4.7",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440005",
    title: "Washington State Product Launch",
    date: "2024-12-22",
    time: "2:00 PM",
    location: "Seattle Cannabis Center, Seattle, WA",
    client: "Emerald City Cannabis",
    status: "confirmed",
    agents: 5,
    priority: "high",
    budget: "$4,000",
    revenue: "$5,200",
    rating: "4.9",
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440006",
    title: "Arizona Dispensary Grand Opening",
    date: "2024-12-23",
    time: "3:00 PM",
    location: "Phoenix Cannabis Collective, Phoenix, AZ",
    client: "Desert Sun Dispensary",
    status: "equipment_deployed",
    agents: 3,
    priority: "medium",
    budget: "$2,800",
    revenue: "$3,600",
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState("month");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  // Generate calendar days for the month
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date) => {
    if (!date) return [];

    return mockBookings.filter((booking) => {
      const bookingDate = new Date(booking.date);
      return bookingDate.toDateString() === date.toDateString();
    });
  };

  // Get bookings for a specific hour
  const getBookingsForHour = (date: Date, hour: number) => {
    const dayBookings = getBookingsForDate(date);
    return dayBookings.filter((booking) => {
      const bookingHour = parseInt(booking.time.split(":")[0]);
      const isPM = booking.time.includes("PM");
      const adjustedHour =
        isPM && bookingHour !== 12
          ? bookingHour + 12
          : !isPM && bookingHour === 12
            ? 0
            : bookingHour;
      return adjustedHour === hour;
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cannabis Operations Calendar
            </h1>
            <p className="text-muted-foreground mt-1">
              Schedule and coordinate cannabis industry operational workflows
            </p>
          </div>
          <div className="flex gap-2">
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="list">List</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Operation
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
                <Button variant="outline" size="sm" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <div className="flex border rounded-md">
                  <Button
                    variant={view === "month" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("month")}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={view === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setView("list")}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {view === "month" ? (
          /* Month View with FullCalendar Style */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Full Calendar Grid */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader className="pb-4">
                  <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground">
                    <div className="p-2">Sun</div>
                    <div className="p-2">Mon</div>
                    <div className="p-2">Tue</div>
                    <div className="p-2">Wed</div>
                    <div className="p-2">Thu</div>
                    <div className="p-2">Fri</div>
                    <div className="p-2">Sat</div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 border-t border-l">
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-32 p-2 border-r border-b cursor-pointer transition-colors ${
                          day
                            ? day.toDateString() === selectedDate.toDateString()
                              ? "bg-primary/10 border-primary"
                              : "hover:bg-muted/50"
                            : "bg-muted/20"
                        }`}
                        onClick={() => day && setSelectedDate(day)}
                      >
                        {day && (
                          <>
                            <div
                              className={`text-sm font-medium mb-2 ${
                                day.toDateString() === new Date().toDateString()
                                  ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                  : ""
                              }`}
                            >
                              {day.getDate()}
                            </div>
                            <div className="space-y-1">
                              {getBookingsForDate(day)
                                .slice(0, 3)
                                .map((booking) => (
                                  <div
                                    key={booking.id}
                                    className={`text-xs p-1 rounded truncate ${
                                      booking.status === "confirmed"
                                        ? "bg-green-100 text-green-800"
                                        : booking.status === "pending_approval"
                                          ? "bg-yellow-100 text-yellow-800"
                                          : booking.status === "completed"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {booking.time.split(" ")[0]} {booking.title}
                                  </div>
                                ))}
                              {getBookingsForDate(day).length > 3 && (
                                <div className="text-xs text-muted-foreground">
                                  +{getBookingsForDate(day).length - 3} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Day Detail Panel with 24-Hour View */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {formatDate(selectedDate)}
                  </CardTitle>
                  <CardDescription>
                    {getBookingsForDate(selectedDate).length} operations
                    scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 24-Hour Timeline */}
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {Array.from({ length: 24 }, (_, hour) => {
                      const hourBookings = getBookingsForHour(
                        selectedDate,
                        hour,
                      );
                      return (
                        <div
                          key={hour}
                          className="flex items-start space-x-3 py-1 border-b border-muted"
                        >
                          <div className="text-xs font-medium text-muted-foreground w-12 mt-1 flex-shrink-0">
                            {formatTime(hour)}
                          </div>
                          <div className="flex-1 space-y-1 min-h-6">
                            {hourBookings.length > 0 ? (
                              hourBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className="p-2 rounded-md bg-primary/10 border-l-2 border-primary"
                                >
                                  <div className="text-sm font-medium truncate">
                                    {booking.title}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {booking.client}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {booking.location.split(",")[0]}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="text-xs mt-1"
                                  >
                                    {booking.status}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <div className="text-xs text-muted-foreground py-1 opacity-50">
                                Available
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* List View */
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Cannabis Operations</CardTitle>
              <CardDescription>
                Comprehensive list view of all scheduled operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center min-w-16">
                        <div className="text-sm font-medium">
                          {new Date(booking.date).toLocaleDateString("en-US", {
                            month: "short",
                          })}
                        </div>
                        <div className="text-2xl font-bold">
                          {new Date(booking.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">{booking.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{booking.time}</span>
                          <MapPin className="h-4 w-4 ml-2" />
                          <span>{booking.location.split(",")[0]}</span>
                          <Users className="h-4 w-4 ml-2" />
                          <span>{booking.agents} agents</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Client: {booking.client}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {booking.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Cannabis Operations
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active States
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Across cannabis-legal jurisdictions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Staff Utilization
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Completion Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
