import { Metadata } from "next";
import {
  Package,
  Plus,
  Search,
  Filter,
  Archive,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inventory | Rishi Workforce Management",
  description: "Manage kit templates, items, and inventory tracking",
};

const mockKitTemplates = [
  {
    id: 1,
    name: "Product Demo Kit",
    description: "Complete kit for product demonstrations",
    itemCount: 12,
    status: "active",
    lastUsed: "2025-06-15",
    category: "Demo Equipment",
  },
  {
    id: 2,
    name: "Brand Activation Setup",
    description: "Everything needed for brand activation events",
    itemCount: 8,
    status: "active",
    lastUsed: "2025-06-14",
    category: "Event Setup",
  },
  {
    id: 3,
    name: "Trade Show Package",
    description: "Full trade show booth equipment",
    itemCount: 15,
    status: "maintenance",
    lastUsed: "2025-06-10",
    category: "Trade Show",
  },
];

const mockItems = [
  {
    id: 1,
    name: "Portable Display Stand",
    category: "Display Equipment",
    quantity: 25,
    available: 22,
    status: "in_stock",
    location: "Warehouse A",
  },
  {
    id: 2,
    name: "Tablet - iPad Air",
    category: "Technology",
    quantity: 15,
    available: 12,
    status: "in_stock",
    location: "Tech Storage",
  },
  {
    id: 3,
    name: "Branded Table Cover",
    category: "Branding",
    quantity: 30,
    available: 28,
    status: "in_stock",
    location: "Warehouse B",
  },
  {
    id: 4,
    name: "Wireless Microphone",
    category: "Audio Equipment",
    quantity: 8,
    available: 3,
    status: "low_stock",
    location: "Audio Storage",
  },
];

export default function InventoryPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage kit templates, items, and inventory tracking
          </p>
        </div>
        <Link href="/inventory/items/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              Across all categories
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">298</div>
            <p className="text-xs text-muted-foreground">
              Ready for deployment
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              Items need restocking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kit Templates</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              Configured templates
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="items" className="space-y-4">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="kits">Kit Templates</TabsTrigger>
          <TabsTrigger value="tracking">Usage Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search items..." className="pl-10" />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            {mockItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge variant="outline">{item.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Location: {item.location}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">
                          {item.available}/{item.quantity} available
                        </div>
                        <Badge
                          variant={
                            item.status === "in_stock"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="kits" className="space-y-4">
          {/* Kit Templates */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockKitTemplates.map((kit) => (
              <Card key={kit.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{kit.name}</CardTitle>
                  <CardDescription>{kit.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items:</span>
                    <span className="font-medium">{kit.itemCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{kit.category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last Used:</span>
                    <span className="font-medium">{kit.lastUsed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Badge
                      variant={
                        kit.status === "active" ? "default" : "secondary"
                      }
                    >
                      {kit.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Tracking</CardTitle>
              <CardDescription>
                Track inventory usage and deployment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Usage Analytics</h3>
                <p className="text-muted-foreground">
                  Detailed usage tracking and deployment history will be
                  displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
