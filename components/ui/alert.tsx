import * as React from &quot;react&quot;
import { cva, type VariantProps } from &quot;class-variance-authority&quot;

import { cn } from &quot;@/lib/utils&quot;

const alertVariants = cva(
  &quot;relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground&quot;,
  {
    variants: {
      variant: {
        default: &quot;bg-background text-foreground&quot;,
        destructive:
          &quot;border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive&quot;,
        success:
          &quot;border-green-500/50 text-green-700 bg-green-50 dark:border-green-500 dark:bg-green-950 dark:text-green-400 [&>svg]:text-green-600&quot;,
        warning:
          &quot;border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:border-yellow-500 dark:bg-yellow-950 dark:text-yellow-400 [&>svg]:text-yellow-600&quot;,
        info:
          &quot;border-blue-500/50 text-blue-700 bg-blue-50 dark:border-blue-500 dark:bg-blue-950 dark:text-blue-400 [&>svg]:text-blue-600&quot;,
      },
    },
    defaultVariants: {
      variant: &quot;default&quot;,
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role=&quot;alert&quot;
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = &quot;Alert&quot;

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(&quot;mb-1 font-medium leading-none tracking-tight&quot;, className)}
    {...props}
  />
))
AlertTitle.displayName = &quot;AlertTitle&quot;

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(&quot;text-sm [&_p]:leading-relaxed&quot;, className)}
    {...props}
  />
))
AlertDescription.displayName = &quot;AlertDescription&quot;

export { Alert, AlertTitle, AlertDescription }