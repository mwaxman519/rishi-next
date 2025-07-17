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
  Barcode,
  DollarSign,
  MapPin,
  Calendar,
  Star,
  Eye,
  Edit,
  MoreVertical,
  Copy,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Modern inventory data structure
const inventoryData = {
  stats: {
    totalItems: 342,
    totalValue: 28750,
    lowStockItems: 12,
    outOfStockItems: 3,
    kitTemplates: 18,
    lastUpdate: "2025-01-17T10:30:00Z",
  },
  categories: [
    { id: "electronics", name: "Electronics", count: 45, icon: "📱" },
    { id: "furniture", name: "Furniture", count: 32, icon: "🪑" },
    { id: "marketing", name: "Marketing", count: 156, icon: "📊" },
    { id: "audio", name: "Audio", count: 18, icon: "🎵" },
    { id: "display", name: "Display", count: 28, icon: "🖼️" },
    { id: "outdoor", name: "Outdoor", count: 21, icon: "🏕️" },
    { id: "luxury", name: "Luxury", count: 12, icon: "💎" },
    { id: "accessories", name: "Accessories", count: 30, icon: "🔧" },
  ],
  items: [
    {
      id: "1",
      name: "LED Display Panel 55\"",
      category: "Electronics",
      sku: "LED-55-4K",
      currentStock: 8,
      minStock: 3,
      maxStock: 12,
      unitCost: 280,
      totalValue: 2240,
      status: "in_stock",
      condition: "excellent",
      location: "Warehouse B",
      lastRestocked: "2025-01-10",
      usageFrequency: "high",
      tags: ["4K", "Premium", "Popular"],
      image: "/api/placeholder/60/60",
    },
    {
      id: "2",
      name: "Demo Table Portable",
      category: "Furniture",
      sku: "DT-001-PRT",
      currentStock: 15,
      minStock: 5,
      maxStock: 25,
      unitCost: 125,
      totalValue: 1875,
      status: "in_stock",
      condition: "good",
      location: "Warehouse A",
      lastRestocked: "2025-01-15",
      usageFrequency: "very_high",
      tags: ["Portable", "Standard", "Popular"],
      image: "/api/placeholder/60/60",
    },
    {
      id: "3",
      name: "Crystal Product Stands",
      category: "Luxury",
      sku: "CPS-LUX-001",
      currentStock: 2,
      minStock: 6,
      maxStock: 15,
      unitCost: 85,
      totalValue: 170,
      status: "low_stock",
      condition: "excellent",
      location: "Warehouse C",
      lastRestocked: "2025-01-05",
      usageFrequency: "low",
      tags: ["Luxury", "Premium", "Crystal"],
      image: "/api/placeholder/60/60",
    },
    {
      id: "4",
      name: "Promotional Brochures",
      category: "Marketing",
      sku: "BRCH-GEN-001",
      currentStock: 2500,
      minStock: 500,
      maxStock: 5000,
      unitCost: 0.5,
      totalValue: 1250,
      status: "in_stock",
      condition: "new",
      location: "Warehouse A",
      lastRestocked: "2025-01-16",
      usageFrequency: "very_high",
      tags: ["Bulk", "Disposable", "Marketing"],
      image: "/api/placeholder/60/60",
    },
    {
      id: "5",
      name: "Professional Sound System",
      category: "Audio",
      sku: "SND-PRO-001",
      currentStock: 4,
      minStock: 2,
      maxStock: 8,
      unitCost: 350,
      totalValue: 1400,
      status: "in_stock",
      condition: "good",
      location: "Warehouse B",
      lastRestocked: "2025-01-12",
      usageFrequency: "medium",
      tags: ["Professional", "Wireless", "Premium"],
      image: "/api/placeholder/60/60",
    },
    {
      id: "6",
      name: "Portable Canopy Tent",
      category: "Outdoor",
      sku: "CNP-OUT-001",
      currentStock: 0,
      minStock: 3,
      maxStock: 10,
      unitCost: 120,
      totalValue: 0,
      status: "out_of_stock",
      condition: "fair",
      location: "Warehouse A",
      lastRestocked: "2025-01-01",
      usageFrequency: "high",
      tags: ["Outdoor", "Weather-Resistant", "Urgent"],
      image: "/api/placeholder/60/60",
    },
  ],
  kitTemplates: [
    {
      id: "1",
      name: "Product Demo Standard",
      description: "Essential items for product demonstrations",
      category: "Demo",
      itemCount: 12,
      totalValue: 485,
      status: "active",
      usageCount: 28,
      rating: 4.6,
      lastUsed: "2025-01-15",
      tags: ["Popular", "Standard", "Demo"],
    },
    {
      id: "2",
      name: "Trade Show Premium",
      description: "Complete setup for trade shows",
      category: "Trade Show",
      itemCount: 25,
      totalValue: 1251,
      status: "active",
      usageCount: 8,
      rating: 4.9,
      lastUsed: "2025-01-12",
      tags: ["Premium", "Corporate", "High-Value"],
    },
    {
      id: "3",
      name: "Street Team Activation",
      description: "Mobile kit for street marketing",
      category: "Street Marketing",
      itemCount: 8,
      totalValue: 320,
      status: "active",
      usageCount: 15,
      rating: 4.3,
      lastUsed: "2025-01-10",
      tags: ["Mobile", "Outdoor", "Activation"],
    },
    {
      id: "4",
      name: "Luxury Event Package",
      description: "High-end equipment for VIP events",
      category: "Luxury",
      itemCount: 18,
      totalValue: 2150,
      status: "active",
      usageCount: 4,
      rating: 5.0,
      lastUsed: "2025-01-08",
      tags: ["Luxury", "VIP", "Premium"],
    },
  ],
};

