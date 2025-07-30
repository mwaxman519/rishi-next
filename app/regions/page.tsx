"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Map, MapPin, Globe, BarChart, Search } from "lucide-react";
import Link from "next/link";

export default function RegionsPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Region Management</h1>
      </div>

      <Tabs defaultValue="map-view" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="map-view">Map View</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="custom-regions">Custom Regions</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="map-view" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Interactive map of all service regions.
          </p>

          <Card>
            <CardContent className="p-6">
              <div className="h-[500px] flex items-center justify-center border rounded-md bg-slate-50">
                <div className="text-center">
                  <Map className="h-12 w-12 mx-auto text-primary mb-4" />
                  <h3 className="text-lg font-medium">Interactive Map</h3>
                  <p className="text-muted-foreground max-w-md mt-2">
                    The interactive map will display all service regions with
                    filtering options.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            State-level region configuration.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* State Region Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    California
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <CardDescription>State-wide coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clients:</span>
                    <span className="font-medium">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">25</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Events (YTD):</span>
                    <span className="font-medium">48</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/regions/states/ca"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Manage Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another State Region Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5 text-primary" />
                    Texas
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <CardDescription>State-wide coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Clients:</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Events (YTD):</span>
                    <span className="font-medium">32</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/regions/states/tx"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Manage Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add State Region Card */}
            <Card className="border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary">
                  <MapPin className="mr-2 h-5 w-5" />
                  Add State Region
                </CardTitle>
                <CardDescription>Configure a new state region</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Link
                  href="/regions/states/new"
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-2xl font-semibold">+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom-regions" className="space-y-6">
          <p className="text-muted-foreground mb-4">
            Client-specific custom service regions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Custom Region Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-primary" />
                    Bay Area Metro
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <CardDescription>Acme Corporation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage:</span>
                    <span className="font-medium">15 ZIP codes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Kits Available:
                    </span>
                    <span className="font-medium">8</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/regions/custom/1"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Another Custom Region Card */}
            <Card className="transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5 text-primary" />
                    Greater Chicago
                  </CardTitle>
                  <span className="text-xs font-medium py-1 px-3 rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                <CardDescription>Globex Industries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coverage:</span>
                    <span className="font-medium">22 ZIP codes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">9</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Kits Available:
                    </span>
                    <span className="font-medium">6</span>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/regions/custom/2"
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Edit Region →
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Add Custom Region Card */}
            <Card className="border-dashed border-primary/20 bg-muted/30 transition-all hover:shadow-md hover:border-primary/40">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-primary">
                  <Globe className="mr-2 h-5 w-5" />
                  Add Custom Region
                </CardTitle>
                <CardDescription>Create a new custom region</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Link
                  href="/regions/custom/new"
                  className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                >
                  <span className="text-2xl font-semibold">+</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coverage" className="space-y-6">
          <p className="text-muted-foreground">
            Analysis of coverage, gaps, and overlaps in service regions.
          </p>

          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart className="h-12 w-12 mx-auto text-primary mb-4" />
              <h3 className="text-lg font-medium">Coverage Analysis</h3>
              <p className="text-muted-foreground max-w-md mt-2">
                This section will provide analytics on regional coverage,
                identifying gaps and overlaps.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
