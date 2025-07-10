"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateKit, useKitTemplates } from "@/hooks/useKits";
import { insertKitSchema } from "@/shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend the kit schema with validation
const createKitSchema = insertKitSchema.extend({
  serialNumber: z
    .string()
    .min(3, "Serial number must be at least 3 characters"),
  templateId: z.number().min(1, "Template must be selected"),
  brandRegionId: z.number().min(1, "Brand/Region must be selected"),
  status: z.string().min(1, "Status must be selected"),
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
    console.log("AddKitDialog open state:", open);
  }, [open]);

  // Create form
  const form = useForm<FormValues>({
    resolver: zodResolver(createKitSchema),
    defaultValues: {
      serialNumber: "",
      templateId: 0,
      brandRegionId: 1,
      status: "Ready",
      components: {},
      notes: "",
      assignedDate: new Date().toISOString().split("T")[0],
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    try {
      await createMutation.mutateAsync(data);

      toast({
        title: "Success",
        description: "Kit created successfully",
      });

      // Reset form
      form.reset();

      // Close dialog
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating kit:", error);
      toast({
        title: "Error",
        description: "Failed to create kit. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update templateId when templates data loads
  useEffect(() => {
    if (
      templates &&
      templates.length > 0 &&
      form.getValues("templateId") === 0
    ) {
      form.setValue("templateId", templates[0].id);
    }
  }, [templates, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Kit</DialogTitle>
          <DialogDescription>
            Create a new kit based on an existing template.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter kit serial number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="templateId"
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
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {templatesLoading ? (
                        <SelectItem value="loading" disabled>
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
                        <SelectItem value="none" disabled>
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
              name="brandRegionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand/Region</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Ready">Ready</SelectItem>
                      <SelectItem value="Deployed">Deployed</SelectItem>
                      <SelectItem value="In Transit">In Transit</SelectItem>
                      <SelectItem value="Maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter notes for this kit"
                      className="resize-none min-h-[80px]"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Kit"
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
