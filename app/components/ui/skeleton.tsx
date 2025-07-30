import { cn } from &quot;../../lib/utils&quot;;

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(&quot;animate-pulse rounded-md bg-muted&quot;, className)}
      {...props}
    />
  );
}

export { Skeleton };
