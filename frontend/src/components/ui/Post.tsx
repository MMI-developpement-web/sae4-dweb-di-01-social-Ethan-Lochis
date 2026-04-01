import { useState } from "react";
import { cva } from "class-variance-authority";
import { AnimatePresence } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import type { PostType } from "../../types/post";

import ConfirmModal from "./ConfirmModal";
import Posting from "../Posting";
import { PostAvatar } from "./PostParts/PostAvatar";
import { PostHeader } from "./PostParts/PostHeader";
import { PostContent } from "./PostParts/PostContent";
import { PostActionBar } from "./PostParts/PostActionBar";
import { CommentSection } from "./PostParts/CommentSection";
import { IconPin } from "./Icons";

import { usePostActions } from "../../hooks/usePostActions";
import { useComments } from "../../hooks/useComments";
import { formatTimeAgo } from "../../lib/utils";

const postVariants = cva(
  "grid grid-cols-[auto_minmax(0,1fr)] rounded-sm w-full",
  {
    variants: {
      background: {
        default: "bg-bg-lighter",
        darker: "bg-bg",
      },
      size: {
        default: "p-4 pr-4 sm:pr-12 gap-2 gap-y-4 shadow-md",
        reply: "p-3 pr-4 gap-2 gap-y-2 shadow-sm border border-white/5",
      },
    },
    defaultVariants: { background: "default", size: "default" },
  },
);

interface EnhancedPostProps {
  post: PostType;
  isReply?: boolean;
  background?: "default" | "darker";
  onDelete?: (id: number) => void;
  onUpdate?: (post: PostType) => void;
  onPin?: (id: number, isPinnedNow: boolean) => void;
  onRetweet?: (newPost: PostType) => void;
}

export default function Post({
  post,
  isReply = false,
  background = "default",
  onDelete,
  onUpdate,
  onPin,
  onRetweet,
}: EnhancedPostProps) {
  const { user } = useAuth();

  // Content state (for edits)
  const [isEditing, setIsEditing] = useState(false);

  // Computed states
  const isPinned = user?.pinnedPostId === post.id;
  const isReadOnly = post.Author.isReadOnly || !!user?.isReadOnly;

  // Custom Hooks
  const actions = usePostActions(post, { onDelete, onRetweet, onPin }, isReply);
  const comments = useComments(post.id, post.commentsCount);

  // Guard Clause : Mode Édition
  if (isEditing) {
    return (
      <div className={postVariants({ background })}>
        <PostAvatar
          username={post.Author.username}
          avatarUrl={post.Author.profilePicture}
          isReply={isReply}
        />
        <div className="flex flex-col gap-1 w-full relative">
          <Posting
            variant={isReply ? "comment" : "post"}
            isEditing={true}
            editPostId={post.id}
            initialContent={post.TextContent}
            initialMediaUrl={post.mediaUrl}
            onPostEdited={(updatedPostData) => {
              setIsEditing(false);
              onUpdate?.(updatedPostData);
            }}
            onCancelEdit={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  const timestampString = post.CreatedAt
    ? formatTimeAgo(post.CreatedAt)
    : "À l'instant";

  return (
    <figure
      className={postVariants({
        background,
        size: isReply ? "reply" : "default",
      })}
    >
      {!post.isRetweet ? (
        <PostAvatar
          username={post.Author.username}
          avatarUrl={post.Author.profilePicture}
          isReply={isReply}
        />
      ) : (
        <PostAvatar
          username={post.RetweetedBy?.username || "Inconnu"}
          avatarUrl={post.RetweetedBy?.profilePicture}
          isReply={isReply}
        />
      )}

      <div className="flex flex-col gap-1 w-full relative">
        {/* Context Indicators (Pinned) */}
        {isPinned && (
          <div className="flex items-center gap-2 text-14 text-inactive mb-1 font-medium">
            <span className="flex items-center gap-1.5">
              <IconPin className="size-4" /> Épinglé
            </span>
          </div>
        )}

        <PostHeader
          username={
            post.isRetweet
              ? post.RetweetedBy?.username || "Inconnu"
              : post.Author.username
          }
          timestamp={timestampString}
          authorId={post.isRetweet ? post.RetweetedBy?.id || 0 : post.Author.id}
          onEdit={isReply ? () => setIsEditing(true) : undefined}
          onDelete={isReply ? actions.requestDelete : undefined}
        />

        <PostContent
          text={post.TextContent}
          mediaUrl={post.mediaUrl}
          isCensored={post.isCensored}
        />

        {post.isRetweet && post.originalAuthorUsername && (
          <p className="text-14 text-inactive mt-1">
            Créé à l'origine par @{post.originalAuthorUsername}
          </p>
        )}

        {!post.isCensored && (
          <PostActionBar
            username={post.Author.username}
            isReply={isReply}
            isPinned={isPinned}
            isRetweet={post.isRetweet || false}
            isReadOnly={isReadOnly}
            likesCount={actions.likesCount}
            isLiked={actions.isLiked}
            onLike={actions.toggleLike}
            commentsCount={comments.total}
            onToggleComments={comments.toggle}
            isRetweeting={actions.isRetweeting}
            isPinning={actions.isPinning}
            isDeleting={actions.isDeleting}
            onRetweet={actions.retweetPost}
            onPin={actions.togglePin}
            onEdit={() => setIsEditing(true)}
            onDeletePrompt={actions.requestDelete}
          />
        )}
      </div>

      {actions.isDeleteDialogOpen && (
        <ConfirmModal
          isOpen={actions.isDeleteDialogOpen}
          title="Supprimer la publication"
          description="Êtes-vous sûr de vouloir supprimer définitivement cette publication ? Cette action est irréversible."
          confirmText="Supprimer"
          cancelText="Annuler"
          onConfirm={actions.deletePost}
          onCancel={actions.cancelDelete}
          isLoading={actions.isDeleting}
        />
      )}

      <AnimatePresence>
        {comments.isOpen && (
          <CommentSection
            postId={post.id}
            comments={comments}
            isReadOnly={isReadOnly}
          />
        )}
      </AnimatePresence>
    </figure>
  );
}
