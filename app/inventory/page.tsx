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
  Grid3x3,
  List,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Archive,
  Box,
  MapPin,
  Building2,
  Users,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  QrCode,
  BarChart3,
  X,
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

// Scalable inventory data structure for hundreds of kits across states/territories
const inventoryData = {
  stats: {
    totalKitTemplates: 186,
    activeInstances: 2847,
    totalBrands: 142,
    totalStates: 23,
    totalTerritories: 87,
    lowStockAlerts: 34,
    criticalAlerts: 8,
  },
  brands: [
    { id: "brand-001", name: "Elevated Essence", count: 245 },
    { id: "brand-002", name: "Green Valley Collective", count: 189 },
    { id: "brand-003", name: "Pacific Coast Cannabis", count: 342 },
    { id: "brand-004", name: "Mountain High Brands", count: 128 },
    { id: "brand-005", name: "Desert Bloom Co", count: 276 },
  ],
  states: [
    { code: "CA", name: "California", territories: 28, kits: 892 },
    { code: "CO", name: "Colorado", territories: 12, kits: 345 },
    { code: "WA", name: "Washington", territories: 15, kits: 423 },
    { code: "OR", name: "Oregon", territories: 10, kits: 287 },
    { code: "NV", name: "Nevada", territories: 8, kits: 198 },
  ],
  kitTemplates: [
    {
      id: "KT-001",
      name: "Product Demo Standard",
      brand: "Elevated Essence",
      brandId: "brand-001",
      activeInstances: 145,
      totalInstances: 245,
      territories: ["CA-01", "CA-02", "CA-05", "NV-01"],
      componentCount: 12,
      avgRating: 4.8,
      status: "active",
      lastModified: "2025-01-15",
    },
    {
      id: "KT-002",
      name: "Trade Show Premium",
      brand: "Green Valley Collective",
      brandId: "brand-002",
      activeInstances: 89,
      totalInstances: 125,
      territories: ["CO-01", "CO-03", "WA-02"],
      componentCount: 25,
      avgRating: 4.6,
      status: "active",
      lastModified: "2025-01-12",
    },
    {
      id: "KT-003",
      name: "Street Team Activation",
      brand: "Pacific Coast Cannabis",
      brandId: "brand-003",
      activeInstances: 234,
      totalInstances: 342,
      territories: ["CA-03", "CA-08", "OR-01", "OR-02", "WA-01"],
      componentCount: 8,
      avgRating: 4.4,
      status: "active",
      lastModified: "2025-01-14",
    },
  ],
};

