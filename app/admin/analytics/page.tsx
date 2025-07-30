&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Activity,
  Download,
} from &quot;lucide-react&quot;;

interface AnalyticsData {
  totalEvents: number;
  activeEvents: number;
  totalUsers: number;
  organizations: number;
  eventsByType: { type: string; count: number }[];
  usersByRole: { role: string; count: number }[];
  eventsByStatus: { status: string; count: number }[];
}

const analyticsData: AnalyticsData = {
  totalEvents: 145,
  activeEvents: 23,
  totalUsers: 287,
  organizations: 34,
  eventsByType: [
    { type: &quot;Education Workshop&quot;, count: 45 },
    { type: &quot;Product Launch&quot;, count: 32 },
    { type: &quot;Grand Opening&quot;, count: 28 },
    { type: &quot;Promotional Event&quot;, count: 40 },
  ],
  usersByRole: [
    { role: &quot;Brand Agent&quot;, count: 156 },
    { role: &quot;Field Manager&quot;, count: 78 },
    { role: &quot;Organization Admin&quot;, count: 45 },
    { role: &quot;Super Admin&quot;, count: 8 },
  ],
  eventsByStatus: [
    { status: &quot;Completed&quot;, count: 89 },
    { status: &quot;Active&quot;, count: 23 },
    { status: &quot;Scheduled&quot;, count: 25 },
    { status: &quot;Cancelled&quot;, count: 8 },
  ],
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState(&quot;30days&quot;);

  return (
    <div className=&quot;space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold&quot;>Analytics Dashboard</h1>
          <p className=&quot;text-muted-foreground mt-2&quot;>
            System-wide analytics and performance metrics
          </p>
        </div>
        <div className=&quot;flex items-center space-x-2&quot;>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className=&quot;w-32&quot;>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=&quot;7days&quot;>7 Days</SelectItem>
              <SelectItem value=&quot;30days&quot;>30 Days</SelectItem>
              <SelectItem value=&quot;90days&quot;>90 Days</SelectItem>
              <SelectItem value=&quot;1year&quot;>1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant=&quot;outline&quot;>
            <Download className=&quot;w-4 h-4 mr-2&quot; />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6&quot;>
        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Total Events</CardTitle>
            <Calendar className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {analyticsData.totalEvents}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Active Events</CardTitle>
            <Activity className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {analyticsData.activeEvents}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Total Users</CardTitle>
            <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>{analyticsData.totalUsers}</div>
            <p className=&quot;text-xs text-muted-foreground&quot;>+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className=&quot;flex flex-row items-center justify-between space-y-0 pb-2&quot;>
            <CardTitle className=&quot;text-sm font-medium&quot;>Organizations</CardTitle>
            <MapPin className=&quot;h-4 w-4 text-muted-foreground&quot; />
          </CardHeader>
          <CardContent>
            <div className=&quot;text-2xl font-bold&quot;>
              {analyticsData.organizations}
            </div>
            <p className=&quot;text-xs text-muted-foreground&quot;>Active clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className=&quot;grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6&quot;>
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Distribution of event categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-3&quot;>
              {analyticsData.eventsByType.map((item) => (
                <div
                  key={item.type}
                  className=&quot;flex items-center justify-between&quot;
                >
                  <span className=&quot;text-sm font-medium&quot;>{item.type}</span>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Badge variant=&quot;outline&quot;>{item.count}</Badge>
                    <div className=&quot;w-16 bg-gray-200 rounded-full h-2&quot;>
                      <div
                        className=&quot;bg-primary h-2 rounded-full&quot;
                        style={{
                          width: `${(item.count / analyticsData.totalEvents) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle>Users by Role</CardTitle>
            <CardDescription>User distribution across roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-3&quot;>
              {analyticsData.usersByRole.map((item) => (
                <div
                  key={item.role}
                  className=&quot;flex items-center justify-between&quot;
                >
                  <span className=&quot;text-sm font-medium&quot;>{item.role}</span>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Badge variant=&quot;outline&quot;>{item.count}</Badge>
                    <div className=&quot;w-16 bg-gray-200 rounded-full h-2&quot;>
                      <div
                        className=&quot;bg-blue-500 h-2 rounded-full&quot;
                        style={{
                          width: `${(item.count / analyticsData.totalUsers) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Event Status */}
        <Card>
          <CardHeader>
            <CardTitle>Event Status</CardTitle>
            <CardDescription>Current state of all events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className=&quot;space-y-3&quot;>
              {analyticsData.eventsByStatus.map((item) => (
                <div
                  key={item.status}
                  className=&quot;flex items-center justify-between&quot;
                >
                  <span className=&quot;text-sm font-medium&quot;>{item.status}</span>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Badge variant=&quot;outline&quot;>{item.count}</Badge>
                    <div className=&quot;w-16 bg-gray-200 rounded-full h-2&quot;>
                      <div
                        className=&quot;bg-green-500 h-2 rounded-full&quot;
                        style={{
                          width: `${(item.count / analyticsData.totalEvents) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className=&quot;flex items-center&quot;>
            <TrendingUp className=&quot;w-5 h-5 mr-2&quot; />
            Performance Trends
          </CardTitle>
          <CardDescription>
            Key performance indicators over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6&quot;>
            <div className=&quot;text-center&quot;>
              <div className=&quot;text-2xl font-bold text-green-600&quot;>94.2%</div>
              <p className=&quot;text-sm text-muted-foreground&quot;>
                Event Success Rate
              </p>
            </div>
            <div className=&quot;text-center&quot;>
              <div className=&quot;text-2xl font-bold text-blue-600&quot;>87.5%</div>
              <p className=&quot;text-sm text-muted-foreground&quot;>Staff Utilization</p>
            </div>
            <div className=&quot;text-center&quot;>
              <div className=&quot;text-2xl font-bold text-orange-600&quot;>4.8/5</div>
              <p className=&quot;text-sm text-muted-foreground&quot;>Average Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
