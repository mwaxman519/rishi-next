&quot;use client&quot;;

import * as React from &quot;react&quot;;
import * as ProgressPrimitive from &quot;@radix-ui/react-progress&quot;;

import { cn } from &quot;../../lib/utils&quot;;

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      &quot;relative h-2 w-full overflow-hidden rounded-full bg-primary/10&quot;,
      className,
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className=&quot;h-full w-full flex-1 bg-primary transition-all&quot;
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
