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
  Users,
  Package,
  LayoutTemplate,
  Calendar,
  User,
  PackageCheck,
} from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Resource Management
        </h1>
      </div>

      <Tabs defaultValue="staff" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="kits">Kits</TabsTrigger>
          <TabsTrigger value="kit-templates">Kit Templates</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Manage brand agents and staff assignments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Staff Card */}
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
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/resources/staff/1"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Staff Card */}
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
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/resources/staff/2"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Profile →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add staff card */}
            <Card className="border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary">
                  <User className="mr-2 h-5 w-5" />
                  Add New Staff
                </CardTitle>
                <CardDescription>Register a new brand agent</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Link
                  href="/resources/staff/new"
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-2xl font-semibold">+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kits" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Manage equipment kits and inventory.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Kit Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" />
                    Demo Kit A-123
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
                <CardDescription>
                  Standard product demonstration kit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">San Francisco Warehouse</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components:</span>
                    <span className="font-medium">15 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Last Inspected:
                    </span>
                    <span className="font-medium">April 15, 2025</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/resources/kits/1"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Kit Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5 text-primary" />
                    Trade Show Kit B-456
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-amber-100 text-amber-800">
                    In Transit
                  </span>
                </div>
                <CardDescription>
                  Full booth setup with displays
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">En route to Chicago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Components:</span>
                    <span className="font-medium">32 items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Last Inspected:
                    </span>
                    <span className="font-medium">April 10, 2025</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/resources/kits/2"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add kit card */}
            <Card className="border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary">
                  <Package className="mr-2 h-5 w-5" />
                  Add New Kit
                </CardTitle>
                <CardDescription>Create a new equipment kit</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Link
                  href="/resources/kits/new"
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-2xl font-semibold">+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="kit-templates" className="space-y-6">
          <p className="text-muted-foreground">
            Standard kit configurations and templates.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <LayoutTemplate className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Kit Templates</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will contain standardized kit templates for quick
                creation.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-6">
          <p className="text-muted-foreground">
            Staff availability and scheduling.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Staff Availability</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will show staff availability calendars and
                scheduling tools.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
