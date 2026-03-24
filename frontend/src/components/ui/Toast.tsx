// src/components/ui/Toast.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { IconClose, IconCheck, IconWarning, IconInfo, IconError } from "./Icons";

const toastVariants = cva(
  "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium shadow-lg",
  {
    variants: {
      type: {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  onClose?: () => void;
}

function getIcon(type?: "success" | "error" | "warning" | "info") {
  switch (type) {
    case "success":
      return <IconCheck className="size-5 shrink-0" />;
    case "error":
      return <IconError className="size-5 shrink-0" />;
    case "warning":
      return <IconWarning className="size-5 shrink-0" />;
    case "info":
    default:
      return <IconInfo className="size-5 shrink-0" />;
  }
}

export function Toast({ message, type = "info", onClose }: ToastProps) {
  const notifType = (type || "info") as "success" | "error" | "warning" | "info";
  return (
    <div className={cn(toastVariants({ type }))}>
      {getIcon(notifType)}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 inline-flex shrink-0 transition-opacity hover:opacity-80"
          aria-label="Close notification"
        >
          <IconClose className="size-4" />
        </button>
      )}
    </div>
  );
}
