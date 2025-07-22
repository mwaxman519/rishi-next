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
  Building,
  Users,
  MapPin,
  CreditCard,
  Layers,
  Store,
} from "lucide-react";
import Link from "next/link";

export default function ClientsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
      </div>

      <Tabs defaultValue="directory" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="brands">Brands</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="directory" className="space-y-6">
          <p className="text-muted-foreground">
            View and manage all client organizations in the system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Client Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5 text-primary" />
                  Acme Corporation
                </CardTitle>
                <CardDescription>
                  Tier 2 - Full-service event staffing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brands:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Locations:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Users:</span>
                    <span className="font-medium">8</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regions:</span>
                    <span className="font-medium">5 states</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/clients/profile?id=1"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Manage Client →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Placeholder for more clients */}
            <Card className="bg-muted/50 border-dashed transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center">
                  <Building className="mr-2 h-5 w-5 text-muted-foreground" />
                  Globex Industries
                </CardTitle>
                <CardDescription>Tier 3 - White-label service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Brands:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Locations:</span>
                    <span className="font-medium">5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Users:</span>
                    <span className="font-medium">4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Regions:</span>
                    <span className="font-medium">3 states</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/clients/profile?id=2"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Manage Client →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add new client card */}
            <Card className="border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary">
                  <Building className="mr-2 h-5 w-5" />
                  Add New Client
                </CardTitle>
                <CardDescription>
                  Create a new client organization
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Link
                  href="/clients/new"
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-2xl font-semibold">+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Select a client from the directory to view and edit their profile.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="brands">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Select a client to manage their brands.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="locations">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Select a client to manage their locations and venues.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Select a client to manage their user accounts.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="billing">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">
              Select a client to view and manage billing information.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
