"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  Plus,
  Filter,
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Archive,
  ArrowRight,
  QrCode,
  Truck,
  BarChart3,
  Building2,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

// Scalable kit instances data for hundreds of brands across territories
const kitInstancesData = {
  stats: {
    totalInstances: 2847,
    activeDeployments: 1892,
    inPreparation: 342,
    inTransit: 456,
    returning: 157,
    totalValue: 1245800,
    criticalIssues: 23,
    territories: 87,
  },
  territories: [
    { code: "CA-01", name: "Northern California", instances: 342 },
    { code: "CA-02", name: "Bay Area", instances: 456 },
    { code: "CA-03", name: "Southern California", instances: 523 },
    { code: "CO-01", name: "Denver Metro", instances: 287 },
    { code: "WA-01", name: "Seattle Region", instances: 312 },
  ],
  brands: [
    { id: "brand-001", name: "Elevated Essence", instances: 342 },
    { id: "brand-002", name: "Green Valley Collective", instances: 289 },
    { id: "brand-003", name: "Pacific Coast Cannabis", instances: 456 },
    { id: "brand-004", name: "Mountain High Brands", instances: 198 },
  ],
  instances: [
    {
      id: "KI-2847",
      templateName: "Product Demo Standard",
      templateId: "KT-001",
      bookingRef: "BK-2025-3421",
      brand: "Elevated Essence",
      brandId: "brand-001",
      status: "deployed",
      location: "Green Dragon Dispensary",
      territory: "CA-01",
      agent: "Sarah Johnson",
      agentId: "BA-CA01-045",
      startDate: "2025-01-17",
      endDate: "2025-01-18",
      items: 12,
      totalValue: 485,
      completeness: 100,
      lastUpdate: "2025-01-17T14:30:00Z",
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    {
      id: "KI-2846",
      templateName: "Trade Show Premium",
      templateId: "KT-002",
      bookingRef: "BK-2025-3420",
      brand: "Green Valley Collective",
      brandId: "brand-002",
      status: "in_preparation",
      location: "San Jose Convention Center",
      territory: "CA-02",
      agent: "Mike Chen",
      agentId: "BA-CA02-022",
      startDate: "2025-01-19",
      endDate: "2025-01-21",
      items: 25,
      totalValue: 1251,
      completeness: 75,
      lastUpdate: "2025-01-17T12:00:00Z",
      coordinates: { lat: 37.3382, lng: -121.8863 },
    },
    // More instances would be loaded dynamically
  ],
};

// Mobile-optimized filter sheet
const InstanceFilterSheet = ({ 
  selectedBrand, 
  setSelectedBrand, 
  selectedTerritory, 
  setSelectedTerritory,
  selectedStatus,
  setSelectedStatus,
  selectedDateRange,
  setSelectedDateRange,
  onClose
}) => {
  return (
    <div className="space-y-6 p-1">
      <div>
        <h3 className="text-sm font-semibold mb-3">Brand</h3>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {kitInstancesData.brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name} ({brand.instances})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Territory</h3>
        <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Territories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Territories ({kitInstancesData.stats.territories})</SelectItem>
            {kitInstancesData.territories.map((territory) => (
              <SelectItem key={territory.code} value={territory.code}>
                {territory.name} ({territory.instances})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Status</h3>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="in_preparation">In Preparation</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="returning">Returning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Date Range</h3>
        <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => {
          setSelectedBrand("all");
          setSelectedTerritory("all");
          setSelectedStatus("all");
          setSelectedDateRange("all");
        }}>
          Reset
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
};

// Mobile-optimized kit instance card
const KitInstanceCard = ({ instance }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "deployed":
        return "bg-green-50 text-green-700 border-green-200";
      case "in_preparation":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "in_transit":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "returning":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "deployed":
        return <CheckCircle className="w-3 h-3" />;
      case "in_preparation":
        return <Clock className="w-3 h-3" />;
      case "in_transit":
        return <Truck className="w-3 h-3" />;
      case "returning":
        return <RefreshCw className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getCompletenessColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-yellow-500";
    return "bg-red-500";
  };

  const timeSinceUpdate = () => {
    const lastUpdate = new Date(instance.lastUpdate);
    const now = new Date();
    const hours = Math.floor((now - lastUpdate) / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">
                  {instance.templateName}
                </h3>
                <Badge className={`${getStatusColor(instance.status)} border text-xs flex items-center gap-1`}>
                  {getStatusIcon(instance.status)}
                  {instance.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {instance.id} • {instance.bookingRef}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <QrCode className="w-4 h-4 mr-2" />
                  View QR
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MapPin className="w-4 h-4 mr-2" />
                  Track
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Activity className="w-4 h-4 mr-2" />
                  Activity Log
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Info grid */}
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <Building2 className="w-3 h-3 text-gray-500" />
              <span className="truncate">{instance.brand}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span className="truncate">{instance.location}</span>
              <span className="text-gray-500">• {instance.territory}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-3 h-3 text-gray-500" />
              <span>{instance.agent}</span>
            </div>
          </div>

          {/* Completeness */}
          {instance.status === "in_preparation" && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Preparation</span>
                <span className="font-medium">{instance.completeness}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full transition-all ${getCompletenessColor(instance.completeness)}`}
                  style={{ width: `${instance.completeness}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-3 text-xs">
              <div>
                <span className="text-gray-600">Items: </span>
                <span className="font-medium">{instance.items}</span>
              </div>
              <div>
                <span className="text-gray-600">Value: </span>
                <span className="font-medium">${instance.totalValue}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {timeSinceUpdate()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mobile list view component
const InstanceListView = ({ instances }) => {
  return (
    <div className="space-y-2">
      {instances.map((instance) => (
        <KitInstanceCard key={instance.id} instance={instance} />
      ))}
    </div>
  );
};

// Map view placeholder
const MapView = () => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 className="font-semibold mb-2">Map View</h3>
        <p className="text-sm text-gray-600 mb-4">
          Track {kitInstancesData.stats.activeDeployments.toLocaleString()} active deployments across {kitInstancesData.stats.territories} territories
        </p>
        <Button>Open Full Map</Button>
      </CardContent>
    </Card>
  );
};

export default function KitInstancesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();

  const activeFilters = [
    selectedBrand !== "all" && selectedBrand,
    selectedTerritory !== "all" && selectedTerritory,
    selectedStatus !== "all" && selectedStatus,
    selectedDateRange !== "all" && selectedDateRange,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-bold">Kit Instances</h1>
            <Button size="sm" className="h-8">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          </div>

          {/* Search and filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search kits, brands, locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 h-9"
              />
            </div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 relative">
                  <Filter className="w-4 h-4" />
                  {activeFilters > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-600">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                  <SheetDescription>
                    Filter instances across territories
                  </SheetDescription>
                </SheetHeader>
                <InstanceFilterSheet
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  selectedTerritory={selectedTerritory}
                  setSelectedTerritory={setSelectedTerritory}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedDateRange={selectedDateRange}
                  setSelectedDateRange={setSelectedDateRange}
                  onClose={() => setFilterOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Stats scroll */}
        <div className="px-4 pb-3 overflow-x-auto">
          <div className="flex gap-3 min-w-max">
            <div className="bg-purple-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-purple-600">Total Active</p>
              <p className="text-lg font-bold text-purple-900">{kitInstancesData.stats.totalInstances.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-green-600">Deployed</p>
              <p className="text-lg font-bold text-green-900">{kitInstancesData.stats.activeDeployments.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-yellow-600">In Transit</p>
              <p className="text-lg font-bold text-yellow-900">{kitInstancesData.stats.inTransit}</p>
            </div>
            <div className="bg-red-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-red-600">Issues</p>
              <p className="text-lg font-bold text-red-900">{kitInstancesData.stats.criticalIssues}</p>
            </div>
          </div>
        </div>

        {/* Tabs with view toggle */}
        <div className="flex items-center justify-between px-4 pb-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="h-8">
              <TabsTrigger value="active" className="text-xs sm:text-sm">Active</TabsTrigger>
              <TabsTrigger value="upcoming" className="text-xs sm:text-sm">Upcoming</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "list" | "map")}>
            <TabsList className="h-8">
              <TabsTrigger value="list" className="px-2">
                <List className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="map" className="px-2">
                <MapPin className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === "list" ? (
          <InstanceListView instances={kitInstancesData.instances} />
        ) : (
          <MapView />
        )}

        {/* Load more */}
        <div className="text-center pt-4">
          <Button variant="outline" className="w-full sm:w-auto">
            Load More Instances
          </Button>
        </div>
      </div>
    </div>
  );
}