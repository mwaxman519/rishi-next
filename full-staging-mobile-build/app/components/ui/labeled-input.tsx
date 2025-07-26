import React, { useId } from "react";
import { Input } from "./input";
import { Label } from "./label";
import { cn } from "../../lib/utils";

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
      `input-${name || label.toLowerCase().replace(/\s+/g, "-")}-${generatedId}`;

    return (
      <div className={cn("space-y-2", fullWidth && "w-full")}>
        <Label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </Label>
        <Input
          id={inputId}
          className={cn(className, fullWidth && "w-full")}
          ref={ref}
          name={name || label.toLowerCase().replace(/\s+/g, "-")}
          {...props}
        />
      </div>
    );
  },
);

LabeledInput.displayName = "LabeledInput";

export { LabeledInput };
