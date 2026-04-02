import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useFollow, useBlock } from "../../contexts/UserRelationsContext";
import { apiFetch } from "../../lib/api";
import { IconMore, IconSpinner } from "./Icons";

interface PostMenuProps {
  userId: number;
  username: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function PostMenu({ userId, username, onEdit, onDelete }: PostMenuProps) {
  const { user, token } = useAuth();
  const { followedUsers, toggleFollow } = useFollow();
  const { blockedUsers, toggleBlock } = useBlock();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isLoadingBlock, setIsLoadingBlock] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isFollowed = followedUsers.has(userId);
  const isBlocked = blockedUsers.has(userId);

  // Fermer le menu au clic extérieur — DOIT être avant le return conditionnel
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Ne pas afficher si non connecté
  // Et ne pas afficher si c'est notre profil SAUF si on a des actions (Edit/Delete) à afficher
  if (!user || (!onEdit && !onDelete && user.id === userId)) {
    return null;
  }

  async function handleToggleFollow() {
    if (isLoadingFollow || !token) return;
    setIsLoadingFollow(true);
    try {
      const method = isFollowed ? "DELETE" : "POST";
      await apiFetch(`/users/${userId}/follow`, { method });
      toggleFollow(userId, !isFollowed);
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setIsLoadingFollow(false);
      setIsOpen(false);
    }
  }

  async function handleToggleBlock() {
    if (isLoadingBlock || !token) return;
    setIsLoadingBlock(true);
    try {
      const method = isBlocked ? "DELETE" : "POST";
      await apiFetch(`/users/${userId}/block`, { method });
      toggleBlock(userId, !isBlocked);
      // Si on bloque, on unfollow aussi côté frontend
      if (!isBlocked && isFollowed) {
        toggleFollow(userId, false);
      }
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setIsLoadingBlock(false);
      setIsOpen(false);
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full hover:bg-white/10 text-inactive hover:text-fg transition-colors"
        aria-label={`Actions pour ${username}`}
      >
        <IconMore className="size-5" />
      </button>

      {isOpen && (
        <nav
          className="absolute right-0 mt-1 w-44 bg-bg-lighter rounded-md shadow-lg border border-white/10 z-20 flex flex-col overflow-hidden"
          aria-label="Menu actions utilisateur"
        >
          {onEdit && (
            <button
              onClick={() => {
                onEdit();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-fg hover:bg-white/5 transition-colors text-left cursor-pointer"
            >
              Modifier
            </button>
          )}

          {user.id !== userId && (
            <>
              <button
                onClick={handleToggleFollow}
                disabled={isLoadingFollow}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-fg hover:bg-white/5 transition-colors text-left cursor-pointer disabled:opacity-50"
              >
                {isLoadingFollow && <IconSpinner className="size-4" />}
                {isFollowed ? "Ne plus suivre" : "Suivre"}
              </button>
              <button
                onClick={handleToggleBlock}
                disabled={isLoadingBlock}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer disabled:opacity-50 border-t border-white/5"
              >
                {isLoadingBlock && <IconSpinner className="size-4" />}
                {isBlocked ? "Débloquer" : "Bloquer"}
              </button>
            </>
          )}

          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer border-t border-white/5"
            >
              Supprimer
            </button>
          )}
        </nav>
      )}
    </div>
  );
}
