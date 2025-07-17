"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Package, MapPin, AlertCircle } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface KitTemplate {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
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
  kit_template?: KitTemplate | null;
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [view, setView] = useState<"grid" | "table">("table");

  // Fetch kit instances
  const { data: kits = [], isLoading, error } = useQuery<KitInstance[]>({
    queryKey: ["/api/kits/instances"],
  });

  // Fetch kit templates for filtering
  const { data: templates = [] } = useQuery<KitTemplate[]>({
    queryKey: ["/api/kits/templates"],
  });

  // Filter kits based on search and filters
  const filteredKits = kits.filter((kit) => {
    const matchesSearch =
      search === "" ||
      kit.name.toLowerCase().includes(search.toLowerCase()) ||
      (kit.description?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchesStatus = statusFilter === "all" || kit.status === statusFilter;
    const matchesTemplate = templateFilter === "all" || kit.template_id === templateFilter;

    return matchesSearch && matchesStatus && matchesTemplate;
  });

  // Group kits by status for overview
  const statusCounts = kits.reduce((acc, kit) => {
    acc[kit.status] = (acc[kit.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kit Instances</h1>
          <p className="text-muted-foreground">
            Manage physical kits deployed across locations
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Kit Instance
        </Button>
      </div>

      {/* Status Overview Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(statusLabels).map(([status, label]) => (
          <Card key={status} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs">{label}</CardDescription>
              <CardTitle className="text-2xl">
                {statusCounts[status] || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`inline-block w-3 h-3 rounded-full ${statusColors[status]}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-[200px]">
              <Label htmlFor="status-filter" className="sr-only">
                Status Filter
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger id="status-filter">
                  <SelectValue placeholder="Filter by status" />
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
            <div className="w-full md:w-[200px]">
              <Label htmlFor="template-filter" className="sr-only">
                Template Filter
              </Label>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger id="template-filter">
                  <SelectValue placeholder="Filter by template" />
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
                    <TableHead>Template</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Updated</TableHead>
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
                        </div>
                      </TableCell>
                      <TableCell>
                        {kit.kit_template?.name || (
                          <span className="text-muted-foreground">No template</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[kit.status]}>
                          {statusLabels[kit.status] || kit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {kit.location_id ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            <span className="text-sm">Location</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
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
                        {kit.kit_template && (
                          <CardDescription className="text-xs">
                            {kit.kit_template.name}
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
    </div>
  );
}