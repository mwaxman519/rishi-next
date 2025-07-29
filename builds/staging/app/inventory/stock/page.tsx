"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


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
  Users,
  AlertTriangle,
  CheckCircle,
  Box,
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
  ArrowUpDown,
  Truck,
  QrCode,
  BarChart3,
  Wrench,
  ChevronRight,
  ScanLine,
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

// Scalable stock data for hundreds of items across states/territories
const stockData = {
  stats: {
    totalItems: 4286,
    assignedItems: 3842,
    availableItems: 380,
    itemsForRepair: 64,
    totalAgents: 423,
    agentsWithoutItems: 18,
    criticalLowStock: 12,
    territories: 87,
  },
  territories: [
    { code: "CA-01", name: "Northern California", agents: 45, items: 523 },
    { code: "CA-02", name: "Bay Area", agents: 62, items: 742 },
    { code: "CA-03", name: "Southern California", agents: 58, items: 689 },
    { code: "CO-01", name: "Denver Metro", agents: 38, items: 412 },
    { code: "WA-01", name: "Seattle Region", agents: 41, items: 487 },
  ],
  itemTypes: [
    { type: "Folding Table", total: 892, assigned: 821, available: 71 },
    { type: "Storage Tote", total: 1243, assigned: 1189, available: 54 },
    { type: "Tablecloth", total: 756, assigned: 692, available: 64 },
    { type: "Display Stand", total: 434, assigned: 398, available: 36 },
    { type: "Banner Stand", total: 523, assigned: 487, available: 36 },
  ],
  stockItems: [
    {
      id: "SI-001",
      serialNumber: "TBL-CA01-2024-001",
      itemType: "Folding Table",
      category: "Furniture",
      assignedTo: "Sarah Johnson",
      agentId: "BA-CA01-045",
      territory: "CA-01",
      brand: "Elevated Essence",
      status: "assigned",
      condition: "good",
      lastScan: "2025-01-17T14:30:00Z",
      location: { lat: 37.7749, lng: -122.4194 },
    },
    {
      id: "SI-002",
      serialNumber: "TOTE-CA02-2024-015",
      itemType: "Storage Tote",
      category: "Storage",
      assignedTo: "Mike Chen",
      agentId: "BA-CA02-022",
      territory: "CA-02",
      brand: "Green Valley Collective",
      status: "assigned",
      condition: "excellent",
      lastScan: "2025-01-17T09:15:00Z",
      location: { lat: 37.3382, lng: -121.8863 },
    },
    // More items would be loaded dynamically
  ],
};

