import { Loader2 } from &quot;lucide-react&quot;;
import { cn } from &quot;../../lib/utils&quot;;

interface LoadingSpinnerProps {
  size?: &quot;sm&quot; | &quot;md&quot; | &quot;lg&quot; | &quot;xl&quot;;
  className?: string;
}

const sizeClasses = {
  sm: &quot;h-4 w-4&quot;,
  md: &quot;h-6 w-6&quot;,
  lg: &quot;h-8 w-8&quot;,
  xl: &quot;h-12 w-12&quot;,
};

export function LoadingSpinner({
  size = &quot;md&quot;,
  className,
}: LoadingSpinnerProps) {
  return (
    <Loader2
      className={cn(
        &quot;animate-spin text-muted-foreground&quot;,
        sizeClasses[size],
        className,
      )}
    />
  );
}
