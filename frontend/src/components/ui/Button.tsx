// import type { ReactNode } from "react";
// import { twMerge } from "tailwind-merge";

// interface ButtonNaifDataProps {
//   children: ReactNode;
//   disabled?: boolean;
// }

// interface ButtonNaifViewProps {
//   className?: string;
// }

// export default function Button({
//   className,
//   children,
// }: ButtonNaifDataProps & ButtonNaifViewProps) {

//   return (
//     <button
//       className={twMerge(
//         "rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600",
//         className,
//       )}
//     >
//       {children}
//     </button>
//   );
// }

// import { cn } from "../../lib/utils";
// import type { ReactNode } from "react";

// interface ButtonCnDataProps {
//   children: ReactNode;
// }

// interface ButtonCnViewProps {
//   variant?: "primary" | "secondary" | "danger" | "Confirm";
//   className?: string;
// }

// export default function ButtonCn({
//   children,
//   variant = "primary",
//   className,
// }: ButtonCnDataProps & ButtonCnViewProps) {
//   return (
//     <button
//       className={cn(
//         "px-4 py-2 rounded-md font-medium transition-colors",
//         {
//           "bg-blue-500 text-white hover:bg-blue-600": variant === "primary",
//           "bg-gray-200 text-gray-800 hover:bg-gray-300": variant === "secondary",
//           "bg-red-500 text-white hover:bg-red-600": variant === "danger",
//           "bg-green-700 text-white hover:bg-green-600": variant === "Confirm",
//         },
//         className,
//       )}
//     >
//       {children}
//     </button>
//   );
// }

import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-primary text-fg hover:bg-primary-hover focus:ring-primary",
        secondary:
          "bg-secondary text-fg hover:bg-secondary-hover focus:ring-secondary",
        danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500",
        ghost: "text-fg hover:bg-gray-100 focus:ring-gray-900",
        outline:
          "border border-gray-300 bg-transparent hover:bg-gray-50 focus:ring-gray-500",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

interface ButtonDataProps {
  children: ReactNode;
}

interface ButtonViewProps
  extends VariantProps<typeof buttonVariants>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> {}

interface ButtonProps extends ButtonDataProps, ButtonViewProps {}

export default function Button({
  children,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size })}
      {...props}
    >
      {children}
    </button>
  );
}