// Mobile-optimized filter sheet
const FilterSheet = ({ 
  selectedBrand, 
  setSelectedBrand, 
  selectedState, 
  setSelectedState,
  selectedStatus,
  setSelectedStatus,
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
            {inventoryData.brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name} ({brand.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">State/Region</h3>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {inventoryData.states.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name} ({state.kits} kits)
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button variant="outline" className="flex-1" onClick={() => {
          setSelectedBrand("all");
          setSelectedState("all");
          setSelectedStatus("all");
        }}>
          Reset Filters
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
};

// Mobile-optimized kit template card
const KitTemplateCard = ({ template, isMobile }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "low_stock":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "critical":
        return "bg-red-50 text-red-700 border-red-200";
      case "inactive":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const utilizationRate = Math.round((template.activeInstances / template.totalInstances) * 100);

  return (
    <Card className="hover:shadow-md transition-all cursor-pointer">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base truncate">
                {template.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                {template.brand} • {template.id}
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
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <QrCode className="w-4 h-4 mr-2" />
                  Generate QR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div>
              <span className="text-gray-600">Active/Total</span>
              <p className="font-semibold">
                {template.activeInstances}/{template.totalInstances}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Utilization</span>
              <p className="font-semibold">{utilizationRate}%</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                utilizationRate > 80 ? "bg-green-500" : 
                utilizationRate > 50 ? "bg-yellow-500" : "bg-red-500"
              }`}
              style={{ width: `${utilizationRate}%` }}
            />
          </div>

          {/* Territories */}
          <div className="flex items-center gap-2 flex-wrap">
            <MapPin className="w-3 h-3 text-gray-500" />
            <div className="flex gap-1 flex-wrap">
              {template.territories.slice(0, 3).map((territory) => (
                <Badge key={territory} variant="outline" className="text-xs px-1.5 py-0">
                  {territory}
                </Badge>
              ))}
              {template.territories.length > 3 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  +{template.territories.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1">
              <Box className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-600">{template.componentCount} items</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-yellow-600">★</span>
              <span className="text-xs font-semibold">{template.avgRating}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("templates");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();

  const filteredTemplates = inventoryData.kitTemplates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand =
      selectedBrand === "all" || template.brandId === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const activeFilters = [
    selectedBrand !== "all" && selectedBrand,
    selectedState !== "all" && selectedState,
    selectedStatus !== "all" && selectedStatus,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-first header */}
      <div className="sticky top-0 z-20 bg-white border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg sm:text-xl font-bold">Inventory</h1>
            <Button size="sm" className="h-8">
              <Plus className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">New Kit</span>
            </Button>
          </div>

          {/* Search bar with filter button */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search kits, brands, territories..."
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
                    Narrow down your inventory search
                  </SheetDescription>
                </SheetHeader>
                <FilterSheet
                  selectedBrand={selectedBrand}
                  setSelectedBrand={setSelectedBrand}
                  selectedState={selectedState}
                  setSelectedState={setSelectedState}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
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
              <p className="text-xs text-purple-600">Templates</p>
              <p className="text-lg font-bold text-purple-900">{inventoryData.stats.totalKitTemplates}</p>
            </div>
            <div className="bg-green-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-green-600">Active Kits</p>
              <p className="text-lg font-bold text-green-900">{inventoryData.stats.activeInstances.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-yellow-600">Brands</p>
              <p className="text-lg font-bold text-yellow-900">{inventoryData.stats.totalBrands}</p>
            </div>
            <div className="bg-red-50 rounded-lg px-3 py-2 min-w-[100px]">
              <p className="text-xs text-red-600">Alerts</p>
              <p className="text-lg font-bold text-red-900">{inventoryData.stats.criticalAlerts}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start rounded-none border-t h-10 p-0">
            <TabsTrigger value="templates" className="flex-1 rounded-none text-xs sm:text-sm">
              Templates
            </TabsTrigger>
            <TabsTrigger value="instances" className="flex-1 rounded-none text-xs sm:text-sm">
              Active
            </TabsTrigger>
            <TabsTrigger value="stock" className="flex-1 rounded-none text-xs sm:text-sm">
              Stock
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
          <TabsContent value="templates" className="mt-0 space-y-4">
            {/* Quick actions for mobile */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <Link href="/inventory/templates/new">
                <Button variant="outline" className="w-full h-auto py-3">
                  <Plus className="w-4 h-4 mb-1" />
                  <span className="block text-xs">Create Template</span>
                </Button>
              </Link>
              <Link href="/inventory/bulk-import">
                <Button variant="outline" className="w-full h-auto py-3">
                  <Archive className="w-4 h-4 mb-1" />
                  <span className="block text-xs">Bulk Import</span>
                </Button>
              </Link>
            </div>

            {/* Template grid */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredTemplates.map((template) => (
                <KitTemplateCard key={template.id} template={template} isMobile={true} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="instances" className="mt-0 space-y-4">
            <Link href="/inventory/kit-instances">
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Active Kit Instances</h3>
                        <p className="text-xs text-gray-600">{inventoryData.stats.activeInstances.toLocaleString()} kits deployed</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </TabsContent>

          <TabsContent value="stock" className="mt-0 space-y-4">
            <Link href="/inventory/stock">
              <Card className="hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">Stock Management</h3>
                        <p className="text-xs text-gray-600">Track items assigned to agents</p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </TabsContent>

          <TabsContent value="analytics" className="mt-0 space-y-4">
            <div className="grid gap-3">
              {/* Territory heat map preview */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Territory Coverage</CardTitle>
                  <CardDescription className="text-xs">Kit distribution across {inventoryData.stats.totalStates} states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {inventoryData.states.slice(0, 3).map((state) => (
                      <div key={state.code} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <span className="text-sm font-medium">{state.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 bg-purple-500 rounded-full"
                              style={{ width: `${(state.kits / 1000) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 min-w-[40px] text-right">{state.kits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Full Analytics
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}