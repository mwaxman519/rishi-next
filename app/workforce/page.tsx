import { Metadata } from "next";
import {
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata: Metadata = {
  title: "Workforce | Rishi Workforce Management",
  description: "Track time, schedules, and workforce performance",
};

const mockTimeEntries = [
  {
    id: 1,
    agent: "Sarah Johnson",
    event: "Product Launch Event",
    date: "2025-06-16",
    clockIn: "09:00 AM",
    clockOut: "06:00 PM",
    totalHours: 9,
    status: "approved",
  },
  {
    id: 2,
    agent: "Michael Chen",
    event: "Summer Brand Activation",
    date: "2025-06-16",
    clockIn: "10:30 AM",
    clockOut: "07:30 PM",
    totalHours: 9,
    status: "pending",
  },
  {
    id: 3,
    agent: "Emily Rodriguez",
    event: "Corporate Trade Show",
    date: "2025-06-15",
    clockIn: "08:00 AM",
    clockOut: "05:00 PM",
    totalHours: 9,
    status: "approved",
  },
];

const mockSchedule = [
  {
    id: 1,
    agent: "Sarah Johnson",
    event: "Tech Conference Setup",
    date: "Jun 17, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "Convention Center",
    status: "confirmed",
  },
  {
    id: 2,
    agent: "Michael Chen",
    event: "Product Demo Day",
    date: "Jun 18, 2025",
    time: "12:00 PM - 8:00 PM",
    location: "Downtown Mall",
    status: "tentative",
  },
  {
    id: 3,
    agent: "David Thompson",
    event: "Brand Activation",
    date: "Jun 19, 2025",
    time: "10:00 AM - 7:00 PM",
    location: "City Plaza",
    status: "confirmed",
  },
];

export default function WorkforcePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workforce</h1>
          <p className="text-muted-foreground">
            Track time, schedules, and workforce performance
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Time Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Hours Today
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">72</div>
            <p className="text-xs text-muted-foreground">
              +8 hours from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Workers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Currently on duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">384</div>
            <p className="text-xs text-muted-foreground">Total hours worked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">+2% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="timetracking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timetracking">Time Tracking</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="timetracking" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search time entries..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Time Entries */}
          <div className="space-y-3">
            {mockTimeEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-medium">{entry.agent}</h3>
                        <Badge variant="outline">{entry.event}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {entry.date} • {entry.clockIn} - {entry.clockOut}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {entry.totalHours} hours
                        </div>
                        <Badge
                          variant={
                            entry.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {entry.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          {/* Schedule Entries */}
          <div className="space-y-3">
            {mockSchedule.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-medium">{item.agent}</h3>
                        <Badge variant="outline">{item.event}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {item.date} • {item.time} • {item.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        variant={
                          item.status === "confirmed" ? "default" : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Workforce performance analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Performance Dashboard
                </h3>
                <p className="text-muted-foreground">
                  Detailed performance metrics and analytics will be displayed
                  here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
