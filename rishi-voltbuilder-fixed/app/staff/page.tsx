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
  User,
  Users,
  Clock,
  CalendarCheck,
  FileText,
  Award,
  Plus,
  Calendar,
} from "lucide-react";
import Link from "next/link";

export default function StaffPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
        <Link
          href="/staff/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Link>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="timesheets">Timesheets</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Manage all Rishi staff members, including internal employees and
            brand agents.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Staff Member Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Sarah Johnson
                </CardTitle>
                <CardDescription>Brand Ambassador</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">San Francisco, CA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-green-600">
                      Available
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Events:</span>
                    <span className="font-medium">12 completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Certifications:
                    </span>
                    <span className="font-medium">3 active</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/staff/1"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Staff Member Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" />
                  Michael Chen
                </CardTitle>
                <CardDescription>Technical Specialist</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">Chicago, IL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-amber-600">Assigned</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Events:</span>
                    <span className="font-medium">8 completed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Certifications:
                    </span>
                    <span className="font-medium">2 active</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/staff/2"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Internal Staff Member Card */}
            <Card className="transition-all hover:shadow-md border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <User className="mr-2 h-5 w-5 text-blue-600" />
                  Alex Rivera
                </CardTitle>
                <CardDescription>Internal Operations Manager</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">Remote</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium text-blue-600">Internal</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">Operations</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Certifications:
                    </span>
                    <span className="font-medium">5 active</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/staff/3"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Manage staff certifications for brand knowledge and technical
            skills.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Certification Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  Brand Knowledge Certification
                </CardTitle>
                <CardDescription>
                  Training for specific brand product knowledge
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-4">
                  <div>
                    <p className="font-medium mb-2">Active Certifications</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div>
                          <span className="font-medium">Sarah Johnson</span>
                          <p className="text-xs text-muted-foreground">
                            Acme Products
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Valid until May 2026
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div>
                          <span className="font-medium">Michael Chen</span>
                          <p className="text-xs text-muted-foreground">
                            Globex Products
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Valid until Nov 2025
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/staff/certifications/brand"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Manage Certifications →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kit Use Certification Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5 text-primary" />
                  Kit Use Certification
                </CardTitle>
                <CardDescription>
                  Training for equipment handling and setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-4">
                  <div>
                    <p className="font-medium mb-2">Active Certifications</p>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div>
                          <span className="font-medium">Michael Chen</span>
                          <p className="text-xs text-muted-foreground">
                            Trade Show Kit
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Valid until Dec 2025
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-muted rounded-md">
                        <div>
                          <span className="font-medium">Alex Rivera</span>
                          <p className="text-xs text-muted-foreground">
                            All Kit Types
                          </p>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                          Valid until Mar 2026
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link
                      href="/staff/certifications/kit"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Manage Certifications →
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <p className="text-muted-foreground">
            View and manage staff availability for event scheduling.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">
                Staff Availability Calendar
              </h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will display staff availability for scheduling and
                assignment.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-6">
          <p className="text-muted-foreground">
            Track staff hours, clock-in/clock-out, and payroll information.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Timesheet Management</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will display timesheet data, hours worked, and
                payroll information.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <p className="text-muted-foreground">
            Generate reports on staff performance, certifications, and
            attendance.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Staff Reports</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will allow generation of various staff-related
                reports.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