// Mobile-optimized filter sheet
const StockFilterSheet = ({ 
  selectedTerritory, 
  setSelectedTerritory, 
  selectedItemType, 
  setSelectedItemType,
  selectedStatus,
  setSelectedStatus,
  selectedCondition,
  setSelectedCondition,
  onClose
}) => {
  return (
    <div className="space-y-6 p-1">
      <div>
        <h3 className="text-sm font-semibold mb-3">Territory</h3>
        <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Territories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Territories ({stockData.stats.territories})</SelectItem>
            {stockData.territories.map((territory) => (
              <SelectItem key={territory.code} value={territory.code}>
                {territory.name} ({territory.items} items)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Item Type</h3>
        <Select value={selectedItemType} onValueChange={setSelectedItemType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Item Types</SelectItem>
            {stockData.itemTypes.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                {type.type} ({type.total})
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
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="missing">Missing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">Condition</h3>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Conditions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="repair_needed">Needs Repair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => {
          setSelectedTerritory("all");
          setSelectedItemType("all");
          setSelectedStatus("all");
          setSelectedCondition("all");
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

// Mobile-optimized stock item card
const StockItemCard = ({ item }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-green-50 text-green-700 border-green-200";
      case "available":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "in_transit":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "missing":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "excellent":
        return <CheckCircle className="w-3 h-3 text-green-600" />;
      case "good":
        return <CheckCircle className="w-3 h-3 text-purple-600" />;
      case "fair":
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />;
      case "repair_needed":
        return <Wrench className="w-3 h-3 text-red-600" />;
      default:
        return null;
    }
  };

  const timeSinceLastScan = () => {
    const lastScan = new Date(item.lastScan);
    const now = new Date();
    const hours = Math.floor((now - lastScan) / (1000 * 60 * 60));
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
                  {item.itemType}
                </h3>
                {getConditionIcon(item.condition)}
              </div>
              <p className="text-xs text-gray-600 font-mono">
                {item.serialNumber}
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
                  Scan QR
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserCheck className="w-4 h-4 mr-2" />
                  Reassign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MapPin className="w-4 h-4 mr-2" />
                  Track
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Assignment info */}
          <div className="space-y-1">
            {item.assignedTo ? (
              <div className="flex items-center gap-2 text-xs">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="font-medium">{item.assignedTo}</span>
                <span className="text-gray-500">({item.agentId})</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Users className="w-3 h-3" />
                <span>Unassigned</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs">
              <MapPin className="w-3 h-3 text-gray-500" />
              <span>{item.territory} • {item.brand}</span>
            </div>
          </div>

          {/* Status and scan info */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Badge className={`${getStatusColor(item.status)} border text-xs`}>
              {item.status.replace("_", " ")}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <ScanLine className="w-3 h-3" />
              <span>{timeSinceLastScan()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Territory summary card
const TerritorySummaryCard = ({ territory }) => {
  const utilizationRate = Math.round((territory.items / (territory.agents * 15)) * 100);
  
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sm">{territory.name}</h3>
              <p className="text-xs text-gray-600">{territory.code}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600">Agents</p>
              <p className="text-lg font-bold">{territory.agents}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600">Items</p>
              <p className="text-lg font-bold">{territory.items}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Utilization</span>
              <span className="font-medium">{utilizationRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  utilizationRate > 80 ? "bg-green-500" : 
                  utilizationRate > 50 ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StockManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("items");
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [selectedItemType, setSelectedItemType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();

  const activeFilters = [
    selectedTerritory !== "all" && selectedTerritory,
    selectedItemType !== "all" && selectedItemType,
    selectedStatus !== "all" && selectedStatus,
    selectedCondition !== "all" && selectedCondition,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-bold">Stock Management</h1>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="h-8">
                <ScanLine className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
              <Button size="sm" className="h-8">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Item</span>
              </Button>
            </div>
          </div>

          {/* Search and filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search serial, agent, territory..."
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
                    Filter stock across territories
                  </SheetDescription>
                </SheetHeader>
                <StockFilterSheet
                  selectedTerritory={selectedTerritory}
                  setSelectedTerritory={setSelectedTerritory}
                  selectedItemType={selectedItemType}
                  setSelectedItemType={setSelectedItemType}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedCondition={selectedCondition}
                  setSelectedCondition={setSelectedCondition}
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
              <p className="text-xs text-purple-600">Total Items</p>
              <p className="text-lg font-bold text-purple-900">{stockData.stats.totalItems.toLocaleString()}</p>
            </div>
            <div className="bg-green-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-green-600">Assigned</p>
              <p className="text-lg font-bold text-green-900">{stockData.stats.assignedItems.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-yellow-600">Available</p>
              <p className="text-lg font-bold text-yellow-900">{stockData.stats.availableItems}</p>
            </div>
            <div className="bg-red-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-red-600">Critical</p>
              <p className="text-lg font-bold text-red-900">{stockData.stats.criticalLowStock}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-t h-10 p-0">
            <TabsTrigger value="items" className="flex-1 rounded-none text-xs sm:text-sm">
              Items
            </TabsTrigger>
            <TabsTrigger value="territories" className="flex-1 rounded-none text-xs sm:text-sm">
              Territories
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex-1 rounded-none text-xs sm:text-sm">
              Agents
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1 rounded-none text-xs sm:text-sm">
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="items" className="mt-0 space-y-3">
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Button variant="outline" className="h-auto py-3">
                <Truck className="w-4 h-4 mb-1" />
                <span className="block text-xs">Bulk Assign</span>
              </Button>
              <Button variant="outline" className="h-auto py-3">
                <BarChart3 className="w-4 h-4 mb-1" />
                <span className="block text-xs">Export Report</span>
              </Button>
            </div>

            {/* Items grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {stockData.stockItems.map((item) => (
                <StockItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Load more */}
            <div className="text-center pt-4">
              <Button variant="outline" className="w-full sm:w-auto">
                Load More Items
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="territories" className="mt-0 space-y-3">
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {stockData.territories.map((territory) => (
                <TerritorySummaryCard key={territory.code} territory={territory} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="agents" className="mt-0">
            <Card>
              <CardContent className="p-4">
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Agent Management</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Track items assigned to {stockData.stats.totalAgents} agents
                  </p>
                  <Button>View Agent Directory</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 space-y-4">
            {/* Item type distribution */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Item Distribution</CardTitle>
                <CardDescription className="text-xs">
                  Stock levels by item type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockData.itemTypes.map((type) => {
                    const percentage = Math.round((type.assigned / type.total) * 100);
                    return (
                      <div key={type.type} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span>{type.type}</span>
                          <span className="text-xs text-gray-600">
                            {type.assigned}/{type.total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 bg-purple-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}