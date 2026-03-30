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
  isReadOnly?: boolean;
  isRetweet?: boolean;
  originalAuthorUsername?: string;
  retweetedBy?: { id: number; username: string };
  isPinned?: boolean;
  onPin?: (id: number, isPinnedNow: boolean) => void;
  onRetweet?: (newPost: any) => void;
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
  isReadOnly = false,
  isRetweet = false,
  originalAuthorUsername,
  retweetedBy,
  isPinned = false,
  onPin,
  onRetweet,
}: PostProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [text, setText] = useState(initialText);
  const [mediaUrl, setMediaUrl] = useState(initialMediaUrl);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isRetweeting, setIsRetweeting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);

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

  const handleRetweet = async () => {
    if (!user) {
      navigate("/Auth", { replace: true });
      return;
    }
    if (!id || isRetweeting) return;

    setIsRetweeting(true);
    try {
      const response = await apiFetch(`/posts/${id}/retweet`, { method: "POST" });
      onRetweet?.(response);
    } catch (e) {
      console.error("Erreur lors du retweet:", e);
    } finally {
      setIsRetweeting(false);
    }
  };

  const handlePin = async () => {
    if (!id || isPinning) return;

    setIsPinning(true);
    try {
      if (isPinned) {
        await apiFetch(`/posts/${id}/pin`, { method: "DELETE" });
        onPin?.(id, false);
      } else {
        await apiFetch(`/posts/${id}/pin`, { method: "POST" });
        onPin?.(id, true);
      }
    } catch (e) {
      console.error("Erreur pin/unpin:", e);
    } finally {
      setIsPinning(false);
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
            variant={isReply ? "comment" : "post"}
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
      <div className="flex flex-col gap-1 w-full relative">
        {(isRetweet || isPinned) && (
          <div className="flex items-center gap-2 text-14 text-inactive mb-1 font-medium">
            {isPinned && <span>📌 Post épinglé</span>}
            {isPinned && isRetweet && <span>•</span>}
            {isRetweet && <span>🔁 Retweeté par @{retweetedBy?.username}</span>}
          </div>
        )}

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
          {text.split(/(#\w+)/g).map((part, index) => {
            if (part.match(/^#\w+/)) {
              return (
                <span
                  key={index}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/search?q=${encodeURIComponent(part)}`);
                  }}
                  className="text-primary hover:underline cursor-pointer font-medium"
                >
                  {part}
                </span>
              );
            }
            return part;
          })}
        </p>
        {isRetweet && originalAuthorUsername && (
          <p className="text-14 text-inactive mt-1">
            Créé à l'origine par @{originalAuthorUsername}
          </p>
        )}

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
            {/* Comment button */}
            {!isReadOnly && !user?.isReadOnly && (
              <button
                onClick={toggleComments}
                className="flex items-center gap-1.5 text-inactive hover:text-primary transition-colors focus:outline-none"
                aria-label="Afficher les commentaires"
              >
                <IconComment className="size-5" />
                <span className="text-14 font-medium">{localCommentsCount}</span>
              </button>
            )}

            {/* Retweet button */}
            <button
              onClick={handleRetweet}
              disabled={isRetweeting || isRetweet || (user?.username === username)}
              className="flex items-center gap-1.5 text-inactive hover:text-green-500 transition-colors focus:outline-none disabled:opacity-50"
              aria-label="Retweeter"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4"></path><path d="M3 11v-1a4 4 0 0 1 4-4h14"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v1a4 4 0 0 1-4 4H3"></path></svg>
            </button>

            {user?.username === username && (
              <div className="ml-auto flex gap-3 items-center">
                {!isReply && (
                  <button
                    onClick={handlePin}
                    disabled={isPinning}
                    className={`text-14 transition-colors disabled:opacity-50 ${isPinned ? "text-secondary" : "text-inactive hover:text-secondary"}`}
                  >
                    {isPinned ? "Désépingler" : "Épingler"}
                  </button>
                )}
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

      {isModalOpen && (
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
      )}

      {/* Section Commentaires */}
      <AnimatePresence>
        {isCommentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full flex col-span-2 col-start-1 flex-col gap-4 mt-4 overflow-hidden"
          >
            {user && id && !isReadOnly && (
              <div className="pl-10 w-full mb-2">
                <Posting
                  variant="comment"
                  postId={id}
                  onPostCreated={handleCommentCreated}
                />
              </div>
            )}
            {user && id && isReadOnly && (
              <div className="pl-10 w-full mb-2 text-14 text-red-400 italic">
                Ce profil est en lecture seule. Les commentaires sont désactivés.
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

              {!hasMoreComments && comments.length > 0 && (
                <div className="pl-14 text-14 text-inactive mt-4 mb-2 flex items-center justify-center">
                  Vous avez lu tous les commentaires pour ce post !
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
