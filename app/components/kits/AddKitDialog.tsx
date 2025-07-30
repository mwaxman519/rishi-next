&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { useForm } from &quot;react-hook-form&quot;;
import { zodResolver } from &quot;@hookform/resolvers/zod&quot;;
import { z } from &quot;zod&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from &quot;@/components/ui/dialog&quot;;
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from &quot;@/components/ui/form&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;
import { useCreateKit, useKitTemplates } from &quot;@/hooks/useKits&quot;;
import { insertKitSchema } from &quot;@shared/schema&quot;;
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from &quot;@/components/ui/select&quot;;

// Extend the kit schema with validation
const createKitSchema = insertKitSchema.extend({
  serialNumber: z
    .string()
    .min(3, &quot;Serial number must be at least 3 characters&quot;),
  templateId: z.number().min(1, &quot;Template must be selected&quot;),
  brandRegionId: z.number().min(1, &quot;Brand/Region must be selected&quot;),
  status: z.string().min(1, &quot;Status must be selected&quot;),
});

// TypeScript type for our form values
type FormValues = z.infer<typeof createKitSchema>;

interface AddKitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddKitDialog({ open, onOpenChange }: AddKitDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateKit();
  const { data: templates, isLoading: templatesLoading } = useKitTemplates();

  // Log when dialog state changes
  useEffect(() => {
    console.log(&quot;AddKitDialog open state:&quot;, open);
  }, [open]);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(createKitSchema),
    defaultValues: {
      serialNumber: "&quot;,
      templateId: 0,
      brandRegionId: 1,
      status: &quot;Ready&quot;,
      components: {},
      notes: &quot;&quot;,
      assignedDate: new Date().toISOString().split(&quot;T&quot;)[0],
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync(data);

      toast({
        title: &quot;Success&quot;,
        description: &quot;Kit created successfully&quot;,
      });

      // Reset form
      form.reset();

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error(&quot;Error creating kit:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to create kit. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  // Update templateId when templates data loads
  useEffect(() => {
    if (
      templates &&
      templates.length > 0 &&
      form.getValues(&quot;templateId&quot;) === 0
    ) {
      form.setValue(&quot;templateId&quot;, templates[0].id);
    }
  }, [templates, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&quot;sm:max-w-[500px]&quot;>
        <DialogHeader>
          <DialogTitle>Create New Kit</DialogTitle>
          <DialogDescription>
            Create a new kit based on an existing template.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-4&quot;>
            <FormField
              control={form.control}
              name=&quot;serialNumber&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder=&quot;Enter kit serial number&quot; {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;templateId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template</FormLabel>
                  <Select
                    disabled={templatesLoading}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select a template&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templatesLoading ? (
                        <SelectItem value=&quot;loading&quot; disabled>
                          Loading templates...
                        </SelectItem>
                      ) : templates && templates.length > 0 ? (
                        templates.map((template) => (
                          <SelectItem
                            key={template.id}
                            value={template.id.toString()}
                          >
                            {template.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value=&quot;none&quot; disabled>
                          No templates available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select the template to use for this kit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;brandRegionId&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand/Region</FormLabel>
                  <FormControl>
                    <Input
                      type=&quot;number&quot;
                      min=&quot;1&quot;
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Assign this kit to a brand/region
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;status&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder=&quot;Select status&quot; />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value=&quot;Ready&quot;>Ready</SelectItem>
                      <SelectItem value=&quot;Deployed&quot;>Deployed</SelectItem>
                      <SelectItem value=&quot;In Transit&quot;>In Transit</SelectItem>
                      <SelectItem value=&quot;Maintenance&quot;>Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;notes&quot;
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder=&quot;Enter notes for this kit&quot;
                      className=&quot;resize-none min-h-[80px]&quot;
                      {...field}
                      value={field.value || &quot;&quot;}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type=&quot;button&quot;
                variant=&quot;outline&quot;
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type=&quot;submit&quot; disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                    Creating...
                  </>
                ) : (
                  &quot;Create Kit"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Add default export to support both import syntaxes
export default AddKitDialog;
