import * as React from &quot;react&quot;
import * as CheckboxPrimitive from &quot;@radix-ui/react-checkbox&quot;
import { Check } from &quot;lucide-react&quot;

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={`peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground ${className || ''}`}
    {...props}
  >
    <CheckboxPrimitive.Indicator className=&quot;flex items-center justify-center text-current&quot;>
      <Check className=&quot;h-4 w-4&quot; />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }