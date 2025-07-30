&quot;use client&quot;;

import React, { useState } from &quot;react&quot;;
import Link from &quot;next/link&quot;;
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
  Calendar,
  MapPin,
  Edit,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  Archive,
  ArrowRight,
  QrCode,
  Truck,
  BarChart3,
  Building2,
  RefreshCw,
  Activity,
  List,
  Eye,
  Zap,
  DollarSign,
} from &quot;lucide-react&quot;;
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from &quot;@/components/ui/dropdown-menu&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from &quot;@/components/ui/sheet&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;
import { Skeleton } from &quot;@/components/ui/skeleton&quot;;

// Status color mapping for consistency with dark mode support
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case &quot;active&quot;:
    case &quot;deployed&quot;:
      return &quot;bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800&quot;;
    case &quot;in_preparation&quot;:
    case &quot;preparing&quot;:
      return &quot;bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800&quot;;
    case &quot;in_transit&quot;:
    case &quot;transit&quot;:
      return &quot;bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800&quot;;
    case &quot;returning&quot;:
      return &quot;bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800&quot;;
    case &quot;maintenance&quot;:
      return &quot;bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800&quot;;
    default:
      return &quot;bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700&quot;;
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case &quot;high&quot;:
    case &quot;critical&quot;:
      return &quot;bg-red-100 text-red-800 border-red-200&quot;;
    case &quot;medium&quot;:
      return &quot;bg-yellow-100 text-yellow-800 border-yellow-200&quot;;
    case &quot;low&quot;:
      return &quot;bg-green-100 text-green-800 border-green-200&quot;;
    default:
      return &quot;bg-gray-100 text-gray-800 border-gray-200&quot;;
  }
};

