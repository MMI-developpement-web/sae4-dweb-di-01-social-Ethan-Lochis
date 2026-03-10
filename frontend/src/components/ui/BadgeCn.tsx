import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

interface BadgeCnProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function BadgeCn({
  variant = "default",
  size = "md",
  className,
  children,
}: BadgeCnProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        {
          "bg-gray-100 text-gray-800": variant === "default",
          "bg-green-100 text-green-800": variant === "success",
          "bg-yellow-100 text-yellow-800": variant === "warning",
          "bg-red-100 text-red-800": variant === "error",
        },
        {
          "px-2 py-0.5 text-xs": size === "sm",
          "px-2.5 py-0.5 text-xs": size === "md",
          "px-3 py-1 text-sm": size === "lg",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
