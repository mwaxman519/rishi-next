&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useRouter } from &quot;next/navigation&quot;;
import { useForm, useFieldArray } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { kitsClient } from &quot;@/client/services/kits&quot;;
import {
  CreateKitTemplateParams,
  ComponentType,
  KitTemplateDTO,
} from &quot;@/services/kits&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from &quot;@/components/ui/card&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;
import { Separator } from &quot;@/components/ui/separator&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import {
  ArrowLeft,
  Plus,
  Trash2,
  Package,
  Save,
  AlertTriangle,
} from &quot;lucide-react&quot;;
import Link from &quot;next/link&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { v4 as uuidv4 } from &quot;uuid&quot;;

// Extended schema with additional validation
const componentSchema = z.object({
  id: z.string(),
  name: z.string().min(1, &quot;Component name is required&quot;),
  type: z.nativeEnum(ComponentType, {
    errorMap: () => ({ message: &quot;Please select a component type&quot; }),
  }),
  description: z.string().optional(),
  quantity: z.number().int().positive(&quot;Quantity must be at least 1&quot;),
  unitCost: z.number().nonnegative(&quot;Unit cost cannot be negative&quot;).optional(),
  imageUrl: z
    .string()
    .url(&quot;Please enter a valid URL&quot;)
    .optional()
    .or(z.literal("&quot;)),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  weight: z.number().nonnegative(&quot;Weight cannot be negative&quot;).optional(),
  dimensions: z.string().optional(),
  notes: z.string().optional(),
  isRequired: z.boolean().default(true),
});

const kitTemplateFormSchema = z.object({
  name: z.string().min(3, &quot;Name must be at least 3 characters&quot;),
  description: z.string().optional(),
  brandId: z.number().positive(&quot;Please select a brand&quot;),
  components: z
    .array(componentSchema)
    .min(1, &quot;At least one component is required&quot;),
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
  templateId?: number; // If provided, we&apos;re editing an existing template
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
      name: &quot;&quot;,
      description: &quot;&quot;,
      brandId: 0,
      components: [
        {
          id: uuidv4(),
          name: &quot;&quot;,
          type: ComponentType.HARDWARE,
          quantity: 1,
          isRequired: true,
        },
      ],
      instructions: &quot;&quot;,
      active: true,
    },
  });

  // Setup components field array
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: &quot;components&quot;,
  });

  // Fetch brands on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch('/api/brands');
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
          description: template.description || &quot;&quot;,
          brandId: template.brandId,
          components: template.components.map((component) => ({
            ...component,
            id: component.id || uuidv4(),
          })),
          instructions: template.instructions || &quot;&quot;,
          active: template.active,
        });

        setError(null);
      } catch (err) {
        console.error(&quot;Error fetching template data:&quot;, err);
        setError(&quot;Failed to load template data. Please try again.&quot;);
        toast({
          title: &quot;Error&quot;,
          description:
            err instanceof Error ? err.message : &quot;Failed to load template data&quot;,
          variant: &quot;destructive&quot;,
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
      name: &quot;&quot;,
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
          title: &quot;Success&quot;,
          description: &quot;Kit template updated successfully&quot;,
          variant: &quot;default&quot;,
        });
      } else {
        // Create new template
        await kitsClient.createTemplate(values);
        toast({
          title: &quot;Success&quot;,
          description: &quot;Kit template created successfully&quot;,
          variant: &quot;default&quot;,
        });
      }

      // Redirect to templates list
      router.push(&quot;/kits/templates&quot;);
    } catch (err) {
      console.error(&quot;Error saving template:&quot;, err);
      toast({
        title: &quot;Error&quot;,
        description:
          err instanceof Error ? err.message : &quot;Failed to save template&quot;,
        variant: &quot;destructive&quot;,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className=&quot;flex justify-center items-center min-h-[400px]&quot;>
        <div className=&quot;inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]&quot;></div>
        <p className=&quot;ml-2&quot;>Loading template data...</p>
      </div>
    );
  }

  if (error && templateId) {
    return (
      <div className=&quot;bg-destructive/15 p-4 rounded-md flex items-center gap-2 text-destructive&quot;>
        <AlertTriangle className=&quot;h-5 w-5&quot; />
        <p>{error}</p>
        <Button variant=&quot;outline&quot; asChild className=&quot;ml-auto&quot;>
          <Link href=&quot;/kits/templates&quot;>
            <ArrowLeft className=&quot;mr-2 h-4 w-4&quot; /> Back to Templates
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className=&quot;container mx-auto py-6 space-y-6&quot;>
      <div className=&quot;flex items-center justify-between&quot;>
        <div className=&quot;flex items-center gap-2&quot;>
          <Button variant=&quot;outline&quot; size=&quot;icon&quot; asChild>
            <Link href=&quot;/kits/templates&quot;>
              <ArrowLeft className=&quot;h-4 w-4&quot; />
            </Link>
          </Button>
          <h1 className=&quot;text-3xl font-bold tracking-tight&quot;>
            {templateId ? &quot;Edit Kit Template&quot; : &quot;Create Kit Template&quot;}
          </h1>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-8&quot;>
          <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-6&quot;>
            <div className=&quot;md:col-span-2 space-y-6&quot;>
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                </CardHeader>
                <CardContent className=&quot;space-y-4&quot;>
                  <FormField
                    control={form.control}
                    name=&quot;name&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Template Name</FormLabel>
                        <FormControl>
                          <Input placeholder=&quot;Enter template name&quot; {...field} />
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
                            className=&quot;min-h-[100px]&quot;
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name=&quot;brandId&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(parseInt(value))
                          }
                          value={field.value ? field.value.toString() : &quot;&quot;}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder=&quot;Select brand&quot; />
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
                    name=&quot;instructions&quot;
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instructions</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder=&quot;Enter assembly or usage instructions&quot;
                            className=&quot;min-h-[100px]&quot;
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
                <CardHeader className=&quot;flex flex-row items-center justify-between&quot;>
                  <CardTitle>Components</CardTitle>
                  <Button
                    type=&quot;button&quot;
                    variant=&quot;outline&quot;
                    onClick={addComponent}
                    size=&quot;sm&quot;
                  >
                    <Plus className=&quot;mr-2 h-4 w-4&quot; />
                    Add Component
                  </Button>
                </CardHeader>
                <CardContent>
                  {fields.length === 0 ? (
                    <div className=&quot;text-center py-6 bg-gray-50 border border-dashed border-gray-200 rounded-md&quot;>
                      <Package className=&quot;h-10 w-10 mx-auto text-gray-400&quot; />
                      <p className=&quot;mt-2 text-gray-500&quot;>No components added</p>
                      <Button
                        type=&quot;button&quot;
                        variant=&quot;link&quot;
                        onClick={addComponent}
                        className=&quot;mt-1&quot;
                      >
                        Add a component
                      </Button>
                    </div>
                  ) : (
                    <div className=&quot;space-y-6&quot;>
                      {fields.map((field, index) => (
                        <Card key={field.id}>
                          <CardHeader className=&quot;pb-2&quot;>
                            <div className=&quot;flex justify-between items-center&quot;>
                              <CardTitle className=&quot;text-lg&quot;>
                                Component {index + 1}
                              </CardTitle>
                              <Button
                                type=&quot;button&quot;
                                variant=&quot;ghost&quot;
                                size=&quot;sm&quot;
                                onClick={() => remove(index)}
                                disabled={fields.length === 1}
                                className=&quot;h-8 text-destructive hover:text-destructive hover:bg-destructive/10&quot;
                              >
                                <Trash2 className=&quot;h-4 w-4&quot; />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className=&quot;space-y-4&quot;>
                            <div className=&quot;grid grid-cols-1 md:grid-cols-2 gap-4&quot;>
                              <FormField
                                control={form.control}
                                name={`components.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                      <Input
                                        placeholder=&quot;Component name&quot;
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
                                          <SelectValue placeholder=&quot;Select type&quot; />
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
                                      placeholder=&quot;Component description&quot;
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className=&quot;grid grid-cols-1 md:grid-cols-3 gap-4&quot;>
                              <FormField
                                control={form.control}
                                name={`components.${index}.quantity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                      <Input
                                        type=&quot;number&quot;
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
                                        type=&quot;number&quot;
                                        min={0}
                                        step={0.01}
                                        placeholder=&quot;0.00&quot;
                                        {...field}
                                        value={
                                          field.value === undefined
                                            ? &quot;&quot;
                                            : field.value
                                        }
                                        onChange={(e) => {
                                          const value =
                                            e.target.value === &quot;&quot;
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
                                        placeholder=&quot;SKU number&quot;
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className=&quot;border-t pt-3&quot;>
                              <FormField
                                control={form.control}
                                name={`components.${index}.isRequired`}
                                render={({ field }) => (
                                  <FormItem className=&quot;flex flex-row items-center justify-between rounded-lg border p-3&quot;>
                                    <div className=&quot;space-y-0.5&quot;>
                                      <FormLabel>Required Component</FormLabel>
                                      <div className=&quot;text-sm text-gray-500&quot;>
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
                    <p className=&quot;text-sm text-red-500 mt-2&quot;>
                      {form.formState.errors.components.root.message}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className=&quot;space-y-6&quot;>
              <Card>
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name=&quot;active&quot;
                    render={({ field }) => (
                      <FormItem className=&quot;flex flex-row items-center justify-between rounded-lg border p-3&quot;>
                        <div className=&quot;space-y-0.5&quot;>
                          <FormLabel>Active</FormLabel>
                          <div className=&quot;text-sm text-gray-500&quot;>
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
                <CardFooter className=&quot;flex justify-between border-t pt-5&quot;>
                  <Button variant=&quot;outline&quot; type=&quot;button&quot; asChild>
                    <Link href=&quot;/kits/templates&quot;>Cancel</Link>
                  </Button>
                  <Button type=&quot;submit&quot; disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span className=&quot;inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] mr-2&quot;></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className=&quot;mr-2 h-4 w-4&quot; />
                        {templateId ? &quot;Update Template&quot; : &quot;Create Template&quot;}
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
                    <div className=&quot;space-y-2&quot;>
                      <div>
                        <span className=&quot;text-sm font-medium&quot;>
                          Current Status:
                        </span>
                        <p className=&quot;capitalize&quot;>
                          {existingTemplate.approvalStatus}
                        </p>
                      </div>

                      {existingTemplate.approvalStatus === &quot;rejected&quot; &&
                        existingTemplate.approvalNotes && (
                          <div>
                            <span className=&quot;text-sm font-medium&quot;>
                              Rejection Reason:
                            </span>
                            <p className=&quot;text-red-600&quot;>
                              {existingTemplate.approvalNotes}
                            </p>
                          </div>
                        )}

                      <div>
                        <span className=&quot;text-sm font-medium&quot;>Created:</span>
                        <p>
                          {new Date(
                            existingTemplate.createdAt,
                          ).toLocaleDateString()}
                        </p>
                      </div>

                      <div>
                        <span className=&quot;text-sm font-medium">
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
