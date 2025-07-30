&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { ArrowLeft, Package, Upload, Barcode } from &quot;lucide-react&quot;;
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
import { Switch } from &quot;@/components/ui/switch&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

export default function AddItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackInventory, setTrackInventory] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: &quot;Item Added Successfully&quot;,
        description: &quot;The new item has been added to the inventory system.&quot;,
      });
      router.push(&quot;/inventory/items&quot;);
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
          Back to Items
        </Button>
      </div>

      <div className=&quot;max-w-2xl mx-auto&quot;>
        <Card>
          <CardHeader>
            <CardTitle className=&quot;flex items-center&quot;>
              <Package className=&quot;h-5 w-5 mr-2&quot; />
              Add New Item
            </CardTitle>
            <CardDescription>
              Add a new item to the inventory system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=&quot;space-y-6&quot;>
              {/* Basic Information */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Basic Information</h3>
                
                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;itemName&quot;>Item Name</Label>
                  <Input id=&quot;itemName&quot; placeholder=&quot;Enter item name&quot; required />
                </div>

                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;category&quot;>Category</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select category&quot; />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;display&quot;>Display Equipment</SelectItem>
                        <SelectItem value=&quot;technology&quot;>Technology</SelectItem>
                        <SelectItem value=&quot;marketing&quot;>Marketing Materials</SelectItem>
                        <SelectItem value=&quot;products&quot;>Product Samples</SelectItem>
                        <SelectItem value=&quot;furniture&quot;>Furniture</SelectItem>
                        <SelectItem value=&quot;accessories&quot;>Accessories</SelectItem>
                        <SelectItem value=&quot;consumables&quot;>Consumables</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;brand&quot;>Brand/Manufacturer</Label>
                    <Input id=&quot;brand&quot; placeholder=&quot;Enter brand name&quot; />
                  </div>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;description&quot;>Description</Label>
                  <Textarea
                    id=&quot;description&quot;
                    placeholder=&quot;Detailed description of the item...&quot;
                    rows={3}
                  />
                </div>
              </div>

              {/* Inventory Details */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Inventory Details</h3>
                
                <div className=&quot;flex items-center justify-between&quot;>
                  <div className=&quot;space-y-0.5&quot;>
                    <Label>Track Inventory</Label>
                    <div className=&quot;text-sm text-muted-foreground&quot;>
                      Enable quantity tracking for this item
                    </div>
                  </div>
                  <Switch
                    checked={trackInventory}
                    onCheckedChange={setTrackInventory}
                  />
                </div>

                {trackInventory && (
                  <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;quantity&quot;>Initial Quantity</Label>
                      <Input
                        id=&quot;quantity&quot;
                        type=&quot;number&quot;
                        min=&quot;0&quot;
                        placeholder=&quot;0&quot;
                        required={trackInventory}
                      />
                    </div>
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;minStock&quot;>Minimum Stock</Label>
                      <Input
                        id=&quot;minStock&quot;
                        type=&quot;number&quot;
                        min=&quot;0&quot;
                        placeholder=&quot;0&quot;
                      />
                    </div>
                    <div className=&quot;space-y-2&quot;>
                      <Label htmlFor=&quot;maxStock&quot;>Maximum Stock</Label>
                      <Input
                        id=&quot;maxStock&quot;
                        type=&quot;number&quot;
                        min=&quot;0&quot;
                        placeholder=&quot;100&quot;
                      />
                    </div>
                  </div>
                )}

                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;location&quot;>Storage Location</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select location&quot; />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=&quot;warehouse-a&quot;>Warehouse A</SelectItem>
                        <SelectItem value=&quot;warehouse-b&quot;>Warehouse B</SelectItem>
                        <SelectItem value=&quot;tech-storage&quot;>Tech Storage</SelectItem>
                        <SelectItem value=&quot;office&quot;>Office Storage</SelectItem>
                        <SelectItem value=&quot;mobile&quot;>Mobile Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;sku&quot;>SKU/Barcode</Label>
                    <div className=&quot;relative&quot;>
                      <Barcode className=&quot;absolute left-3 top-3 h-4 w-4 text-muted-foreground&quot; />
                      <Input
                        id=&quot;sku&quot;
                        placeholder=&quot;Enter SKU or scan barcode&quot;
                        className=&quot;pl-10&quot;
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Additional Details</h3>
                
                <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;cost&quot;>Unit Cost</Label>
                    <div className=&quot;relative&quot;>
                      <span className=&quot;absolute left-3 top-3 text-sm text-muted-foreground&quot;>$</span>
                      <Input
                        id=&quot;cost&quot;
                        type=&quot;number&quot;
                        step=&quot;0.01&quot;
                        min=&quot;0&quot;
                        placeholder=&quot;0.00&quot;
                        className=&quot;pl-7&quot;
                      />
                    </div>
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;weight&quot;>Weight (lbs)</Label>
                    <Input
                      id=&quot;weight&quot;
                      type=&quot;number&quot;
                      step=&quot;0.1&quot;
                      min=&quot;0&quot;
                      placeholder=&quot;0.0&quot;
                    />
                  </div>
                </div>

                <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;length&quot;>Length (in)</Label>
                    <Input
                      id=&quot;length&quot;
                      type=&quot;number&quot;
                      step=&quot;0.1&quot;
                      min=&quot;0&quot;
                      placeholder=&quot;0.0&quot;
                    />
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;width&quot;>Width (in)</Label>
                    <Input
                      id=&quot;width&quot;
                      type=&quot;number&quot;
                      step=&quot;0.1&quot;
                      min=&quot;0&quot;
                      placeholder=&quot;0.0&quot;
                    />
                  </div>
                  <div className=&quot;space-y-2&quot;>
                    <Label htmlFor=&quot;height&quot;>Height (in)</Label>
                    <Input
                      id=&quot;height&quot;
                      type=&quot;number&quot;
                      step=&quot;0.1&quot;
                      min=&quot;0&quot;
                      placeholder=&quot;0.0&quot;
                    />
                  </div>
                </div>

                <div className=&quot;space-y-2&quot;>
                  <Label htmlFor=&quot;notes&quot;>Notes</Label>
                  <Textarea
                    id=&quot;notes&quot;
                    placeholder=&quot;Additional notes about this item...&quot;
                    rows={3}
                  />
                </div>
              </div>

              {/* Photo Upload */}
              <div className=&quot;space-y-4&quot;>
                <h3 className=&quot;text-lg font-medium&quot;>Item Photo</h3>
                <div className=&quot;border-2 border-dashed border-muted-foreground/25 rounded-lg p-6&quot;>
                  <div className=&quot;flex flex-col items-center text-center&quot;>
                    <Upload className=&quot;h-10 w-10 text-muted-foreground mb-2&quot; />
                    <div className=&quot;text-sm font-medium&quot;>Upload item photo</div>
                    <div className=&quot;text-xs text-muted-foreground&quot;>
                      Drag and drop or click to browse
                    </div>
                    <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;mt-2&quot;>
                      Choose File
                    </Button>
                  </div>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? &quot;Adding...&quot; : &quot;Add Item&quot;}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}