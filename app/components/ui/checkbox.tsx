&quot;use client&quot;;

import * as React from &quot;react&quot;;
import * as CheckboxPrimitive from &quot;@radix-ui/react-checkbox&quot;;
import { Check } from &quot;lucide-react&quot;;

import { cn } from &quot;../../lib/utils&quot;;

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      &quot;peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground&quot;,
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn(&quot;flex items-center justify-center text-current&quot;)}
    >
      <Check className=&quot;h-3.5 w-3.5&quot; />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };
