"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Plus, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock inventory items
const mockInventoryItems = [
  { id: 1, name: "Portable Display Stand", category: "Display", inStock: 25 },
  { id: 2, name: "iPad Air", category: "Technology", inStock: 15 },
  { id: 3, name: "Promotional Banner", category: "Marketing", inStock: 30 },
  { id: 4, name: "Demo Product Samples", category: "Products", inStock: 100 },
  { id: 5, name: "Branded Tablecloth", category: "Display", inStock: 12 },
  { id: 6, name: "Power Bank", category: "Technology", inStock: 20 },
];

export default function DeployNewKitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = mockInventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addItemToKit = (item) => {
    const existingItem = selectedItems.find(selected => selected.id === item.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(selected =>
        selected.id === item.id
          ? { ...selected, quantity: selected.quantity + 1 }
          : selected
      ));
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const removeItemFromKit = (itemId) => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId));
  };

  const updateItemQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItemFromKit(itemId);
      return;
    }
    setSelectedItems(selectedItems.map(item =>
      item.id === itemId ? { ...item, quantity: parseInt(quantity) } : item
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate kit deployment
    setTimeout(() => {
      toast({
        title: "Kit Deployed Successfully",
        description: "The new kit has been created and deployed to the field.",
      });
      router.push("/inventory/kit-instances");
    }, 1500);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Inventory
        </Button>
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Deploy New Kit
            </CardTitle>
            <CardDescription>
              Create and deploy a new kit instance for field operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Kit Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Kit Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kitName">Kit Name</Label>
                    <Input id="kitName" placeholder="Enter kit name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template">Base Template</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="demo">Product Demo Kit</SelectItem>
                        <SelectItem value="activation">Brand Activation Setup</SelectItem>
                        <SelectItem value="trade">Trade Show Package</SelectItem>
                        <SelectItem value="custom">Custom Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignee">Assigned To</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select staff member" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sarah">Sarah Johnson</SelectItem>
                        <SelectItem value="mike">Mike Chen</SelectItem>
                        <SelectItem value="jessica">Jessica Smith</SelectItem>
                        <SelectItem value="alex">Alex Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deployDate">Deployment Date</Label>
                    <Input id="deployDate" type="date" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the kit purpose..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Kit Contents</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search inventory items..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>

                  {/* Available Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Available Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {filteredItems.map(item => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {item.category} • {item.inStock} in stock
                              </div>
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => addItemToKit(item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Selected Items */}
                  {selectedItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Kit Contents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className="w-24">Quantity</TableHead>
                              <TableHead className="w-16">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedItems.map(item => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">{item.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.inStock}
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                                    className="w-16"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeItemFromKit(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || selectedItems.length === 0}
                >
                  {isSubmitting ? "Deploying..." : "Deploy Kit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}