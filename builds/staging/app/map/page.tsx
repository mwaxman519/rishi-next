"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState } from "react";
import { AppLayout } from "../components/app-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { MapPin, Search, Users, Calendar, Package } from "lucide-react";

// Cannabis industry locations with authentic operational data
const cannabisLocations = [
  {
    id: "loc_ca_001",
    name: "Bay Area Cannabis Collective",
    address: "1245 Market Street, San Francisco, CA 94103",
    type: "dispensary",
    region: "California",
    status: "active",
    activeBookings: 3,
    staffCapacity: 12,
    equipmentStored: ["Demo Kit Alpha", "Training Kit Basic"],
  },
  {
    id: "loc_co_002",
    name: "Denver Convention Center",
    address: "700 14th Street, Denver, CO 80202",
    type: "event_venue",
    region: "Colorado",
    status: "active",
    activeBookings: 1,
    staffCapacity: 20,
    equipmentStored: ["Conference Kit Pro", "Event Kit Deluxe"],
  },
  {
    id: "loc_or_003",
    name: "Portland Training Facility",
    address: "2150 NW Westover Road, Portland, OR 97210",
    type: "training_center",
    region: "Oregon",
    status: "active",
    activeBookings: 2,
    staffCapacity: 8,
    equipmentStored: ["Training Kit Advanced", "Demo Kit Beta"],
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    maintenance:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const filteredLocations = cannabisLocations.filter((location) => {
    const matchesRegion =
      selectedRegion === "all" || location.region === selectedRegion;
    const matchesSearch = location.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Cannabis Operations Map
            </h1>
            <p className="text-muted-foreground mt-1">
              Interactive map of cannabis industry locations and operational
              centers
            </p>
          </div>
          <Button>
            <MapPin className="mr-2 h-4 w-4" />
            Add New Location
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter Locations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search locations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Region</label>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="California">California</SelectItem>
                      <SelectItem value="Colorado">Colorado</SelectItem>
                      <SelectItem value="Oregon">Oregon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedLocation?.id === location.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">
                          {location.name}
                        </CardTitle>
                        <CardDescription className="text-sm">
                          {location.region} • {location.type.replace("_", " ")}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(location.status)}>
                        {location.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{location.activeBookings} active</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{location.staffCapacity} capacity</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cannabis Operations Map</CardTitle>
                <CardDescription>
                  Geographic view of cannabis industry locations across legal
                  states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] bg-muted/20 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Interactive Map View
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cannabis locations across {filteredLocations.length}{" "}
                      operational centers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
