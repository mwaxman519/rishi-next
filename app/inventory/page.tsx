&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Badge } from &quot;@/components/ui/badge&quot;;
import { Tabs, TabsContent, TabsList, TabsTrigger } from &quot;@/components/ui/tabs&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
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
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import Link from &quot;next/link&quot;;
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from &quot;@/components/ui/sheet&quot;;

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
    { id: &quot;brand-001&quot;, name: &quot;Elevated Essence&quot;, count: 245 },
    { id: &quot;brand-002&quot;, name: &quot;Green Valley Collective&quot;, count: 189 },
    { id: &quot;brand-003&quot;, name: &quot;Pacific Coast Cannabis&quot;, count: 342 },
    { id: &quot;brand-004&quot;, name: &quot;Mountain High Brands&quot;, count: 128 },
    { id: &quot;brand-005&quot;, name: &quot;Desert Bloom Co&quot;, count: 276 },
  ],
  states: [
    { code: &quot;CA&quot;, name: &quot;California&quot;, territories: 28, kits: 892 },
    { code: &quot;CO&quot;, name: &quot;Colorado&quot;, territories: 12, kits: 345 },
    { code: &quot;WA&quot;, name: &quot;Washington&quot;, territories: 15, kits: 423 },
    { code: &quot;OR&quot;, name: &quot;Oregon&quot;, territories: 10, kits: 287 },
    { code: &quot;NV&quot;, name: &quot;Nevada&quot;, territories: 8, kits: 198 },
  ],
  kitTemplates: [
    {
      id: &quot;KT-001&quot;,
      name: &quot;Product Demo Standard&quot;,
      brand: &quot;Elevated Essence&quot;,
      brandId: &quot;brand-001&quot;,
      activeInstances: 145,
      totalInstances: 245,
      territories: [&quot;CA-01&quot;, &quot;CA-02&quot;, &quot;CA-05&quot;, &quot;NV-01&quot;],
      componentCount: 12,
      avgRating: 4.8,
      status: &quot;active&quot;,
      lastModified: &quot;2025-01-15&quot;,
    },
    {
      id: &quot;KT-002&quot;,
      name: &quot;Trade Show Premium&quot;,
      brand: &quot;Green Valley Collective&quot;,
      brandId: &quot;brand-002&quot;,
      activeInstances: 89,
      totalInstances: 125,
      territories: [&quot;CO-01&quot;, &quot;CO-03&quot;, &quot;WA-02&quot;],
      componentCount: 25,
      avgRating: 4.6,
      status: &quot;active&quot;,
      lastModified: &quot;2025-01-12&quot;,
    },
    {
      id: &quot;KT-003&quot;,
      name: &quot;Street Team Activation&quot;,
      brand: &quot;Pacific Coast Cannabis&quot;,
      brandId: &quot;brand-003&quot;,
      activeInstances: 234,
      totalInstances: 342,
      territories: [&quot;CA-03&quot;, &quot;CA-08&quot;, &quot;OR-01&quot;, &quot;OR-02&quot;, &quot;WA-01&quot;],
      componentCount: 8,
      avgRating: 4.4,
      status: &quot;active&quot;,
      lastModified: &quot;2025-01-14&quot;,
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
    <div className=&quot;space-y-6 p-1&quot;>
      <div>
        <h3 className=&quot;text-sm font-semibold mb-3&quot;>Brand</h3>
        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
          <SelectTrigger className=&quot;w-full&quot;>
            <SelectValue placeholder=&quot;All Brands&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Brands</SelectItem>
            {inventoryData.brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name} ({brand.count})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className=&quot;text-sm font-semibold mb-3&quot;>State/Region</h3>
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className=&quot;w-full&quot;>
            <SelectValue placeholder=&quot;All States&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All States</SelectItem>
            {inventoryData.states.map((state) => (
              <SelectItem key={state.code} value={state.code}>
                {state.name} ({state.kits} kits)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className=&quot;text-sm font-semibold mb-3&quot;>Status</h3>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className=&quot;w-full&quot;>
            <SelectValue placeholder=&quot;All Status&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Status</SelectItem>
            <SelectItem value=&quot;active&quot;>Active</SelectItem>
            <SelectItem value=&quot;low_stock&quot;>Low Stock</SelectItem>
            <SelectItem value=&quot;critical&quot;>Critical</SelectItem>
            <SelectItem value=&quot;inactive&quot;>Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className=&quot;flex gap-2 pt-4&quot;>
        <Button variant=&quot;outline&quot; className=&quot;flex-1&quot; onClick={() => {
          setSelectedBrand(&quot;all&quot;);
          setSelectedState(&quot;all&quot;);
          setSelectedStatus(&quot;all&quot;);
        }}>
          Reset Filters
        </Button>
        <Button className=&quot;flex-1&quot; onClick={onClose}>
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
      case &quot;active&quot;:
        return &quot;bg-green-50 text-green-700 border-green-200&quot;;
      case &quot;low_stock&quot;:
        return &quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;;
      case &quot;critical&quot;:
        return &quot;bg-red-50 text-red-700 border-red-200&quot;;
      case &quot;inactive&quot;:
        return &quot;bg-gray-50 text-gray-700 border-gray-200&quot;;
      default:
        return &quot;bg-gray-50 text-gray-700 border-gray-200&quot;;
    }
  };

  const utilizationRate = Math.round((template.activeInstances / template.totalInstances) * 100);

  return (
    <Card className=&quot;hover:shadow-md transition-all cursor-pointer&quot;>
      <CardContent className=&quot;p-3 sm:p-4&quot;>
        <div className=&quot;space-y-3&quot;>
          {/* Header */}
          <div className=&quot;flex items-start justify-between gap-2&quot;>
            <div className=&quot;flex-1 min-w-0&quot;>
              <h3 className=&quot;font-semibold text-sm sm:text-base truncate&quot;>
                {template.name}
              </h3>
              <p className=&quot;text-xs sm:text-sm text-gray-600 truncate&quot;>
                {template.brand} • {template.id}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant=&quot;ghost&quot; size=&quot;sm&quot; className=&quot;h-8 w-8 p-0&quot;>
                  <MoreVertical className=&quot;h-4 w-4&quot; />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align=&quot;end&quot;>
                <DropdownMenuItem>
                  <Eye className=&quot;w-4 h-4 mr-2&quot; />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className=&quot;w-4 h-4 mr-2&quot; />
                  Edit Template
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className=&quot;w-4 h-4 mr-2&quot; />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <QrCode className=&quot;w-4 h-4 mr-2&quot; />
                  Generate QR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Grid */}
          <div className=&quot;grid grid-cols-2 gap-2 text-xs sm:text-sm&quot;>
            <div>
              <span className=&quot;text-gray-600&quot;>Active/Total</span>
              <p className=&quot;font-semibold&quot;>
                {template.activeInstances}/{template.totalInstances}
              </p>
            </div>
            <div>
              <span className=&quot;text-gray-600&quot;>Utilization</span>
              <p className=&quot;font-semibold&quot;>{utilizationRate}%</p>
            </div>
          </div>

          {/* Utilization bar */}
          <div className=&quot;w-full bg-gray-200 rounded-full h-1.5&quot;>
            <div
              className={`h-1.5 rounded-full transition-all ${
                utilizationRate > 80 ? &quot;bg-green-500&quot; : 
                utilizationRate > 50 ? &quot;bg-yellow-500&quot; : &quot;bg-red-500&quot;
              }`}
              style={{ width: `${utilizationRate}%` }}
            />
          </div>

          {/* Territories */}
          <div className=&quot;flex items-center gap-2 flex-wrap&quot;>
            <MapPin className=&quot;w-3 h-3 text-gray-500&quot; />
            <div className=&quot;flex gap-1 flex-wrap&quot;>
              {template.territories.slice(0, 3).map((territory) => (
                <Badge key={territory} variant=&quot;outline&quot; className=&quot;text-xs px-1.5 py-0&quot;>
                  {territory}
                </Badge>
              ))}
              {template.territories.length > 3 && (
                <Badge variant=&quot;outline&quot; className=&quot;text-xs px-1.5 py-0&quot;>
                  +{template.territories.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className=&quot;flex items-center justify-between pt-2 border-t&quot;>
            <div className=&quot;flex items-center gap-1&quot;>
              <Box className=&quot;w-3 h-3 text-gray-500&quot; />
              <span className=&quot;text-xs text-gray-600&quot;>{template.componentCount} items</span>
            </div>
            <div className=&quot;flex items-center gap-1&quot;>
              <span className=&quot;text-xs text-yellow-600&quot;>★</span>
              <span className=&quot;text-xs font-semibold&quot;>{template.avgRating}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InventoryPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [activeTab, setActiveTab] = useState(&quot;templates&quot;);
  const [selectedBrand, setSelectedBrand] = useState(&quot;all&quot;);
  const [selectedState, setSelectedState] = useState(&quot;all&quot;);
  const [selectedStatus, setSelectedStatus] = useState(&quot;all&quot;);
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();

  const filteredTemplates = inventoryData.kitTemplates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand =
      selectedBrand === &quot;all&quot; || template.brandId === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const activeFilters = [
    selectedBrand !== &quot;all&quot; && selectedBrand,
    selectedState !== &quot;all&quot; && selectedState,
    selectedStatus !== &quot;all&quot; && selectedStatus,
  ].filter(Boolean).length;

  return (
    <div className=&quot;min-h-screen bg-gray-50&quot;>
      {/* Mobile-first header */}
      <div className=&quot;sticky top-0 z-20 bg-white border-b&quot;>
        <div className=&quot;px-4 py-3&quot;>
          <div className=&quot;flex items-center justify-between mb-3&quot;>
            <h1 className=&quot;text-lg sm:text-xl font-bold&quot;>Inventory</h1>
            <Button size=&quot;sm&quot; className=&quot;h-8&quot;>
              <Plus className=&quot;w-4 h-4 sm:mr-2&quot; />
              <span className=&quot;hidden sm:inline&quot;>New Kit</span>
            </Button>
          </div>

          {/* Search bar with filter button */}
          <div className=&quot;flex gap-2&quot;>
            <div className=&quot;relative flex-1&quot;>
              <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4&quot; />
              <Input
                placeholder=&quot;Search kits, brands, territories...&quot;
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className=&quot;pl-9 pr-3 h-9&quot;
              />
            </div>
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;h-9 px-3 relative&quot;>
                  <Filter className=&quot;w-4 h-4&quot; />
                  {activeFilters > 0 && (
                    <Badge className=&quot;absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-purple-600&quot;>
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side=&quot;right&quot; className=&quot;w-[300px] sm:w-[400px]&quot;>
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
        <div className=&quot;px-4 pb-3 overflow-x-auto&quot;>
          <div className=&quot;flex gap-3 min-w-max&quot;>
            <div className=&quot;bg-purple-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-purple-600&quot;>Templates</p>
              <p className=&quot;text-lg font-bold text-purple-900&quot;>{inventoryData.stats.totalKitTemplates}</p>
            </div>
            <div className=&quot;bg-green-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-green-600&quot;>Active Kits</p>
              <p className=&quot;text-lg font-bold text-green-900&quot;>{inventoryData.stats.activeInstances.toLocaleString()}</p>
            </div>
            <div className=&quot;bg-yellow-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-yellow-600&quot;>Brands</p>
              <p className=&quot;text-lg font-bold text-yellow-900&quot;>{inventoryData.stats.totalBrands}</p>
            </div>
            <div className=&quot;bg-red-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-red-600&quot;>Alerts</p>
              <p className=&quot;text-lg font-bold text-red-900&quot;>{inventoryData.stats.criticalAlerts}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className=&quot;w-full justify-start rounded-none border-t h-10 p-0&quot;>
            <TabsTrigger value=&quot;templates&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Templates
            </TabsTrigger>
            <TabsTrigger value=&quot;instances&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Active
            </TabsTrigger>
            <TabsTrigger value=&quot;stock&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Stock
            </TabsTrigger>
            <TabsTrigger value=&quot;analytics&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className=&quot;p-4&quot;>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value=&quot;templates&quot; className=&quot;mt-0 space-y-4&quot;>
            {/* Quick actions for mobile */}
            <div className=&quot;grid grid-cols-2 gap-2 sm:hidden&quot;>
              <Link href=&quot;/inventory/templates/new&quot;>
                <Button variant=&quot;outline&quot; className=&quot;w-full h-auto py-3&quot;>
                  <Plus className=&quot;w-4 h-4 mb-1&quot; />
                  <span className=&quot;block text-xs&quot;>Create Template</span>
                </Button>
              </Link>
              <Link href=&quot;/inventory/bulk-import&quot;>
                <Button variant=&quot;outline&quot; className=&quot;w-full h-auto py-3&quot;>
                  <Archive className=&quot;w-4 h-4 mb-1&quot; />
                  <span className=&quot;block text-xs&quot;>Bulk Import</span>
                </Button>
              </Link>
            </div>

            {/* Template grid */}
            <div className=&quot;grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4&quot;>
              {filteredTemplates.map((template) => (
                <KitTemplateCard key={template.id} template={template} isMobile={true} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value=&quot;instances&quot; className=&quot;mt-0 space-y-4&quot;>
            <Link href=&quot;/inventory/kit-instances&quot;>
              <Card className=&quot;hover:shadow-md transition-all cursor-pointer&quot;>
                <CardContent className=&quot;p-4&quot;>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;flex items-center gap-3&quot;>
                      <div className=&quot;w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center&quot;>
                        <Package className=&quot;w-5 h-5 text-purple-600&quot; />
                      </div>
                      <div>
                        <h3 className=&quot;font-semibold text-sm&quot;>Active Kit Instances</h3>
                        <p className=&quot;text-xs text-gray-600&quot;>{inventoryData.stats.activeInstances.toLocaleString()} kits deployed</p>
                      </div>
                    </div>
                    <ChevronRight className=&quot;w-5 h-5 text-gray-400&quot; />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </TabsContent>

          <TabsContent value=&quot;stock&quot; className=&quot;mt-0 space-y-4&quot;>
            <Link href=&quot;/inventory/stock&quot;>
              <Card className=&quot;hover:shadow-md transition-all cursor-pointer&quot;>
                <CardContent className=&quot;p-4&quot;>
                  <div className=&quot;flex items-center justify-between&quot;>
                    <div className=&quot;flex items-center gap-3&quot;>
                      <div className=&quot;w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center&quot;>
                        <Users className=&quot;w-5 h-5 text-green-600&quot; />
                      </div>
                      <div>
                        <h3 className=&quot;font-semibold text-sm&quot;>Stock Management</h3>
                        <p className=&quot;text-xs text-gray-600&quot;>Track items assigned to agents</p>
                      </div>
                    </div>
                    <ChevronRight className=&quot;w-5 h-5 text-gray-400&quot; />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </TabsContent>

          <TabsContent value=&quot;analytics&quot; className=&quot;mt-0 space-y-4&quot;>
            <div className=&quot;grid gap-3&quot;>
              {/* Territory heat map preview */}
              <Card>
                <CardHeader className=&quot;pb-3&quot;>
                  <CardTitle className=&quot;text-base&quot;>Territory Coverage</CardTitle>
                  <CardDescription className=&quot;text-xs&quot;>Kit distribution across {inventoryData.stats.totalStates} states</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className=&quot;space-y-2&quot;>
                    {inventoryData.states.slice(0, 3).map((state) => (
                      <div key={state.code} className=&quot;flex items-center justify-between&quot;>
                        <div className=&quot;flex items-center gap-2&quot;>
                          <MapPin className=&quot;w-3 h-3 text-gray-500&quot; />
                          <span className=&quot;text-sm font-medium&quot;>{state.name}</span>
                        </div>
                        <div className=&quot;flex items-center gap-2&quot;>
                          <div className=&quot;w-24 bg-gray-200 rounded-full h-2&quot;>
                            <div
                              className=&quot;h-2 bg-purple-500 rounded-full&quot;
                              style={{ width: `${(state.kits / 1000) * 100}%` }}
                            />
                          </div>
                          <span className=&quot;text-xs text-gray-600 min-w-[40px] text-right&quot;>{state.kits}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot; className=&quot;w-full mt-3&quot;>
                    <BarChart3 className=&quot;w-4 h-4 mr-2" />
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