export default function KitInstancesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("&quot;);
  const [selectedTerritory, setSelectedTerritory] = useState(&quot;all&quot;);
  const [selectedStatus, setSelectedStatus] = useState(&quot;all&quot;);
  const [viewMode, setViewMode] = useState(&quot;grid&quot;);

  // Fetch kit instances data
  const { data: kitInstances = [], isLoading, error } = useQuery({
    queryKey: [&quot;/api/kits/instances&quot;],
  });

  // Fetch stats data
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: [&quot;/api/kits/instances/stats&quot;],
  });

  // Filter kit instances based on search and filters
  const filteredInstances = kitInstances.filter((kit: any) => {
    const matchesSearch = !searchQuery || 
      kit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTerritory = selectedTerritory === &quot;all&quot; || kit.territory === selectedTerritory;
    const matchesStatus = selectedStatus === &quot;all&quot; || kit.status === selectedStatus;
    
    return matchesSearch && matchesTerritory && matchesStatus;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className=&quot;p-3 sm:p-6 space-y-6&quot;>
        <div className=&quot;flex items-center justify-between&quot;>
          <div className=&quot;space-y-2&quot;>
            <Skeleton className=&quot;h-8 w-48&quot; />
            <Skeleton className=&quot;h-4 w-96&quot; />
          </div>
          <Skeleton className=&quot;h-10 w-32&quot; />
        </div>
        
        <div className=&quot;grid grid-cols-2 sm:grid-cols-4 gap-4&quot;>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className=&quot;h-24&quot; />
          ))}
        </div>
        
        <div className=&quot;grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4&quot;>
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className=&quot;h-48&quot; />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className=&quot;min-h-screen bg-gray-50 dark:bg-gray-900&quot;>
      {/* Header Section */}
      <div className=&quot;bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10&quot;>
        <div className=&quot;p-4 sm:p-6&quot;>
          <div className=&quot;flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4&quot;>
            <div>
              <h1 className=&quot;text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white&quot;>
                Kit Instances
              </h1>
              <p className=&quot;text-sm text-gray-600 dark:text-gray-300 mt-1&quot;>
                Manage and track kit deployments across all territories
              </p>
            </div>
            <div className=&quot;flex items-center gap-2&quot;>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant=&quot;outline&quot; size=&quot;sm&quot;>
                    <Plus className=&quot;h-4 w-4 mr-2&quot; />
                    New Instance
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Create Kit Instance</SheetTitle>
                    <SheetDescription>
                      Deploy a new kit instance to a territory.
                    </SheetDescription>
                  </SheetHeader>
                  <div className=&quot;py-4&quot;>
                    <p className=&quot;text-sm text-gray-600&quot;>
                      Kit instance creation form would go here.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
              <Button 
                variant=&quot;outline&quot; 
                size=&quot;sm&quot;
                onClick={() => setViewMode(viewMode === &quot;grid&quot; ? &quot;list&quot; : &quot;grid&quot;)}
              >
                {viewMode === &quot;grid&quot; ? <List className=&quot;h-4 w-4&quot; /> : <Package className=&quot;h-4 w-4&quot; />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className=&quot;p-4 sm:p-6&quot;>
        <div className=&quot;grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6&quot;>
          <Card 
            className=&quot;cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-blue-500 dark:border-l-blue-400&quot;
            onClick={() => setSelectedStatus(&quot;all&quot;)}
          >
            <CardContent className=&quot;p-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider&quot;>Total</p>
                  <div className=&quot;text-lg font-bold text-gray-900 dark:text-white mt-1&quot;>
                    {statsLoading ? <Skeleton className=&quot;h-5 w-12&quot; /> : filteredInstances.length}
                  </div>
                </div>
                <Package className=&quot;h-5 w-5 text-blue-500 dark:text-blue-400&quot; />
              </div>
            </CardContent>
          </Card>

          <Card 
            className=&quot;cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-green-500 dark:border-l-green-400&quot;
            onClick={() => setSelectedStatus(&quot;active&quot;)}
          >
            <CardContent className=&quot;p-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider&quot;>Active</p>
                  <div className=&quot;text-lg font-bold text-gray-900 dark:text-white mt-1&quot;>
                    {statsLoading ? <Skeleton className=&quot;h-5 w-12&quot; /> : filteredInstances.filter(k => k.status === 'active').length}
                  </div>
                </div>
                <CheckCircle className=&quot;h-5 w-5 text-green-500 dark:text-green-400&quot; />
              </div>
            </CardContent>
          </Card>

          <Card 
            className=&quot;cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-yellow-500 dark:border-l-yellow-400&quot;
            onClick={() => setSelectedStatus(&quot;in_transit&quot;)}
          >
            <CardContent className=&quot;p-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider&quot;>Transit</p>
                  <div className=&quot;text-lg font-bold text-gray-900 dark:text-white mt-1&quot;>
                    {statsLoading ? <Skeleton className=&quot;h-5 w-12&quot; /> : filteredInstances.filter(k => k.status === 'in_transit').length}
                  </div>
                </div>
                <Truck className=&quot;h-5 w-5 text-yellow-500 dark:text-yellow-400&quot; />
              </div>
            </CardContent>
          </Card>

          <Card 
            className=&quot;cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-orange-500 dark:border-l-orange-400&quot;
            onClick={() => setSelectedStatus(&quot;preparing&quot;)}
          >
            <CardContent className=&quot;p-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider&quot;>Preparing</p>
                  <div className=&quot;text-lg font-bold text-gray-900 dark:text-white mt-1&quot;>
                    {statsLoading ? <Skeleton className=&quot;h-5 w-12&quot; /> : filteredInstances.filter(k => k.status === 'preparing').length}
                  </div>
                </div>
                <Clock className=&quot;h-5 w-5 text-orange-500 dark:text-orange-400&quot; />
              </div>
            </CardContent>
          </Card>

          <Card 
            className=&quot;cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-red-500 dark:border-l-red-400&quot;
            onClick={() => setSelectedStatus(&quot;maintenance&quot;)}
          >
            <CardContent className=&quot;p-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider&quot;>Issues</p>
                  <div className=&quot;text-lg font-bold text-gray-900 dark:text-white mt-1&quot;>
                    {statsLoading ? <Skeleton className=&quot;h-5 w-12&quot; /> : filteredInstances.filter(k => k.status === 'maintenance').length}
                  </div>
                </div>
                <AlertTriangle className=&quot;h-5 w-5 text-red-500 dark:text-red-400&quot; />
              </div>
            </CardContent>
          </Card>

          <Card 
            className=&quot;cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-gray-500 dark:border-l-gray-400&quot;
            onClick={() => setSelectedTerritory(&quot;all&quot;)}
          >
            <CardContent className=&quot;p-3&quot;>
              <div className=&quot;flex items-center justify-between&quot;>
                <div>
                  <p className=&quot;text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider&quot;>Territories</p>
                  <div className=&quot;text-lg font-bold text-gray-900 dark:text-white mt-1&quot;>
                    {statsLoading ? <Skeleton className=&quot;h-5 w-12&quot; /> : [...new Set(filteredInstances.map(k => k.territory).filter(Boolean))].length}
                  </div>
                </div>
                <MapPin className=&quot;h-5 w-5 text-gray-500 dark:text-gray-400&quot; />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className=&quot;flex flex-col sm:flex-row gap-4 mb-6&quot;>
          <div className=&quot;relative flex-1&quot;>
            <Search className=&quot;absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400&quot; />
            <Input
              placeholder=&quot;Search kit instances...&quot;
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className=&quot;pl-10&quot;
            />
          </div>
          
          <div className=&quot;flex gap-2&quot;>
            <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
              <SelectTrigger className=&quot;w-40&quot;>
                <SelectValue placeholder=&quot;Territory&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Territories</SelectItem>
                {/* Extract unique territories from filtered instances */}
                {[...new Set(kitInstances.map((k: any) => k.territory).filter(Boolean))].map((territory) => (
                  <SelectItem key={territory} value={territory}>{territory}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className=&quot;w-32&quot;>
                <SelectValue placeholder=&quot;Status&quot; />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=&quot;all&quot;>All Status</SelectItem>
                {/* Extract unique statuses from filtered instances */}
                {[...new Set(kitInstances.map((k: any) => k.status).filter(Boolean))].map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Kit Instances Grid */}
        <div className={`grid gap-4 ${viewMode === &quot;grid&quot; ? &quot;grid-cols-1 md:grid-cols-2 lg:grid-cols-3&quot; : &quot;grid-cols-1&quot;}`}>
          {filteredInstances.length === 0 ? (
            <div className=&quot;col-span-full&quot;>
              <Card className=&quot;p-12 text-center&quot;>
                <Package className=&quot;h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4&quot; />
                <h3 className=&quot;text-lg font-semibold text-gray-900 dark:text-white mb-2&quot;>
                  No kit instances found
                </h3>
                <p className=&quot;text-gray-600 dark:text-gray-300 mb-4&quot;>
                  {searchQuery || selectedTerritory !== &quot;all&quot; || selectedStatus !== &quot;all&quot; 
                    ? &quot;No instances match your current filters.&quot; 
                    : &quot;Create your first kit instance to get started.&quot;}
                </p>
                <Button>
                  <Plus className=&quot;h-4 w-4 mr-2&quot; />
                  Create Kit Instance
                </Button>
              </Card>
            </div>
          ) : (
            filteredInstances.map((kit: any) => (
              <Card key={kit.id} className=&quot;hover:shadow-lg transition-shadow duration-200&quot;>
                <CardHeader className=&quot;pb-3&quot;>
                  <div className=&quot;flex items-start justify-between&quot;>
                    <div className=&quot;flex-1&quot;>
                      <CardTitle className=&quot;text-lg text-gray-900 dark:text-white mb-1&quot;>
                        {kit.name || &quot;Unnamed Kit&quot;}
                      </CardTitle>
                      <CardDescription className=&quot;text-sm text-gray-600 dark:text-gray-400&quot;>
                        {kit.templateName || &quot;No template&quot;} • {kit.brandName || &quot;Unknown brand&quot;}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant=&quot;ghost&quot; size=&quot;sm&quot;>
                          <MoreVertical className=&quot;h-4 w-4&quot; />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align=&quot;end&quot;>
                        <DropdownMenuItem>
                          <Eye className=&quot;h-4 w-4 mr-2&quot; />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className=&quot;h-4 w-4 mr-2&quot; />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className=&quot;h-4 w-4 mr-2&quot; />
                          QR Code
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className=&quot;space-y-3&quot;>
                    <div className=&quot;flex items-center justify-between&quot;>
                      <Badge className={`${getStatusColor(kit.status || &quot;unknown&quot;)} text-xs`}>
                        {kit.status || &quot;Unknown&quot;}
                      </Badge>
                      <span className=&quot;text-xs text-gray-500 dark:text-gray-400&quot;>
                        {kit.territory || &quot;No territory&quot;}
                      </span>
                    </div>
                    
                    <div className=&quot;flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400&quot;>
                      <div className=&quot;flex items-center gap-1&quot;>
                        <MapPin className=&quot;h-3 w-3&quot; />
                        <span>{kit.location || &quot;TBD&quot;}</span>
                      </div>
                      <div className=&quot;flex items-center gap-1&quot;>
                        <Calendar className=&quot;h-3 w-3&quot; />
                        <span>{kit.deployedAt ? new Date(kit.deployedAt).toLocaleDateString() : &quot;Not deployed&quot;}</span>
                      </div>
                    </div>

                    <div className=&quot;flex items-center justify-between pt-2&quot;>
                      <div className=&quot;flex items-center gap-2&quot;>
                        <div className=&quot;flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400&quot;>
                          <Package className=&quot;h-3 w-3&quot; />
                          <span>{kit.componentCount || 0} items</span>
                        </div>
                        <div className=&quot;flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400&quot;>
                          <DollarSign className=&quot;h-3 w-3&quot; />
                          <span>${kit.totalValue || 0}</span>
                        </div>
                      </div>
                      <Button size=&quot;sm&quot; variant=&quot;ghost&quot; asChild>
                        <Link href={`/inventory/kit-instances/${kit.id}`}>
                          <ArrowRight className=&quot;h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

