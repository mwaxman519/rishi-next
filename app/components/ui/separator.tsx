&quot;use client&quot;;

import * as React from &quot;react&quot;;
import * as SeparatorPrimitive from &quot;@radix-ui/react-separator&quot;;

import { cn } from &quot;../../lib/utils&quot;;

const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = &quot;horizontal&quot;, decorative = true, ...props },
    ref,
  ) => (
    <SeparatorPrimitive.Root
      ref={ref}
      decorative={decorative}
      orientation={orientation}
      className={cn(
        &quot;shrink-0 bg-border&quot;,
        orientation === &quot;horizontal&quot; ? &quot;h-[1px] w-full&quot; : &quot;h-full w-[1px]&quot;,
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = SeparatorPrimitive.Root.displayName;

export { Separator };
