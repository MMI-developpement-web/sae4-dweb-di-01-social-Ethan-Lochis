import { useState, useRef } from "react";
import Publisher from "./ui/Publisher";
import Button from "./ui/Button";
import { useAuth } from "../contexts/AuthContext";
import { IconImage, IconClose } from "./ui/Icons";
import { cn, getMediaUrl } from "../lib/utils";

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
  const [content, setContent] = useState(initialContent);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const initialPreview = initialMediaUrl ? getMediaUrl(initialMediaUrl) : null;
  const initialPreviewType = initialMediaUrl 
    ? (initialMediaUrl.match(/\.(mp4|webm)$/i) ? "video" : "image") 
    : null;
    
  const [preview, setPreview] = useState<string | null>(initialPreview);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(initialPreviewType as "image" | "video" | null);
  const [mediaRemoved, setMediaRemoved] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

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
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      let response;
      if (variant === "comment" && postId) {
        // Envoi simple en JSON pour les commentaires
        response = await fetch(`${import.meta.env.VITE_API_URL}/posts/${postId}/comments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ TextContent: content }),
        });
      } else {
        // Créer FormData pour multipart/form-data (posts avec potentiels médias)
        const formData = new FormData();
        formData.append("textContent", content);
        
        if (selectedFile) {
          formData.append("media", selectedFile);
        }
        
        if (isEditing && mediaRemoved && !selectedFile) {
          formData.append("removeMedia", "true");
        }

        const url = isEditing 
          ? `${import.meta.env.VITE_API_URL}/posts/${editPostId}`
          : `${import.meta.env.VITE_API_URL}/posts`;

        // Utiliser fetch directement pour FormData (apiFetch ne supporte pas bien FormData)
        response = await fetch(url, {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || (isEditing ? "Erreur lors de la modification." : "Erreur lors de la publication."));
      }

      const data = await response.json();

      if (!isEditing) {
        setContent("");
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
    } catch (err: any) {
      setError(err.message || (isEditing ? "Erreur lors de la modification." : "Erreur lors de la publication."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-4 p-4 rounded-[5px] w-full max-w-2xl mx-auto",
        variant === "comment" ? "bg-bg shadow-md border border-fg/20" : "bg-bg-lighter shadow-2xl"
      )}
    >
      {!isEditing && <Publisher username={user?.username || "Invité"} avatarUrl={user?.profilePicture} size="md" />}
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
        rows={isEditing ? 4 : (variant === "comment" ? 2 : 8)}
        className="shrink w-full resize-none rounded-lg border border-fg p-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
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
        </div>
      </div>
    </form>
  );
}
