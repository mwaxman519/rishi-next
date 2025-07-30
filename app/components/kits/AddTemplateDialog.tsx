&quot;use client&quot;;

import { useState } from &quot;react&quot;;
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
import { useCreateKitTemplate } from &quot;@/hooks/useKits&quot;;
import { Switch } from &quot;@/components/ui/switch&quot;;
import { useQueryClient } from &quot;@tanstack/react-query&quot;;
import { insertKitTemplateSchema } from &quot;@shared/schema&quot;;

// Extend the kit template schema with validation
const createTemplateSchema = insertKitTemplateSchema.extend({
  name: z.string().min(3, &quot;Name must be at least 3 characters&quot;),
  description: z.string().optional(),
  brandId: z.number().min(1, &quot;Brand must be selected&quot;),
});

// TypeScript type for our form values
type FormValues = z.infer<typeof createTemplateSchema>;

interface AddTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddTemplateDialog({
  open,
  onOpenChange,
}: AddTemplateDialogProps) {
  const { toast } = useToast();
  const createMutation = useCreateKitTemplate();
  const queryClient = useQueryClient();

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(createTemplateSchema),
    defaultValues: {
      name: "&quot;,
      description: &quot;&quot;,
      brandId: 1, // Default brandId
      is_active: true,
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync(data);

      toast({
        title: &quot;Success&quot;,
        description: &quot;Kit template created successfully&quot;,
      });

      // Reset form
      form.reset();

      // Close dialog
      onOpenChange(false);

      // Refresh kit templates
      queryClient.invalidateQueries({ queryKey: [&quot;/api/inventory/templates&quot;] });
    } catch (error) {
      console.error(&quot;Error creating kit template:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to create kit template. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&quot;sm:max-w-[500px]&quot;>
        <DialogHeader>
          <DialogTitle>Create Kit Template</DialogTitle>
          <DialogDescription>
            Create a new kit template that can be used to generate kits.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=&quot;space-y-4&quot;>
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
                      placeholder=&quot;Enter a description for this template&quot;
                      className=&quot;resize-none min-h-[80px]&quot;
                      {...field}
                      value={field.value || &quot;&quot;}
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
                    Select the brand or region this template belongs to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name=&quot;is_active&quot;
              render={({ field }) => (
                <FormItem className=&quot;flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm&quot;>
                  <div className=&quot;space-y-0.5&quot;>
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                      Make this template available for use
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
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
                  &quot;Create Template"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
