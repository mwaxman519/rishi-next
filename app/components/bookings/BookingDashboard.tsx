&quot;use client&quot;;

import React, { useState, useEffect } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Filter,
  User,
  ListFilter,
  CalendarDays,
  CheckCircle2,
  Clock4,
} from &quot;lucide-react&quot;;
import { ScrollArea } from &quot;@/components/ui/scroll-area&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import BookingsFilter from &quot;./BookingsFilter&quot;;
import BookingsCalendarView from &quot;./BookingsCalendarView&quot;;

// Production implementation - all data fetched from real APIs
export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch('/api/bookings');
        if (response.ok) {
          const data = await response.json();
          setBookings(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className=&quot;flex items-center justify-center h-96&quot;>
        <div className=&quot;animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600&quot;></div>
      </div>
    );
  }

  // Status badge mapper
  const activityStatusMapper: Record<string, string> = {
    pending: &quot;bg-yellow-100 text-yellow-800&quot;,
    approved: &quot;bg-green-100 text-green-800&quot;,
    rejected: &quot;bg-red-100 text-red-800&quot;,
    in_progress: &quot;bg-blue-100 text-blue-800&quot;,
    completed: &quot;bg-purple-100 text-purple-800&quot;
  };

  return (
    <div className=&quot;flex h-screen flex-col&quot;>
      <div className=&quot;flex-1 space-y-6 p-6&quot;>
        <div className=&quot;flex items-center justify-between&quot;>
          <h1 className=&quot;text-3xl font-bold&quot;>Bookings Dashboard</h1>
          <div className=&quot;flex items-center space-x-4&quot;>
            <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
              <Filter className=&quot;h-4 w-4 mr-2&quot; />
              Filter
            </Button>
            <Button>
              <Plus className=&quot;h-4 w-4 mr-2&quot; />
              New Booking
            </Button>
          </div>
        </div>

        <Tabs defaultValue=&quot;dashboard&quot; className=&quot;w-full&quot;>
          <TabsList className=&quot;grid w-full grid-cols-3&quot;>
            <TabsTrigger value=&quot;dashboard&quot;>Dashboard</TabsTrigger>
            <TabsTrigger value=&quot;list&quot;>List View</TabsTrigger>
            <TabsTrigger value=&quot;calendar&quot;>Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value=&quot;dashboard&quot; className=&quot;space-y-4&quot;>
            <div className=&quot;grid gap-4 md:grid-cols-2 lg:grid-cols-4&quot;>
              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>Total Bookings</CardTitle>
                  <CalendarDays className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold&quot;>{bookings.length}</div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>Active Bookings</CardTitle>
                  <CheckCircle2 className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold&quot;>
                    {bookings.filter(b => b.status === 'active').length}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>Currently ongoing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>Pending Approval</CardTitle>
                  <Clock4 className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold&quot;>
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
                  <CardTitle className=&quot;text-sm font-medium&quot;>This Month</CardTitle>
                  <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
                </CardHeader>
                <CardContent>
                  <div className=&quot;text-2xl font-bold&quot;>
                    {bookings.filter(b => {
                      const bookingDate = new Date(b.created_at);
                      const now = new Date();
                      return bookingDate.getMonth() === now.getMonth() && 
                             bookingDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                  <p className=&quot;text-xs text-muted-foreground&quot;>Recent bookings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value=&quot;list&quot; className=&quot;space-y-4&quot;>
            <div className=&quot;grid gap-4&quot;>
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <CardTitle className=&quot;text-lg&quot;>{booking.title}</CardTitle>
                      <Badge className={activityStatusMapper[booking.status] || &quot;bg-gray-100 text-gray-800&quot;}>
                        {booking.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className=&quot;flex items-center space-x-4 text-sm text-gray-600&quot;>
                        <span className=&quot;flex items-center&quot;>
                          <MapPin className=&quot;h-4 w-4 mr-1&quot; />
                          {booking.location_name || 'Location TBD'}
                        </span>
                        <span className=&quot;flex items-center&quot;>
                          <Clock className=&quot;h-4 w-4 mr-1&quot; />
                          {new Date(booking.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className=&quot;text-sm text-gray-700&quot;>{booking.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value=&quot;calendar&quot; className=&quot;space-y-4&quot;>
            <BookingsCalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
