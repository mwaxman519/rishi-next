&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { useState } from &quot;react&quot;;
import { Loader2 } from &quot;lucide-react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;
import { Textarea } from &quot;@/components/ui/textarea&quot;;
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from &quot;@/components/ui/dialog&quot;;

// Import location types for consistency
enum LocationType {
  VENUE = &quot;VENUE&quot;,
  OFFICE = &quot;OFFICE&quot;,
  STORAGE = &quot;STORAGE&quot;,
  OTHER = &quot;OTHER&quot;,
}

interface NewLocationRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    name: string;
    type: LocationType;
    address1: string;
    address2?: string;
    city: string;
    stateId: string;
    zipcode: string;
    notes?: string;
  }) => Promise<boolean>;
}

export function NewLocationRequestDialog({
  open,
  onOpenChange,
  onSubmit,
}: NewLocationRequestDialogProps) {
  const [formData, setFormData] = useState({
    name: "&quot;,
    type: LocationType.VENUE,
    address1: &quot;&quot;,
    address2: &quot;&quot;,
    city: &quot;&quot;,
    stateId: &quot;&quot;,
    zipcode: &quot;&quot;,
    notes: &quot;&quot;,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onSubmit(formData);
      if (success) {
        // Reset form
        setFormData({
          name: &quot;&quot;,
          type: LocationType.VENUE,
          address1: &quot;&quot;,
          address2: &quot;&quot;,
          city: &quot;&quot;,
          stateId: &quot;&quot;,
          zipcode: &quot;&quot;,
          notes: &quot;&quot;,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&quot;sm:max-w-[600px] bg-background dark:bg-gray-900 border dark:border-gray-800&quot;>
        <DialogHeader>
          <DialogTitle>Request a New Location</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className=&quot;space-y-4&quot;>
          <div className=&quot;grid grid-cols-1 gap-4 sm:grid-cols-2&quot;>
            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;name&quot;>Location Name</Label>
              <Input
                id=&quot;name&quot;
                name=&quot;name&quot;
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;type&quot;>Location Type</Label>
              <select
                id=&quot;type&quot;
                name=&quot;type&quot;
                className=&quot;w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2&quot;
                value={formData.type}
                onChange={handleChange}
                required
              >
                {Object.values(LocationType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className=&quot;space-y-2&quot;>
            <Label htmlFor=&quot;address1&quot;>Address Line 1</Label>
            <Input
              id=&quot;address1&quot;
              name=&quot;address1&quot;
              value={formData.address1}
              onChange={handleChange}
              required
            />
          </div>

          <div className=&quot;space-y-2&quot;>
            <Label htmlFor=&quot;address2&quot;>Address Line 2 (Optional)</Label>
            <Input
              id=&quot;address2&quot;
              name=&quot;address2&quot;
              value={formData.address2}
              onChange={handleChange}
            />
          </div>

          <div className=&quot;grid grid-cols-1 gap-4 sm:grid-cols-3&quot;>
            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;city&quot;>City</Label>
              <Input
                id=&quot;city&quot;
                name=&quot;city&quot;
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;stateId&quot;>State</Label>
              <Input
                id=&quot;stateId&quot;
                name=&quot;stateId&quot;
                value={formData.stateId}
                onChange={handleChange}
                required
              />
            </div>

            <div className=&quot;space-y-2&quot;>
              <Label htmlFor=&quot;zipcode&quot;>Zipcode</Label>
              <Input
                id=&quot;zipcode&quot;
                name=&quot;zipcode&quot;
                value={formData.zipcode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className=&quot;space-y-2&quot;>
            <Label htmlFor=&quot;notes&quot;>Notes (Optional)</Label>
            <Textarea
              id=&quot;notes&quot;
              name=&quot;notes&quot;
              className=&quot;min-h-[100px]&quot;
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <DialogFooter>
            <Button
              type=&quot;button&quot;
              variant=&quot;outline&quot;
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type=&quot;submit&quot; disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className=&quot;mr-2 h-4 w-4 animate-spin&quot; />
                  Submitting...
                </>
              ) : (
                &quot;Submit Request"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
