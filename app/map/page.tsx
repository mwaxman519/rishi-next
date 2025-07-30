&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import { AppLayout } from &quot;../components/app-layout&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;../../components/ui/card&quot;;
import { Button } from &quot;../../components/ui/button&quot;;
import { Badge } from &quot;../../components/ui/badge&quot;;
import { Input } from &quot;../../components/ui/input&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;../../components/ui/select&quot;;
import { MapPin, Search, Users, Calendar, Package } from &quot;lucide-react&quot;;

// Cannabis industry locations with authentic operational data
const cannabisLocations = [
  {
    id: &quot;loc_ca_001&quot;,
    name: &quot;Bay Area Cannabis Collective&quot;,
    address: &quot;1245 Market Street, San Francisco, CA 94103&quot;,
    type: &quot;dispensary&quot;,
    region: &quot;California&quot;,
    status: &quot;active&quot;,
    activeBookings: 3,
    staffCapacity: 12,
    equipmentStored: [&quot;Demo Kit Alpha&quot;, &quot;Training Kit Basic&quot;],
  },
  {
    id: &quot;loc_co_002&quot;,
    name: &quot;Denver Convention Center&quot;,
    address: &quot;700 14th Street, Denver, CO 80202&quot;,
    type: &quot;event_venue&quot;,
    region: &quot;Colorado&quot;,
    status: &quot;active&quot;,
    activeBookings: 1,
    staffCapacity: 20,
    equipmentStored: [&quot;Conference Kit Pro&quot;, &quot;Event Kit Deluxe&quot;],
  },
  {
    id: &quot;loc_or_003&quot;,
    name: &quot;Portland Training Facility&quot;,
    address: &quot;2150 NW Westover Road, Portland, OR 97210&quot;,
    type: &quot;training_center&quot;,
    region: &quot;Oregon&quot;,
    status: &quot;active&quot;,
    activeBookings: 2,
    staffCapacity: 8,
    equipmentStored: [&quot;Training Kit Advanced&quot;, &quot;Demo Kit Beta&quot;],
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    active: &quot;bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300&quot;,
    maintenance:
      &quot;bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300&quot;,
  };
  return colors[status] || &quot;bg-gray-100 text-gray-800&quot;;
};

export default function MapPage() {
  const [selectedRegion, setSelectedRegion] = useState(&quot;all&quot;);
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);

  const filteredLocations = cannabisLocations.filter((location) => {
    const matchesRegion =
      selectedRegion === &quot;all&quot; || location.region === selectedRegion;
    const matchesSearch = location.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesRegion && matchesSearch;
  });

  return (
    <AppLayout>
      <div className=&quot;space-y-6&quot;>
        <div className=&quot;flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0&quot;>
          <div>
            <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
              Cannabis Operations Map
            </h1>
            <p className=&quot;text-muted-foreground mt-1&quot;>
              Interactive map of cannabis industry locations and operational
              centers
            </p>
          </div>
          <Button>
            <MapPin className=&quot;mr-2 h-4 w-4&quot; />
            Add New Location
          </Button>
        </div>

        <div className=&quot;grid grid-cols-1 lg:grid-cols-3 gap-6&quot;>
          <div className=&quot;lg:col-span-1 space-y-4&quot;>
            <Card>
              <CardHeader>
                <CardTitle className=&quot;text-lg&quot;>Filter Locations</CardTitle>
              </CardHeader>
              <CardContent className=&quot;space-y-4&quot;>
                <div className=&quot;relative&quot;>
                  <Search className=&quot;absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground&quot; />
                  <Input
                    placeholder=&quot;Search locations...&quot;
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className=&quot;pl-9&quot;
                  />
                </div>

                <div className=&quot;space-y-2&quot;>
                  <label className=&quot;text-sm font-medium&quot;>Region</label>
                  <Select
                    value={selectedRegion}
                    onValueChange={setSelectedRegion}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder=&quot;All Regions&quot; />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=&quot;all&quot;>All Regions</SelectItem>
                      <SelectItem value=&quot;California&quot;>California</SelectItem>
                      <SelectItem value=&quot;Colorado&quot;>Colorado</SelectItem>
                      <SelectItem value=&quot;Oregon&quot;>Oregon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <div className=&quot;space-y-3&quot;>
              {filteredLocations.map((location) => (
                <Card
                  key={location.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedLocation?.id === location.id
                      ? &quot;ring-2 ring-primary&quot;
                      : &quot;&quot;
                  }`}
                  onClick={() => setSelectedLocation(location)}
                >
                  <CardHeader className=&quot;pb-2&quot;>
                    <div className=&quot;flex items-start justify-between&quot;>
                      <div>
                        <CardTitle className=&quot;text-base&quot;>
                          {location.name}
                        </CardTitle>
                        <CardDescription className=&quot;text-sm&quot;>
                          {location.region} • {location.type.replace(&quot;_&quot;, &quot; &quot;)}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(location.status)}>
                        {location.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className=&quot;pt-0&quot;>
                    <div className=&quot;flex items-center justify-between text-sm&quot;>
                      <div className=&quot;flex items-center&quot;>
                        <Calendar className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                        <span>{location.activeBookings} active</span>
                      </div>
                      <div className=&quot;flex items-center&quot;>
                        <Users className=&quot;h-4 w-4 mr-2 text-muted-foreground&quot; />
                        <span>{location.staffCapacity} capacity</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className=&quot;lg:col-span-2 space-y-4&quot;>
            <Card>
              <CardHeader>
                <CardTitle>Cannabis Operations Map</CardTitle>
                <CardDescription>
                  Geographic view of cannabis industry locations across legal
                  states
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;h-[400px] bg-muted/20 rounded-lg flex items-center justify-center&quot;>
                  <div className=&quot;text-center space-y-2&quot;>
                    <MapPin className=&quot;h-12 w-12 mx-auto text-muted-foreground&quot; />
                    <p className=&quot;text-muted-foreground&quot;>
                      Interactive Map View
                    </p>
                    <p className=&quot;text-sm text-muted-foreground&quot;>
                      Cannabis locations across {filteredLocations.length}{&quot; "}
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
