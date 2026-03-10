import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import Like from "./Like";

// --- Variants ---
const avatarVariants = cva("rounded-full object-cover shrink-0", {
  variants: {
    size: {
      reply: "size-6",   // 24px pour les réponses
      default: "size-10", // 40px pour les commentaires principaux
    },
  },
  defaultVariants: { size: "default" },
});

interface CommentProps extends VariantProps<typeof avatarVariants> {
  username: string;
  avatarUrl?: string;
  text: string;
  timestamp?: string;
  className?: string;
  isReply?: boolean;
}

export default function Comment({
  username,
  avatarUrl,
  text,
  timestamp = "il y a 2h",
  className,
  isReply = false,
}: CommentProps) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* --- Colonne gauche : Avatar --- */}
      <img
        src={avatarUrl ?? `https://ui-avatars.com/api/?name=${username}&background=random`}
        alt={`${username}'s avatar`}
        className={cn(avatarVariants({ size: isReply ? "reply" : "default" }))}
      />

      {/* --- Colonne droite : Contenu --- */}
      <div className="flex flex-col gap-1">

        {/* Header : pseudo + timestamp */}
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-semibold text-fg">{username}</span>
          <span className="text-[12px] text-gray-400">{timestamp}</span>
        </div>

        {/* Corps du message */}
        <p className="text-[14px] leading-relaxed text-fg">{text}</p>

        {/* Footer : actions */}
        <div className="flex items-center gap-4">
          <Like size="sm" defaultLiked={false} />
        </div>
      </div>
    </div>
  );
}