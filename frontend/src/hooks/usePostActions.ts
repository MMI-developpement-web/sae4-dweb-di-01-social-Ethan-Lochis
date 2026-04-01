import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import type { PostType } from "../types/post";

export interface PostActionCallbacks {
  onDelete?: (postId: number) => void;
  onRetweet?: (newPost: PostType) => void;
  onPin?: (postId: number, isPinnedNow: boolean) => void;
}

export function usePostActions(post: PostType, callbacks?: PostActionCallbacks, isReply = false) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLikedByCurrentUser || false);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetweeting, setIsRetweeting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    setLikesCount(post.likesCount || 0);
    setIsLiked(post.isLikedByCurrentUser || false);
  }, [post.likesCount, post.isLikedByCurrentUser]);

  const requireAuthOrRedirect = useCallback((): boolean => {
    if (!user) {
      navigate("/Auth", { replace: true });
      return false;
    }
    return true;
  }, [user, navigate]);

  const toggleLike = async () => {
    if (!post.id || !requireAuthOrRedirect()) return;
    
    const wasLiked = isLiked;
    
    setIsLiked(!wasLiked);
    setLikesCount(prev => (wasLiked ? prev - 1 : prev + 1));

    try {
      await apiFetch(`/posts/${post.id}/like`, { method: "POST" });
    } catch (error) {
      console.error("Échec du Like:", error);
      setIsLiked(wasLiked);
      setLikesCount(prev => (wasLiked ? prev + 1 : prev - 1));
    }
  };

  const deletePost = async () => {
    if (!post.id || isDeleting) return;

    setIsDeleting(true);
    try {
      const url = isReply ? `/posts/comments/${post.id}` : `/posts/${post.id}`;
      await apiFetch(url, { method: "DELETE" });
      callbacks?.onDelete?.(post.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Échec de la suppression:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const retweetPost = async () => {
    if (!post.id || isRetweeting || !requireAuthOrRedirect()) return;

    setIsRetweeting(true);
    try {
      const response = await apiFetch(`/posts/${post.id}/retweet`, { method: "POST" });
      callbacks?.onRetweet?.(response as PostType);
    } catch (error) {
      console.error("Échec du retweet:", error);
    } finally {
      setIsRetweeting(false);
    }
  };

  const togglePin = async (currentlyPinned: boolean) => {
    if (!post.id || isPinning) return;

    setIsPinning(true);
    const httpMethod = currentlyPinned ? "DELETE" : "POST";
    
    try {
      await apiFetch(`/posts/${post.id}/pin`, { method: httpMethod });
      callbacks?.onPin?.(post.id, !currentlyPinned);
    } catch (error) {
      console.error("Échec de l'épinglage:", error);
    } finally {
      setIsPinning(false);
    }
  };

  return {
    isDeleting,
    isRetweeting,
    isPinning,
    isDeleteDialogOpen,
    likesCount,
    isLiked,
    requestDelete: () => setIsDeleteDialogOpen(true),
    cancelDelete: () => setIsDeleteDialogOpen(false),
    toggleLike,
    deletePost,
    retweetPost,
    togglePin,
  };
}