// Mobile-first responsive item card
const InventoryItemCard = ({ item, viewMode = "grid" }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-50 text-green-700 border-green-200";
      case "low_stock":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "out_of_stock":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStockPercentage = () => {
    return (item.currentStock / item.maxStock) * 100;
  };

  const getUsageIntensity = (frequency: string) => {
    const colors = {
      very_high: "bg-red-500",
      high: "bg-orange-500",
      medium: "bg-yellow-500",
      low: "bg-green-500",
    };
    return colors[frequency as keyof typeof colors] || "bg-gray-500";
  };

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {item.sku}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {item.location}
                    </span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <Badge
                    className={`${getStatusColor(item.status)} text-xs border mb-1`}
                  >
                    {item.status.replace("_", " ")}
                  </Badge>
                  <div className="text-sm font-semibold">
                    {item.currentStock}/{item.maxStock}
                  </div>
                  <div className="text-xs text-gray-500">${item.unitCost}</div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${
                      getStockPercentage() > 50
                        ? "bg-green-500"
                        : getStockPercentage() > 20
                          ? "bg-yellow-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(getStockPercentage(), 100)}%` }}
                  />
                </div>
                <div
                  className={`w-2 h-2 rounded-full ${getUsageIntensity(item.usageFrequency)}`}
                  title={`Usage: ${item.usageFrequency}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200 h-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-gray-600" />
          </div>
          <Badge
            className={`${getStatusColor(item.status)} text-xs border`}
          >
            {item.status.replace("_", " ")}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.category}</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Stock</span>
            <span className="font-semibold">
              {item.currentStock}/{item.maxStock}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                getStockPercentage() > 50
                  ? "bg-green-500"
                  : getStockPercentage() > 20
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(getStockPercentage(), 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Value</span>
            <span className="font-semibold">${item.totalValue}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Usage</span>
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${getUsageIntensity(item.usageFrequency)}`}
              />
              <span className="text-xs">{item.usageFrequency}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Kit template card
const KitTemplateCard = ({ kit }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-50 text-green-700 border-green-200";
      case "draft":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "archived":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Archive className="w-6 h-6 text-purple-600" />
          </div>
          <Badge className={`${getStatusColor(kit.status)} text-xs border`}>
            {kit.status}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2">{kit.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {kit.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center bg-blue-50 rounded-lg p-2">
              <div className="font-bold text-blue-600">{kit.itemCount}</div>
              <div className="text-blue-700">Items</div>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-2">
              <div className="font-bold text-green-600">${kit.totalValue}</div>
              <div className="text-green-700">Value</div>
            </div>
            <div className="text-center bg-purple-50 rounded-lg p-2">
              <div className="font-bold text-purple-600">{kit.usageCount}</div>
              <div className="text-purple-700">Uses</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="text-xs font-semibold">{kit.rating}</span>
            </div>
            <span className="text-xs text-gray-500">
              Used {new Date(kit.lastUsed).toLocaleDateString()}
            </span>
          </div>

          <div className="flex flex-wrap gap-1">
            {kit.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {kit.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{kit.tags.length - 2}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState("items");
  const { toast } = useToast();

  const filteredItems = inventoryData.items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredKits = inventoryData.kitTemplates.filter((kit) =>
    kit.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Mobile-first header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-sm text-gray-600">
            Manage items, kits, and track usage across all locations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/inventory/items/new">
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats grid - responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold">
                  {inventoryData.stats.totalItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold">
                  ${inventoryData.stats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Low Stock</p>
                <p className="text-2xl font-bold">
                  {inventoryData.stats.lowStockItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Archive className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Kit Templates</p>
                <p className="text-2xl font-bold">
                  {inventoryData.stats.kitTemplates}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {inventoryData.categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name} ({cat.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="items">Items ({filteredItems.length})</TabsTrigger>
          <TabsTrigger value="kits">Kits ({filteredKits.length})</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredItems.map((item) => (
              <InventoryItemCard key={item.id} item={item} viewMode={viewMode} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredKits.map((kit) => (
              <KitTemplateCard key={kit.id} kit={kit} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Usage Analytics</CardTitle>
                <CardDescription>Track inventory usage patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Analytics dashboard will be displayed here</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Distribution</CardTitle>
                <CardDescription>Items by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {inventoryData.categories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{category.icon}</span>
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                      <Badge variant="outline">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}