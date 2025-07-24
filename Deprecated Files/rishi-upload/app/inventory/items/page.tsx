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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Package2,
  Plus,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  MoreVertical,
  Barcode,
  DollarSign,
  TrendingUp,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Authentic inventory items data with UUID format following architectural guidelines
const inventoryItemsData = [
  {
    id: "bb0e8400-e29b-41d4-a716-446655440001",
    name: "Demo Table (Portable)",
    description: "Lightweight portable table for product demonstrations",
    category: "Furniture",
    sku: "DT-001-PRT",
    barcode: "1234567890123",
    unitCost: 125.0,
    currentStock: 15,
    minimumStock: 5,
    maximumStock: 25,
    status: "in_stock",
    condition: "good",
    supplier: "Event Equipment Co.",
    lastRestocked: "2025-06-10T09:30:00Z",
    totalValue: 1875.0,
    usageFrequency: "high",
    maintenanceSchedule: "quarterly",
    location: "Warehouse A - Section 1",
    tags: ["Portable", "Demo", "Furniture", "Popular"],
    assignedToTemplates: [
      "Product Demo Standard Kit",
      "Basic Retail Support Kit",
    ],
    warranties: {
      hasWarranty: true,
      expiryDate: "2026-06-10",
      warrantyProvider: "Event Equipment Co.",
    },
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440002",
    name: 'LED Display Panel (55")',
    description: "High-resolution 4K LED display panel for presentations",
    category: "Electronics",
    sku: "LED-55-4K",
    barcode: "2345678901234",
    unitCost: 280.0,
    currentStock: 8,
    minimumStock: 3,
    maximumStock: 12,
    status: "in_stock",
    condition: "excellent",
    supplier: "TechDisplay Solutions",
    lastRestocked: "2025-06-05T14:20:00Z",
    totalValue: 2240.0,
    usageFrequency: "medium",
    maintenanceSchedule: "monthly",
    location: "Warehouse B - Electronics Section",
    tags: ["Electronics", "Display", "High-Value", "4K"],
    assignedToTemplates: ["Trade Show Premium Setup", "Luxury Event Package"],
    warranties: {
      hasWarranty: true,
      expiryDate: "2027-06-05",
      warrantyProvider: "TechDisplay Solutions",
    },
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440003",
    name: "Promotional Brochures",
    description: "Generic branded brochures for product information",
    category: "Marketing Materials",
    sku: "BRCH-GEN-001",
    barcode: "3456789012345",
    unitCost: 0.5,
    currentStock: 2500,
    minimumStock: 500,
    maximumStock: 5000,
    status: "in_stock",
    condition: "new",
    supplier: "PrintPro Marketing",
    lastRestocked: "2025-06-15T11:00:00Z",
    totalValue: 1250.0,
    usageFrequency: "very_high",
    maintenanceSchedule: "none",
    location: "Warehouse A - Marketing Section",
    tags: ["Marketing", "Disposable", "Bulk", "Branding"],
    assignedToTemplates: [
      "Product Demo Standard Kit",
      "Street Team Activation Kit",
    ],
    warranties: {
      hasWarranty: false,
      expiryDate: null,
      warrantyProvider: null,
    },
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440004",
    name: "Crystal Product Stands",
    description: "Premium crystal display stands for luxury products",
    category: "Display",
    sku: "CPS-LUX-001",
    barcode: "4567890123456",
    unitCost: 85.0,
    currentStock: 2,
    minimumStock: 6,
    maximumStock: 15,
    status: "low_stock",
    condition: "excellent",
    supplier: "Luxury Display Corp",
    lastRestocked: "2025-05-20T16:30:00Z",
    totalValue: 170.0,
    usageFrequency: "low",
    maintenanceSchedule: "as_needed",
    location: "Warehouse C - Luxury Section",
    tags: ["Luxury", "Crystal", "Premium", "Display"],
    assignedToTemplates: ["Luxury Event Package"],
    warranties: {
      hasWarranty: true,
      expiryDate: "2030-05-20",
      warrantyProvider: "Luxury Display Corp",
    },
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440005",
    name: "Portable Canopy Tent",
    description: "Weather-resistant portable canopy for outdoor events",
    category: "Outdoor Equipment",
    sku: "CNP-OUT-001",
    barcode: "5678901234567",
    unitCost: 120.0,
    currentStock: 0,
    minimumStock: 3,
    maximumStock: 10,
    status: "out_of_stock",
    condition: "fair",
    supplier: "Outdoor Events Supply",
    lastRestocked: "2025-05-15T10:00:00Z",
    totalValue: 0.0,
    usageFrequency: "high",
    maintenanceSchedule: "after_each_use",
    location: "Warehouse A - Outdoor Section",
    tags: ["Outdoor", "Weather-Resistant", "Portable", "Canopy"],
    assignedToTemplates: ["Street Team Activation Kit"],
    warranties: {
      hasWarranty: true,
      expiryDate: "2026-05-15",
      warrantyProvider: "Outdoor Events Supply",
    },
  },
  {
    id: "bb0e8400-e29b-41d4-a716-446655440006",
    name: "Professional Sound System",
    description: "High-quality wireless sound system with microphones",
    category: "Audio Equipment",
    sku: "SND-PRO-001",
    barcode: "6789012345678",
    unitCost: 350.0,
    currentStock: 4,
    minimumStock: 2,
    maximumStock: 8,
    status: "in_stock",
    condition: "good",
    supplier: "AudioTech Solutions",
    lastRestocked: "2025-06-01T13:45:00Z",
    totalValue: 1400.0,
    usageFrequency: "medium",
    maintenanceSchedule: "bi_annually",
    location: "Warehouse B - Audio Section",
    tags: ["Audio", "Wireless", "Professional", "Microphones"],
    assignedToTemplates: ["Trade Show Premium Setup"],
    warranties: {
      hasWarranty: true,
      expiryDate: "2027-06-01",
      warrantyProvider: "AudioTech Solutions",
    },
  },
];

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  sku: string;
  barcode: string;
  unitCost: number;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  status: string;
  condition: string;
  supplier: string;
  lastRestocked: string;
  totalValue: number;
  usageFrequency: string;
  maintenanceSchedule: string;
  location: string;
  tags: string[];
  assignedToTemplates: string[];
  warranties: {
    hasWarranty: boolean;
    expiryDate: string | null;
    warrantyProvider: string | null;
  };
}

