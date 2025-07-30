&quot;use client&quot;;

import { useState, useEffect } from &quot;react&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { useCreateKit, useKitTemplates } from &quot;@/hooks/useKits&quot;;
import { useToast } from &quot;@/hooks/use-toast&quot;;

interface SimpleKitFormProps {
  onSuccess: () => void;
}

export default function SimpleKitForm({ onSuccess }: SimpleKitFormProps) {
  const { toast } = useToast();
  const { data: templates, isLoading: templatesLoading } = useKitTemplates();
  const createMutation = useCreateKit();

  const [formData, setFormData] = useState({
    serialNumber: "&quot;,
    templateId: 0,
    brandRegionId: 1,
    status: &quot;Ready&quot;,
    components: {},
    notes: &quot;&quot;,
    assignedDate: new Date().toISOString().split(&quot;T&quot;)[0],
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
        title: &quot;Success&quot;,
        description: &quot;Kit created successfully&quot;,
      });

      // Reset form
      setFormData({
        serialNumber: &quot;&quot;,
        templateId: 0,
        brandRegionId: 1,
        status: &quot;Ready&quot;,
        components: {},
        notes: &quot;&quot;,
        assignedDate: new Date().toISOString().split(&quot;T&quot;)[0],
      });

      // Notify parent of success
      onSuccess();
    } catch (error) {
      console.error(&quot;Error creating kit:&quot;, error);
      toast({
        title: &quot;Error&quot;,
        description: &quot;Failed to create kit. Please try again.&quot;,
        variant: &quot;destructive&quot;,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className=&quot;space-y-4&quot;>
      <div className=&quot;space-y-2&quot;>
        <label htmlFor=&quot;serialNumber&quot; className=&quot;text-sm font-medium&quot;>
          Serial Number <span className=&quot;text-red-500&quot;>*</span>
        </label>
        <input
          id=&quot;serialNumber&quot;
          name=&quot;serialNumber&quot;
          type=&quot;text&quot;
          required
          minLength={3}
          placeholder=&quot;Enter kit serial number&quot;
          className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md&quot;
          value={formData.serialNumber}
          onChange={handleChange}
        />
      </div>

      <div className=&quot;space-y-2&quot;>
        <label htmlFor=&quot;templateId&quot; className=&quot;text-sm font-medium&quot;>
          Template <span className=&quot;text-red-500&quot;>*</span>
        </label>
        <select
          id=&quot;templateId&quot;
          name=&quot;templateId&quot;
          required
          className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md&quot;
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
        <p className=&quot;text-xs text-gray-500&quot;>
          Select the template to use for this kit
        </p>
      </div>

      <div className=&quot;space-y-2&quot;>
        <label htmlFor=&quot;brandRegionId&quot; className=&quot;text-sm font-medium&quot;>
          Brand/Region ID <span className=&quot;text-red-500&quot;>*</span>
        </label>
        <input
          id=&quot;brandRegionId&quot;
          name=&quot;brandRegionId&quot;
          type=&quot;number&quot;
          min=&quot;1&quot;
          required
          className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md&quot;
          value={formData.brandRegionId}
          onChange={handleNumberChange}
        />
        <p className=&quot;text-xs text-gray-500&quot;>
          Assign this kit to a brand/region
        </p>
      </div>

      <div className=&quot;space-y-2&quot;>
        <label htmlFor=&quot;status&quot; className=&quot;text-sm font-medium&quot;>
          Status <span className=&quot;text-red-500&quot;>*</span>
        </label>
        <select
          id=&quot;status&quot;
          name=&quot;status&quot;
          required
          className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md&quot;
          value={formData.status}
          onChange={handleChange}
        >
          <option value=&quot;Ready&quot;>Ready</option>
          <option value=&quot;Deployed&quot;>Deployed</option>
          <option value=&quot;In Transit&quot;>In Transit</option>
          <option value=&quot;Maintenance&quot;>Maintenance</option>
        </select>
      </div>

      <div className=&quot;space-y-2&quot;>
        <label htmlFor=&quot;notes&quot; className=&quot;text-sm font-medium&quot;>
          Notes
        </label>
        <textarea
          id=&quot;notes&quot;
          name=&quot;notes&quot;
          placeholder=&quot;Enter notes for this kit&quot;
          className=&quot;w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md resize-none min-h-[80px]&quot;
          value={formData.notes || &quot;&quot;}
          onChange={handleChange}
        />
      </div>

      <div className=&quot;flex justify-end space-x-3 pt-3&quot;>
        <button
          type=&quot;button&quot;
          className=&quot;px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700&quot;
          onClick={onSuccess}
        >
          Cancel
        </button>
        <button
          type=&quot;submit&quot;
          disabled={createMutation.isPending}
          className=&quot;px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 flex items-center&quot;
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
              Creating...
            </>
          ) : (
            &quot;Create Kit"
          )}
        </button>
      </div>
    </form>
  );
}
