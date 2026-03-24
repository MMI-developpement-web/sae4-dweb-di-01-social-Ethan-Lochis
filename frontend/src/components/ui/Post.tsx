import { cva } from "class-variance-authority";
import Like from "./Like";
import { apiFetch } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { cn, getMediaUrl } from "../../lib/utils";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import FollowButton from "./FollowButton";

// --- Variants ---
const postVariants = cva("flex items-start gap-3 rounded-sm p-4 shadow-md w-full", {
  variants: {
    background: {
      default: "bg-bg-lighter",
      darker: "bg-bg",
    }
  },
  defaultVariants: { background: "default" },
});

const avatarVariants = cva("rounded-full object-cover shrink-0", {
  variants: {
    size: {
      reply: "size-6", // 24px pour les réponses
      default: "size-10", // 40px pour les Post principaux
    },
  },
  defaultVariants: { size: "default" },
});

interface PostProps {
  id?: number;
  authorId?: number;
  username: string;
  avatarUrl?: string;
  text: string;
  mediaUrl?: string;
  timestamp?: string;
  isReply?: boolean;
  likesCount?: number;
  likedByCurrentUser?: boolean;
  background?: "default" | "darker";
  onDelete?: (id: number) => void;
}

export default function Post({
  id,
  authorId,
  username,
  avatarUrl,
  text,
  mediaUrl,
  timestamp = "il y a 2h",
  isReply = false,
  likesCount = 0,
  likedByCurrentUser = false,
  background = "default",
  onDelete,
}: PostProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleDelete = async () => {
    if (!id || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await apiFetch(`/posts/${id}`, { method: "DELETE" });
      onDelete?.(id);
      setIsModalOpen(false);
    } catch (e) {
      console.error("Erreur lors de la suppression:", e);
      setIsDeleting(false);
    }
  };

  return (
    <figure className={postVariants({ background })}>

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
      <div className="flex flex-col gap-1 w-full">
        {/* Header : pseudo + timestamp */}
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-fg text-16 font-semibold">{username}</span>
              <span className="text-14 text-gray-400">{timestamp}</span>
            </div>
            {authorId !== undefined && (
              <FollowButton userId={authorId} />
            )}
          </div>
          <span className="text-inactive text-14 ">@{username}</span>
        </div>

        {/* Corps du message */}
        <p className="text-fg text-16 leading-relaxed">{text}</p>

        {/* Media si présent */}
        {mediaUrl && (
          <div className="mt-2 rounded-lg overflow-hidden max-w-full">
            {mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video
                src={getMediaUrl(mediaUrl) || undefined}
                controls
                className="w-full max-h-96 object-cover"
                alt="Post media"
              />
            ) : (
              <img
                src={getMediaUrl(mediaUrl) || ""}
                alt="Post media"
                className="w-full max-h-96 object-cover rounded-lg"
              />
            )}
          </div>
        )}

        {/* Footer : actions */}
        <div className="flex items-center gap-4 w-full">
          <Like
            size="sm"
            defaultLiked={likedByCurrentUser}
            defaultCount={likesCount}
            onClick={handleLike}
          />
          {user?.username === username && (
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={isDeleting}
              className="text-14 text-red-500 hover:text-red-600 transition-colors ml-auto disabled:opacity-50"
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={isModalOpen}
        title="Supprimer la publication"
        description="Êtes-vous sûr de vouloir supprimer définitivement cette publication ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        onCancel={() => setIsModalOpen(false)}
        isLoading={isDeleting}
      />
    </figure>
  );
}
