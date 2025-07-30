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
import { Loader2, Save, X, Package } from &quot;lucide-react&quot;;
import { useQuery } from &quot;@tanstack/react-query&quot;;

const kitInstanceSchema = z.object({
  name: z.string().min(1, &quot;Name is required&quot;).max(255, &quot;Name must be less than 255 characters&quot;),
  description: z.string().optional(),
  template_id: z.string().uuid(&quot;Please select a template&quot;).optional(),
  location_id: z.string().uuid(&quot;Please select a location&quot;).optional(),
  organization_id: z.string().uuid(&quot;Please select an organization&quot;),
  status: z.enum([&quot;available&quot;, &quot;in_use&quot;, &quot;maintenance&quot;, &quot;needs_replenishment&quot;, &quot;retired&quot;]).default(&quot;available&quot;),
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
  { value: &quot;available&quot;, label: &quot;Available&quot;, color: &quot;bg-green-100 text-green-800&quot; },
  { value: &quot;in_use&quot;, label: &quot;In Use&quot;, color: &quot;bg-blue-100 text-blue-800&quot; },
  { value: &quot;maintenance&quot;, label: &quot;Maintenance&quot;, color: &quot;bg-yellow-100 text-yellow-800&quot; },
  { value: &quot;needs_replenishment&quot;, label: &quot;Needs Replenishment&quot;, color: &quot;bg-red-100 text-red-800&quot; },
  { value: &quot;retired&quot;, label: &quot;Retired&quot;, color: &quot;bg-gray-100 text-gray-800&quot; },
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
    initialData?.organization_id || "&quot;
  );

  const form = useForm<KitInstanceFormData>({
    resolver: zodResolver(kitInstanceSchema),
    defaultValues: {
      name: initialData?.name || &quot;&quot;,
      description: initialData?.description || &quot;&quot;,
      template_id: initialData?.template_id || &quot;&quot;,
      location_id: initialData?.location_id || &quot;&quot;,
      organization_id: initialData?.organization_id || &quot;&quot;,
      status: initialData?.status || &quot;available&quot;,
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

  // Fetch templates for selected organization
  const { data: templates = [] } = useQuery<KitTemplate[]>({
    queryKey: [&quot;/api/kits/templates&quot;, { organizationId: selectedOrganization }],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const params = new URLSearchParams();
      params.append(&quot;organizationId&quot;, selectedOrganization);
      params.append(&quot;status&quot;, &quot;active&quot;);
      
      const response = await fetch(`/api/kits/templates?${params}`);
      if (!response.ok) throw new Error(&quot;Failed to fetch templates&quot;);
      return response.json();
    },
    enabled: !!selectedOrganization,
  });

  // Fetch locations for selected organization
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: [&quot;/api/locations&quot;, { organizationId: selectedOrganization }],
    queryFn: async () => {
      if (!selectedOrganization) return [];
      const params = new URLSearchParams();
      params.append(&quot;organizationId&quot;, selectedOrganization);
      
      const response = await fetch(`/api/locations?${params}`);
      if (!response.ok) throw new Error(&quot;Failed to fetch locations&quot;);
      return response.json();
    },
    enabled: !!selectedOrganization,
  });

  const handleSubmit = async (data: KitInstanceFormData) => {
    try {
      await onSubmit(data);
      toast({
        title: &quot;Success&quot;,
        description: `Kit instance ${isEditing ? &quot;updated&quot; : &quot;created&quot;} successfully`,
      });
    } catch (error) {
      console.error(&quot;Form submission error:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: error instanceof Error ? error.message : &quot;Failed to save kit instance&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  const handleOrganizationChange = (organizationId: string) => {
    setSelectedOrganization(organizationId);
    form.setValue(&quot;organization_id&quot;, organizationId);
    form.setValue(&quot;template_id&quot;, &quot;&quot;); // Reset template selection
    form.setValue(&quot;location_id&quot;, &quot;&quot;); // Reset location selection
  };

  return (
    <Card className=&quot;w-full max-w-2xl mx-auto&quot;>
      <CardHeader>
        <CardTitle className=&quot;flex items-center gap-2&quot;>
          <Package className=&quot;h-5 w-5&quot; />
          {isEditing ? &quot;Edit Kit Instance&quot; : &quot;Create New Kit Instance&quot;}
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
                    <FormLabel>Kit Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder=&quot;Enter kit instance name&quot;
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
                        placeholder=&quot;Enter kit instance description&quot;
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

            {/* Template and Location Selection */}
            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
              <FormField
                control={form.control}
                name=&quot;template_id&quot;
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
                          <SelectValue placeholder=&quot;Select template (optional)&quot; />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=&quot;&quot;>No template</SelectItem>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                            {template.brand && (
                              <span className=&quot;text-muted-foreground ml-2&quot;>
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
                name=&quot;location_id&quot;
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
                          <SelectValue placeholder=&quot;Select location (optional)&quot; />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value=&quot;&quot;>No location</SelectItem>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
                            <span className=&quot;text-muted-foreground ml-2&quot;>
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
              name=&quot;status&quot;
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
                        <SelectValue placeholder=&quot;Select status&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className=&quot;flex items-center gap-2&quot;>
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
                {isEditing ? &quot;Update Instance&quot; : &quot;Create Instance&quot;}
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