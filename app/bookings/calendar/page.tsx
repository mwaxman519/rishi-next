&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { Calendar, dateFnsLocalizer } from &quot;react-big-calendar&quot;;
import format from &quot;date-fns/format&quot;;
import parse from &quot;date-fns/parse&quot;;
import startOfWeek from &quot;date-fns/startOfWeek&quot;;
import getDay from &quot;date-fns/getDay&quot;;
import enUS from &quot;date-fns/locale/en-US&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { CalendarIcon, Filter, Plus } from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;

// CSS for react-big-calendar imported in layout.tsx to prevent webpack style-loader issues

const locales = {
  &quot;en-US&quot;: enUS,
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
    title: &quot;Product Demo - Best Buy&quot;,
    start: new Date(2025, 0, 15, 10, 0),
    end: new Date(2025, 0, 15, 18, 0),
    status: &quot;confirmed&quot;,
    location: &quot;Best Buy - Downtown SF&quot;,
    staff: [&quot;Sarah Johnson&quot;, &quot;Mike Chen&quot;],
  },
  {
    id: 2,
    title: &quot;Brand Activation - Whole Foods&quot;,
    start: new Date(2025, 0, 17, 9, 0),
    end: new Date(2025, 0, 17, 17, 0),
    status: &quot;pending&quot;,
    location: &quot;Whole Foods - Mission Bay&quot;,
    staff: [&quot;Jessica Smith&quot;],
  },
  {
    id: 3,
    title: &quot;Trade Show Setup&quot;,
    start: new Date(2025, 0, 20, 8, 0),
    end: new Date(2025, 0, 22, 20, 0),
    status: &quot;confirmed&quot;,
    location: &quot;Moscone Center&quot;,
    staff: [&quot;Alex Rodriguez&quot;, &quot;Sarah Johnson&quot;, &quot;Mike Chen&quot;],
  },
  {
    id: 4,
    title: &quot;Store Demo - Target&quot;,
    start: new Date(2025, 0, 23, 11, 0),
    end: new Date(2025, 0, 23, 19, 0),
    status: &quot;confirmed&quot;,
    location: &quot;Target - Union Square&quot;,
    staff: [&quot;Jessica Smith&quot;, &quot;Alex Rodriguez&quot;],
  },
];

const statusColors = {
  confirmed: &quot;bg-green-500&quot;,
  pending: &quot;bg-yellow-500&quot;,
  cancelled: &quot;bg-red-500&quot;,
  completed: &quot;bg-blue-500&quot;,
};

export default function BookingsCalendarPage() {
  const [view, setView] = useState(&quot;month&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredBookings = mockBookings.filter(booking => 
    statusFilter === &quot;all&quot; || booking.status === statusFilter
  );

  // Event styling based on status
  const eventStyleGetter = (event) => {
    let backgroundColor = &quot;#3174ad&quot;;
    let borderColor = &quot;#3174ad&quot;;

    switch (event.status) {
      case &quot;confirmed&quot;:
        backgroundColor = &quot;#10b981&quot;;
        borderColor = &quot;#059669&quot;;
        break;
      case &quot;pending&quot;:
        backgroundColor = &quot;#f59e0b&quot;;
        borderColor = &quot;#d97706&quot;;
        break;
      case &quot;cancelled&quot;:
        backgroundColor = &quot;#ef4444&quot;;
        borderColor = &quot;#dc2626&quot;;
        break;
      case &quot;completed&quot;:
        backgroundColor = &quot;#3b82f6&quot;;
        borderColor = &quot;#2563eb&quot;;
        break;
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color: &quot;white&quot;,
      },
    };
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight flex items-center&quot;>
            <CalendarIcon className=&quot;h-8 w-8 mr-3 text-primary&quot; />
            Bookings Calendar
          </h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            View and manage all bookings in calendar format
          </p>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Link href=&quot;/bookings/new&quot;>
            <Button>
              <Plus className=&quot;h-4 w-4 mr-2&quot; />
              New Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className=&quot;flex items-center&quot;>
            <Filter className=&quot;h-5 w-5 mr-2&quot; />
            Calendar Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-wrap gap-4 items-center&quot;>
            <div className=&quot;flex items-center space-x-2&quot;>
              <label className=&quot;text-sm font-medium&quot;>Status Filter:</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className=&quot;w-40&quot;>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                  <SelectItem value=&quot;confirmed&quot;>Confirmed</SelectItem>
                  <SelectItem value=&quot;pending&quot;>Pending</SelectItem>
                  <SelectItem value=&quot;cancelled&quot;>Cancelled</SelectItem>
                  <SelectItem value=&quot;completed&quot;>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className=&quot;flex items-center space-x-2&quot;>
              <label className=&quot;text-sm font-medium&quot;>View:</label>
              <Select value={view} onValueChange={setView}>
                <SelectTrigger className=&quot;w-32&quot;>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value=&quot;month&quot;>Month</SelectItem>
                  <SelectItem value=&quot;week&quot;>Week</SelectItem>
                  <SelectItem value=&quot;day&quot;>Day</SelectItem>
                  <SelectItem value=&quot;agenda&quot;>Agenda</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Legend */}
            <div className=&quot;flex items-center space-x-4 ml-auto&quot;>
              <span className=&quot;text-sm font-medium&quot;>Status:</span>
              <div className=&quot;flex items-center space-x-1&quot;>
                <div className=&quot;w-3 h-3 bg-green-500 rounded&quot;></div>
                <span className=&quot;text-xs&quot;>Confirmed</span>
              </div>
              <div className=&quot;flex items-center space-x-1&quot;>
                <div className=&quot;w-3 h-3 bg-yellow-500 rounded&quot;></div>
                <span className=&quot;text-xs&quot;>Pending</span>
              </div>
              <div className=&quot;flex items-center space-x-1&quot;>
                <div className=&quot;w-3 h-3 bg-blue-500 rounded&quot;></div>
                <span className=&quot;text-xs&quot;>Completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className=&quot;p-6&quot;>
          <div style={{ height: &quot;600px&quot; }}>
            <Calendar
              localizer={localizer}
              events={filteredBookings}
              startAccessor=&quot;start&quot;
              endAccessor=&quot;end&quot;
              view={view}
              onView={setView}
              onSelectEvent={(event) => setSelectedEvent(event)}
              eventPropGetter={eventStyleGetter}
              popup
              components={{
                event: ({ event }) => (
                  <div className=&quot;text-xs&quot;>
                    <div className=&quot;font-medium truncate&quot;>{event.title}</div>
                    <div className=&quot;truncate&quot;>{event.location}</div>
                  </div>
                ),
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-green-600&quot;>
              {mockBookings.filter(b => b.status === &quot;confirmed&quot;).length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Confirmed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-yellow-600&quot;>
              {mockBookings.filter(b => b.status === &quot;pending&quot;).length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-blue-600&quot;>
              {mockBookings.filter(b => b.status === &quot;completed&quot;).length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold&quot;>
              {mockBookings.length}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Total Bookings</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}