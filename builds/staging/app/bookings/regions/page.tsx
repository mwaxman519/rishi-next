"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import { MapPin, Users, Calendar, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import Link from "next/link";

// Mock regions data
const mockRegions = [
  {
    id: 1,
    name: "San Francisco Bay Area",
    code: "SF-BAY",
    manager: "Sarah Johnson",
    activeBookings: 12,
    totalLocations: 45,
    staffCount: 8,
    status: "active",
    monthlyRevenue: 45600,
    areas: ["Downtown SF", "Mission Bay", "SOMA", "Castro", "Marina"]
  },
  {
    id: 2,
    name: "Los Angeles Metro",
    code: "LA-METRO",
    manager: "Mike Chen",
    activeBookings: 18,
    totalLocations: 67,
    staffCount: 12,
    status: "active",
    monthlyRevenue: 67800,
    areas: ["Hollywood", "Santa Monica", "Beverly Hills", "Venice", "West Hollywood"]
  },
  {
    id: 3,
    name: "Orange County",
    code: "OC",
    manager: "Jessica Smith",
    activeBookings: 9,
    totalLocations: 23,
    staffCount: 6,
    status: "active",
    monthlyRevenue: 32400,
    areas: ["Irvine", "Newport Beach", "Anaheim", "Costa Mesa"]
  },
  {
    id: 4,
    name: "San Diego County",
    code: "SD",
    manager: "Alex Rodriguez",
    activeBookings: 14,
    totalLocations: 38,
    staffCount: 9,
    status: "active",
    monthlyRevenue: 51200,
    areas: ["Downtown SD", "La Jolla", "Mission Valley", "Gaslamp"]
  }
];

export default function BookingRegionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRegions = mockRegions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         region.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || region.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <MapPin className="h-8 w-8 mr-3 text-primary" />
            Booking Regions
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage booking regions and territory assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Region
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Region Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search regions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{mockRegions.length}</div>
            <div className="text-sm text-muted-foreground">Total Regions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {mockRegions.reduce((sum, region) => sum + region.activeBookings, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Active Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {mockRegions.reduce((sum, region) => sum + region.staffCount, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              ${mockRegions.reduce((sum, region) => sum + region.monthlyRevenue, 0).toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Monthly Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRegions.map((region) => (
          <Card key={region.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary" />
                    {region.name}
                  </CardTitle>
                  <CardDescription>
                    Code: {region.code} • Manager: {region.manager}
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  {region.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{region.activeBookings}</div>
                  <div className="text-xs text-muted-foreground">Active Bookings</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">{region.totalLocations}</div>
                  <div className="text-xs text-muted-foreground">Locations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{region.staffCount}</div>
                  <div className="text-xs text-muted-foreground">Staff Members</div>
                </div>
              </div>

              {/* Areas */}
              <div>
                <div className="text-sm font-medium mb-2">Coverage Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {region.areas.map((area, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Revenue */}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-sm text-muted-foreground">Monthly Revenue:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${region.monthlyRevenue.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link href={`/bookings?region=${region.code}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </Link>
                <Link href={`/staff?region=${region.code}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Staff
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}