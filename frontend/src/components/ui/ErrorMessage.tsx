import { cn } from "../../lib/utils";

interface ErrorMessageProps {
  message?: string;
  className?: string;
}

export default function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className={cn("text-xs text-red-400 mt-0.5 pl-1", className)}
    >
      {message}
    </p>
  );
}
