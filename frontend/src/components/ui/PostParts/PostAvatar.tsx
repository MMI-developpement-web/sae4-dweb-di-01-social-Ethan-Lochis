import { getMediaUrl } from "../../../lib/utils";
import { cva } from "class-variance-authority";

export const initialAvatarVariants = cva("rounded-full object-cover shrink-0", {
  variants: {
    size: {
      reply: "size-6", // 24px pour les réponses
      default: "size-10", // 40px pour les Post principaux
    },
  },
  defaultVariants: { size: "default" },
});

interface PostAvatarProps {
  username: string;
  avatarUrl?: string;
  isReply?: boolean;
}

export function PostAvatar({ username, avatarUrl, isReply }: PostAvatarProps) {
  return (
    <img
      src={
        getMediaUrl(avatarUrl) ??
        `https://ui-avatars.com/api/?name=${username}&background=random`
      }
      alt={`${username}'s avatar`}
      className={initialAvatarVariants({ size: isReply ? "reply" : "default" })}
    />
  );
}
