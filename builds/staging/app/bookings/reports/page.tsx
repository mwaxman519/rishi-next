"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import { FileText, Download, Calendar, TrendingUp, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock report data
const mockReportMetrics = {
  totalBookings: 156,
  completedBookings: 142,
  activeBookings: 14,
  totalRevenue: 285600,
  monthlyGrowth: 12.5,
  topRegion: "San Francisco Bay Area",
  topClient: "Tech Corp"
};

const mockBookingReports = [
  {
    id: 1,
    eventName: "Product Demo Campaign - Q1",
    client: "Tech Corp",
    region: "San Francisco",
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    totalEvents: 25,
    revenue: 45600,
    staffHours: 320,
    status: "completed"
  },
  {
    id: 2,
    eventName: "Brand Activation Series",
    client: "Wellness Brand",
    region: "Los Angeles",
    startDate: "2025-01-15",
    endDate: "2025-02-15",
    totalEvents: 18,
    revenue: 32400,
    staffHours: 245,
    status: "active"
  },
  {
    id: 3,
    eventName: "Trade Show Circuit",
    client: "Event Solutions",
    region: "Multiple",
    startDate: "2024-12-01",
    endDate: "2025-01-15",
    totalEvents: 12,
    revenue: 67800,
    staffHours: 480,
    status: "completed"
  }
];

const mockPerformanceData = [
  { metric: "Booking Fulfillment Rate", value: "98.5%", trend: "+2.1%" },
  { metric: "Average Staff Utilization", value: "85.2%", trend: "+5.3%" },
  { metric: "Client Satisfaction Score", value: "4.7/5", trend: "+0.2" },
  { metric: "Revenue per Event", value: "$1,832", trend: "+8.4%" },
  { metric: "Staff Efficiency Rating", value: "92.1%", trend: "+1.8%" },
  { metric: "Event Success Rate", value: "96.8%", trend: "+3.2%" }
];

export default function BookingReportsPage() {
  const [timeRange, setTimeRange] = useState("last_30_days");
  const [region, setRegion] = useState("all");

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <FileText className="h-8 w-8 mr-3 text-primary" />
            Booking Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive analytics and reporting for booking performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="sf">San Francisco</SelectItem>
                <SelectItem value="la">Los Angeles</SelectItem>
                <SelectItem value="oc">Orange County</SelectItem>
                <SelectItem value="sd">San Diego</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{mockReportMetrics.totalBookings}</div>
                <div className="text-sm text-muted-foreground">Total Bookings</div>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${mockReportMetrics.totalRevenue.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">+{mockReportMetrics.monthlyGrowth}%</div>
                <div className="text-sm text-muted-foreground">Monthly Growth</div>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {mockReportMetrics.completedBookings}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Overview</CardTitle>
              <CardDescription>
                Summary of booking activities for the selected time period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Performing Region</h4>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{mockReportMetrics.topRegion}</span>
                    <Badge variant="outline">Best ROI</Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Top Client</h4>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{mockReportMetrics.topClient}</span>
                    <Badge variant="outline">Highest Volume</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Key performance indicators for booking operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockPerformanceData.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">{metric.metric}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <Badge variant="outline" className="text-green-600 bg-green-50">
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

        <TabsContent value="campaigns" className="space-y-6">
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
                          <div className="font-medium">{report.eventName}</div>
                          <div className="text-sm text-muted-foreground">{report.region}</div>
                        </div>
                      </TableCell>
                      <TableCell>{report.client}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.startDate} to {report.endDate}
                        </div>
                      </TableCell>
                      <TableCell>{report.totalEvents}</TableCell>
                      <TableCell className="font-medium">
                        ${report.revenue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={report.status === "completed" ? 
                            "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
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

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>
                Financial performance and revenue breakdowns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Revenue Analytics Dashboard</h3>
                <p className="text-muted-foreground">
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