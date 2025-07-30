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
  Users,
  AlertTriangle,
  CheckCircle,
  Box,
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  UserCheck,
  UserX,
  ArrowUpDown,
  Truck,
  QrCode,
  BarChart3,
  Wrench,
  ChevronRight,
  ScanLine,
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

// Scalable stock data for hundreds of items across states/territories
const stockData = {
  stats: {
    totalItems: 4286,
    assignedItems: 3842,
    availableItems: 380,
    itemsForRepair: 64,
    totalAgents: 423,
    agentsWithoutItems: 18,
    criticalLowStock: 12,
    territories: 87,
  },
  territories: [
    { code: &quot;CA-01&quot;, name: &quot;Northern California&quot;, agents: 45, items: 523 },
    { code: &quot;CA-02&quot;, name: &quot;Bay Area&quot;, agents: 62, items: 742 },
    { code: &quot;CA-03&quot;, name: &quot;Southern California&quot;, agents: 58, items: 689 },
    { code: &quot;CO-01&quot;, name: &quot;Denver Metro&quot;, agents: 38, items: 412 },
    { code: &quot;WA-01&quot;, name: &quot;Seattle Region&quot;, agents: 41, items: 487 },
  ],
  itemTypes: [
    { type: &quot;Folding Table&quot;, total: 892, assigned: 821, available: 71 },
    { type: &quot;Storage Tote&quot;, total: 1243, assigned: 1189, available: 54 },
    { type: &quot;Tablecloth&quot;, total: 756, assigned: 692, available: 64 },
    { type: &quot;Display Stand&quot;, total: 434, assigned: 398, available: 36 },
    { type: &quot;Banner Stand&quot;, total: 523, assigned: 487, available: 36 },
  ],
  stockItems: [
    {
      id: &quot;SI-001&quot;,
      serialNumber: &quot;TBL-CA01-2024-001&quot;,
      itemType: &quot;Folding Table&quot;,
      category: &quot;Furniture&quot;,
      assignedTo: &quot;Sarah Johnson&quot;,
      agentId: &quot;BA-CA01-045&quot;,
      territory: &quot;CA-01&quot;,
      brand: &quot;Elevated Essence&quot;,
      status: &quot;assigned&quot;,
      condition: &quot;good&quot;,
      lastScan: &quot;2025-01-17T14:30:00Z&quot;,
      location: { lat: 37.7749, lng: -122.4194 },
    },
    {
      id: &quot;SI-002&quot;,
      serialNumber: &quot;TOTE-CA02-2024-015&quot;,
      itemType: &quot;Storage Tote&quot;,
      category: &quot;Storage&quot;,
      assignedTo: &quot;Mike Chen&quot;,
      agentId: &quot;BA-CA02-022&quot;,
      territory: &quot;CA-02&quot;,
      brand: &quot;Green Valley Collective&quot;,
      status: &quot;assigned&quot;,
      condition: &quot;excellent&quot;,
      lastScan: &quot;2025-01-17T09:15:00Z&quot;,
      location: { lat: 37.3382, lng: -121.8863 },
    },
    // More items would be loaded dynamically
  ],
};

