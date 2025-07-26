"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useCreateKit, useKitTemplates } from "@/hooks/useKits";
import { useToast } from "@/hooks/use-toast";

interface SimpleKitFormProps {
  onSuccess: () => void;
}

export default function SimpleKitForm({ onSuccess }: SimpleKitFormProps) {
  const { toast } = useToast();
  const { data: templates, isLoading: templatesLoading } = useKitTemplates();
  const createMutation = useCreateKit();

  const [formData, setFormData] = useState({
    serialNumber: "",
    templateId: 0,
    brandRegionId: 1,
    status: "Ready",
    components: {},
    notes: "",
    assignedDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (templates && templates.length > 0 && formData.templateId === 0) {
      setFormData((prev) => ({ ...prev, templateId: templates[0].id }));
    }
  }, [templates, formData.templateId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createMutation.mutateAsync(formData);

      toast({
        title: "Success",
        description: "Kit created successfully",
      });

      // Reset form
      setFormData({
        serialNumber: "",
        templateId: 0,
        brandRegionId: 1,
        status: "Ready",
        components: {},
        notes: "",
        assignedDate: new Date().toISOString().split("T")[0],
      });

      // Notify parent of success
      onSuccess();
    } catch (error) {
      console.error("Error creating kit:", error);
      toast({
        title: "Error",
        description: "Failed to create kit. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="serialNumber" className="text-sm font-medium">
          Serial Number <span className="text-red-500">*</span>
        </label>
        <input
          id="serialNumber"
          name="serialNumber"
          type="text"
          required
          minLength={3}
          placeholder="Enter kit serial number"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          value={formData.serialNumber}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="templateId" className="text-sm font-medium">
          Template <span className="text-red-500">*</span>
        </label>
        <select
          id="templateId"
          name="templateId"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          value={formData.templateId}
          onChange={handleNumberChange}
          disabled={templatesLoading}
        >
          {templatesLoading ? (
            <option disabled>Loading templates...</option>
          ) : templates && templates.length > 0 ? (
            templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))
          ) : (
            <option disabled>No templates available</option>
          )}
        </select>
        <p className="text-xs text-gray-500">
          Select the template to use for this kit
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="brandRegionId" className="text-sm font-medium">
          Brand/Region ID <span className="text-red-500">*</span>
        </label>
        <input
          id="brandRegionId"
          name="brandRegionId"
          type="number"
          min="1"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          value={formData.brandRegionId}
          onChange={handleNumberChange}
        />
        <p className="text-xs text-gray-500">
          Assign this kit to a brand/region
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="status" className="text-sm font-medium">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          name="status"
          required
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Ready">Ready</option>
          <option value="Deployed">Deployed</option>
          <option value="In Transit">In Transit</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Enter notes for this kit"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md resize-none min-h-[80px]"
          value={formData.notes || ""}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-3 pt-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={onSuccess}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Kit"
          )}
        </button>
      </div>
    </form>
  );
}
