import type { ReactNode } from "react";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  required?: boolean;
}

export default function Label({
  htmlFor,
  children,
  required = false,
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium text-fg/80 select-none"
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
