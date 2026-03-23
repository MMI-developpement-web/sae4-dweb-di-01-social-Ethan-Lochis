import { useState } from "react";
import Publisher from "./ui/Publisher";
import Button from "./ui/Button";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface PostingProps {
  onPostCreated?: () => void;
}

export default function Posting({ onPostCreated }: PostingProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await apiFetch('/posts', {
        method: 'POST',
        body: JSON.stringify({ textContent: content })
      });
      setContent("");
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la publication.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 rounded-[5px] shadow-2xl bg-bg-lighter w-full max-w-2xl mx-auto"
    >
      <Publisher username={user?.username || "Invité"} size="md" />
      {error && <div className="text-red-500 text-sm" role="alert">{error}</div>}
      <label htmlFor="post-text" className="sr-only">
        Contenu du post
      </label>
      <textarea
        id="post-text"
        name="post-text"
        value={content}
        onChange={handleContentChange}
        placeholder="What's on your mind?"
        rows={8}
        className="shrink w-full resize-none rounded-lg border border-fg p-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
      />
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={content.trim().length === 0 || isSubmitting}
        >
          {isSubmitting ? "Publication..." : "Publier"}
        </Button>
      </div>
    </form>
  );
}

