"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  CheckCircle,
  ClockIcon,
  XCircle,
  CalendarDays,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RequestsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Event Requests</h1>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="declined">Declined</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            New event booking requests waiting for approval.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Pending Request Card */}
            <Card className="transition-all hover:shadow-md border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-2 h-5 w-5 text-amber-600" />
                      Product Launch Event
                    </CardTitle>
                    <CardDescription>
                      <span className="font-medium">Acme Corporation</span> •
                      Tier 2
                    </CardDescription>
                  </div>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800">
                    Pending
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        May 15, 2025 • 10:00 AM - 4:00 PM
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">
                        San Francisco Convention Center
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff Needed</p>
                      <p className="font-medium">5 Brand Ambassadors</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kit Requested</p>
                      <p className="font-medium">Demo Kit v2</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-sm mb-1">
                      Request Notes
                    </p>
                    <p className="text-sm">
                      Staff should have knowledge of our new product line and be
                      able to demonstrate features to potential clients.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" size="sm" className="gap-1">
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                    <Link href="/requests/1">
                      <Button size="sm" className="gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Another Pending Request Card */}
            <Card className="transition-all hover:shadow-md border-amber-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-2 h-5 w-5 text-amber-600" />
                      Trade Show Representation
                    </CardTitle>
                    <CardDescription>
                      <span className="font-medium">Globex Industries</span> •
                      Tier 3
                    </CardDescription>
                  </div>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800">
                    Pending
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        June 5-7, 2025 • 9:00 AM - 5:00 PM
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">Chicago McCormick Place</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff Needed</p>
                      <p className="font-medium">3 Technical Specialists</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kit Requested</p>
                      <p className="font-medium">Trade Show Ultimate</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-muted-foreground text-sm mb-1">
                      Request Notes
                    </p>
                    <p className="text-sm">
                      Need staff with technical expertise who can engage with
                      industry professionals. Booth will require full setup on
                      June 4th.
                    </p>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button variant="outline" size="sm" className="gap-1">
                      <XCircle className="h-4 w-4" />
                      Decline
                    </Button>
                    <Link href="/requests/2">
                      <Button size="sm" className="gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Review & Approve
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Approved requests ready for scheduling.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Approved Request Card */}
            <Card className="transition-all hover:shadow-md border-green-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-2 h-5 w-5 text-green-600" />
                      Product Demo Workshop
                    </CardTitle>
                    <CardDescription>
                      <span className="font-medium">Initech Solutions</span> •
                      Tier 2
                    </CardDescription>
                  </div>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        April 28, 2025 • 1:00 PM - 5:00 PM
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">Austin Convention Center</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff Needed</p>
                      <p className="font-medium">2 Brand Ambassadors</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kit Assigned</p>
                      <p className="font-medium">Demo Kit A-123</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/requests/3/schedule">
                      <Button size="sm" className="gap-1">
                        <ClockIcon className="h-4 w-4" />
                        Schedule Staff
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Fully scheduled event requests.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Scheduled Request Card */}
            <Card className="transition-all hover:shadow-md border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center text-lg">
                      <Calendar className="mr-2 h-5 w-5 text-blue-600" />
                      Annual Conference
                    </CardTitle>
                    <CardDescription>
                      <span className="font-medium">Acme Corporation</span> •
                      Tier 2
                    </CardDescription>
                  </div>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-blue-100 text-blue-800">
                    Scheduled
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date & Time</p>
                      <p className="font-medium">
                        April 22-24, 2025 • 8:00 AM - 6:00 PM
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">Las Vegas Convention Center</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff Assigned</p>
                      <p className="font-medium">5/5 Confirmed</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Kit Status</p>
                      <p className="font-medium">All Kits Ready</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/requests/4/details">
                      <Button size="sm" variant="outline" className="gap-1">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="declined" className="space-y-6">
          <p className="text-muted-foreground">Declined event requests.</p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Declined Requests</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                There are currently no declined event requests.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <p className="text-muted-foreground">
            Calendar view of all event requests.
          </p>

          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <CalendarDays className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Calendar View</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will display a calendar view of all event requests.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
