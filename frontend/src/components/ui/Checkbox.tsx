import { cn } from "../../lib/utils";

interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  id,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  className,
}: CheckboxProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        defaultChecked={defaultChecked}
        onChange={onChange}
        disabled={disabled}
        className="size-4 cursor-pointer rounded accent-primary disabled:opacity-50 disabled:pointer-events-none"
      />
      <label
        htmlFor={id}
        className="cursor-pointer select-none text-sm text-fg/80"
      >
        {label}
      </label>
    </div>
  );
}
