import { cva } from "class-variance-authority";
import Like from "./Like";
import { apiFetch } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

// --- Variants ---
const avatarVariants = cva("rounded-full object-cover shrink-0", {
  variants: {
    size: {
      reply: "size-6", // 24px pour les réponses
      default: "size-10", // 40px pour les Post principaux
    },
    background: {
      default: "bg-bg-lighter",
      darker: "bg-bg",
    },
  },
  defaultVariants: { size: "default", background: "default" },
});

interface PostProps {
  id?: number;
  username: string;
  avatarUrl?: string;
  text: string;
  timestamp?: string;
  isReply?: boolean;
  likesCount?: number;
  likedByCurrentUser?: boolean;
  background?: "default" | "darker";
}

export default function Post({
  id,
  username,
  avatarUrl,
  text,
  timestamp = "il y a 2h",
  isReply = false,
  likesCount = 0,
  likedByCurrentUser = false,
  background = "default",
}: PostProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const backgroundClasses = {
    default: "bg-bg-lighter",
    darker: "bg-bg",
  };

  const handleLike = async () => {
    if (!user) {
      navigate("/Auth", { replace: true });
      return;
    }

    if (!id) return;
    try {
      await apiFetch(`/posts/${id}/like`, { method: "POST" });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <figure className={cn("flex items-start gap-3 rounded-sm p-4 shadow-md", backgroundClasses[background])}>

      {/* --- Colonne gauche : Avatar --- */}
      <img
        src={
          avatarUrl ??
          `https://ui-avatars.com/api/?name=${username}&background=random`
        }
        alt={`${username}'s avatar`}
        className={avatarVariants({ size: isReply ? "reply" : "default" })}
      />

      {/* --- Colonne droite : Contenu --- */}
      <div className="flex flex-col gap-1">
        {/* Header : pseudo + timestamp */}
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-fg text-16 font-semibold">{username}</span>
            <span className="text-14 text-gray-400">{timestamp}</span>
          </div>
          <span className="text-inactive text-14 ">@{username}</span>
        </div>

        {/* Corps du message */}
        <p className="text-fg text-16 leading-relaxed">{text}</p>

        {/* Footer : actions */}
        <div className="flex items-center gap-4">
          <Like
            size="sm"
            defaultLiked={likedByCurrentUser}
            defaultCount={likesCount}
            onClick={handleLike}
          />
        </div>
      </div>
    </figure>
  );
}
