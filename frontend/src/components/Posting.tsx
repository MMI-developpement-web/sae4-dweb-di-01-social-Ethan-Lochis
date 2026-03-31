import { useState, useRef } from "react";
import Publisher from "./ui/Publisher";
import Button from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { IconImage, IconClose, IconCheckComments, IconXComments } from "./ui/Icons";
import { cn, getMediaUrl } from "../lib/utils";
import { usePostForm } from "../hooks/usePostForm";

interface PostingProps {
  onPostCreated?: (data?: any) => void;
  isEditing?: boolean;
  editPostId?: number;
  postId?: number; // Used for comments
  variant?: "post" | "comment";
  initialContent?: string;
  initialMediaUrl?: string;
  onPostEdited?: (newData: any) => void;
  onCancelEdit?: () => void;
}

function extractContentAndTags(text: string) {
  if (!text) return { textContent: "", extractedTags: "" };

  const tagsRegex = /^([#@]\S+\s*)+$/;
  if (tagsRegex.test(text)) {
    return { textContent: "", extractedTags: text.trim().replace(/\s+/g, " ") };
  }

  const match = text.match(/^(.*?)(?:\r?\n\r?\n)((?:[#@]\S+\s*)+)$/s);
  if (match) {
    return {
      textContent: match[1],
      extractedTags: match[2].trim().replace(/\s+/g, " "),
    };
  }

  return { textContent: text, extractedTags: "" };
}

export default function Posting({ 
  onPostCreated,
  isEditing = false,
  editPostId,
  postId,
  variant = "post",
  initialContent = "",
  initialMediaUrl,
  onPostEdited,
  onCancelEdit
}: PostingProps) {
  const { textContent: parsedContent, extractedTags } = extractContentAndTags(initialContent);
  const [content, setContent] = useState(parsedContent);
  const [hashtagsInput, setHashtagsInput] = useState(extractedTags);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const initialPreview = initialMediaUrl ? getMediaUrl(initialMediaUrl) : null;
  const initialPreviewType = initialMediaUrl 
    ? (initialMediaUrl.match(/\.(mp4|webm)$/i) ? "video" : "image") 
    : null;
    
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(initialPreviewType as "image" | "video" | null);
  const [mediaRemoved, setMediaRemoved] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const { submitAction, isSubmitting } = usePostForm({
    variant,
    postId,
    editPostId,
    isEditing,
  });

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value);
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Veuillez sélectionner une image ou une vidéo.");
      return;
    }

    // Vérifier la taille max (30MB pour correspondre au backend)
    if (file.size > 30 * 1024 * 1024) {
      setError("Le fichier ne doit pas dépasser 30MB.");
      return;
    }

    setSelectedFile(file);
    setMediaRemoved(false);
    setError(null);

    // Générer la preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setPreviewType(isImage ? "image" : "video");
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveMedia() {
    setSelectedFile(null);
    setPreview(null);
    setPreviewType(null);
    setMediaRemoved(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!content.trim() && !hashtagsInput.trim()) return;

    setError(null);
    let finalContent = content.trim();

    if (hashtagsInput.trim()) {
      const formattedHashtags = hashtagsInput
        .split(/[,\s]+/)
        .filter(tag => tag.trim() !== "")
        .map(tag => (tag.startsWith("#") || tag.startsWith("@")) ? tag : `#${tag}`)
        .join(" ");
      finalContent = finalContent ? `${finalContent}\n\n${formattedHashtags}` : formattedHashtags;
    }

    const { data, error: submitError } = await submitAction(finalContent, selectedFile, mediaRemoved);

    if (submitError) {
      setError(submitError);
      return;
    }

    if (!isEditing) {
      setContent("");
      setHashtagsInput("");
      setSelectedFile(null);
      setPreview(null);
      setPreviewType(null);
      if (onPostCreated) {
        onPostCreated(data);
      }
    } else {
      if (onPostEdited) {
        onPostEdited(data);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col rounded-[5px] w-full max-w-2xl mx-auto",
        variant === "comment" ? "bg-bg shadow-md border border-fg/20 p-3 gap-2" : "bg-bg-lighter shadow-2xl p-4 gap-4"
      )}
    >
      {!isEditing && <Publisher username={user?.username || "Invité"} avatarUrl={user?.profilePicture ?? undefined} size="md" />}
      {error && (
        <div className="text-red-500 text-sm" role="alert">
          {error}
        </div>
      )}

      <label htmlFor="post-text" className="sr-only">
        Contenu du post
      </label>
      <textarea
        id="post-text"
        name="post-text"
        value={content}
        onChange={handleContentChange}
        placeholder={variant === "comment" ? "Write a comment..." : "What's on your mind?"}
        rows={isEditing ? 4 : (variant === "comment" ? 2 : 5)}
        className="shrink w-full resize-none rounded-lg border border-fg p-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
      />

      {/* Input optionnel pour les hashtags */}
      <input
        type="text"
        value={hashtagsInput}
        onChange={(e) => setHashtagsInput(e.target.value)}
        placeholder="Ajouter des hashtags ou @mentions (ex: react, @user)"
        className="w-full rounded-lg border border-fg p-2 text-sm outline-none focus:ring-2 focus:ring-primary text-fg bg-bg-lighter placeholder:text-gray-400"
      />

      {/* Aperçu ou Input file si non comment */}
      {variant !== "comment" && (
        <>
          {/* Preview du média */}
          {preview && previewType && (
            <div className="relative rounded-lg overflow-hidden max-w-full bg-bg">
              {previewType === "image" ? (
                <img
                  src={preview}
                  alt="Aperçu du média"
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              ) : (
                <video
                  src={preview}
                  controls
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              )}
              <button
                type="button"
                onClick={handleRemoveMedia}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                aria-label="Supprimer le média"
              >
                <IconClose className="size-5 text-white" />
              </button>
            </div>
          )}

          {/* Input file caché */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileInputChange}
            className="hidden"
            aria-label="Sélectionner un média"
          />
        </>
      )}

      {/* Boutons d'action */}
      <div className={cn("flex items-center gap-2", variant === "comment" ? "justify-end" : "justify-between")}>
        {variant !== "comment" && (
          <button
            type="button"
            onClick={triggerFileInput}
            disabled={isSubmitting}
            className={cn(
              "rounded-full transition-colors hover:bg-primary/10",
              isSubmitting && "opacity-50 cursor-not-allowed"
            )}
            aria-label="Ajouter une image ou vidéo"
          >
            <IconImage className="size-6 text-primary" />
          </button>
        )}

        <div className="flex gap-2">
          {/* Icônes pour commentaires en édition (mobiles uniquement) */}
          {isEditing && variant === "comment" && (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onCancelEdit}
                className="flex md:hidden p-2 rounded-full text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                aria-label="Annuler l'édition"
                title="Annuler"
              >
                <IconXComments className="size-5" />
              </button>
              <button
                type="submit"
                disabled={content.trim().length === 0 || isSubmitting}
                className="flex md:hidden p-2 rounded-full text-green-500 hover:bg-green-500/10 transition-colors disabled:opacity-50"
                aria-label="Enregistrer le commentaire"
                title="Enregistrer"
              >
                <IconCheckComments className="size-5" />
              </button>
            </>
          )}

          {/* Boutons texte pour commentaires en édition (desktop) */}
          {isEditing && variant === "comment" && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isSubmitting}
                onClick={onCancelEdit}
                className="hidden md:inline-flex"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={content.trim().length === 0 || isSubmitting}
                className="hidden md:inline-flex"
              >
                {isSubmitting ? "Modification..." : "Enregistrer"}
              </Button>
            </>
          )}

          {/* Boutons standards (posts et autres cas) */}
          {!(isEditing && variant === "comment") && (
            <>
              {isEditing && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  disabled={isSubmitting}
                  onClick={onCancelEdit}
                >
                  Annuler
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={content.trim().length === 0 || isSubmitting}
              >
                {isSubmitting ? (isEditing ? "Modification..." : "Publication...") : (isEditing ? "Enregistrer" : "Publier")}
              </Button>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
