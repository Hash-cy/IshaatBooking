import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

export interface CustomCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const CustomCheckbox = React.forwardRef<HTMLInputElement, CustomCheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn("custom-checkbox flex items-center cursor-pointer mb-2", className)}>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            {...props}
          />
          <div className={cn(
            "h-5 w-5 border-2 border-neutral-medium rounded mr-2.5 flex items-center justify-center transition-colors",
            props.checked ? "bg-primary border-primary" : "bg-white hover:border-primary"
          )}>
            {props.checked && <CheckIcon className="h-3 w-3 text-white" />}
          </div>
        </div>
        <span className="text-sm">{label}</span>
      </label>
    );
  }
);

CustomCheckbox.displayName = "CustomCheckbox";

export { CustomCheckbox };
