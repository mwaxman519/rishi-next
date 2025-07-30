&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { FileText, Download, Calendar, TrendingUp, Users, MapPin } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;

// Mock report data
const mockReportMetrics = {
  totalBookings: 156,
  completedBookings: 142,
  activeBookings: 14,
  totalRevenue: 285600,
  monthlyGrowth: 12.5,
  topRegion: &quot;San Francisco Bay Area&quot;,
  topClient: &quot;Tech Corp&quot;
};

const mockBookingReports = [
  {
    id: 1,
    eventName: &quot;Product Demo Campaign - Q1&quot;,
    client: &quot;Tech Corp&quot;,
    region: &quot;San Francisco&quot;,
    startDate: &quot;2025-01-01&quot;,
    endDate: &quot;2025-01-31&quot;,
    totalEvents: 25,
    revenue: 45600,
    staffHours: 320,
    status: &quot;completed&quot;
  },
  {
    id: 2,
    eventName: &quot;Brand Activation Series&quot;,
    client: &quot;Wellness Brand&quot;,
    region: &quot;Los Angeles&quot;,
    startDate: &quot;2025-01-15&quot;,
    endDate: &quot;2025-02-15&quot;,
    totalEvents: 18,
    revenue: 32400,
    staffHours: 245,
    status: &quot;active&quot;
  },
  {
    id: 3,
    eventName: &quot;Trade Show Circuit&quot;,
    client: &quot;Event Solutions&quot;,
    region: &quot;Multiple&quot;,
    startDate: &quot;2024-12-01&quot;,
    endDate: &quot;2025-01-15&quot;,
    totalEvents: 12,
    revenue: 67800,
    staffHours: 480,
    status: &quot;completed&quot;
  }
];

const mockPerformanceData = [
  { metric: &quot;Booking Fulfillment Rate&quot;, value: &quot;98.5%&quot;, trend: &quot;+2.1%&quot; },
  { metric: &quot;Average Staff Utilization&quot;, value: &quot;85.2%&quot;, trend: &quot;+5.3%&quot; },
  { metric: &quot;Client Satisfaction Score&quot;, value: &quot;4.7/5&quot;, trend: &quot;+0.2&quot; },
  { metric: &quot;Revenue per Event&quot;, value: &quot;$1,832&quot;, trend: &quot;+8.4%&quot; },
  { metric: &quot;Staff Efficiency Rating&quot;, value: &quot;92.1%&quot;, trend: &quot;+1.8%&quot; },
  { metric: &quot;Event Success Rate&quot;, value: &quot;96.8%&quot;, trend: &quot;+3.2%&quot; }
];

