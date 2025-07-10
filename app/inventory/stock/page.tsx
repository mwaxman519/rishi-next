/**
 * Stock Management Page
 * Displays and manages inventory stock levels and replenishment
 */

import { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Plus,
  Search,
  Filter,
  Download
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

export const metadata: Metadata = {
  title: "Stock Management | Rishi Platform",
  description: "Manage inventory stock levels and track replenishment requests",
};

// Mock data for demonstration
const mockStockItems = [
  {
    id: "stock-001",
    name: "Black Polo Shirt (L)",
    category: "Core Items",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unitCost: 25.99,
    supplier: "Rishi HR Department",
    lastReplenished: "2025-01-05",
    status: "in-stock",
    trend: "stable"
  },
  {
    id: "stock-002",
    name: "Folding Table (6ft)",
    category: "Core Items",
    currentStock: 8,
    minStock: 10,
    maxStock: 25,
    unitCost: 89.99,
    supplier: "Rishi HR Department",
    lastReplenished: "2025-01-03",
    status: "low-stock",
    trend: "down"
  },
  {
    id: "stock-003",
    name: "Neoprene Tablecloth",
    category: "Core Items",
    currentStock: 32,
    minStock: 15,
    maxStock: 50,
    unitCost: 34.99,
    supplier: "Rishi HR Department",
    lastReplenished: "2025-01-07",
    status: "in-stock",
    trend: "stable"
  },
  {
    id: "stock-004",
    name: "Sativa Solutions Pamphlets",
    category: "Brand Materials",
    currentStock: 2,
    minStock: 50,
    maxStock: 500,
    unitCost: 0.25,
    supplier: "Sativa Solutions",
    lastReplenished: "2024-12-28",
    status: "critical",
    trend: "down"
  },
  {
    id: "stock-005",
    name: "Indica Dreams Stickers",
    category: "Brand Materials",
    currentStock: 150,
    minStock: 100,
    maxStock: 1000,
    unitCost: 0.15,
    supplier: "Indica Dreams",
    lastReplenished: "2025-01-02",
    status: "in-stock",
    trend: "up"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "in-stock":
      return "bg-green-100 text-green-800";
    case "low-stock":
      return "bg-yellow-100 text-yellow-800";
    case "critical":
      return "bg-red-100 text-red-800";
    case "out-of-stock":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case "down":
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <div className="h-4 w-4" />;
  }
};

const getStockLevel = (current: number, min: number, max: number) => {
  return Math.round((current / max) * 100);
};

function StockManagementContent() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-gray-600 mt-1">
            Monitor inventory levels and manage replenishment requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search stock items..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-green-600">98</p>
              </div>
              <Package className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">15</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">8</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Items List */}
      <div className="grid gap-4">
        {mockStockItems.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="h-5 w-5 text-blue-500" />
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <p className="text-sm text-gray-600">{item.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(item.trend)}
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Current Stock</p>
                  <p className="font-bold text-lg">{item.currentStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Min / Max</p>
                  <p className="font-medium">{item.minStock} / {item.maxStock}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Unit Cost</p>
                  <p className="font-medium">${item.unitCost}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Supplier</p>
                  <p className="font-medium">{item.supplier}</p>
                </div>
              </div>
              
              {/* Stock Level Progress */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Stock Level</span>
                  <span>{getStockLevel(item.currentStock, item.minStock, item.maxStock)}%</span>
                </div>
                <Progress 
                  value={getStockLevel(item.currentStock, item.minStock, item.maxStock)} 
                  className="h-2"
                />
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Last replenished: {new Date(item.lastReplenished).toLocaleDateString()}</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    Update Stock
                  </Button>
                  {item.status === "low-stock" || item.status === "critical" ? (
                    <Button variant="outline" size="sm" className="text-yellow-600">
                      Request Replenishment
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function StockManagementPage() {
  return (
    <Suspense fallback={<div>Loading stock management...</div>}>
      <StockManagementContent />
    </Suspense>
  );
}