&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { ArrowLeft, Package, Plus, Trash2, Search } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from &quot;@/components/ui/table&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

// Mock inventory items
const mockInventoryItems = [
  { id: 1, name: &quot;Portable Display Stand&quot;, category: &quot;Display&quot;, inStock: 25 },
  { id: 2, name: &quot;iPad Air&quot;, category: &quot;Technology&quot;, inStock: 15 },
  { id: 3, name: &quot;Promotional Banner&quot;, category: &quot;Marketing&quot;, inStock: 30 },
  { id: 4, name: &quot;Demo Product Samples&quot;, category: &quot;Products&quot;, inStock: 100 },
  { id: 5, name: &quot;Branded Tablecloth&quot;, category: &quot;Display&quot;, inStock: 12 },
  { id: 6, name: &quot;Power Bank&quot;, category: &quot;Technology&quot;, inStock: 20 },
];

export default function DeployNewKitPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("&quot;);

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
        title: &quot;Kit Deployed Successfully&quot;,
        description: &quot;The new kit has been created and deployed to the field.&quot;,
      });
      router.push(&quot;/inventory/kit-instances&quot;);
    }, 1500);
  };

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center space-x-4&quot;>
        <Button
          variant=&quot;ghost&quot;
          size=&quot;sm&quot;
          onClick={() => router.back()}
        >
          <ArrowLeft className=&quot;h-4 w-4 mr-2&quot; />
          Back to Inventory
        </Button>
      </div>

      <div className=&quot;max-w-4xl mx-auto&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Package className=&quot;h-5 w-5 mr-2&quot; />
              Deploy New Kit
            </CardTitle>
            <CardDescription>
              Create and deploy a new kit instance for field operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=&quot;space-y-6&quot;>
              {/* Kit Information */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Kit Information</h3>
                
                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;kitName&quot;>Kit Name</Label>
                    <Input id=&quot;kitName&quot; placeholder=&quot;Enter kit name&quot; required />
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;template&quot;>Base Template</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select template&quot; />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;demo&quot;>Product Demo Kit</SelectItem>
                        <SelectItem value=&quot;activation&quot;>Brand Activation Setup</SelectItem>
                        <SelectItem value=&quot;trade&quot;>Trade Show Package</SelectItem>
                        <SelectItem value=&quot;custom&quot;>Custom Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;assignee&quot;>Assigned To</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select staff member&quot; />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;sarah&quot;>Sarah Johnson</SelectItem>
                        <SelectItem value=&quot;mike&quot;>Mike Chen</SelectItem>
                        <SelectItem value=&quot;jessica&quot;>Jessica Smith</SelectItem>
                        <SelectItem value=&quot;alex&quot;>Alex Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;deployDate&quot;>Deployment Date</Label>
                    <Input id=&quot;deployDate&quot; type=&quot;date&quot; required />
                  </div>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;description&quot;>Description</Label>
                  <Textarea
                    id=&quot;description&quot;
                    placeholder=&quot;Brief description of the kit purpose...&quot;
                    rows={3}
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Kit Contents</h3>
                
                <div className=&quot;space-y-4&quot;>
                  <div className=&quot;flex items-center space-x-2&quot;>
                    <Search className=&quot;h-4 w-4 text-muted-foreground&quot; />
                    <Input
                      placeholder=&quot;Search inventory items...&quot;
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className=&quot;max-w-sm&quot;
                    />
                  </div>

                  {/* Available Items */}
                  <Card>
                    <CardHeader>
                      <CardTitle className=&quot;text-base&quot;>Available Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2&quot;>
                        {filteredItems.map(item => (
                          <div
                            key={item.id}
                            className=&quot;flex items-center justify-between p-2 border rounded hover:bg-gray-50&quot;
                          >
                            <div className=&quot;flex-1&quot;>
                              <div className=&quot;text-sm font-medium&quot;>{item.name}</div>
                              <div className=&quot;text-xs text-muted-foreground&quot;>
                                {item.category} • {item.inStock} in stock
                              </div>
                            </div>
                            <Button
                              type=&quot;button&quot;
                              size=&quot;sm&quot;
                              variant=&quot;outline&quot;
                              onClick={() => addItemToKit(item)}
                            >
                              <Plus className=&quot;h-3 w-3&quot; />
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
                        <CardTitle className=&quot;text-base&quot;>Kit Contents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Item</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className=&quot;w-24&quot;>Quantity</TableHead>
                              <TableHead className=&quot;w-16&quot;>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {selectedItems.map(item => (
                              <TableRow key={item.id}>
                                <TableCell>{item.name}</TableCell>
                                <TableCell>
                                  <Badge variant=&quot;outline&quot;>{item.category}</Badge>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type=&quot;number&quot;
                                    min=&quot;1&quot;
                                    max={item.inStock}
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                                    className=&quot;w-16&quot;
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    type=&quot;button&quot;
                                    size=&quot;sm&quot;
                                    variant=&quot;ghost&quot;
                                    onClick={() => removeItemFromKit(item.id)}
                                  >
                                    <Trash2 className=&quot;h-4 w-4&quot; />
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
              <div className=&quot;flex gap-4 pt-6&quot;>
                <Button
                  type=&quot;button&quot;
                  variant=&quot;outline&quot;
                  className=&quot;flex-1&quot;
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type=&quot;submit&quot;
                  className=&quot;flex-1&quot;
                  disabled={isSubmitting || selectedItems.length === 0}
                >
                  {isSubmitting ? &quot;Deploying...&quot; : &quot;Deploy Kit"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}