export default function BookingReportsPage() {
  const [timeRange, setTimeRange] = useState(&quot;last_30_days&quot;);
  const [region, setRegion] = useState(&quot;all&quot;);

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight flex items-center&quot;>
            <FileText className=&quot;h-8 w-8 mr-3 text-primary&quot; />
            Booking Reports
          </h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            Comprehensive analytics and reporting for booking performance
          </p>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button variant=&quot;outline&quot;>
            <Download className=&quot;h-4 w-4 mr-2&quot; />
            Export Report
          </Button>
          <Button>
            <Calendar className=&quot;h-4 w-4 mr-2&quot; />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className=&quot;text-lg&quot;>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className=&quot;w-44&quot;>
                <SelectValue placeholder=&quot;Select time range&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;last_7_days&quot;>Last 7 Days</SelectItem>
                <SelectItem value=&quot;last_30_days&quot;>Last 30 Days</SelectItem>
                <SelectItem value=&quot;last_90_days&quot;>Last 90 Days</SelectItem>
                <SelectItem value=&quot;last_year&quot;>Last Year</SelectItem>
                <SelectItem value=&quot;custom&quot;>Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className=&quot;w-44&quot;>
                <SelectValue placeholder=&quot;Select region&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Regions</SelectItem>
                <SelectItem value=&quot;sf&quot;>San Francisco</SelectItem>
                <SelectItem value=&quot;la&quot;>Los Angeles</SelectItem>
                <SelectItem value=&quot;oc&quot;>Orange County</SelectItem>
                <SelectItem value=&quot;sd&quot;>San Diego</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <div className=&quot;text-2xl font-bold&quot;>{mockReportMetrics.totalBookings}</div>
                <div className=&quot;text-sm text-muted-foreground&quot;>Total Bookings</div>
              </div>
              <Calendar className=&quot;h-8 w-8 text-blue-500&quot; />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <div className=&quot;text-2xl font-bold text-green-600&quot;>
                  ${mockReportMetrics.totalRevenue.toLocaleString()}
                </div>
                <div className=&quot;text-sm text-muted-foreground&quot;>Total Revenue</div>
              </div>
              <TrendingUp className=&quot;h-8 w-8 text-green-500&quot; />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <div className=&quot;text-2xl font-bold text-blue-600&quot;>+{mockReportMetrics.monthlyGrowth}%</div>
                <div className=&quot;text-sm text-muted-foreground&quot;>Monthly Growth</div>
              </div>
              <TrendingUp className=&quot;h-8 w-8 text-blue-500&quot; />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;flex items-center justify-between&quot;>
              <div>
                <div className=&quot;text-2xl font-bold text-purple-600&quot;>
                  {mockReportMetrics.completedBookings}
                </div>
                <div className=&quot;text-sm text-muted-foreground&quot;>Completed</div>
              </div>
              <Users className=&quot;h-8 w-8 text-purple-500&quot; />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue=&quot;overview&quot; className=&quot;w-full&quot;>
        <TabsList className=&quot;mb-4&quot;>
          <TabsTrigger value=&quot;overview&quot;>Overview</TabsTrigger>
          <TabsTrigger value=&quot;performance&quot;>Performance</TabsTrigger>
          <TabsTrigger value=&quot;campaigns&quot;>Campaigns</TabsTrigger>
          <TabsTrigger value=&quot;revenue&quot;>Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value=&quot;overview&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
              <CardDescription>
                Summary of booking activities for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-6&quot;>
                <div className=&quot;space-y-4&quot;>
                  <h4 className=&quot;font-medium&quot;>Top Performing Region</h4>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <MapPin className=&quot;h-4 w-4 text-muted-foreground&quot; />
                    <span className=&quot;font-medium&quot;>{mockReportMetrics.topRegion}</span>
                    <Badge variant=&quot;outline&quot;>Best ROI</Badge>
                  </div>
                </div>
                <div className=&quot;space-y-4&quot;>
                  <h4 className=&quot;font-medium&quot;>Top Client</h4>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Users className=&quot;h-4 w-4 text-muted-foreground&quot; />
                    <span className=&quot;font-medium&quot;>{mockReportMetrics.topClient}</span>
                    <Badge variant=&quot;outline&quot;>Highest Volume</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;performance&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for booking operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
                {mockPerformanceData.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className=&quot;p-4&quot;>
                      <div className=&quot;text-sm text-muted-foreground&quot;>{metric.metric}</div>
                      <div className=&quot;flex items-center justify-between mt-2&quot;>
                        <div className=&quot;text-2xl font-bold&quot;>{metric.value}</div>
                        <Badge variant=&quot;outline&quot; className=&quot;text-green-600 bg-green-50&quot;>
                          {metric.trend}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;campaigns&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Campaign Reports</CardTitle>
              <CardDescription>
                Detailed reports for individual campaigns and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockBookingReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className=&quot;font-medium&quot;>{report.eventName}</div>
                          <div className=&quot;text-sm text-muted-foreground&quot;>{report.region}</div>
                        </div>
                      </TableCell>
                      <TableCell>{report.client}</TableCell>
                      <TableCell>
                        <div className=&quot;text-sm&quot;>
                          {report.startDate} to {report.endDate}
                        </div>
                      </TableCell>
                      <TableCell>{report.totalEvents}</TableCell>
                      <TableCell className=&quot;font-medium&quot;>
                        ${report.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={report.status === &quot;completed&quot; ? 
                            &quot;bg-green-100 text-green-800&quot; : &quot;bg-blue-100 text-blue-800&quot;}
                        >
                          {report.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=&quot;revenue&quot; className=&quot;space-y-6&quot;>
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and revenue breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className=&quot;text-center py-8&quot;>
                <TrendingUp className=&quot;h-16 w-16 text-muted-foreground mx-auto mb-4&quot; />
                <h3 className=&quot;text-lg font-medium mb-2&quot;>Revenue Analytics Dashboard</h3>
                <p className=&quot;text-muted-foreground&quot;>
                  Detailed revenue charts and financial analytics would be displayed here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}