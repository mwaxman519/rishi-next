import * as React from &quot;react&quot;;

import { cn } from &quot;../../lib/utils&quot;;

export interface BaseInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

// Create a standard input component without label
const BaseInput = React.forwardRef<HTMLInputElement, BaseInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          &quot;flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50&quot;,
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
BaseInput.displayName = &quot;BaseInput&quot;;

// Extended interface that includes label
export interface InputProps extends BaseInputProps {
  label?: string;
  fullWidth?: boolean;
}

// Create an enhanced input component that supports labels
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, fullWidth, ...props }, ref) => {
    return (
      <div className={cn(&quot;w-full space-y-2&quot;, className)}>
        {label && (
          <label className=&quot;block text-sm font-medium text-foreground&quot;>
            {label}
          </label>
        )}
        <BaseInput
          type={type}
          className={cn(fullWidth ? &quot;w-full&quot; : "&quot;)}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = &quot;Input";

export { Input, BaseInput };
