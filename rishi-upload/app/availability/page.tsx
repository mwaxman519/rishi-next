"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, CalendarCheck, Users, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BasicCalendar from "../availability/components/BasicCalendar";

export default function AvailabilityPage() {
  return (
    <div className="container mx-auto py-2 space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold tracking-tight">My Availability</h1>
        <Button variant="outline" className="gap-1" size="sm">
          <Clock className="h-3 w-3" />
          Set Available Hours
        </Button>
      </div>

      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex justify-between items-center mb-1">
          <TabsList className="h-8">
            <TabsTrigger value="calendar" className="text-xs px-2 py-1 h-7">
              Calendar
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs px-2 py-1 h-7">
              Upcoming Shifts
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-2 py-1 h-7">
              History
            </TabsTrigger>
            <TabsTrigger value="team" className="text-xs px-2 py-1 h-7">
              Team View
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="calendar" className="space-y-2 pt-1">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              <div className="h-[1000px] overflow-hidden">
                {/* Replace placeholder with actual BasicCalendar component */}
                <BasicCalendar userId={1} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            View your upcoming scheduled shifts.
          </p>

          <div className="grid grid-cols-1 gap-4">
            {/* Upcoming Shift Card */}
            <Card className="transition-all hover:shadow-md border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-lg">
                    <CalendarCheck className="mr-2 h-5 w-5 text-blue-600" />
                    Product Launch Event
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-blue-100 text-blue-800">
                    Confirmed
                  </span>
                </div>
                <CardDescription>Acme Corporation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">May 15, 2025</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">9:00 AM - 5:00 PM</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">
                        San Francisco Convention Center
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium">Brand Ambassador</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/availability/shifts/1">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Another Upcoming Shift */}
            <Card className="transition-all hover:shadow-md border-blue-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center text-lg">
                    <CalendarCheck className="mr-2 h-5 w-5 text-blue-600" />
                    Trade Show Representation
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-blue-100 text-blue-800">
                    Confirmed
                  </span>
                </div>
                <CardDescription>Globex Industries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">June 5-7, 2025</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">8:00 AM - 6:00 PM</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">Chicago McCormick Place</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Role</p>
                      <p className="font-medium">Technical Specialist</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href="/availability/shifts/2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <p className="text-muted-foreground">
            View your past shifts and work history.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Work History</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will display your historical shifts and event
                participation.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <p className="text-muted-foreground">
            View availability across your team.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Team Availability</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will provide a view of availability across all team
                members.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
