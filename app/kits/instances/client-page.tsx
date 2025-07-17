"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Package, MapPin, AlertCircle, ChevronDown, ChevronUp, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import KitInstanceForm from "@/components/KitInstanceForm";

interface KitTemplate {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Brand {
  id: string;
  name: string;
  description: string | null;
  organizationId: string;
  organization: {
    id: string;
    name: string;
  };
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface KitInstance {
  id: string;
  name: string;
  description: string | null;
  template_id: string | null;
  location_id: string | null;
  status: string;
  organization_id: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
  template?: {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
    brand_id: string | null;
    brand?: {
      id: string;
      name: string;
      description: string | null;
      organization_id: string;
    };
    created_at: string;
    updated_at: string;
  } | null;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  in_use: "bg-blue-100 text-blue-800",
  maintenance: "bg-yellow-100 text-yellow-800",
  needs_replenishment: "bg-red-100 text-red-800",
  retired: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  in_use: "In Use",
  maintenance: "Maintenance",
  needs_replenishment: "Needs Replenishment",
  retired: "Retired",
};

export default function KitInstancesClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [organizationFilter, setOrganizationFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("table");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch kit instances with filters
  const { data: kits = [], isLoading, error } = useQuery<KitInstance[]>({
    queryKey: ["/api/kits/instances", { brandFilter, organizationFilter, statusFilter, templateFilter, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (brandFilter !== "all") params.append("brandId", brandFilter);
      if (organizationFilter !== "all") params.append("organizationId", organizationFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (templateFilter !== "all") params.append("templateId", templateFilter);
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/kits/instances?${params}`);
      if (!response.ok) throw new Error("Failed to fetch kit instances");
      return response.json();
    },
  });

  // Fetch kit templates for filtering
  const { data: templates = [] } = useQuery<KitTemplate[]>({
    queryKey: ["/api/kits/templates"],
  });

  // Fetch brands for filtering
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands", { organizationId: organizationFilter !== "all" ? organizationFilter : undefined }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (organizationFilter !== "all") params.append("organizationId", organizationFilter);
      
      const response = await fetch(`/api/brands?${params}`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    },
  });

  // Fetch organizations for filtering
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/user-organizations"],
    queryFn: async () => {
      const response = await fetch("/api/user-organizations");
      if (!response.ok) throw new Error("Failed to fetch organizations");
      return response.json();
    },
  });

  // Create kit instance mutation
  const createKitInstanceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/kits/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create kit instance");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/instances"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Kit instance created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create kit instance",
        variant: "destructive",
      });
    },
  });

  // All filtering is done server-side, so we use kits directly
  const filteredKits = kits;

  // Group kits by status for overview
  const statusCounts = kits.reduce((acc, kit) => {
    acc[kit.status] = (acc[kit.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleCreateKitInstance = async (data: any) => {
    await createKitInstanceMutation.mutateAsync(data);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error Loading Kit Instances</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Failed to load kit instances"}
          </p>
        </div>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kit Instances</h1>
          <p className="text-sm text-muted-foreground">
            Manage physical kits deployed across locations
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700 w-full md:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Kit Instance
        </Button>
      </div>

      {/* Collapsible Status Overview Cards - Hidden on mobile by default */}
      <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Summary Overview
            </div>
            {summaryOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            {Object.entries(statusLabels).map(([status, label]) => (
              <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs">{label}</CardDescription>
                  <CardTitle className="text-xl md:text-2xl">
                    {statusCounts[status] || 0}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`inline-block w-3 h-3 rounded-full ${statusColors[status]}`} />
                </CardContent>
              </Card>
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Row 1 - Organization and Brand */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <Label htmlFor="organization-filter" className="text-sm font-medium">
                Organization
              </Label>
              <Select value={organizationFilter} onValueChange={(value) => {
                setOrganizationFilter(value);
                setBrandFilter("all"); // Reset brand filter when organization changes
              }}>
                <SelectTrigger id="organization-filter">
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizations</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brand-filter" className="text-sm font-medium">
                Brand
              </Label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger id="brand-filter">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Filter Row 2 - Status and Template */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <Label htmlFor="status-filter" className="text-sm font-medium">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="template-filter" className="text-sm font-medium">
                Template
              </Label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger id="template-filter">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Templates</SelectItem>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kit Instances Table/Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Kit Inventory ({filteredKits.length})</CardTitle>
            <Tabs value={view} onValueChange={(v) => setView(v as "grid" | "table")}>
              <TabsList>
                <TabsTrigger value="table">Table</TabsTrigger>
                <TabsTrigger value="grid">Grid</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading kit instances...</p>
              </div>
            </div>
          ) : filteredKits.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No kit instances found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {search || statusFilter !== "all" || templateFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first kit instance"}
              </p>
            </div>
          ) : view === "table" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Template</TableHead>
                    <TableHead className="hidden md:table-cell">Brand</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKits.map((kit) => (
                    <TableRow key={kit.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{kit.name}</div>
                          {kit.description && (
                            <div className="text-sm text-muted-foreground">
                              {kit.description}
                            </div>
                          )}
                          {/* Mobile-only info */}
                          <div className="md:hidden mt-2 space-y-1">
                            <div className="text-xs text-muted-foreground">
                              Template: {kit.template?.name || "No template"}
                            </div>
                            {kit.template?.brand && (
                              <div className="text-xs text-muted-foreground">
                                Brand: {kit.template.brand.name}
                              </div>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Updated: {format(new Date(kit.updated_at), "MMM d, yyyy")}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {kit.template?.name || (
                          <span className="text-muted-foreground">No template</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {kit.template?.brand?.name || (
                          <span className="text-muted-foreground">No brand</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[kit.status]}>
                          {statusLabels[kit.status] || kit.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {kit.location_id ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">Location</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {format(new Date(kit.updated_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredKits.map((kit) => (
                <Card key={kit.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{kit.name}</CardTitle>
                        {kit.template && (
                          <CardDescription className="text-xs">
                            {kit.template.name}
                          </CardDescription>
                        )}
                        {kit.template?.brand && (
                          <CardDescription className="text-xs text-blue-600">
                            {kit.template.brand.name}
                          </CardDescription>
                        )}
                      </div>
                      <Badge className={statusColors[kit.status]}>
                        {statusLabels[kit.status] || kit.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {kit.description && (
                      <p className="text-sm text-muted-foreground">{kit.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {kit.location_id ? "Assigned" : "Unassigned"}
                      </div>
                      <span className="text-muted-foreground">
                        {format(new Date(kit.updated_at), "MMM d")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Kit Instance Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Kit Instance</DialogTitle>
          </DialogHeader>
          <KitInstanceForm
            onSubmit={handleCreateKitInstance}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createKitInstanceMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}