import { Metadata } from &quot;next&quot;;
import {
  Clock,
  Calendar,
  TrendingUp,
  Users,
  Plus,
  Search,
  Filter,
} from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;

export const metadata: Metadata = {
  title: &quot;Workforce | Rishi Workforce Management&quot;,
  description: &quot;Track time, schedules, and workforce performance&quot;,
};

const mockTimeEntries = [
  {
    id: 1,
    agent: &quot;Sarah Johnson&quot;,
    event: &quot;Product Launch Event&quot;,
    date: &quot;2025-06-16&quot;,
    clockIn: &quot;09:00 AM&quot;,
    clockOut: &quot;06:00 PM&quot;,
    totalHours: 9,
    status: &quot;approved&quot;,
  },
  {
    id: 2,
    agent: &quot;Michael Chen&quot;,
    event: &quot;Summer Brand Activation&quot;,
    date: &quot;2025-06-16&quot;,
    clockIn: &quot;10:30 AM&quot;,
    clockOut: &quot;07:30 PM&quot;,
    totalHours: 9,
    status: &quot;pending&quot;,
  },
  {
    id: 3,
    agent: &quot;Emily Rodriguez&quot;,
    event: &quot;Corporate Trade Show&quot;,
    date: &quot;2025-06-15&quot;,
    clockIn: &quot;08:00 AM&quot;,
    clockOut: &quot;05:00 PM&quot;,
    totalHours: 9,
    status: &quot;approved&quot;,
  },
];

const mockSchedule = [
  {
    id: 1,
    agent: &quot;Sarah Johnson&quot;,
    event: &quot;Tech Conference Setup&quot;,
    date: &quot;Jun 17, 2025&quot;,
    time: &quot;9:00 AM - 6:00 PM&quot;,
    location: &quot;Convention Center&quot;,
    status: &quot;confirmed&quot;,
  },
  {
    id: 2,
    agent: &quot;Michael Chen&quot;,
    event: &quot;Product Demo Day&quot;,
    date: &quot;Jun 18, 2025&quot;,
    time: &quot;12:00 PM - 8:00 PM&quot;,
    location: &quot;Downtown Mall&quot;,
    status: &quot;tentative&quot;,
  },
  {
    id: 3,
    agent: &quot;David Thompson&quot;,
    event: &quot;Brand Activation&quot;,
    date: &quot;Jun 19, 2025&quot;,
    time: &quot;10:00 AM - 7:00 PM&quot;,
    location: &quot;City Plaza&quot;,
    status: &quot;confirmed&quot;,
  },
];

export default function WorkforcePage() {
  return (
    <div className=&quot;container mx-auto p-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex justify-between items-center&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>Workforce</h1>
          <p className=&quot;text-muted-foreground&quot;>
            Track time, schedules, and workforce performance
          </p>
        </div>
        <Button>
          <Plus className=&quot;h-4 w-4 mr-2&quot; />
          Add Time Entry
        </Button>
      </div>

      {/* Stats Cards */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Total Hours Today
            </CardTitle>
            <Clock className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>72</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              +8 hours from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>
              Active Workers
            </CardTitle>
            <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>12</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Currently on duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>This Week</CardTitle>
            <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>384</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Total hours worked</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Efficiency</CardTitle>
            <TrendingUp className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>94%</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>+2% from last week</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue=&quot;timetracking&quot; className=&quot;space-y-4&quot;>
        <TabsList>
          <TabsTrigger value=&quot;timetracking&quot;>Time Tracking</TabsTrigger>
          <TabsTrigger value=&quot;schedule&quot;>Schedule</TabsTrigger>
          <TabsTrigger value=&quot;performance&quot;>Performance</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;timetracking&quot; className=&quot;space-y-4&quot;>
          {/* Filters */}
          <div className=&quot;flex gap-4&quot;>
            <div className=&quot;relative flex-1&quot;>
              <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4&quot; />
              <Input placeholder=&quot;Search time entries...&quot; className=&quot;pl-10&quot; />
            </div>
            <Button variant=&quot;outline&quot;>
              <Filter className=&quot;h-4 w-4 mr-2&quot; />
              Filter
            </Button>
          </div>

          {/* Time Entries */}
          <div className=&quot;space-y-3&quot;>
            {mockTimeEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className=&quot;p-4&quot;>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;space-y-1&quot;>
                      <div className=&quot;flex items-center space-x-4&quot;>
                        <h3 className=&quot;font-medium&quot;>{entry.agent}</h3>
                        <Badge variant=&quot;outline&quot;>{entry.event}</Badge>
                      </div>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {entry.date} • {entry.clockIn} - {entry.clockOut}
                      </p>
                    </div>
                    <div className=&quot;flex items-center space-x-4&quot;>
                      <div className=&quot;text-right&quot;>
                        <div className=&quot;font-medium&quot;>
                          {entry.totalHours} hours
                        </div>
                        <Badge
                          variant={
                            entry.status === &quot;approved&quot;
                              ? &quot;default&quot;
                              : &quot;secondary&quot;
                          }
                        >
                          {entry.status}
                        </Badge>
                      </div>
                      <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                        Review
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;schedule&quot; className=&quot;space-y-4&quot;>
          {/* Schedule Entries */}
          <div className=&quot;space-y-3&quot;>
            {mockSchedule.map((item) => (
              <Card key={item.id}>
                <CardContent className=&quot;p-4&quot;>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;space-y-1&quot;>
                      <div className=&quot;flex items-center space-x-4&quot;>
                        <h3 className=&quot;font-medium&quot;>{item.agent}</h3>
                        <Badge variant=&quot;outline&quot;>{item.event}</Badge>
                      </div>
                      <p className=&quot;text-sm text-muted-foreground&quot;>
                        {item.date} • {item.time} • {item.location}
                      </p>
                    </div>
                    <div className=&quot;flex items-center space-x-4&quot;>
                      <Badge
                        variant={
                          item.status === &quot;confirmed&quot; ? &quot;default&quot; : &quot;secondary&quot;
                        }
                      >
                        {item.status}
                      </Badge>
                      <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value=&quot;performance&quot; className=&quot;space-y-4&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Workforce performance analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-center py-8&quot;>
                <TrendingUp className=&quot;h-12 w-12 mx-auto text-muted-foreground mb-4&quot; />
                <h3 className=&quot;text-lg font-medium mb-2&quot;>
                  Performance Dashboard
                </h3>
                <p className=&quot;text-muted-foreground&quot;>
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
