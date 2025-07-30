"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, X, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const kitInstanceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  template_id: z.string().uuid("Please select a template").optional(),
  location_id: z.string().uuid("Please select a location").optional(),
  organization_id: z.string().uuid("Please select an organization"),
  status: z.enum(["available", "in_use", "maintenance", "needs_replenishment", "retired"]).default("available"),
  active: z.boolean().default(true),
});

type KitInstanceFormData = z.infer<typeof kitInstanceSchema>;

interface KitTemplate {
  id: string;
  name: string;
  description: string | null;
  organization_id: string;
  brand_id: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  brand?: {
    id: string;
    name: string;
  } | null;
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  organizationId: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface KitInstanceFormProps {
  onSubmit: (data: KitInstanceFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<KitInstanceFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

const statusOptions = [
  { value: "available", label: "Available", color: "bg-green-100 text-green-800" },
  { value: "in_use", label: "In Use", color: "bg-blue-100 text-blue-800" },
  { value: "maintenance", label: "Maintenance", color: "bg-yellow-100 text-yellow-800" },
  { value: "needs_replenishment", label: "Needs Replenishment", color: "bg-red-100 text-red-800" },
  { value: "retired", label: "Retired", color: "bg-gray-100 text-gray-800" },
];

export default function KitInstanceForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isLoading = false,
}: KitInstanceFormProps) {
  const { toast } = useToast();
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    initialData?.organization_id || ""
  );

  const form = useForm<KitInstanceFormData>({
    resolver: zodResolver(kitInstanceSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      template_id: initialData?.template_id || "",
      location_id: initialData?.location_id || "",
      organization_id: initialData?.organization_id || "",
      status: initialData?.status || "available",
      active: initialData?.active ?? true,
    },
  });

  // Fetch organizations
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: ["/api/user-organizations"],
    queryFn: async () => {
      const response = await fetch("/api/user-organizations");
      if (!response.ok) throw new Error("Failed to fetch organizations");
      return response.json();
    },
  });

  // Fetch templates for selected organization
  const { data: templates = [] } = useQuery<KitTemplate[]>({
    queryKey: ["/api/kits/templates", { organizationId: selectedOrganization }],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const params = new URLSearchParams();
      params.append("organizationId", selectedOrganization);
      params.append("status", "active");
      
      const response = await fetch(`/api/kits/templates?${params}`);
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    },
    enabled: !!selectedOrganization,
  });

  // Fetch locations for selected organization
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ["/api/locations", { organizationId: selectedOrganization }],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const params = new URLSearchParams();
      params.append("organizationId", selectedOrganization);
      
      const response = await fetch(`/api/locations?${params}`);
      if (!response.ok) throw new Error("Failed to fetch locations");
      return response.json();
    },
    enabled: !!selectedOrganization,
  });

  const handleSubmit = async (data: KitInstanceFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: `Kit instance ${isEditing ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save kit instance",
        variant: "destructive",
      });
    }
  };

  const handleOrganizationChange = (organizationId: string) => {
    setSelectedOrganization(organizationId);
    form.setValue("organization_id", organizationId);
    form.setValue("template_id", ""); // Reset template selection
    form.setValue("location_id", ""); // Reset location selection
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {isEditing ? "Edit Kit Instance" : "Create New Kit Instance"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kit Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter kit instance name"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter kit instance description"
                        rows={3}
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Organization Selection */}
            <FormField
              control={form.control}
              name="organization_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization *</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={handleOrganizationChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select organization" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Template and Location Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="template_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kit Template</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || !selectedOrganization}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                            {template.brand && (
                              <span className="text-muted-foreground ml-2">
                                ({template.brand.name})
                              </span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || !selectedOrganization}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select location (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                            <span className="text-muted-foreground ml-2">
                              ({location.city}, {location.state})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status Selection */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${option.color}`} />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? "Update Instance" : "Create Instance"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}