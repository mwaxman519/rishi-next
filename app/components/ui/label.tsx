&quot;use client&quot;;

import * as React from &quot;react&quot;;
import * as LabelPrimitive from &quot;@radix-ui/react-label&quot;;
import { cva, type VariantProps } from &quot;class-variance-authority&quot;;

import { cn } from &quot;../../lib/utils&quot;;

const labelVariants = cva(
  &quot;text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70&quot;,
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