const InventoryItemCard = ({
  item,
  onAction,
}: {
  item: InventoryItem;
  onAction: (action: string, itemId: string) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "low_stock":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "out_of_stock":
        return "bg-red-100 text-red-800 border-red-200";
      case "discontinued":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "text-green-600";
      case "good":
        return "text-blue-600";
      case "fair":
        return "text-yellow-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in_stock":
        return <CheckCircle className="h-4 w-4" />;
      case "low_stock":
      case "out_of_stock":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Package2 className="h-4 w-4" />;
    }
  };

  const getUsageFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "very_high":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "medium":
        return "text-yellow-600";
      case "low":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const formatLastRestocked = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getStockPercentage = () => {
    return (item.currentStock / item.maximumStock) * 100;
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-indigo-100 text-indigo-600 font-semibold">
                {item.category.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{item.name}</CardTitle>
              <CardDescription className="mt-1">
                {item.description}
              </CardDescription>
              <div className="flex items-center mt-1 space-x-2">
                <Barcode className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {item.sku}
                </span>
              </div>
            </div>
          </div>
          <Badge
            className={`${getStatusColor(item.status)} border flex items-center gap-1`}
          >
            {getStatusIcon(item.status)}
            {item.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stock Information */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Package2 className="h-4 w-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Stock Level
              </span>
            </div>
            <span className="text-sm font-bold text-blue-800">
              {item.currentStock}/{item.maximumStock}
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                getStockPercentage() > 50
                  ? "bg-gradient-to-r from-blue-500 to-blue-600"
                  : getStockPercentage() > 20
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600"
                    : "bg-gradient-to-r from-red-500 to-red-600"
              }`}
              style={{ width: `${Math.min(getStockPercentage(), 100)}%` }}
            />
          </div>
        </div>

        {/* Financial Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">
              ${item.unitCost.toFixed(0)}
            </div>
            <div className="text-xs text-green-700">Unit Cost</div>
          </div>
          <div className="text-center bg-purple-50 rounded-lg p-3">
            <div className="text-lg font-bold text-purple-600">
              ${item.totalValue.toFixed(0)}
            </div>
            <div className="text-xs text-purple-700">Total Value</div>
          </div>
        </div>

        {/* Condition & Usage */}
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div>
            <p className="text-sm font-medium">Condition</p>
            <p className={`text-sm ${getConditionColor(item.condition)}`}>
              {item.condition.charAt(0).toUpperCase() + item.condition.slice(1)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Usage</p>
            <p
              className={`text-sm ${getUsageFrequencyColor(item.usageFrequency)}`}
            >
              {item.usageFrequency.replace("_", " ").toUpperCase()}
            </p>
          </div>
        </div>

        {/* Location & Supplier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium text-right">{item.location}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Supplier:</span>
            <span className="font-medium text-right">{item.supplier}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Restocked:</span>
            <span className="font-medium">
              {formatLastRestocked(item.lastRestocked)}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="text-sm font-medium mb-2">Tags</div>
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2 border-t">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAction("view", item.id)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("edit", item.id)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onAction("restock", item.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onAction("history", item.id)}>
                View History
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onAction("maintenance", item.id)}
              >
                Schedule Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("transfer", item.id)}>
                Transfer Location
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAction("retire", item.id)}>
                Retire Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InventoryItemsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const { toast } = useToast();

  const filteredItems = inventoryItemsData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAction = async (action: string, itemId: string) => {
    const item = inventoryItemsData.find((i) => i.id === itemId);

    // Event-driven architecture: Publish events for inventory actions
    const eventPayload = {
      eventType: `inventory_item_${action}`,
      timestamp: new Date().toISOString(),
      itemId,
      itemName: item?.name,
      initiatedBy: "internal_admin",
      metadata: {
        sku: item?.sku,
        category: item?.category,
        currentStock: item?.currentStock,
        status: item?.status,
        unitCost: item?.unitCost,
        location: item?.location,
      },
    };

    // In real implementation, this would publish to event bus
    console.log("Publishing inventory event:", eventPayload);

    switch (action) {
      case "view":
        toast({
          title: "Item Details",
          description: `Opening detailed view for ${item?.name}`,
        });
        break;
      case "edit":
        toast({
          title: "Edit Item",
          description: `Opening editor for ${item?.name}`,
        });
        break;
      case "restock":
        toast({
          title: "Restock Item",
          description: `Opening restock form for ${item?.name}`,
        });
        break;
      case "history":
        toast({
          title: "Usage History",
          description: `Loading usage history for ${item?.name}`,
        });
        break;
      case "maintenance":
        toast({
          title: "Schedule Maintenance",
          description: `Scheduling maintenance for ${item?.name}`,
        });
        break;
      case "transfer":
        toast({
          title: "Transfer Location",
          description: `Opening location transfer for ${item?.name}`,
        });
        break;
      case "retire":
        toast({
          title: "Retire Item",
          description: `Initiating retirement process for ${item?.name}`,
        });
        break;
    }
  };

  const totalItems = inventoryItemsData.length;
  const inStockItems = inventoryItemsData.filter(
    (i) => i.status === "in_stock",
  ).length;
  const lowStockItems = inventoryItemsData.filter(
    (i) => i.status === "low_stock",
  ).length;
  const outOfStockItems = inventoryItemsData.filter(
    (i) => i.status === "out_of_stock",
  ).length;
  const totalValue = inventoryItemsData.reduce(
    (sum, i) => sum + i.totalValue,
    0,
  );

  const uniqueCategories = [
    ...new Set(inventoryItemsData.map((i) => i.category)),
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Items</h1>
          <p className="text-muted-foreground">
            Manage individual inventory items, stock levels, and equipment
            tracking
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Items
                </p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package2 className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  In Stock
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {inStockItems}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Low Stock
                </p>
                <p className="text-2xl font-bold text-yellow-600">
                  {lowStockItems}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Out of Stock
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {outOfStockItems}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalValue.toFixed(0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items by name, description, SKU, category, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            size="sm"
          >
            All Status
          </Button>
          <Button
            variant={statusFilter === "in_stock" ? "default" : "outline"}
            onClick={() => setStatusFilter("in_stock")}
            size="sm"
          >
            In Stock
          </Button>
          <Button
            variant={statusFilter === "low_stock" ? "default" : "outline"}
            onClick={() => setStatusFilter("low_stock")}
            size="sm"
          >
            Low Stock
          </Button>
          <Button
            variant={statusFilter === "out_of_stock" ? "default" : "outline"}
            onClick={() => setStatusFilter("out_of_stock")}
            size="sm"
          >
            Out of Stock
          </Button>
        </div>
      </div>

      {/* Items Grid */}
      <Tabs value="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onAction={handleAction}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Package2 className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No inventory items found</h3>
          <p className="mt-2 text-muted-foreground">
            Try adjusting your search criteria or add a new item.
          </p>
        </div>
      )}
    </div>
  );
}
