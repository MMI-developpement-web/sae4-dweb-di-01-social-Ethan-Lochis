import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import Button from "./ui/Button";
import Label from "./ui/Label";
import { IconClose } from "./ui/Icons";
import { getMediaUrl } from "../lib/utils";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileEditModal({ isOpen, onClose }: ProfileEditModalProps) {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Réinitialiser le formulaire quand le modal s'ouvre
  useEffect(() => {
    if (isOpen && user) {
      setBio(user.bio || "");
      setLocation(user.location || "");
      setPreview(user.profilePicture ? getMediaUrl(user.profilePicture) : null);
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      setError("Veuillez sélectionner une image.");
      return;
    }

    // Vérifier la taille max (5MB pour les avatars)
    if (file.size > 5 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 5MB.");
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Générer la preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("bio", bio);
      formData.append("location", location);
      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/me`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la mise à jour");
      }

      const updatedUser = await response.json();
      
      updateUser({ ...user, ...updatedUser });
      addNotification("Profil mis à jour avec succès", "success");
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        addNotification(err.message, "error");
      } else {
        setError("Erreur lors de la mise à jour");
        addNotification("Erreur lors de la mise à jour", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 w-full h-full"
      open={isOpen}
      aria-modal="true"
      aria-labelledby="modal-title"
      role="dialog"
    >
      <div className="bg-bg-lighter p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 id="modal-title" className="text-xl font-bold mb-4 text-fg">
          Modifier mon profil
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Photo de profil avec preview */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="profilePicture">Photo de profil</Label>
            {preview && (
              <div className="relative inline-block w-24 h-24">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  <img src={preview} alt="Aperçu" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={handleRemoveProfilePicture}
                  className="absolute top-0 right-0 bg-red-500 p-1 rounded-full text-white hover:bg-red-600 transition-colors shadow-md"
                  aria-label="Supprimer la photo"
                >
                  <IconClose className="size-4" />
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              id="profilePicture"
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={loading}
            />
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="bio">Bio</Label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Écrivez une courte bio..."
              className="w-full px-3 py-2 rounded-md border border-gray-600 bg-bg text-fg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Localisation */}
          <div className="flex flex-col gap-1">
            <Label htmlFor="location">Localisation</Label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Votre localisation..."
              className="w-full px-3 py-2 rounded-md border border-gray-600 bg-bg text-fg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4 justify-end mt-4">
            <Button
              type="button"
              variant="danger"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
