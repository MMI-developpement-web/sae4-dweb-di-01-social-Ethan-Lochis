import { motion } from "framer-motion";
import Posting from "../../Posting";
import Post from "../Post";
import { useAuth } from "../../../contexts/AuthContext";
import type { PostType } from "../../../types/post";

function mapCommentToPostType(comment: any): PostType {
  return {
    id: comment.id,
    TextContent: comment.TextContent,
    mediaUrl: comment.mediaUrl,
    CreatedAt: comment.CreatedAt || new Date().toISOString(),
    likesCount: comment.likesCount || 0,
    commentsCount: comment.commentsCount || 0,
    isLikedByCurrentUser: comment.likedByCurrentUser || false,
    isCensored: comment.isCensored || false,
    isRetweet: false,
    Author: {
      id: comment.author?.id || 0,
      username: comment.author?.username || "Utilisateur",
      profilePicture: comment.author?.profilePicture,
      readOnly: comment.author?.readOnly ?? comment.author?.isReadOnly ?? false,
    }
  };
}

interface CommentSectionProps {
  postId: number;
  isReadOnly: boolean;
  comments: {
    isOpen: boolean;
    comments: any[];
    hasMore: boolean;
    isLoading: boolean;
    fetchNextPage: () => void;
    addComment: (comment: any) => void;
    updateComment: (comment: any) => void;
    deleteComment: (commentId: number) => void;
  };
}

export function CommentSection({
  postId,
  isReadOnly,
  comments,
}: CommentSectionProps) {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="w-full flex col-span-2 col-start-1 flex-col gap-4 mt-4 overflow-hidden"
    >
      {user && !isReadOnly && (
        <div className="pl-10 w-full mb-2">
          <Posting
            variant="comment"
            postId={postId}
            onPostCreated={comments.addComment}
          />
        </div>
      )}

      {isReadOnly && (
        <div className="pl-14 w-full mb-2 text-14 text-red-100 bg-red-900/20 py-2 px-4 rounded-md border border-red-500/30 italic">
          Ce profil est en lecture seule. Les commentaires sont désactivés.
        </div>
      )}

      <div className="flex flex-col gap-2 w-full pl-10">
        {comments.comments.map((comment, i) => (
          <Post
            key={`${comment.id}-${i}`}
            isReply={true}
            background="darker"
            post={mapCommentToPostType(comment)}
            onUpdate={comments.updateComment}
            onDelete={comments.deleteComment}
          />
        ))}

        {comments.hasMore && comments.comments.length > 0 && (
          <div className="pl-3 mt-2 mb-2">
            <button
              onClick={() => comments.fetchNextPage()}
              disabled={comments.isLoading}
              className="text-14 font-medium text-primary hover:text-primary/80 transition-colors focus:outline-none"
            >
              {comments.isLoading
                ? "Chargement..."
                : "Charger plus de réponses"}
            </button>
          </div>
        )}

        {!comments.hasMore && comments.comments.length > 0 && (
          <div className="pl-14 text-14 text-inactive mt-4 mb-2 flex items-center justify-center">
            Vous avez lu tous les commentaires pour ce post !
          </div>
        )}

        {comments.isLoading && comments.comments.length === 0 && (
          <div className="pl-14 text-14 text-inactive mt-2 flex items-center justify-center py-4">
            Chargement des commentaires...
          </div>
        )}
      </div>
    </motion.div>
  );
}