// Mobile-optimized filter sheet
const StockFilterSheet = ({ 
  selectedTerritory, 
  setSelectedTerritory, 
  selectedItemType, 
  setSelectedItemType,
  selectedStatus,
  setSelectedStatus,
  selectedCondition,
  setSelectedCondition,
  onClose
}) => {
  return (
    <div className=&quot;space-y-6 p-1&quot;>
      <div>
        <h3 className=&quot;text-sm font-semibold mb-3&quot;>Territory</h3>
        <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
          <SelectTrigger className=&quot;w-full&quot;>
            <SelectValue placeholder=&quot;All Territories&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Territories ({stockData.stats.territories})</SelectItem>
            {stockData.territories.map((territory) => (
              <SelectItem key={territory.code} value={territory.code}>
                {territory.name} ({territory.items} items)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className=&quot;text-sm font-semibold mb-3&quot;>Item Type</h3>
        <Select value={selectedItemType} onValueChange={setSelectedItemType}>
          <SelectTrigger className=&quot;w-full&quot;>
            <SelectValue placeholder=&quot;All Types&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Item Types</SelectItem>
            {stockData.itemTypes.map((type) => (
              <SelectItem key={type.type} value={type.type}>
                {type.type} ({type.total})
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
            <SelectItem value=&quot;assigned&quot;>Assigned</SelectItem>
            <SelectItem value=&quot;available&quot;>Available</SelectItem>
            <SelectItem value=&quot;in_transit&quot;>In Transit</SelectItem>
            <SelectItem value=&quot;missing&quot;>Missing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h3 className=&quot;text-sm font-semibold mb-3&quot;>Condition</h3>
        <Select value={selectedCondition} onValueChange={setSelectedCondition}>
          <SelectTrigger className=&quot;w-full&quot;>
            <SelectValue placeholder=&quot;All Conditions&quot; />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=&quot;all&quot;>All Conditions</SelectItem>
            <SelectItem value=&quot;excellent&quot;>Excellent</SelectItem>
            <SelectItem value=&quot;good&quot;>Good</SelectItem>
            <SelectItem value=&quot;fair&quot;>Fair</SelectItem>
            <SelectItem value=&quot;repair_needed&quot;>Needs Repair</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className=&quot;flex gap-2 pt-4&quot;>
        <Button variant=&quot;outline&quot; className=&quot;flex-1&quot; onClick={() => {
          setSelectedTerritory(&quot;all&quot;);
          setSelectedItemType(&quot;all&quot;);
          setSelectedStatus(&quot;all&quot;);
          setSelectedCondition(&quot;all&quot;);
        }}>
          Reset
        </Button>
        <Button className=&quot;flex-1&quot; onClick={onClose}>
          Apply
        </Button>
      </div>
    </div>
  );
};

// Mobile-optimized stock item card
const StockItemCard = ({ item }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case &quot;assigned&quot;:
        return &quot;bg-green-50 text-green-700 border-green-200&quot;;
      case &quot;available&quot;:
        return &quot;bg-purple-50 text-purple-700 border-purple-200&quot;;
      case &quot;in_transit&quot;:
        return &quot;bg-yellow-50 text-yellow-700 border-yellow-200&quot;;
      case &quot;missing&quot;:
        return &quot;bg-red-50 text-red-700 border-red-200&quot;;
      default:
        return &quot;bg-gray-50 text-gray-700 border-gray-200&quot;;
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case &quot;excellent&quot;:
        return <CheckCircle className=&quot;w-3 h-3 text-green-600&quot; />;
      case &quot;good&quot;:
        return <CheckCircle className=&quot;w-3 h-3 text-purple-600&quot; />;
      case &quot;fair&quot;:
        return <AlertTriangle className=&quot;w-3 h-3 text-yellow-600&quot; />;
      case &quot;repair_needed&quot;:
        return <Wrench className=&quot;w-3 h-3 text-red-600&quot; />;
      default:
        return null;
    }
  };

  const timeSinceLastScan = () => {
    const lastScan = new Date(item.lastScan);
    const now = new Date();
    const hours = Math.floor((now - lastScan) / (1000 * 60 * 60));
    if (hours < 1) return &quot;Just now&quot;;
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <Card className=&quot;hover:shadow-md transition-all cursor-pointer&quot;>
      <CardContent className=&quot;p-3&quot;>
        <div className=&quot;space-y-3&quot;>
          {/* Header */}
          <div className=&quot;flex items-start justify-between gap-2&quot;>
            <div className=&quot;flex-1 min-w-0&quot;>
              <div className=&quot;flex items-center gap-2&quot;>
                <h3 className=&quot;font-semibold text-sm truncate&quot;>
                  {item.itemType}
                </h3>
                {getConditionIcon(item.condition)}
              </div>
              <p className=&quot;text-xs text-gray-600 font-mono&quot;>
                {item.serialNumber}
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
                  <QrCode className=&quot;w-4 h-4 mr-2&quot; />
                  Scan QR
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className=&quot;w-4 h-4 mr-2&quot; />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserCheck className=&quot;w-4 h-4 mr-2&quot; />
                  Reassign
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <MapPin className=&quot;w-4 h-4 mr-2&quot; />
                  Track
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Assignment info */}
          <div className=&quot;space-y-1&quot;>
            {item.assignedTo ? (
              <div className=&quot;flex items-center gap-2 text-xs&quot;>
                <Users className=&quot;w-3 h-3 text-gray-500&quot; />
                <span className=&quot;font-medium&quot;>{item.assignedTo}</span>
                <span className=&quot;text-gray-500&quot;>({item.agentId})</span>
              </div>
            ) : (
              <div className=&quot;flex items-center gap-2 text-xs text-gray-500&quot;>
                <Users className=&quot;w-3 h-3&quot; />
                <span>Unassigned</span>
              </div>
            )}
            <div className=&quot;flex items-center gap-2 text-xs&quot;>
              <MapPin className=&quot;w-3 h-3 text-gray-500&quot; />
              <span>{item.territory} • {item.brand}</span>
            </div>
          </div>

          {/* Status and scan info */}
          <div className=&quot;flex items-center justify-between pt-2 border-t&quot;>
            <Badge className={`${getStatusColor(item.status)} border text-xs`}>
              {item.status.replace(&quot;_&quot;, &quot; &quot;)}
            </Badge>
            <div className=&quot;flex items-center gap-1 text-xs text-gray-500&quot;>
              <ScanLine className=&quot;w-3 h-3&quot; />
              <span>{timeSinceLastScan()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Territory summary card
const TerritorySummaryCard = ({ territory }) => {
  const utilizationRate = Math.round((territory.items / (territory.agents * 15)) * 100);
  
  return (
    <Card className=&quot;hover:shadow-md transition-all&quot;>
      <CardContent className=&quot;p-4&quot;>
        <div className=&quot;space-y-3&quot;>
          <div className=&quot;flex items-start justify-between&quot;>
            <div>
              <h3 className=&quot;font-semibold text-sm&quot;>{territory.name}</h3>
              <p className=&quot;text-xs text-gray-600&quot;>{territory.code}</p>
            </div>
            <ChevronRight className=&quot;w-4 h-4 text-gray-400&quot; />
          </div>

          <div className=&quot;grid grid-cols-2 gap-3&quot;>
            <div>
              <p className=&quot;text-xs text-gray-600&quot;>Agents</p>
              <p className=&quot;text-lg font-bold&quot;>{territory.agents}</p>
            </div>
            <div>
              <p className=&quot;text-xs text-gray-600&quot;>Items</p>
              <p className=&quot;text-lg font-bold&quot;>{territory.items}</p>
            </div>
          </div>

          <div>
            <div className=&quot;flex items-center justify-between text-xs mb-1&quot;>
              <span className=&quot;text-gray-600&quot;>Utilization</span>
              <span className=&quot;font-medium&quot;>{utilizationRate}%</span>
            </div>
            <div className=&quot;w-full bg-gray-200 rounded-full h-1.5&quot;>
              <div
                className={`h-1.5 rounded-full ${
                  utilizationRate > 80 ? &quot;bg-green-500&quot; : 
                  utilizationRate > 50 ? &quot;bg-yellow-500&quot; : &quot;bg-red-500&quot;
                }`}
                style={{ width: `${utilizationRate}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function StockManagementPage() {
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [activeTab, setActiveTab] = useState(&quot;items&quot;);
  const [selectedTerritory, setSelectedTerritory] = useState(&quot;all&quot;);
  const [selectedItemType, setSelectedItemType] = useState(&quot;all&quot;);
  const [selectedStatus, setSelectedStatus] = useState(&quot;all&quot;);
  const [selectedCondition, setSelectedCondition] = useState(&quot;all&quot;);
  const [filterOpen, setFilterOpen] = useState(false);
  const { toast } = useToast();

  const activeFilters = [
    selectedTerritory !== &quot;all&quot; && selectedTerritory,
    selectedItemType !== &quot;all&quot; && selectedItemType,
    selectedStatus !== &quot;all&quot; && selectedStatus,
    selectedCondition !== &quot;all&quot; && selectedCondition,
  ].filter(Boolean).length;

  return (
    <div className=&quot;min-h-screen bg-gray-50&quot;>
      {/* Mobile-first sticky header */}
      <div className=&quot;sticky top-0 z-20 bg-white border-b&quot;>
        <div className=&quot;px-4 py-3&quot;>
          <div className=&quot;flex items-center justify-between mb-3&quot;>
            <h1 className=&quot;text-lg sm:text-xl font-bold&quot;>Stock Management</h1>
            <div className=&quot;flex gap-2&quot;>
              <Button size=&quot;sm&quot; variant=&quot;outline&quot; className=&quot;h-8&quot;>
                <ScanLine className=&quot;w-4 h-4 sm:mr-2&quot; />
                <span className=&quot;hidden sm:inline&quot;>Scan</span>
              </Button>
              <Button size=&quot;sm&quot; className=&quot;h-8&quot;>
                <Plus className=&quot;w-4 h-4 sm:mr-2&quot; />
                <span className=&quot;hidden sm:inline&quot;>Add Item</span>
              </Button>
            </div>
          </div>

          {/* Search and filter */}
          <div className=&quot;flex gap-2&quot;>
            <div className=&quot;relative flex-1&quot;>
              <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4&quot; />
              <Input
                placeholder=&quot;Search serial, agent, territory...&quot;
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
                    Filter stock across territories
                  </SheetDescription>
                </SheetHeader>
                <StockFilterSheet
                  selectedTerritory={selectedTerritory}
                  setSelectedTerritory={setSelectedTerritory}
                  selectedItemType={selectedItemType}
                  setSelectedItemType={setSelectedItemType}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedCondition={selectedCondition}
                  setSelectedCondition={setSelectedCondition}
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
              <p className=&quot;text-xs text-purple-600&quot;>Total Items</p>
              <p className=&quot;text-lg font-bold text-purple-900&quot;>{stockData.stats.totalItems.toLocaleString()}</p>
            </div>
            <div className=&quot;bg-green-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-green-600&quot;>Assigned</p>
              <p className=&quot;text-lg font-bold text-green-900&quot;>{stockData.stats.assignedItems.toLocaleString()}</p>
            </div>
            <div className=&quot;bg-yellow-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-yellow-600&quot;>Available</p>
              <p className=&quot;text-lg font-bold text-yellow-900&quot;>{stockData.stats.availableItems}</p>
            </div>
            <div className=&quot;bg-red-50 rounded-lg px-3 py-2 min-w-[100px]&quot;>
              <p className=&quot;text-xs text-red-600&quot;>Critical</p>
              <p className=&quot;text-lg font-bold text-red-900&quot;>{stockData.stats.criticalLowStock}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className=&quot;w-full justify-start rounded-none border-t h-10 p-0&quot;>
            <TabsTrigger value=&quot;items&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Items
            </TabsTrigger>
            <TabsTrigger value=&quot;territories&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Territories
            </TabsTrigger>
            <TabsTrigger value=&quot;agents&quot; className=&quot;flex-1 rounded-none text-xs sm:text-sm&quot;>
              Agents
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
          <TabsContent value=&quot;items&quot; className=&quot;mt-0 space-y-3&quot;>
            {/* Quick actions */}
            <div className=&quot;grid grid-cols-2 gap-2 sm:hidden&quot;>
              <Button variant=&quot;outline&quot; className=&quot;h-auto py-3&quot;>
                <Truck className=&quot;w-4 h-4 mb-1&quot; />
                <span className=&quot;block text-xs&quot;>Bulk Assign</span>
              </Button>
              <Button variant=&quot;outline&quot; className=&quot;h-auto py-3&quot;>
                <BarChart3 className=&quot;w-4 h-4 mb-1&quot; />
                <span className=&quot;block text-xs&quot;>Export Report</span>
              </Button>
            </div>

            {/* Items grid */}
            <div className=&quot;grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4&quot;>
              {stockData.stockItems.map((item) => (
                <StockItemCard key={item.id} item={item} />
              ))}
            </div>

            {/* Load more */}
            <div className=&quot;text-center pt-4&quot;>
              <Button variant=&quot;outline&quot; className=&quot;w-full sm:w-auto&quot;>
                Load More Items
              </Button>
            </div>
          </TabsContent>

          <TabsContent value=&quot;territories&quot; className=&quot;mt-0 space-y-3&quot;>
            <div className=&quot;grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3&quot;>
              {stockData.territories.map((territory) => (
                <TerritorySummaryCard key={territory.code} territory={territory} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value=&quot;agents&quot; className=&quot;mt-0&quot;>
            <Card>
              <CardContent className=&quot;p-4&quot;>
                <div className=&quot;text-center py-8&quot;>
                  <Users className=&quot;w-12 h-12 text-gray-400 mx-auto mb-3&quot; />
                  <h3 className=&quot;font-semibold mb-2&quot;>Agent Management</h3>
                  <p className=&quot;text-sm text-gray-600 mb-4&quot;>
                    Track items assigned to {stockData.stats.totalAgents} agents
                  </p>
                  <Button>View Agent Directory</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value=&quot;analytics&quot; className=&quot;mt-0 space-y-4&quot;>
            {/* Item type distribution */}
            <Card>
              <CardHeader className=&quot;pb-3&quot;>
                <CardTitle className=&quot;text-base&quot;>Item Distribution</CardTitle>
                <CardDescription className=&quot;text-xs&quot;>
                  Stock levels by item type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=&quot;space-y-3&quot;>
                  {stockData.itemTypes.map((type) => {
                    const percentage = Math.round((type.assigned / type.total) * 100);
                    return (
                      <div key={type.type} className=&quot;space-y-1&quot;>
                        <div className=&quot;flex items-center justify-between text-sm&quot;>
                          <span>{type.type}</span>
                          <span className=&quot;text-xs text-gray-600&quot;>
                            {type.assigned}/{type.total}
                          </span>
                        </div>
                        <div className=&quot;w-full bg-gray-200 rounded-full h-2&quot;>
                          <div
                            className=&quot;h-2 bg-purple-500 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}