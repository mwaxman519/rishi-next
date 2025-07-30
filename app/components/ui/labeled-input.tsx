import React, { useId } from &quot;react&quot;;
import { Input } from &quot;./input&quot;;
import { Label } from &quot;./label&quot;;
import { cn } from &quot;../../lib/utils&quot;;

export interface LabeledInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  fullWidth?: boolean;
}

const LabeledInput = React.forwardRef<HTMLInputElement, LabeledInputProps>(
  ({ className, label, id, fullWidth = false, name, ...props }, ref) => {
    // Create a stable, deterministic ID based on the name or label
    // This ensures server and client render the same ID
    const generatedId = useId();
    const inputId =
      id ||
      `input-${name || label.toLowerCase().replace(/\s+/g, &quot;-&quot;)}-${generatedId}`;

    return (
      <div className={cn(&quot;space-y-2&quot;, fullWidth && &quot;w-full&quot;)}>
        <Label htmlFor={inputId} className=&quot;text-sm font-medium&quot;>
          {label}
        </Label>
        <Input
          id={inputId}
          className={cn(className, fullWidth && &quot;w-full&quot;)}
          ref={ref}
          name={name || label.toLowerCase().replace(/\s+/g, &quot;-&quot;)}
          {...props}
        />
      </div>
    );
  },
);

LabeledInput.displayName = &quot;LabeledInput&quot;;

export { LabeledInput };
