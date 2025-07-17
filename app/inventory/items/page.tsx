"use client";

import React, { useState, useMemo } from "react";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  Download,
  Upload,
  QrCode,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

// Comprehensive inventory data with real structure
const inventoryData = [
  {
    id: "inv-001",
    name: "LED Display Panel 55\" 4K",
    description: "High-resolution commercial display with HDR support",
    category: "Electronics",
    subcategory: "Displays",
    sku: "LED-55-4K-HDR",
    barcode: "1234567890123",
    qrCode: "QR-LED-001",
    
    // Stock Information
    currentStock: 8,
    reservedStock: 2,
    availableStock: 6,
    minStock: 3,
    maxStock: 12,
    reorderPoint: 5,
    reorderQuantity: 6,
    
    // Financial Information
    unitCost: 280.00,
    marketValue: 350.00,
    totalValue: 2240.00,
    depreciationRate: 0.15,
    currentBookValue: 1904.00,
    
    // Status & Condition
    status: "in_stock",
    condition: "excellent",
    lastInspection: "2025-01-10",
    nextMaintenance: "2025-02-10",
    
    // Location & Storage
    warehouse: "Warehouse B",
    zone: "Electronics",
    aisle: "E-12",
    shelf: "3A",
    bin: "E12-3A-01",
    
    // Supplier Information
    supplier: "TechDisplay Solutions",
    supplierCode: "TDS-2024-LED55",
    leadTime: 14, // days
    lastRestocked: "2025-01-10",
    
    // Usage Analytics
    usageFrequency: "high",
    avgUsageDays: 3.5,
    totalUsages: 45,
    lastUsed: "2025-01-15",
    
    // Metadata
    tags: ["4K", "Premium", "Popular", "HDR", "Commercial"],
    certifications: ["CE", "FCC", "Energy Star"],
    warranty: {
      active: true,
      provider: "TechDisplay Solutions",
      expiry: "2027-01-10",
      type: "Extended",
    },
    
    // Tracking
    createdAt: "2024-06-15",
    updatedAt: "2025-01-15",
    createdBy: "admin@rishi.com",
    lastModifiedBy: "mike@rishi.com",
  },
  // Add more items...
];

// Advanced filter component
const AdvancedFilters = ({ onApply, onReset }) => {
  const [filters, setFilters] = useState({
    status: "all",
    condition: "all",
    warehouse: "all",
    category: "all",
    stockLevel: "all",
    priceRange: { min: 0, max: 10000 },
  });

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Status</label>
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value })}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Condition</label>
        <Select
          value={filters.condition}
          onValueChange={(value) => setFilters({ ...filters, condition: value })}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conditions</SelectItem>
            <SelectItem value="excellent">Excellent</SelectItem>
            <SelectItem value="good">Good</SelectItem>
            <SelectItem value="fair">Fair</SelectItem>
            <SelectItem value="poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Warehouse</label>
        <Select
          value={filters.warehouse}
          onValueChange={(value) => setFilters({ ...filters, warehouse: value })}
        >
          <SelectTrigger className="w-full mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Warehouses</SelectItem>
            <SelectItem value="warehouse-a">Warehouse A</SelectItem>
            <SelectItem value="warehouse-b">Warehouse B</SelectItem>
            <SelectItem value="warehouse-c">Warehouse C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={() => onApply(filters)} className="flex-1">
          Apply Filters
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setFilters({
              status: "all",
              condition: "all",
              warehouse: "all",
              category: "all",
              stockLevel: "all",
              priceRange: { min: 0, max: 10000 },
            });
            onReset();
          }}
          className="flex-1"
        >
          Reset
        </Button>
      </div>
    </div>
  );
};

