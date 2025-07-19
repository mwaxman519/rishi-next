"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Package, Plus, Search, Filter, ArrowLeft, Edit, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import KitTemplateForm from "@/components/KitTemplateForm";
import Image from "next/image";

interface KitTemplate {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  brand_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  image_alt_text: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  brand?: {
    id: string;
    name: string;
    description: string | null;
  } | null;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: string;
}

export default function KitTemplatesClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [organizationFilter, setOrganizationFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<KitTemplate | null>(null);

  // Fetch kit templates with filters
  const { data: templates = [], isLoading, error } = useQuery<KitTemplate[]>({
    queryKey: ["/api/kits/templates", { organizationFilter, statusFilter, searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (organizationFilter !== "all") params.append("organizationId", organizationFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      
      const response = await fetch(`/api/kits/templates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch kit templates");
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

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/kits/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Success",
        description: "Template created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create template",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/kits/templates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update template");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kits/templates"] });
      setEditingTemplate(null);
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update template",
        variant: "destructive",
      });
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || (statusFilter === "active" ? template.active : !template.active);
    const matchesOrganization =
      organizationFilter === "all" || template.organization_id === organizationFilter;
    return matchesSearch && matchesStatus && matchesOrganization;
  });

  const handleCreateTemplate = async (data: any) => {
    await createTemplateMutation.mutateAsync(data);
  };

  const handleUpdateTemplate = async (data: any) => {
    if (editingTemplate) {
      await updateTemplateMutation.mutateAsync({ id: editingTemplate.id, data });
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Error Loading Templates</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Failed to load kit templates"}
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/kits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kit Management
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kit Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage and configure reusable kit templates
            </p>
          </div>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by organization" />
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No templates found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "all" || organizationFilter !== "all"
                ? "Try adjusting your filters"
                : "Get started by creating your first kit template"}
            </p>
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-4">
                {/* Template Image */}
                <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  {template.thumbnail_url || template.image_url ? (
                    <Image
                      src={template.thumbnail_url || template.image_url}
                      alt={template.image_alt_text || `${template.name} template`}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                      unoptimized={template.image_url?.startsWith('blob:')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Template Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg leading-tight">{template.name}</h3>
                    <Badge variant={template.active ? "default" : "secondary"}>
                      {template.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  {template.brand && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="font-medium">Brand:</span>
                      <span>{template.brand.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-medium">Created:</span>
                    <span>{format(new Date(template.created_at), "MMM d, yyyy")}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingTemplate(template)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement delete functionality
                        toast({
                          title: "Coming Soon",
                          description: "Delete functionality will be implemented",
                        });
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Kit Template</DialogTitle>
          </DialogHeader>
          <KitTemplateForm
            onSubmit={handleCreateTemplate}
            onCancel={() => setIsCreateDialogOpen(false)}
            isLoading={createTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={!!editingTemplate} onOpenChange={(open) => !open && setEditingTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Kit Template</DialogTitle>
          </DialogHeader>
          {editingTemplate && (
            <KitTemplateForm
              onSubmit={handleUpdateTemplate}
              onCancel={() => setEditingTemplate(null)}
              initialData={editingTemplate}
              isEditing={true}
              isLoading={updateTemplateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <div className="p-2 bg-primary/10 rounded-full text-primary">
                  <Package className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Items:</span>
                  <span className="font-medium ml-2">{template.itemCount}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium ml-2">{template.category}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Last Used:</span>
                  <span className="font-medium ml-2">{template.lastUsed}</span>
                </div>
                <div>
                  <Badge
                    variant={
                      template.status === "active" ? "default" : "secondary"
                    }
                  >
                    {template.status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No templates found</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first kit template"}
          </p>
        </div>
      )}
    </div>
  );
}
