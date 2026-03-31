import { memo } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Like from "../Like";
import { IconComment, IconPin } from "../Icons";

interface PostActionBarProps {
  // Post properties
  username: string;
  isReply: boolean;
  isPinned: boolean;
  isRetweet: boolean;
  isReadOnly: boolean;

  // Like operations
  likesCount: number;
  isLiked: boolean;
  onLike: () => void;

  // Comment operations
  commentsCount: number;
  onToggleComments: () => void;

  // Action operations
  isRetweeting: boolean;
  isPinning: boolean;
  isDeleting: boolean;

  onRetweet: () => void;
  onPin: (isPinned: boolean) => void;
  onEdit: () => void;
  onDeletePrompt: () => void;
}

const PostActionBar = memo(function PostActionBar({
  username,
  isReply,
  isPinned,
  isRetweet,
  isReadOnly,
  likesCount,
  isLiked,
  onLike,
  commentsCount,
  onToggleComments,
  isRetweeting,
  isPinning,
  isDeleting,
  onRetweet,
  onPin,
  onEdit,
  onDeletePrompt,
}: PostActionBarProps) {
  const { user } = useAuth();

  return (
    <div className="flex items-center gap-2 w-full mt-2">
      <Like
        size="sm"
        defaultLiked={isLiked}
        defaultCount={likesCount}
        onClick={onLike}
      />

      {/* Comment button */}
      {!isReadOnly && !user?.isReadOnly && (
        <button
          onClick={onToggleComments}
          className="flex items-center gap-1.5 text-inactive hover:text-primary transition-colors focus:outline-none"
          aria-label="Afficher les commentaires"
        >
          <IconComment className="size-5" />
          <span className="text-14 font-medium">{commentsCount}</span>
        </button>
      )}

      {/* Retweet button */}
      <button
        onClick={onRetweet}
        disabled={isRetweeting || isRetweet || user?.username === username}
        className="flex items-center gap-1.5 text-inactive hover:text-green-500 transition-colors focus:outline-none disabled:opacity-50"
        aria-label="Retweeter"
      >
        <svg
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          height="20"
          width="20"
          aria-hidden="true"
        >
          <path d="M17 2l4 4-4 4"></path>
          <path d="M3 11v-1a4 4 0 0 1 4-4h14"></path>
          <path d="M7 22l-4-4 4-4"></path>
          <path d="M21 13v1a4 4 0 0 1-4 4H3"></path>
        </svg>
      </button>

      {user?.username === username && (
        <div className="ml-auto flex gap-3 items-center">
          {!isReply && (
            <button
              onClick={() => onPin(isPinned)}
              disabled={isPinning}
              title={isPinned ? "Désépingler" : "Épingler"}
              className={`flex items-center transition-colors disabled:opacity-50 ${
                isPinned ? "text-secondary" : "text-inactive hover:text-secondary"
              }`}
            >
              <IconPin className="size-5" />
            </button>
          )}
          <button
            onClick={onEdit}
            disabled={isDeleting}
            className="text-14 text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
          >
            Modifier
          </button>
          <button
            onClick={onDeletePrompt}
            disabled={isDeleting}
            className="text-14 text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      )}
    </div>
  );
});

export { PostActionBar };
