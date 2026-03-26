import { useState } from "react";
import { apiFetch } from "../lib/api";

type PostVariant = "post" | "comment";

interface UsePostFormOptions {
  variant: PostVariant;
  postId?: number;
  editPostId?: number;
  isEditing?: boolean;
}

export function usePostForm({ variant, postId, editPostId, isEditing }: UsePostFormOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitAction = async (content: string, file: File | null, mediaRemoved: boolean) => {
    setIsSubmitting(true);

    try {
      let data;
      if (variant === "comment" && postId) {
        data = await apiFetch(`/posts/${postId}/comments`, {
          method: "POST",
          body: JSON.stringify({ TextContent: content }),
        });
      } else {
        const formData = new FormData();
        formData.append("textContent", content);
        
        if (file) {
          formData.append("media", file);
        }
        
        if (isEditing && mediaRemoved && !file) {
          formData.append("removeMedia", "true");
        }

        const url = isEditing ? `/posts/${editPostId}` : `/posts`;
        data = await apiFetch(url, {
          method: "POST",
          body: formData,
        });
      }
      return { data, error: null };
    } catch (err: any) {
      return { data: null, error: err.message || "Erreur lors de l'opération." };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitAction, isSubmitting };
}
