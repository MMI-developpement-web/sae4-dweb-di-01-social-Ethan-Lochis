import { useState, useCallback, useEffect, useRef } from "react";
import { apiFetch } from "../lib/api";

export interface Comment {
  id: number;
  [key: string]: unknown; // Contrat minimal auto-documenté
}

const COMMENTS_PER_PAGE = 7;

export function useComments(postId: number | undefined, initialTotal = 0) {
  const [total, setTotal] = useState(initialTotal);
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Guard contre les appels multiples de fetch (évite les reclassements incessants des dépendances)
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setTotal(initialTotal);
  }, [initialTotal]);

  const fetchComments = useCallback(async (targetPage: number) => {
    if (!postId || isFetchingRef.current) return;

    setIsLoading(true);
    isFetchingRef.current = true;

    try {
      const offset = targetPage * COMMENTS_PER_PAGE;
      const response = await apiFetch(
        `/posts/${postId}/comments?limit=${COMMENTS_PER_PAGE}&offset=${offset}`
      );
      const fetchedComments = response as Comment[];

      setComments(prev => targetPage === 0 ? fetchedComments : [...prev, ...fetchedComments]);
      setHasMore(fetchedComments.length === COMMENTS_PER_PAGE);
      setPage(targetPage);
    } catch (error) {
      console.error(`Erreur de chargement des commentaires (Post: ${postId}):`, error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [postId]);

  const toggle = useCallback(() => {
    if (!isOpen && comments.length === 0) {
      fetchComments(0);
    }
    setIsOpen(prev => !prev);
  }, [isOpen, comments.length, fetchComments]);

  const fetchNextPage = useCallback(() => {
    if (hasMore) fetchComments(page + 1);
  }, [hasMore, page, fetchComments]);

  const addComment = useCallback((newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    setTotal(prev => prev + 1);
  }, []);

  const updateComment = useCallback((updatedComment: Comment) => {
    setComments(prev => prev.map(c => c.id === updatedComment.id ? { ...c, ...updatedComment } : c));
  }, []);

  const deleteComment = useCallback((commentId: number) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    setTotal(prev => Math.max(0, prev - 1));
  }, []);

  return {
    isOpen,
    comments,
    total,
    hasMore,
    isLoading,
    toggle,
    fetchNextPage,
    addComment,
    updateComment,
    deleteComment,
  };
}
