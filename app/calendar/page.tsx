&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { AppLayout } from &quot;../components/app-layout&quot;;
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
} from &quot;lucide-react&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;../../components/ui/select&quot;;

// Cannabis booking data
const mockBookings = [
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440001&quot;,
    title: &quot;California Dispensary Product Demo&quot;,
    date: &quot;2024-12-18&quot;,
    time: &quot;10:00 AM&quot;,
    location: &quot;Bay Area Cannabis Collective, San Francisco, CA&quot;,
    client: &quot;Green Valley Dispensary&quot;,
    status: &quot;confirmed&quot;,
    agents: 3,
    priority: &quot;high&quot;,
    budget: &quot;$2,500&quot;,
    revenue: &quot;$3,200&quot;,
    rating: &quot;4.8&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440002&quot;,
    title: &quot;Colorado Cannabis Conference Booth&quot;,
    date: &quot;2024-12-19&quot;,
    time: &quot;09:00 AM&quot;,
    location: &quot;Denver Convention Center, Denver, CO&quot;,
    client: &quot;Rocky Mountain Events&quot;,
    status: &quot;staff_assigned&quot;,
    agents: 6,
    priority: &quot;medium&quot;,
    budget: &quot;$5,000&quot;,
    revenue: &quot;$6,800&quot;,
    rating: &quot;4.9&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440003&quot;,
    title: &quot;Oregon Cultivation Training&quot;,
    date: &quot;2024-12-20&quot;,
    time: &quot;1:00 PM&quot;,
    location: &quot;Portland Training Facility, Portland, OR&quot;,
    client: &quot;Pacific Northwest Growers&quot;,
    status: &quot;pending_approval&quot;,
    agents: 2,
    priority: &quot;low&quot;,
    budget: &quot;$1,800&quot;,
    revenue: &quot;$2,100&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440004&quot;,
    title: &quot;Nevada Cannabis Trade Show&quot;,
    date: &quot;2024-12-21&quot;,
    time: &quot;11:00 AM&quot;,
    location: &quot;Las Vegas Convention Center, Las Vegas, NV&quot;,
    client: &quot;Desert Bloom Cannabis&quot;,
    status: &quot;completed&quot;,
    agents: 4,
    priority: &quot;high&quot;,
    budget: &quot;$3,200&quot;,
    revenue: &quot;$4,100&quot;,
    rating: &quot;4.7&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440005&quot;,
    title: &quot;Washington State Product Launch&quot;,
    date: &quot;2024-12-22&quot;,
    time: &quot;2:00 PM&quot;,
    location: &quot;Seattle Cannabis Center, Seattle, WA&quot;,
    client: &quot;Emerald City Cannabis&quot;,
    status: &quot;confirmed&quot;,
    agents: 5,
    priority: &quot;high&quot;,
    budget: &quot;$4,000&quot;,
    revenue: &quot;$5,200&quot;,
    rating: &quot;4.9&quot;,
  },
  {
    id: &quot;550e8400-e29b-41d4-a716-446655440006&quot;,
    title: &quot;Arizona Dispensary Grand Opening&quot;,
    date: &quot;2024-12-23&quot;,
    time: &quot;3:00 PM&quot;,
    location: &quot;Phoenix Cannabis Collective, Phoenix, AZ&quot;,
    client: &quot;Desert Sun Dispensary&quot;,
    status: &quot;equipment_deployed&quot;,
    agents: 3,
    priority: &quot;medium&quot;,
    budget: &quot;$2,800&quot;,
    revenue: &quot;$3,600&quot;,
  },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(&quot;month&quot;);
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
    return date.toLocaleDateString(&quot;en-US&quot;, {
      weekday: &quot;long&quot;,
      year: &quot;numeric&quot;,
      month: &quot;long&quot;,
      day: &quot;numeric&quot;,
    });
  };

  const formatTime = (hour: number) => {
    if (hour === 0) return &quot;12 AM&quot;;
    if (hour === 12) return &quot;12 PM&quot;;
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
      const bookingHour = parseInt(booking.time.split(&quot;:&quot;)[0]);
      const isPM = booking.time.includes(&quot;PM&quot;);
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
      <div className=&quot;space-y-6&quot;>
        <div className=&quot;flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0&quot;>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
              Cannabis Operations Calendar
            </h1>
            <p className=&quot;text-muted-foreground mt-1&quot;>
              Schedule and coordinate cannabis industry operational workflows
            </p>
          </div>
          <div className=&quot;flex gap-2&quot;>
            <Select value={view} onValueChange={setView}>
              <SelectTrigger className=&quot;w-32&quot;>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;month&quot;>Month</SelectItem>
                <SelectItem value=&quot;list&quot;>List</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Plus className=&quot;mr-2 h-4 w-4&quot; />
              Schedule Operation
            </Button>
          </div>
        </div>

        {/* Calendar Navigation */}
        <Card>
          <CardHeader>
            <div className=&quot;flex items-center justify-between&quot;>
              <div className=&quot;flex items-center space-x-4&quot;>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={prevMonth}>
                  <ChevronLeft className=&quot;h-4 w-4&quot; />
                </Button>
                <h2 className=&quot;text-xl font-semibold&quot;>
                  {currentDate.toLocaleDateString(&quot;en-US&quot;, {
                    month: &quot;long&quot;,
                    year: &quot;numeric&quot;,
                  })}
                </h2>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; onClick={nextMonth}>
                  <ChevronRight className=&quot;h-4 w-4&quot; />
                </Button>
              </div>
              <div className=&quot;flex items-center space-x-2&quot;>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                  <Filter className=&quot;mr-2 h-4 w-4&quot; />
                  Filter
                </Button>
                <div className=&quot;flex border rounded-md&quot;>
                  <Button
                    variant={view === &quot;month&quot; ? &quot;default&quot; : &quot;ghost&quot;}
                    size=&quot;sm&quot;
                    onClick={() => setView(&quot;month&quot;)}
                    className=&quot;rounded-r-none&quot;
                  >
                    <Grid className=&quot;h-4 w-4&quot; />
                  </Button>
                  <Button
                    variant={view === &quot;list&quot; ? &quot;default&quot; : &quot;ghost&quot;}
                    size=&quot;sm&quot;
                    onClick={() => setView(&quot;list&quot;)}
                    className=&quot;rounded-l-none&quot;
                  >
                    <List className=&quot;h-4 w-4&quot; />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {view === &quot;month&quot; ? (
          /* Month View with FullCalendar Style */
          <div className=&quot;grid grid-cols-1 lg:grid-cols-4 gap-6&quot;>
            {/* Full Calendar Grid */}
            <div className=&quot;lg:col-span-3&quot;>
              <Card>
                <CardHeader className=&quot;pb-4&quot;>
                  <div className=&quot;grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground&quot;>
                    <div className=&quot;p-2&quot;>Sun</div>
                    <div className=&quot;p-2&quot;>Mon</div>
                    <div className=&quot;p-2&quot;>Tue</div>
                    <div className=&quot;p-2&quot;>Wed</div>
                    <div className=&quot;p-2&quot;>Thu</div>
                    <div className=&quot;p-2&quot;>Fri</div>
                    <div className=&quot;p-2&quot;>Sat</div>
                  </div>
                </CardHeader>
                <CardContent className=&quot;p-0&quot;>
                  <div className=&quot;grid grid-cols-7 border-t border-l&quot;>
                    {generateCalendarDays().map((day, index) => (
                      <div
                        key={index}
                        className={`min-h-32 p-2 border-r border-b cursor-pointer transition-colors ${
                          day
                            ? day.toDateString() === selectedDate.toDateString()
                              ? &quot;bg-primary/10 border-primary&quot;
                              : &quot;hover:bg-muted/50&quot;
                            : &quot;bg-muted/20&quot;
                        }`}
                        onClick={() => day && setSelectedDate(day)}
                      >
                        {day && (
                          <>
                            <div
                              className={`text-sm font-medium mb-2 ${
                                day.toDateString() === new Date().toDateString()
                                  ? &quot;bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs&quot;
                                  : "&quot;
                              }`}
                            >
                              {day.getDate()}
                            </div>
                            <div className=&quot;space-y-1&quot;>
                              {getBookingsForDate(day)
                                .slice(0, 3)
                                .map((booking) => (
                                  <div
                                    key={booking.id}
                                    className={`text-xs p-1 rounded truncate ${
                                      booking.status === &quot;confirmed&quot;
                                        ? &quot;bg-green-100 text-green-800&quot;
                                        : booking.status === &quot;pending_approval&quot;
                                          ? &quot;bg-yellow-100 text-yellow-800&quot;
                                          : booking.status === &quot;completed&quot;
                                            ? &quot;bg-blue-100 text-blue-800&quot;
                                            : &quot;bg-gray-100 text-gray-800&quot;
                                    }`}
                                  >
                                    {booking.time.split(&quot; &quot;)[0]} {booking.title}
                                  </div>
                                ))}
                              {getBookingsForDate(day).length > 3 && (
                                <div className=&quot;text-xs text-muted-foreground&quot;>
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
            <div className=&quot;lg:col-span-1&quot;>
              <Card>
                <CardHeader>
                  <CardTitle className=&quot;text-lg&quot;>
                    {formatDate(selectedDate)}
                  </CardTitle>
                  <CardDescription>
                    {getBookingsForDate(selectedDate).length} operations
                    scheduled
                  </CardDescription>
                </CardHeader>
                <CardContent className=&quot;space-y-4&quot;>
                  {/* 24-Hour Timeline */}
                  <div className=&quot;space-y-1 max-h-96 overflow-y-auto&quot;>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const hourBookings = getBookingsForHour(
                        selectedDate,
                        hour,
                      );
                      return (
                        <div
                          key={hour}
                          className=&quot;flex items-start space-x-3 py-1 border-b border-muted&quot;
                        >
                          <div className=&quot;text-xs font-medium text-muted-foreground w-12 mt-1 flex-shrink-0&quot;>
                            {formatTime(hour)}
                          </div>
                          <div className=&quot;flex-1 space-y-1 min-h-6&quot;>
                            {hourBookings.length > 0 ? (
                              hourBookings.map((booking) => (
                                <div
                                  key={booking.id}
                                  className=&quot;p-2 rounded-md bg-primary/10 border-l-2 border-primary&quot;
                                >
                                  <div className=&quot;text-sm font-medium truncate&quot;>
                                    {booking.title}
                                  </div>
                                  <div className=&quot;text-xs text-muted-foreground truncate&quot;>
                                    {booking.client}
                                  </div>
                                  <div className=&quot;text-xs text-muted-foreground truncate&quot;>
                                    {booking.location.split(&quot;,&quot;)[0]}
                                  </div>
                                  <Badge
                                    variant=&quot;outline&quot;
                                    className=&quot;text-xs mt-1&quot;
                                  >
                                    {booking.status}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <div className=&quot;text-xs text-muted-foreground py-1 opacity-50&quot;>
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
              <div className=&quot;space-y-4&quot;>
                {mockBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className=&quot;flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors&quot;
                  >
                    <div className=&quot;flex items-center space-x-4&quot;>
                      <div className=&quot;text-center min-w-16&quot;>
                        <div className=&quot;text-sm font-medium&quot;>
                          {new Date(booking.date).toLocaleDateString(&quot;en-US&quot;, {
                            month: &quot;short&quot;,
                          })}
                        </div>
                        <div className=&quot;text-2xl font-bold&quot;>
                          {new Date(booking.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <h3 className=&quot;font-medium&quot;>{booking.title}</h3>
                        <div className=&quot;flex items-center space-x-2 text-sm text-muted-foreground&quot;>
                          <Clock className=&quot;h-4 w-4&quot; />
                          <span>{booking.time}</span>
                          <MapPin className=&quot;h-4 w-4 ml-2&quot; />
                          <span>{booking.location.split(&quot;,&quot;)[0]}</span>
                          <Users className=&quot;h-4 w-4 ml-2&quot; />
                          <span>{booking.agents} agents</span>
                        </div>
                        <div className=&quot;text-sm text-muted-foreground mt-1&quot;>
                          Client: {booking.client}
                        </div>
                      </div>
                    </div>
                    <div className=&quot;flex items-center space-x-2&quot;>
                      <Badge
                        variant={
                          booking.status === &quot;completed&quot;
                            ? &quot;default&quot;
                            : &quot;secondary&quot;
                        }
                      >
                        {booking.status}
                      </Badge>
                      <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
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
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6&quot;>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                Total Cannabis Operations
              </CardTitle>
              <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
            </CardHeader>
            <CardContent>
              <div className=&quot;text-2xl font-bold&quot;>47</div>
              <p className=&quot;text-xs text-muted-foreground&quot;>
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                Active States
              </CardTitle>
              <MapPin className=&quot;h-4 w-4 text-muted-foreground&quot; />
            </CardHeader>
            <CardContent>
              <div className=&quot;text-2xl font-bold&quot;>8</div>
              <p className=&quot;text-xs text-muted-foreground&quot;>
                Across cannabis-legal jurisdictions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                Staff Utilization
              </CardTitle>
              <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
            </CardHeader>
            <CardContent>
              <div className=&quot;text-2xl font-bold&quot;>89%</div>
              <p className=&quot;text-xs text-muted-foreground&quot;>
                +5% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
              <CardTitle className=&quot;text-sm font-medium&quot;>
                Completion Rate
              </CardTitle>
              <TrendingUp className=&quot;h-4 w-4 text-muted-foreground&quot; />
            </CardHeader>
            <CardContent>
              <div className=&quot;text-2xl font-bold&quot;>96%</div>
              <p className=&quot;text-xs text-muted-foreground">
                +2% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
