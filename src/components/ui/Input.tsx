import { forwardRef } from "react";
import { Label } from "./legacy/label";

import { cn } from "@/lib/utils";

const CoreInput = forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  min,
  max,
  step,
  pattern,
  disabled,
}: {
  label?: string;
  id: string;
  type?: "text" | "email" | "tel" | "url" | "password" | "number";
  placeholder?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <CoreInput
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        disabled={disabled}
      />
    </div>
  );
}
