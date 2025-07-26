"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  TrendingUp,
  Users,
  MapPin,
  Activity,
  Download,
} from "lucide-react";

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
    { type: "Education Workshop", count: 45 },
    { type: "Product Launch", count: 32 },
    { type: "Grand Opening", count: 28 },
    { type: "Promotional Event", count: 40 },
  ],
  usersByRole: [
    { role: "Brand Agent", count: 156 },
    { role: "Field Manager", count: 78 },
    { role: "Organization Admin", count: 45 },
    { role: "Super Admin", count: 8 },
  ],
  eventsByStatus: [
    { status: "Completed", count: 89 },
    { status: "Active", count: 23 },
    { status: "Scheduled", count: 25 },
    { status: "Cancelled", count: 8 },
  ],
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("30days");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            System-wide analytics and performance metrics
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalEvents}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.activeEvents}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.organizations}
            </div>
            <p className="text-xs text-muted-foreground">Active clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Events by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Events by Type</CardTitle>
            <CardDescription>Distribution of event categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.eventsByType.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item.type}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.count}</Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
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
            <div className="space-y-3">
              {analyticsData.usersByRole.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item.role}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.count}</Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
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
            <div className="space-y-3">
              {analyticsData.eventsByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm font-medium">{item.status}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.count}</Badge>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
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
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Trends
          </CardTitle>
          <CardDescription>
            Key performance indicators over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">94.2%</div>
              <p className="text-sm text-muted-foreground">
                Event Success Rate
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">87.5%</div>
              <p className="text-sm text-muted-foreground">Staff Utilization</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">4.8/5</div>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
