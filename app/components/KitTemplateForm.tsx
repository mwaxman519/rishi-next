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
import { Loader2, Save, X } from "lucide-react";
import ImageUpload from "./ImageUpload";
import { useQuery } from "@tanstack/react-query";

const kitTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name must be less than 255 characters"),
  description: z.string().optional(),
  organization_id: z.string().uuid("Please select an organization"),
  brand_id: z.string().uuid("Please select a brand").optional(),
  image_url: z.string().optional(),
  thumbnail_url: z.string().optional(),
  image_alt_text: z.string().optional(),
  active: z.boolean().default(true),
});

type KitTemplateFormData = z.infer<typeof kitTemplateSchema>;

interface Organization {
  id: string;
  name: string;
  type: string;
  status: string;
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

interface KitTemplateFormProps {
  onSubmit: (data: KitTemplateFormData) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<KitTemplateFormData>;
  isEditing?: boolean;
  isLoading?: boolean;
}

export default function KitTemplateForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false,
  isLoading = false,
}: KitTemplateFormProps) {
  const { toast } = useToast();
  const [selectedOrganization, setSelectedOrganization] = useState<string>(
    initialData?.organization_id || ""
  );

  const form = useForm<KitTemplateFormData>({
    resolver: zodResolver(kitTemplateSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      organization_id: initialData?.organization_id || "",
      brand_id: initialData?.brand_id || "",
      image_url: initialData?.image_url || "",
      thumbnail_url: initialData?.thumbnail_url || "",
      image_alt_text: initialData?.image_alt_text || "",
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

  // Fetch brands for selected organization
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: ["/api/brands", { organizationId: selectedOrganization }],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const params = new URLSearchParams();
      params.append("organizationId", selectedOrganization);
      
      const response = await fetch(`/api/brands?${params}`);
      if (!response.ok) throw new Error("Failed to fetch brands");
      return response.json();
    },
    enabled: !!selectedOrganization,
  });

  const handleImageUpload = (imageUrl: string, thumbnailUrl: string) => {
    form.setValue("image_url", imageUrl);
    form.setValue("thumbnail_url", thumbnailUrl);
    
    // Auto-generate alt text from template name if not provided
    if (!form.getValues("image_alt_text") && form.getValues("name")) {
      form.setValue("image_alt_text", `${form.getValues("name")} template image`);
    }
  };

  const handleSubmit = async (data: KitTemplateFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: "Success",
        description: `Kit template ${isEditing ? "updated" : "created"} successfully`,
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save kit template",
        variant: "destructive",
      });
    }
  };

  const handleOrganizationChange = (organizationId: string) => {
    setSelectedOrganization(organizationId);
    form.setValue("organization_id", organizationId);
    form.setValue("brand_id", ""); // Reset brand selection
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Save className="h-5 w-5" />
          {isEditing ? "Edit Kit Template" : "Create New Kit Template"}
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
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter template name"
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
                        placeholder="Enter template description"
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

            {/* Organization and Brand Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading || !selectedOrganization}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No brand</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Image Upload */}
            <ImageUpload
              onImageUpload={handleImageUpload}
              currentImageUrl={form.getValues("image_url")}
              currentThumbnailUrl={form.getValues("thumbnail_url")}
              disabled={isLoading}
            />

            {/* Alt Text for Accessibility */}
            <FormField
              control={form.control}
              name="image_alt_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Description (for accessibility)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Describe the image for screen readers"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
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
                {isEditing ? "Update Template" : "Create Template"}
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