// Modern item card component
const ItemCard = ({ item, viewMode = "grid", onAction }) => {
  const getStatusColor = (status: string) => {
    const colors = {
      in_stock: "bg-green-50 text-green-700 border-green-200",
      low_stock: "bg-yellow-50 text-yellow-700 border-yellow-200",
      out_of_stock: "bg-red-50 text-red-700 border-red-200",
      reserved: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return colors[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      excellent: "text-green-600",
      good: "text-blue-600",
      fair: "text-yellow-600",
      poor: "text-red-600",
    };
    return colors[condition] || "text-gray-600";
  };

  const stockPercentage = (item.currentStock / item.maxStock) * 100;

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Image/Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-8 h-8 text-purple-600" />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {item.sku}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-600">{item.warehouse}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock & Actions */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge className={`${getStatusColor(item.status)} text-xs border mb-1`}>
                      {item.status.replace("_", " ")}
                    </Badge>
                    <div className="text-sm font-semibold">
                      {item.currentStock}/{item.maxStock}
                    </div>
                    <div className="text-xs text-gray-500">${item.unitCost}</div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onAction("view", item)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction("edit", item)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction("qr", item)}>
                        <QrCode className="w-4 h-4 mr-2" />
                        Show QR Code
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onAction("history", item)}>
                        <History className="w-4 h-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAction("duplicate", item)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500">Stock Level</span>
                  <span className="text-gray-600 font-medium">
                    {item.availableStock} available
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      stockPercentage > 50
                        ? "bg-green-500"
                        : stockPercentage > 20
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View
  return (
    <Card className="hover:shadow-lg transition-all duration-200 h-full flex flex-col">
      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-purple-600" />
          </div>
          <Badge className={`${getStatusColor(item.status)} text-xs border`}>
            {item.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-sm line-clamp-2">{item.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{item.category}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">SKU</span>
              <span className="font-mono">{item.sku}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Stock</span>
              <span className="font-semibold">
                {item.currentStock}/{item.maxStock}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Available</span>
              <span className="font-semibold text-green-600">
                {item.availableStock}
              </span>
            </div>
          </div>

          {/* Stock Progress */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                stockPercentage > 50
                  ? "bg-green-500"
                  : stockPercentage > 20
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${Math.min(stockPercentage, 100)}%` }}
            />
          </div>

          {/* Financial Info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded p-2 text-center">
              <div className="font-semibold">${item.unitCost}</div>
              <div className="text-gray-500">Unit Cost</div>
            </div>
            <div className="bg-purple-50 rounded p-2 text-center">
              <div className="font-semibold text-purple-700">${item.totalValue}</div>
              <div className="text-purple-600">Total Value</div>
            </div>
          </div>

          {/* Location & Condition */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600">{item.warehouse}</span>
            </div>
            <span className={`font-medium ${getConditionColor(item.condition)}`}>
              {item.condition}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onAction("view", item)}
          >
            <Eye className="w-3 h-3 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("edit", item)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InventoryItemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

  const handleAction = (action: string, item: any) => {
    toast({
      title: `${action} action`,
      description: `Performing ${action} on ${item.name}`,
    });
  };

  const filteredItems = useMemo(() => {
    return inventoryData.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Link href="/inventory">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">Inventory Items</h1>
            <p className="text-sm text-gray-600">
              Manage and track all inventory items across locations
            </p>
          </div>
          <Link href="/inventory/items/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, SKU, or barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Audio">Audio</SelectItem>
              <SelectItem value="Display">Display</SelectItem>
              <SelectItem value="Outdoor">Outdoor</SelectItem>
              <SelectItem value="Luxury">Luxury</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="stock">Stock Level</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="usage">Usage</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
            </SelectContent>
          </Select>

          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
                <SheetDescription>
                  Apply multiple filters to refine your search
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <AdvancedFilters
                  onApply={(filters) => {
                    console.log("Applying filters:", filters);
                    setShowFilters(false);
                  }}
                  onReset={() => {
                    console.log("Resetting filters");
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">342</p>
              </div>
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">$28.7K</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <X className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items Grid/List */}
      <div className={`grid gap-4 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      }`}>
        {filteredItems.map((item) => (
          <ItemCard
            key={item.id}
            item={item}
            viewMode={viewMode}
            onAction={handleAction}
          />
        ))}
      </div>
    </div>
  );
}