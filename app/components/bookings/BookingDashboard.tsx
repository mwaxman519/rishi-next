"use client";

import React, { useState } from "react";
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

// Data will be fetched from database via API endpoints
const mockBookings = [
  {
    id: "1",
    title: "Product Demo at Westfield Mall",
    activityType: "event",
    activityStatus: "pending",
    location: "Westfield Mall, San Francisco",
    startDate: new Date("2025-05-15T10:00:00"),
    endDate: new Date("2025-05-15T16:00:00"),
    assignee: "Sarah Johnson",
  },
  {
    id: "2",
    title: "Store Merchandising Review",
    activityType: "merchandising",
    activityStatus: "approved",
    location: "Downtown Retail Store, Chicago",
    startDate: new Date("2025-05-20T09:00:00"),
    endDate: new Date("2025-05-20T12:00:00"),
    assignee: "Mike Peterson",
  },
  {
    id: "3",
    title: "Secret Shopping Evaluation",
    activityType: "secret_shopping",
    activityStatus: "in_progress",
    location: "Outlet Mall, Miami",
    startDate: new Date("2025-05-10T14:00:00"),
    endDate: new Date("2025-05-10T17:00:00"),
    assignee: "Alex Williams",
  },
  {
    id: "4",
    title: "Product Training Session",
    activityType: "training",
    activityStatus: "completed",
    location: "Virtual Event",
    startDate: new Date("2025-05-05T13:00:00"),
    endDate: new Date("2025-05-05T15:00:00"),
    assignee: "Taylor Rodriguez",
  },
  {
    id: "5",
    title: "Inventory Transfer",
    activityType: "logistics",
    activityStatus: "draft",
    location: "Distribution Center, Dallas",
    startDate: new Date("2025-05-25T08:00:00"),
    endDate: new Date("2025-05-25T16:00:00"),
    assignee: "Jordan Smith",
  },
];

// Status badge mapper
const activityStatusMapper: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  draft: { label: "Draft", variant: "outline" },
  pending: { label: "Pending Approval", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  in_progress: { label: "In Progress", variant: "default" },
  completed: { label: "Completed", variant: "outline" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

// Activity type mapper
const activityTypeMapper: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  event: {
    label: "Event",
    icon: <CalendarDays className="h-4 w-4 mr-1" />,
  },
  merchandising: {
    label: "Merchandising",
    icon: <CheckCircle2 className="h-4 w-4 mr-1" />,
  },
  secret_shopping: {
    label: "Secret Shopping",
    icon: <User className="h-4 w-4 mr-1" />,
  },
  training: {
    label: "Training",
    icon: <User className="h-4 w-4 mr-1" />,
  },
  logistics: {
    label: "Logistics",
    icon: <Clock4 className="h-4 w-4 mr-1" />,
  },
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function BookingDashboard() {
  const [showFilters, setShowFilters] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Button asChild className="flex gap-1">
          <Link href="/bookings/new">
            <Plus className="h-4 w-4" />
            New Booking
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          <Tabs
            defaultValue="list"
            className="w-[200px]"
            onValueChange={(value) => setView(value as "list" | "calendar")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">
                <ListFilter className="h-4 w-4 mr-1" />
                List
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-1" />
                Calendar
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Filter Bookings</CardTitle>
            <CardDescription>
              Narrow down bookings based on various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BookingsFilter />
          </CardContent>
        </Card>
      )}

      {/* Content View Based on Tab Selection */}
      {view === "list" ? (
        <div className="grid gap-6">
          {mockBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <div className="border-l-4 border-primary h-full flex-none" />
              <CardHeader className="p-4 pb-2">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <CardTitle className="text-xl">
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="hover:text-primary transition-colors"
                      >
                        {booking.title}
                      </Link>
                    </CardTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">{booking.location}</span>
                      </div>
                      <div className="hidden sm:block text-muted-foreground">
                        •
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span>
                          {formatTime(booking.startDate)} -{" "}
                          {formatTime(booking.endDate)}
                        </span>
                      </div>
                      <div className="hidden sm:block text-muted-foreground">
                        •
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span>{formatDate(booking.startDate)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col items-start gap-2">
                    <Badge
                      variant={
                        activityStatusMapper[booking.activityStatus]?.variant ||
                        "default"
                      }
                      className="text-xs px-2 py-0.5 h-5"
                    >
                      {activityStatusMapper[booking.activityStatus]?.label ||
                        booking.activityStatus}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-0.5 h-5 flex items-center"
                    >
                      {activityTypeMapper[booking.activityType]?.icon}
                      {activityTypeMapper[booking.activityType]?.label ||
                        booking.activityType}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center text-sm">
                    <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                    <span className="text-muted-foreground">Assigned to:</span>
                    <span className="font-medium ml-1">{booking.assignee}</span>
                  </div>

                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/bookings/${booking.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <CardContent className="p-0">
            <BookingsCalendarView bookings={mockBookings} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
