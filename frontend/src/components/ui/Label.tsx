import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export default function Label({
  htmlFor,
  children,
  required = false,
  className,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "text-sm font-medium text-fg/80 select-none",
        className,
      )}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-400" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
