import Label from "./Label";
import InputField from "./InputField";
import ErrorMessage from "./ErrorMessage";

interface FormFieldProps {
  id: string;
  label: string;
  variant: "username" | "email" | "password";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export default function FormField({
  id,
  label,
  variant,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  placeholder,
}: FormFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <InputField
        id={id}
        variant={variant}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        isError={!!error}
      />
      <ErrorMessage message={error} />
    </div>
  );
}
