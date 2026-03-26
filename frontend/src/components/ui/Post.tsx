import { cva } from "class-variance-authority";
import Like from "./Like";
import { apiFetch } from "../../lib/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getMediaUrl, formatTimeAgo } from "../../lib/utils";
import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import PostMenu from "./PostMenu";
import Posting from "../Posting";
import { IconComment } from "./Icons";
import { motion, AnimatePresence } from "framer-motion";

// --- Variants ---
const postVariants = cva(
  "grid grid-cols-[auto_minmax(0,1fr)] rounded-sm w-full",
  {
    variants: {
      background: {
        default: "bg-bg-lighter",
        darker: "bg-bg",
      },
      size: {
        default: "p-4 pr-12 gap-3 gap-y-4 shadow-md",
        reply: "p-3 pr-4 gap-2 gap-y-2 shadow-sm border border-white/5",
      },
    },
    defaultVariants: { background: "default", size: "default" },
  },
);

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
  commentsCount?: number;
  likedByCurrentUser?: boolean;
  isCensored?: boolean;
  background?: "default" | "darker";
  onDelete?: (id: number) => void;
  onUpdate?: (post: any) => void;
}

export default function Post({
  id,
  authorId,
  username,
  avatarUrl,
  text: initialText,
  mediaUrl: initialMediaUrl,
  timestamp = "il y a 2h",
  isReply = false,
  likesCount = 0,
  commentsCount = 0,
  likedByCurrentUser = false,
  isCensored = false,
  background = "default",
  onDelete,
  onUpdate,
}: PostProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [text, setText] = useState(initialText);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // States pour les commentaires
  const [localCommentsCount, setLocalCommentsCount] = useState(commentsCount);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const fetchComments = async (reset = false) => {
    if (!id || isLoadingComments || (!hasMoreComments && !reset)) return;

    setIsLoadingComments(true);
    try {
      const offset = reset ? 0 : commentsPage * 7;
      const response = (await apiFetch(
        `/posts/${id}/comments?limit=7&offset=${offset}`,
      )) as any[];

      if (reset) {
        setComments(response);
      } else {
        setComments((prev) => [...prev, ...response]);
      }

      setHasMoreComments(response.length === 7);
      if (!reset) {
        setCommentsPage((prev) => prev + 1);
      } else {
        setCommentsPage(1);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des commentaires:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const toggleComments = () => {
    const newState = !isCommentsOpen;
    setIsCommentsOpen(newState);
    if (newState && comments.length === 0) {
      fetchComments(true);
    }
  };

  const handleCommentCreated = (newComment: any) => {
    setComments((prev) => [newComment, ...prev]);
    setLocalCommentsCount((prev) => prev + 1);
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

  const handlePostEdited = (updatedPostData: any) => {
    setText(updatedPostData.TextContent);
    setMediaUrl(updatedPostData.mediaUrl);
    setIsEditing(false);
    onUpdate?.(updatedPostData);
  };

  if (isEditing) {
    return (
      <div className={postVariants({ background })}>
        <img
          src={
            getMediaUrl(avatarUrl) ??
            `https://ui-avatars.com/api/?name=${username}&background=random`
          }
          alt={`${username}'s avatar`}
          className={avatarVariants({ size: isReply ? "reply" : "default" })}
        />
        <div className="flex flex-col gap-1 w-full relative">
          <Posting
            isEditing={true}
            editPostId={id!}
            initialContent={text}
            initialMediaUrl={mediaUrl}
            onPostEdited={handlePostEdited}
            onCancelEdit={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <figure
      className={postVariants({
        background,
        size: isReply ? "reply" : "default",
      })}
    >
      {/* --- Colonne gauche : Avatar --- */}
      <img
        src={
          getMediaUrl(avatarUrl) ??
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
              <PostMenu userId={authorId} username={username} />
            )}
          </div>
          <span className="text-inactive text-14 ">@{username}</span>
        </div>

        {/* Corps du message */}
        <p
          className={`text-16 leading-relaxed whitespace-pre-wrap ${isCensored ? "text-red-400 italic" : "text-fg"}`}
        >
          {isCensored && <span className="mr-1">⚠️</span>}
          {text}
        </p>

        {/* Media si présent */}
        {mediaUrl && (
          <div className="mt-2 rounded-lg overflow-hidden max-w-full inline-block">
            {mediaUrl.match(/\.(mp4|webm|ogg|mov)$/i) ? (
              <video
                src={getMediaUrl(mediaUrl) ?? undefined}
                controls
                className="max-h-96 w-auto object-contain rounded-lg"
              />
            ) : (
              <img
                src={getMediaUrl(mediaUrl) || ""}
                alt="Post media"
                className="max-h-96 w-auto object-contain rounded-lg"
              />
            )}
          </div>
        )}

        {/* Footer : actions */}
        {!isCensored && (
          <div className="flex items-center gap-2 w-full mt-2">
            <Like
              size="sm"
              defaultLiked={likedByCurrentUser}
              defaultCount={likesCount}
              onClick={handleLike}
            />
            <button
              onClick={toggleComments}
              className="flex items-center gap-1.5 text-inactive hover:text-primary transition-colors focus:outline-none"
              aria-label="Afficher les commentaires"
            >
              <IconComment />
              <span className="text-14 font-medium">{localCommentsCount}</span>
            </button>

            {user?.username === username && (
              <div className="ml-auto flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isDeleting}
                  className="text-14 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isDeleting}
                  className="text-14 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Suppression..." : "Supprimer"}
                </button>
              </div>
            )}
          </div>
        )}
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

      {/* Section Commentaires */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex col-span-2 col-start-1 flex-col gap-4 mt-4 overflow-hidden"
          >
            {user && id && (
              <div className="pl-10 w-full mb-2">
                <Posting
                  variant="comment"
                  postId={id}
                  onPostCreated={handleCommentCreated}
                />
              </div>
            )}

            <div className="flex flex-col gap-2 w-full pl-10">
              {comments.map((comment, i) => (
                <Post
                  key={`${comment.id}-${i}`}
                  id={comment.id}
                  authorId={comment.author?.id}
                  username={comment.author?.username || "Utilisateur"}
                  avatarUrl={comment.author?.profilePicture}
                  text={comment.TextContent}
                  timestamp={
                    comment.CreatedAt
                      ? formatTimeAgo(comment.CreatedAt)
                      : undefined
                  }
                  isReply={true}
                  background="darker"
                  likesCount={comment.likesCount}
                  commentsCount={comment.commentsCount}
                  likedByCurrentUser={comment.likedByCurrentUser}
                  isCensored={comment.isCensored}
                />
              ))}

              {hasMoreComments && comments.length > 0 && (
                <div className="pl-3 mt-2 mb-2">
                  <button
                    onClick={() => fetchComments()}
                    disabled={isLoadingComments}
                    className="text-14 font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
                  >
                    {isLoadingComments
                      ? "Chargement..."
                      : "Charger plus de réponses"}
                  </button>
                </div>
              )}

              {isLoadingComments && comments.length === 0 && (
                <div className="pl-14 text-14 text-inactive mt-2 flex items-center justify-center py-4">
                  Chargement des commentaires...
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </figure>
  );
}
