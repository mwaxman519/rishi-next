import * as React from &quot;react&quot;;

import { cn } from &quot;../../lib/utils&quot;;

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          &quot;flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = &quot;Textarea&quot;;

export { Textarea };
