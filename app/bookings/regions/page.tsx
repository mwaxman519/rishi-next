&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { MapPin, Users, Calendar, Plus, Search } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import Link from &quot;next/link&quot;;

// Mock regions data
const mockRegions = [
  {
    id: 1,
    name: &quot;San Francisco Bay Area&quot;,
    code: &quot;SF-BAY&quot;,
    manager: &quot;Sarah Johnson&quot;,
    activeBookings: 12,
    totalLocations: 45,
    staffCount: 8,
    status: &quot;active&quot;,
    monthlyRevenue: 45600,
    areas: [&quot;Downtown SF&quot;, &quot;Mission Bay&quot;, &quot;SOMA&quot;, &quot;Castro&quot;, &quot;Marina&quot;]
  },
  {
    id: 2,
    name: &quot;Los Angeles Metro&quot;,
    code: &quot;LA-METRO&quot;,
    manager: &quot;Mike Chen&quot;,
    activeBookings: 18,
    totalLocations: 67,
    staffCount: 12,
    status: &quot;active&quot;,
    monthlyRevenue: 67800,
    areas: [&quot;Hollywood&quot;, &quot;Santa Monica&quot;, &quot;Beverly Hills&quot;, &quot;Venice&quot;, &quot;West Hollywood&quot;]
  },
  {
    id: 3,
    name: &quot;Orange County&quot;,
    code: &quot;OC&quot;,
    manager: &quot;Jessica Smith&quot;,
    activeBookings: 9,
    totalLocations: 23,
    staffCount: 6,
    status: &quot;active&quot;,
    monthlyRevenue: 32400,
    areas: [&quot;Irvine&quot;, &quot;Newport Beach&quot;, &quot;Anaheim&quot;, &quot;Costa Mesa&quot;]
  },
  {
    id: 4,
    name: &quot;San Diego County&quot;,
    code: &quot;SD&quot;,
    manager: &quot;Alex Rodriguez&quot;,
    activeBookings: 14,
    totalLocations: 38,
    staffCount: 9,
    status: &quot;active&quot;,
    monthlyRevenue: 51200,
    areas: [&quot;Downtown SD&quot;, &quot;La Jolla&quot;, &quot;Mission Valley&quot;, &quot;Gaslamp&quot;]
  }
];

export default function BookingRegionsPage() {
  const [searchTerm, setSearchTerm] = useState("&quot;);
  const [statusFilter, setStatusFilter] = useState(&quot;all&quot;);

  const filteredRegions = mockRegions.filter(region => {
    const matchesSearch = region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         region.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === &quot;all&quot; || region.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      {/* Header */}
      <div className=&quot;flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4&quot;>
        <div>
          <h1 className=&quot;text-3xl font-bold tracking-tight flex items-center&quot;>
            <MapPin className=&quot;h-8 w-8 mr-3 text-primary&quot; />
            Booking Regions
          </h1>
          <p className=&quot;text-muted-foreground mt-1&quot;>
            Manage booking regions and territory assignments
          </p>
        </div>
        <div className=&quot;flex gap-2&quot;>
          <Button variant=&quot;outline&quot;>
            <Plus className=&quot;h-4 w-4 mr-2&quot; />
            Add Region
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className=&quot;text-lg&quot;>Region Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className=&quot;flex flex-col sm:flex-row gap-4&quot;>
            <div className=&quot;flex-1&quot;>
              <div className=&quot;relative&quot;>
                <Search className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                <Input
                  placeholder=&quot;Search regions...&quot;
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className=&quot;pl-10&quot;
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className=&quot;w-40&quot;>
                <SelectValue placeholder=&quot;Filter by status&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                <SelectItem value=&quot;active&quot;>Active</SelectItem>
                <SelectItem value=&quot;inactive&quot;>Inactive</SelectItem>
                <SelectItem value=&quot;pending&quot;>Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className=&quot;grid grid-cols-1 md:grid-cols-4 gap-4&quot;>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold&quot;>{mockRegions.length}</div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Total Regions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-green-600&quot;>
              {mockRegions.reduce((sum, region) => sum + region.activeBookings, 0)}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Active Bookings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-blue-600&quot;>
              {mockRegions.reduce((sum, region) => sum + region.staffCount, 0)}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Total Staff</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className=&quot;p-4&quot;>
            <div className=&quot;text-2xl font-bold text-purple-600&quot;>
              ${mockRegions.reduce((sum, region) => sum + region.monthlyRevenue, 0).toLocaleString()}
            </div>
            <div className=&quot;text-sm text-muted-foreground&quot;>Monthly Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Regions Grid */}
      <div className=&quot;grid grid-cols-1 lg:grid-cols-2 gap-6&quot;>
        {filteredRegions.map((region) => (
          <Card key={region.id} className=&quot;hover:shadow-md transition-shadow&quot;>
            <CardHeader>
              <div className=&quot;flex justify-between items-start&quot;>
                <div>
                  <CardTitle className=&quot;flex items-center&quot;>
                    <MapPin className=&quot;h-5 w-5 mr-2 text-primary&quot; />
                    {region.name}
                  </CardTitle>
                  <CardDescription>
                    Code: {region.code} • Manager: {region.manager}
                  </CardDescription>
                </div>
                <Badge variant=&quot;outline&quot; className=&quot;bg-green-50 text-green-700&quot;>
                  {region.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className=&quot;space-y-4&quot;>
              {/* Key Metrics */}
              <div className=&quot;grid grid-cols-3 gap-4 text-center&quot;>
                <div>
                  <div className=&quot;text-2xl font-bold text-blue-600&quot;>{region.activeBookings}</div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>Active Bookings</div>
                </div>
                <div>
                  <div className=&quot;text-2xl font-bold text-green-600&quot;>{region.totalLocations}</div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>Locations</div>
                </div>
                <div>
                  <div className=&quot;text-2xl font-bold text-purple-600&quot;>{region.staffCount}</div>
                  <div className=&quot;text-xs text-muted-foreground&quot;>Staff Members</div>
                </div>
              </div>

              {/* Areas */}
              <div>
                <div className=&quot;text-sm font-medium mb-2&quot;>Coverage Areas:</div>
                <div className=&quot;flex flex-wrap gap-1&quot;>
                  {region.areas.map((area, index) => (
                    <Badge key={index} variant=&quot;secondary&quot; className=&quot;text-xs&quot;>
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Revenue */}
              <div className=&quot;flex justify-between items-center pt-2 border-t&quot;>
                <span className=&quot;text-sm text-muted-foreground&quot;>Monthly Revenue:</span>
                <span className=&quot;text-lg font-semibold text-green-600&quot;>
                  ${region.monthlyRevenue.toLocaleString()}
                </span>
              </div>

              {/* Actions */}
              <div className=&quot;flex gap-2 pt-2&quot;>
                <Link href={`/bookings?region=${region.code}`} className=&quot;flex-1&quot;>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;w-full&quot;>
                    <Calendar className=&quot;h-4 w-4 mr-2&quot; />
                    View Bookings
                  </Button>
                </Link>
                <Link href={`/staff?region=${region.code}`} className=&quot;flex-1&quot;>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;w-full&quot;>
                    <Users className=&quot;h-4 w-4 mr-2" />
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