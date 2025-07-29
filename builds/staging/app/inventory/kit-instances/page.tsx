"use client";

// Generate static params for dynamic routes
export async function generateStaticParams() {
  // Return empty array for mobile build - will generate on demand
  return [];
}


import React, { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

// Status color mapping for consistency with dark mode support
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "active":
    case "deployed":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800";
    case "in_preparation":
    case "preparing":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    case "in_transit":
    case "transit":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
    case "returning":
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    case "maintenance":
      return "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800";
    default:
      return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
  }
};

// Priority color mapping
const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
    case "critical":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function KitInstancesPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTerritory, setSelectedTerritory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch kit instances data
  const { data: kitInstances = [], isLoading, error } = useQuery({
    queryKey: ["/api/kits/instances"],
  });

  // Fetch stats data
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/kits/instances/stats"],
  });

  // Filter kit instances based on search and filters
  const filteredInstances = kitInstances.filter((kit: any) => {
    const matchesSearch = !searchQuery || 
      kit.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.templateName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kit.brandName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTerritory = selectedTerritory === "all" || kit.territory === selectedTerritory;
    const matchesStatus = selectedStatus === "all" || kit.status === selectedStatus;
    
    return matchesSearch && matchesTerritory && matchesStatus;
  });

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="p-3 sm:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Kit Instances
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Manage and track kit deployments across all territories
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
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
                  <div className="py-4">
                    <p className="text-sm text-gray-600">
                      Kit instance creation form would go here.
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Package className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-blue-500 dark:border-l-blue-400"
            onClick={() => setSelectedStatus("all")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Total</p>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? <Skeleton className="h-5 w-12" /> : filteredInstances.length}
                  </div>
                </div>
                <Package className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-green-500 dark:border-l-green-400"
            onClick={() => setSelectedStatus("active")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Active</p>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? <Skeleton className="h-5 w-12" /> : filteredInstances.filter(k => k.status === 'active').length}
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-yellow-500 dark:border-l-yellow-400"
            onClick={() => setSelectedStatus("in_transit")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Transit</p>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? <Skeleton className="h-5 w-12" /> : filteredInstances.filter(k => k.status === 'in_transit').length}
                  </div>
                </div>
                <Truck className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-orange-500 dark:border-l-orange-400"
            onClick={() => setSelectedStatus("preparing")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Preparing</p>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? <Skeleton className="h-5 w-12" /> : filteredInstances.filter(k => k.status === 'preparing').length}
                  </div>
                </div>
                <Clock className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-red-500 dark:border-l-red-400"
            onClick={() => setSelectedStatus("maintenance")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Issues</p>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? <Skeleton className="h-5 w-12" /> : filteredInstances.filter(k => k.status === 'maintenance').length}
                  </div>
                </div>
                <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4 border-l-gray-500 dark:border-l-gray-400"
            onClick={() => setSelectedTerritory("all")}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">Territories</p>
                  <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {statsLoading ? <Skeleton className="h-5 w-12" /> : [...new Set(filteredInstances.map(k => k.territory).filter(Boolean))].length}
                  </div>
                </div>
                <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search kit instances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={selectedTerritory} onValueChange={setSelectedTerritory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Territory" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Territories</SelectItem>
                {/* Extract unique territories from filtered instances */}
                {[...new Set(kitInstances.map((k: any) => k.territory).filter(Boolean))].map((territory) => (
                  <SelectItem key={territory} value={territory}>{territory}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
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
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
          {filteredInstances.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No kit instances found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchQuery || selectedTerritory !== "all" || selectedStatus !== "all" 
                    ? "No instances match your current filters." 
                    : "Create your first kit instance to get started."}
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Kit Instance
                </Button>
              </Card>
            </div>
          ) : (
            filteredInstances.map((kit: any) => (
              <Card key={kit.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-900 dark:text-white mb-1">
                        {kit.name || "Unnamed Kit"}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                        {kit.templateName || "No template"} • {kit.brandName || "Unknown brand"}
                      </CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Code
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className={`${getStatusColor(kit.status || "unknown")} text-xs`}>
                        {kit.status || "Unknown"}
                      </Badge>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {kit.territory || "No territory"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{kit.location || "TBD"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{kit.deployedAt ? new Date(kit.deployedAt).toLocaleDateString() : "Not deployed"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Package className="h-3 w-3" />
                          <span>{kit.componentCount || 0} items</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <DollarSign className="h-3 w-3" />
                          <span>${kit.totalValue || 0}</span>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" asChild>
                        <Link href={`/inventory/kit-instances/${kit.id}`}>
                          <ArrowRight className="h-4 w-4" />
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

