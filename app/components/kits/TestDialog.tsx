&quot;use client&quot;;

import * as React from &quot;react&quot;;
import { Button } from &quot;@/components/ui/button&quot;;
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from &quot;@/components/ui/dialog&quot;;
import { Input } from &quot;@/components/ui/input&quot;;
import { Label } from &quot;@/components/ui/label&quot;;

export default function TestDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className=&quot;sm:max-w-[425px]&quot;>
        <DialogHeader>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogDescription>
            This is a test dialog to verify that dialogs are working correctly.
          </DialogDescription>
        </DialogHeader>
        <div className=&quot;grid gap-4 py-4&quot;>
          <div className=&quot;grid grid-cols-4 items-center gap-4&quot;>
            <Label htmlFor=&quot;name&quot; className=&quot;text-right&quot;>
              Name
            </Label>
            <Input id=&quot;name&quot; value=&quot;Test User&quot; className=&quot;col-span-3&quot; />
          </div>
        </div>
        <DialogFooter>
          <Button type=&quot;submit&quot; onClick={() => onOpenChange(false)}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
