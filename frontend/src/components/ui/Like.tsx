import { cva, type VariantProps } from "class-variance-authority";
import { IconHeart } from "./Icons";
import { useState, useEffect } from "react";

const likeVariants = cva(
  "inline-flex items-center justify-center rounded-full transition-colors cursor-pointer",
  {
    variants: {
      background: {
        default: "",
        grey: "bg-gray-200 hover:bg-gray-300",
        primary:"bg-primary hover:bg-primary-hover"
      },
      size: {
        sm: "size-8 [&>svg]:size-4",
        md: "size-10 [&>svg]:size-5",
        lg: "size-12 [&>svg]:size-6",
      },
      filling: {
        none: "[&>svg]:fill-transparent [&>svg]:stroke-gray-600",
        red: "[&>svg]:fill-red-500 [&>svg]:stroke-red-500",
        primary: "[&>svg]:fill-primary [&>svg]:stroke-primary",
        secondary: "[&>svg]:fill-secondary [&>svg]:stroke-secondary",
      },
    },
    defaultVariants: {
      size: "md",
      background: "default",
      filling: "red",
    },
  },
);

interface LikeProps extends VariantProps<typeof likeVariants> {
  onClick?: () => void;
  defaultLiked?: boolean;
  defaultCount?: number;
}

export default function Like({
  size,
  background,
  filling = "red",
  onClick,
  defaultLiked = false,
  defaultCount = 0,
}: LikeProps) {
  const [liked, setLiked] = useState(defaultLiked);
  const [count, setCount] = useState(defaultCount);

  useEffect(() => {
    setLiked(defaultLiked);
    setCount(defaultCount);
  }, [defaultLiked, defaultCount]);

  function handleClick() {
    const next = !liked;
    setLiked(next);
    setCount((c) => (next ? c + 1 : c - 1));
    onClick?.();
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={handleClick}
        className={likeVariants({ size, background, filling: liked ? filling : "none" })}
      >
        <IconHeart className="transition-colors" />
      </button>
      {count > 0 && <span className="text-sm text-gray-500">{count}</span>}
    </div>
  );
}
