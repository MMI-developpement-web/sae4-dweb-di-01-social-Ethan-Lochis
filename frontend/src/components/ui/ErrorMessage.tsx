interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="text-xs text-red-400 mt-0.5 pl-1"
    >
      {message}
    </p>
  );
}
