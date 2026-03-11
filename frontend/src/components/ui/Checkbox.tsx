
interface CheckboxProps {
  id: string;
  label: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function Checkbox({
  id,
  label,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
}: CheckboxProps) {
  return (
    <div className="flex items-center gap-2">
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
