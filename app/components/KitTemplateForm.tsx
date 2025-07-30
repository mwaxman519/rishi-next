&quot;use client&quot;;

import { useState } from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { Card, CardContent, CardHeader, CardTitle } from &quot;@/components/ui/card&quot;;
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from &quot;@/components/ui/form&quot;;
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from &quot;@/components/ui/select&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { Loader2, Save, X } from &quot;lucide-react&quot;;
import ImageUpload from &quot;./ImageUpload&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;

const kitTemplateSchema = z.object({
  name: z.string().min(1, &quot;Name is required&quot;).max(255, &quot;Name must be less than 255 characters&quot;),
  description: z.string().optional(),
  organization_id: z.string().uuid(&quot;Please select an organization&quot;),
  brand_id: z.string().uuid(&quot;Please select a brand&quot;).optional(),
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
    initialData?.organization_id || "&quot;
  );

  const form = useForm<KitTemplateFormData>({
    resolver: zodResolver(kitTemplateSchema),
    defaultValues: {
      name: initialData?.name || &quot;&quot;,
      description: initialData?.description || &quot;&quot;,
      organization_id: initialData?.organization_id || &quot;&quot;,
      brand_id: initialData?.brand_id || &quot;&quot;,
      image_url: initialData?.image_url || &quot;&quot;,
      thumbnail_url: initialData?.thumbnail_url || &quot;&quot;,
      image_alt_text: initialData?.image_alt_text || &quot;&quot;,
      active: initialData?.active ?? true,
    },
  });

  // Fetch organizations
  const { data: organizations = [] } = useQuery<Organization[]>({
    queryKey: [&quot;/api/user-organizations&quot;],
    queryFn: async () => {
      const response = await fetch(&quot;/api/user-organizations&quot;);
      if (!response.ok) throw new Error(&quot;Failed to fetch organizations&quot;);
      return response.json();
    },
  });

  // Fetch brands for selected organization
  const { data: brands = [] } = useQuery<Brand[]>({
    queryKey: [&quot;/api/brands&quot;, { organizationId: selectedOrganization }],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const params = new URLSearchParams();
      params.append(&quot;organizationId&quot;, selectedOrganization);
      
      const response = await fetch(`/api/brands?${params}`);
      if (!response.ok) throw new Error(&quot;Failed to fetch brands&quot;);
      return response.json();
    },
    enabled: !!selectedOrganization,
  });

  const handleImageUpload = (imageUrl: string, thumbnailUrl: string) => {
    form.setValue(&quot;image_url&quot;, imageUrl);
    form.setValue(&quot;thumbnail_url&quot;, thumbnailUrl);
    
    // Auto-generate alt text from template name if not provided
    if (!form.getValues(&quot;image_alt_text&quot;) && form.getValues(&quot;name&quot;)) {
      form.setValue(&quot;image_alt_text&quot;, `${form.getValues(&quot;name&quot;)} template image`);
    }
  };

  const handleSubmit = async (data: KitTemplateFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: &quot;Success&quot;,
        description: `Kit template ${isEditing ? &quot;updated&quot; : &quot;created&quot;} successfully`,
      });
    } catch (error) {
      console.error(&quot;Form submission error:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: error instanceof Error ? error.message : &quot;Failed to save kit template&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  const handleOrganizationChange = (organizationId: string) => {
    setSelectedOrganization(organizationId);
    form.setValue(&quot;organization_id&quot;, organizationId);
    form.setValue(&quot;brand_id&quot;, &quot;&quot;); // Reset brand selection
  };

  return (
    <Card className=&quot;w-full max-w-2xl mx-auto&quot;>
      <CardHeader>
        <CardTitle className=&quot;flex items-center gap-2&quot;>
          <Save className=&quot;h-5 w-5&quot; />
          {isEditing ? &quot;Edit Kit Template&quot; : &quot;Create New Kit Template&quot;}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className=&quot;space-y-6&quot;>
            {/* Basic Information */}
            <div className=&quot;space-y-4&quot;>
              <FormField
                control={form.control}
                name=&quot;name&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;Enter template name&quot;
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
                name=&quot;description&quot;
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder=&quot;Enter template description&quot;
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
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
              <FormField
                control={form.control}
                name=&quot;organization_id&quot;
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
                          <SelectValue placeholder=&quot;Select organization&quot; />
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
                name=&quot;brand_id&quot;
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
                          <SelectValue placeholder=&quot;Select brand (optional)&quot; />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=&quot;&quot;>No brand</SelectItem>
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
              currentImageUrl={form.getValues(&quot;image_url&quot;)}
              currentThumbnailUrl={form.getValues(&quot;thumbnail_url&quot;)}
              disabled={isLoading}
            />

            {/* Alt Text for Accessibility */}
            <FormField
              control={form.control}
              name=&quot;image_alt_text&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Description (for accessibility)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder=&quot;Describe the image for screen readers&quot;
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Form Actions */}
            <div className=&quot;flex gap-3 pt-4&quot;>
              <Button
                type=&quot;submit&quot;
                disabled={isLoading}
                className=&quot;flex-1&quot;
              >
                {isLoading ? (
                  <Loader2 className=&quot;h-4 w-4 animate-spin mr-2&quot; />
                ) : (
                  <Save className=&quot;h-4 w-4 mr-2&quot; />
                )}
                {isEditing ? &quot;Update Template&quot; : &quot;Create Template&quot;}
              </Button>
              <Button
                type=&quot;button&quot;
                variant=&quot;outline&quot;
                onClick={onCancel}
                disabled={isLoading}
              >
                <X className=&quot;h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}