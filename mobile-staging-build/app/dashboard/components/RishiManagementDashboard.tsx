"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Building,
  Calendar,
  Package,
  MapPin,
  Users,
  AlertTriangle,
  Clock,
  BarChart3,
  FileBarChart,
  DollarSign,
  ClipboardList,
  Bell,
} from "lucide-react";
import Link from "next/link";

export default function RishiManagementDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Management Dashboard
        </h1>
      </div>

      {/* Core Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Clients</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Building className="mr-2 h-5 w-5 text-primary" />
              12
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/client-management"
              className="text-xs text-primary hover:underline"
            >
              Manage clients →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Events</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-primary" />8
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/events/active"
              className="text-xs text-primary hover:underline"
            >
              View active events →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Staff Available</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              28
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/staff-management"
              className="text-xs text-primary hover:underline"
            >
              Manage staff →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Regions</CardDescription>
            <CardTitle className="text-3xl flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-primary" />8
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/regions"
              className="text-xs text-primary hover:underline"
            >
              Manage regions →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Attention Required Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Attention Required</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Requests Card */}
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  Pending Booking Requests
                </CardTitle>
                <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800">
                  5 Requests
                </span>
              </div>
              <CardDescription>
                Events awaiting management approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Product Launch</div>
                    <div className="text-sm text-muted-foreground">
                      Acme Corporation • May 15, 2025
                    </div>
                  </div>
                  <Link
                    href="/events/request/1"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Review →
                  </Link>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Trade Show</div>
                    <div className="text-sm text-muted-foreground">
                      Globex Industries • June 5-7, 2025
                    </div>
                  </div>
                  <Link
                    href="/events/request/2"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Review →
                  </Link>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">Corporate Training</div>
                    <div className="text-sm text-muted-foreground">
                      Initech • May 20-22, 2025
                    </div>
                  </div>
                  <Link
                    href="/events/request/3"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Review →
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/events/booking-requests"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all requests →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Staffing Needs Card */}
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-amber-500" />
                  Staffing Needs
                </CardTitle>
                <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800">
                  3 Events
                </span>
              </div>
              <CardDescription>
                Events requiring staff assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Tech Workshop</div>
                    <div className="text-sm text-muted-foreground">
                      Needs 3 more staff • April 25, 2025
                    </div>
                  </div>
                  <Link
                    href="/staff-management/assign/1"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Assign →
                  </Link>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <div>
                    <div className="font-medium">Product Launch</div>
                    <div className="text-sm text-muted-foreground">
                      Needs 5 more staff • May 10, 2025
                    </div>
                  </div>
                  <Link
                    href="/staff-management/assign/2"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Assign →
                  </Link>
                </div>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">Trade Show</div>
                    <div className="text-sm text-muted-foreground">
                      Needs 8 more staff • June 5-7, 2025
                    </div>
                  </div>
                  <Link
                    href="/staff-management/assign/3"
                    className="text-xs font-medium text-primary hover:underline self-center"
                  >
                    Assign →
                  </Link>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/staff-management/needs"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View all staffing needs →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Operational Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Operational Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff Utilization */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-primary" />
                Staff Utilization
              </CardTitle>
              <CardDescription>
                Current staff deployment and availability
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div className="font-medium">Currently Deployed</div>
                  <div className="font-medium">12 Staff (43%)</div>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <div className="font-medium">Available This Week</div>
                  <div className="font-medium">16 Staff (57%)</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Scheduled Next Week</div>
                  <div className="font-medium">22 Staff (79%)</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/analytics/staff-utilization"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View detailed metrics →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-primary" />
                Financial Overview
              </CardTitle>
              <CardDescription>Current month financial metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between border-b pb-2">
                  <div className="font-medium">Revenue (MTD)</div>
                  <div className="font-medium">$125,750</div>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <div className="font-medium">Expenses (MTD)</div>
                  <div className="font-medium">$87,320</div>
                </div>
                <div className="flex justify-between">
                  <div className="font-medium">Projected Monthly</div>
                  <div className="font-medium">$210,500</div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/finance/overview"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  View financial reports →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Management Tools */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <ClipboardList className="mr-2 h-5 w-5 text-primary" />
                Client Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/client-management/accounts"
                  className="block text-primary hover:underline"
                >
                  Client Accounts
                </Link>
                <Link
                  href="/client-management/locations"
                  className="block text-primary hover:underline"
                >
                  Manage Locations
                </Link>
                <Link
                  href="/client-management/kits"
                  className="block text-primary hover:underline"
                >
                  Equipment Allocation
                </Link>
                <Link
                  href="/client-management/staff"
                  className="block text-primary hover:underline"
                >
                  Staff Assignment
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <FileBarChart className="mr-2 h-5 w-5 text-primary" />
                Analytics & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/analytics/performance"
                  className="block text-primary hover:underline"
                >
                  Performance Metrics
                </Link>
                <Link
                  href="/analytics/client-satisfaction"
                  className="block text-primary hover:underline"
                >
                  Client Satisfaction
                </Link>
                <Link
                  href="/analytics/staffing"
                  className="block text-primary hover:underline"
                >
                  Staffing Analytics
                </Link>
                <Link
                  href="/analytics/financial"
                  className="block text-primary hover:underline"
                >
                  Financial Reports
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-lg">
                <Bell className="mr-2 h-5 w-5 text-primary" />
                Alert Center
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <Link
                  href="/alerts/low-inventory"
                  className="block text-primary hover:underline"
                >
                  Low Inventory Alerts
                </Link>
                <Link
                  href="/alerts/staffing-shortages"
                  className="block text-primary hover:underline"
                >
                  Staffing Shortages
                </Link>
                <Link
                  href="/alerts/deadline-alerts"
                  className="block text-primary hover:underline"
                >
                  Approaching Deadlines
                </Link>
                <Link
                  href="/alerts/system"
                  className="block text-primary hover:underline"
                >
                  System Notifications
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Analytics Charts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Events by Region
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Regional event distribution charts will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart3 className="mr-2 h-5 w-5 text-primary" />
                Resource Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Staff and kit utilization metrics will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
