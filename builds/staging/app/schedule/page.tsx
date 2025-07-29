"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import {
  Calendar,
  Clock,
  Plus,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";

const upcomingEvents = [
  {
    id: 1,
    title: "Product Launch Demo",
    client: "TechHub Events",
    date: "2025-06-17",
    time: "10:00 AM - 6:00 PM",
    location: "Downtown Mall, Floor 2",
    status: "confirmed",
    role: "Lead Brand Ambassador",
  },
  {
    id: 2,
    title: "Summer Activation",
    client: "Premium Events Ltd",
    date: "2025-06-19",
    time: "12:00 PM - 8:00 PM",
    location: "Central Park Plaza",
    status: "pending",
    role: "Product Specialist",
  },
  {
    id: 3,
    title: "Trade Show Setup",
    client: "Acme Corp",
    date: "2025-06-22",
    time: "8:00 AM - 10:00 AM",
    location: "Convention Center Hall A",
    status: "confirmed",
    role: "Setup Assistant",
  },
];

export default function SchedulePage() {
  const [activeTab, setActiveTab] = useState("schedule");
  const router = useRouter();

  const handleUpdateAvailability = () => {
    router.push("/availability");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Schedule</h1>
          <p className="text-muted-foreground">
            View your upcoming events and manage availability
          </p>
        </div>
        <Button onClick={handleUpdateAvailability}>
          <Plus className="h-4 w-4 mr-2" />
          Update Availability
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              Working hours this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Availability</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/7</div>
            <p className="text-xs text-muted-foreground">Days available</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Event</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tomorrow</div>
            <p className="text-xs text-muted-foreground">10:00 AM start</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">Upcoming Events</TabsTrigger>
          <TabsTrigger value="history">Event History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
          {/* Upcoming Events */}
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge
                          variant={
                            event.status === "confirmed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-muted-foreground">
                          <User className="h-4 w-4 mr-2" />
                          <span className="font-medium text-foreground">
                            {event.client}
                          </span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="font-medium text-foreground">
                            {event.date}
                          </span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          <span className="font-medium text-foreground">
                            {event.time}
                          </span>
                        </div>
                        <div className="flex items-center text-muted-foreground">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span className="font-medium text-foreground">
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          Role:{" "}
                          <span className="font-medium text-foreground">
                            {event.role}
                          </span>
                        </span>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {event.status === "pending" && (
                            <>
                              <Button variant="outline" size="sm">
                                Accept
                              </Button>
                              <Button variant="outline" size="sm">
                                Decline
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event History</CardTitle>
              <CardDescription>
                View your completed events and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Event History</h3>
                <p className="text-muted-foreground">
                  Your completed events and performance history will be
                  displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
