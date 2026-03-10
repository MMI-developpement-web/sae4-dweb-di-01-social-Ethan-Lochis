import { useState } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { IconUser, IconMail, IconLock, IconEye, IconEyeSlash } from "./Icons";

const inputWrapperVariants = cva(
  [
    "flex items-center gap-2 rounded-md border w-full",
    "bg-bg px-3 py-2 transition-all",
    "focus-within:ring-2",
  ],
  {
    variants: {
      variant: {
        username: "border-gray-600 focus-within:ring-primary focus-within:border-primary",
        email: "border-gray-600 focus-within:ring-primary focus-within:border-primary",
        password: "border-gray-600 focus-within:ring-primary focus-within:border-primary",
      },
      isError: {
        true: "border-red-500 focus-within:ring-red-500/60 focus-within:border-red-500",
        false: "",
      },
    },
    defaultVariants: {
      variant: "username",
      isError: false,
    },
  },
);

const variantConfig = {
  username: {
    type: "text" as const,
    Icon: IconUser,
    placeholder: "Nom d'utilisateur",
    autoComplete: "username",
  },
  email: {
    type: "email" as const,
    Icon: IconMail,
    placeholder: "Adresse e-mail",
    autoComplete: "email",
  },
  password: {
    type: "password" as const,
    Icon: IconLock,
    placeholder: "Mot de passe",
    autoComplete: "current-password",
  },
};

interface InputFieldProps extends VariantProps<typeof inputWrapperVariants> {
  id?: string;
  placeholder?: string;
  autoComplete?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export default function InputField({
  id,
  variant = "username",
  isError = false,
  placeholder,
  autoComplete,
  value,
  defaultValue,
  onChange,
  className,
  disabled = false,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  const config = variantConfig[variant ?? "username"];
  const inputType =
    variant === "password"
      ? showPassword
        ? "text"
        : "password"
      : config.type;

  return (
    <div
      className={cn(
        inputWrapperVariants({ variant, isError }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <config.Icon className="size-5 shrink-0 text-gray-400" />
      <input
        id={id}
        type={inputType}
        placeholder={placeholder ?? config.placeholder}
        autoComplete={autoComplete ?? config.autoComplete}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        className="flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-gray-400"
      />
      {variant === "password" && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={
            showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"
          }
          className="text-gray-400 transition-colors hover:text-fg focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? (
            <IconEyeSlash className="size-5" />
          ) : (
            <IconEye className="size-5" />
          )}
        </button>
      )}
    </div>
  );
}
