import * as React from &quot;react&quot;
import { cva, type VariantProps } from &quot;class-variance-authority&quot;

import { cn } from &quot;@/lib/utils&quot;

const badgeVariants = cva(
  &quot;inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2&quot;,
  {
    variants: {
      variant: {
        default:
          &quot;border-transparent bg-primary text-primary-foreground hover:bg-primary/80&quot;,
        secondary:
          &quot;border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80&quot;,
        destructive:
          &quot;border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80&quot;,
        success:
          &quot;border-transparent bg-green-500 text-white hover:bg-green-600&quot;,
        outline: &quot;text-foreground&quot;,
      },
    },
    defaultVariants: {
      variant: &quot;default&quot;,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }