"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { kitsClient } from "@/client/services/kits";
import {
  CreateKitTemplateParams,
  ComponentType,
  KitTemplateDTO,
} from "@/services/kits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Save,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";
import { apiFetch } from "@/lib/api";

// Extended schema with additional validation
const componentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Component name is required"),
  type: z.nativeEnum(ComponentType, {
    errorMap: () => ({ message: "Please select a component type" }),
  }),
  description: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitCost: z.number().nonnegative("Unit cost cannot be negative").optional(),
  imageUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().nonnegative("Weight cannot be negative").optional(),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
  isRequired: z.boolean().default(true),
});

const kitTemplateFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  brandId: z.number().positive("Please select a brand"),
  components: z
    .array(componentSchema)
    .min(1, "At least one component is required"),
  instructions: z.string().optional(),
  active: z.boolean().default(true),
});

type KitTemplateFormValues = z.infer<typeof kitTemplateFormSchema>;

// Brand option type
interface BrandOption {
  id: number;
  name: string;
}

interface KitTemplateFormProps {
  templateId?: number; // If provided, we're editing an existing template
}

export default function KitTemplateForm({ templateId }: KitTemplateFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingTemplate, setExistingTemplate] =
    useState<KitTemplateDTO | null>(null);
  const [loading, setLoading] = useState(templateId ? true : false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form
  const form = useForm<KitTemplateFormValues>({
    resolver: zodResolver(kitTemplateFormSchema),
    defaultValues: {
      name: "",
      description: "",
      brandId: 0,
      components: [
        {
          id: uuidv4(),
          name: "",
          type: ComponentType.HARDWARE,
          quantity: 1,
          isRequired: true,
        },
      ],
      instructions: "",
      active: true,
    },
  });

  // Setup components field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "components",
  });

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await apiFetch('/api/brands');
        if (response.ok) {
          const data = await response.json();
          setBrands(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      }
    };

    fetchBrands();
  }, []);

  // Fetch existing template data if editing
  useEffect(() => {
    const fetchTemplateData = async () => {
      if (!templateId) return;

      try {
        setLoading(true);
        const template = await kitsClient.getTemplateById(templateId);
        setExistingTemplate(template);

        // Populate form with existing data
        form.reset({
          name: template.name,
          description: template.description || "",
          brandId: template.brandId,
          components: template.components.map((component) => ({
            ...component,
            id: component.id || uuidv4(),
          })),
          instructions: template.instructions || "",
          active: template.active,
        });

        setError(null);
      } catch (err) {
        console.error("Error fetching template data:", err);
        setError("Failed to load template data. Please try again.");
        toast({
          title: "Error",
          description:
            err instanceof Error ? err.message : "Failed to load template data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplateData();
  }, [templateId, form]);

  // Add a new component
  const addComponent = () => {
    append({
      id: uuidv4(),
      name: "",
      type: ComponentType.HARDWARE,
      quantity: 1,
      isRequired: true,
    });
  };

  // Handle form submission
  const onSubmit = async (values: KitTemplateFormValues) => {
    try {
      setIsSubmitting(true);

      if (templateId) {
        // Update existing template
        await kitsClient.updateTemplate(templateId, values);
        toast({
          title: "Success",
          description: "Kit template updated successfully",
          variant: "default",
        });
      } else {
        // Create new template
        await kitsClient.createTemplate(values);
        toast({
          title: "Success",
          description: "Kit template created successfully",
          variant: "default",
        });
      }

      // Redirect to templates list
      router.push("/inventory/templates");
    } catch (err) {
      console.error("Error saving template:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error ? err.message : "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]"></div>
        <p className="ml-2">Loading template data...</p>
      </div>
    );
  }

  if (error && templateId) {
    return (
      <div className="bg-destructive/15 p-4 rounded-md flex items-center gap-2 text-destructive">
        <AlertTriangle className="h-5 w-5" />
        <p>{error}</p>
        <Button variant="outline" asChild className="ml-auto">
          <Link href="/inventory/templates">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/inventory/templates">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {templateId ? "Edit Kit Template" : "Create Kit Template"}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter template name" {...field} />
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
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value ? field.value.toString() : ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem
                                key={brand.id}
                                value={brand.id.toString()}
                              >
                                {brand.name}
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
                    name="instructions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Enter assembly or usage instructions"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Components</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addComponent}
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Component
                  </Button>
                </CardHeader>
                <CardContent>
                  {fields.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-md">
                      <Package className="h-10 w-10 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-500">No components added</p>
                      <Button
                        type="button"
                        variant="link"
                        onClick={addComponent}
                        className="mt-1"
                      >
                        Add a component
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {fields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle className="text-lg">
                                Component {index + 1}
                              </CardTitle>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name={`components.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="Component name"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`components.${index}.type`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {Object.values(ComponentType).map(
                                          (type) => (
                                            <SelectItem key={type} value={type}>
                                              {type}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={form.control}
                              name={`components.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Component description"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <FormField
                                control={form.control}
                                name={`components.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={1}
                                        step={1}
                                        {...field}
                                        onChange={(e) =>
                                          field.onChange(
                                            parseInt(e.target.value),
                                          )
                                        }
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`components.${index}.unitCost`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Unit Cost ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="0.00"
                                        {...field}
                                        value={
                                          field.value === undefined
                                            ? ""
                                            : field.value
                                        }
                                        onChange={(e) => {
                                          const value =
                                            e.target.value === ""
                                              ? undefined
                                              : parseFloat(e.target.value);
                                          field.onChange(value);
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`components.${index}.sku`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>SKU</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder="SKU number"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="border-t pt-3">
                              <FormField
                                control={form.control}
                                name={`components.${index}.isRequired`}
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                      <FormLabel>Required Component</FormLabel>
                                      <div className="text-sm text-gray-500">
                                        This component must be included in all
                                        kit instances
                                      </div>
                                    </div>
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {form.formState.errors.components?.root && (
                    <p className="text-sm text-red-500 mt-2">
                      {form.formState.errors.components.root.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <div className="text-sm text-gray-500">
                            Template will be available for use
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-5">
                  <Button variant="outline" type="button" asChild>
                    <Link href="/inventory/templates">Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {templateId ? "Update Template" : "Create Template"}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {templateId && existingTemplate && (
                <Card>
                  <CardHeader>
                    <CardTitle>Template Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium">
                          Current Status:
                        </span>
                        <p className="capitalize">
                          {existingTemplate.approvalStatus}
                        </p>
                      </div>

                      {existingTemplate.approvalStatus === "rejected" &&
                        existingTemplate.approvalNotes && (
                          <div>
                            <span className="text-sm font-medium">
                              Rejection Reason:
                            </span>
                            <p className="text-red-600">
                              {existingTemplate.approvalNotes}
                            </p>
                          </div>
                        )}

                      <div>
                        <span className="text-sm font-medium">Created:</span>
                        <p>
                          {new Date(
                            existingTemplate.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <span className="text-sm font-medium">
                          Last Updated:
                        </span>
                        <p>
                          {new Date(
                            existingTemplate.updatedAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
