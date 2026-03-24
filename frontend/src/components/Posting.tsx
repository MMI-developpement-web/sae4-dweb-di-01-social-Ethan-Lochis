import { useState, useRef } from "react";
import Publisher from "./ui/Publisher";
import Button from "./ui/Button";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { IconImage, IconClose } from "./ui/Icons";
import { cn } from "../lib/utils";

interface PostingProps {
  onPostCreated?: () => void;
}

export default function Posting({ onPostCreated }: PostingProps) {
  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(null);
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
      // Créer FormData pour multipart/form-data
      const formData = new FormData();
      formData.append("textContent", content);
      if (selectedFile) {
        formData.append("media", selectedFile);
      }

      // Utiliser fetch directement pour FormData (apiFetch ne supporte pas bien FormData)
       const response = await fetch(`${import.meta.env.VITE_API_URL}/posts`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la publication.");
      }

      setContent("");
      setSelectedFile(null);
      setPreview(null);
      setPreviewType(null);
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
        placeholder="What's on your mind?"
        rows={8}
        className="shrink w-full resize-none rounded-lg border border-fg p-3 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent placeholder:text-gray-400"
      />

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

      {/* Boutons d'action */}
      <div className="flex items-center gap-2 justify-between">
        <button
          type="button"
          onClick={triggerFileInput}
          disabled={isSubmitting}
          className={cn(
            "p-2 rounded-full transition-colors hover:bg-primary/10",
            isSubmitting && "opacity-50 cursor-not-allowed"
          )}
          aria-label="Ajouter une image ou vidéo"
        >
          <IconImage className="size-5 text-primary" />
        </button>

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

