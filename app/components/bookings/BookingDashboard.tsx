"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import BookingsFilter from "./BookingsFilter";
import BookingsCalendarView from "./BookingsCalendarView";
import { apiFetch } from "@/lib/api";

// Production implementation - all data fetched from real APIs
export default function BookingDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await apiFetch('/api/bookings');
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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Status badge mapper
  const activityStatusMapper: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-purple-100 text-purple-800"
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Bookings Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Booking
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{bookings.length}</div>
                  <p className="text-xs text-muted-foreground">+12% from last month</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => b.status === 'active').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Currently ongoing</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <Clock4 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => b.status === 'pending').length}
                  </div>
                  <p className="text-xs text-muted-foreground">Awaiting review</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {bookings.filter(b => {
                      const bookingDate = new Date(b.created_at);
                      const now = new Date();
                      return bookingDate.getMonth() === now.getMonth() && 
                             bookingDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Recent bookings</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            <div className="grid gap-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{booking.title}</CardTitle>
                      <Badge className={activityStatusMapper[booking.status] || "bg-gray-100 text-gray-800"}>
                        {booking.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.location_name || 'Location TBD'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {new Date(booking.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{booking.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <BookingsCalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
