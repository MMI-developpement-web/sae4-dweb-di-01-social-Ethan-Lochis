import { cva, type VariantProps } from "class-variance-authority";
import FollowButton from "./FollowButton";

const publisherVariants = cva("inline-flex items-center gap-3", {
  variants: {
    size: {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const avatarVariants = cva("rounded-full object-cover shrink-0", {
  variants: {
    size: {
      sm: "size-5",
      md: "size-8",
      lg: "size-16",
    },
    ring: {
      none: "",
      default: "ring-2 ring-gray-300",
      primary: "ring-2 ring-primary",
      secondary: "ring-2 ring-secondary",
    },
  },
  defaultVariants: {
    size: "md",
    ring: "none",
  },
});

const usernameVariants = cva("font-medium", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface PublisherProps extends VariantProps<typeof publisherVariants>, VariantProps<typeof avatarVariants> {
  username: string;
  avatarUrl?: string;
  userId?: number;
}

export default function Publisher({
  username,
  avatarUrl,
  userId,
  size,
  ring,
}: PublisherProps) {
  return (
    <div className={publisherVariants({ size })}>
      <img
        src={avatarUrl ?? `https://ui-avatars.com/api/?name=${username}&background=random`}
        alt={`${username}'s avatar`}
        className={avatarVariants({ size, ring })}
      />
      <span className={usernameVariants({ size })}>{username}</span>
      {userId !== undefined && (
        <FollowButton userId={userId} />
      )}
    </div>
  );
}
