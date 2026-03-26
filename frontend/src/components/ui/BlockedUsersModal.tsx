import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import { useBlock } from "../../contexts/BlockContext";
import { getMediaUrl } from "../../lib/utils";
import Button from "./Button";
import { IconSpinner, IconClose } from "./Icons";

interface BlockedUser {
  id: number;
  username: string;
  profilePicture: string | null;
}

interface BlockedUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BlockedUsersModal({ isOpen, onClose }: BlockedUsersModalProps) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [unblockingId, setUnblockingId] = useState<number | null>(null);
  const { toggleBlock } = useBlock();

  useEffect(() => {
    if (isOpen) {
      fetchBlockedUsers();
    }
  }, [isOpen]);

  const fetchBlockedUsers = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<BlockedUser[]>("/users/me/blocked");
      setBlockedUsers(data);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs bloqués:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async (userId: number) => {
    setUnblockingId(userId);
    try {
      await apiFetch(`/users/${userId}/block`, { method: "DELETE" });
      toggleBlock(userId, false);
      setBlockedUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error("Erreur lors du déblocage:", error);
    } finally {
      setUnblockingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      open={isOpen}
      onCancel={onClose}
      aria-modal="true"
      aria-labelledby="blocked-users-title"
      role="dialog"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-100 rounded-lg bg-bg-lighter p-6 shadow-xl ring-1 ring-white/10 backdrop:bg-black/50 backdrop:backdrop-blur-sm w-full max-w-md max-h-[70vh] flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="blocked-users-title" className="text-xl font-semibold text-fg">
          Profils bloqués
        </h2>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-white/10 text-inactive hover:text-fg transition-colors"
          aria-label="Fermer"
        >
          <IconClose className="size-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex justify-center items-center py-8">
            <IconSpinner className="size-8" />
          </div>
        )}

        {!loading && blockedUsers.length === 0 && (
          <p className="text-center text-fg/60 py-8">
            Vous n'avez bloqué aucun utilisateur.
          </p>
        )}

        {!loading && blockedUsers.length > 0 && (
          <ul className="flex flex-col gap-2">
            {blockedUsers.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between gap-3 p-3 rounded-md bg-white/5 hover:bg-white/8 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={
                      getMediaUrl(user.profilePicture) ??
                      `https://ui-avatars.com/api/?name=${user.username}&background=random`
                    }
                    alt={`${user.username}'s avatar`}
                    className="size-10 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-fg font-medium truncate">{user.username}</p>
                    <p className="text-inactive text-sm truncate">@{user.username}</p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleUnblock(user.id)}
                  disabled={unblockingId === user.id}
                >
                  {unblockingId === user.id ? (
                    <IconSpinner className="size-4" />
                  ) : (
                    "Débloquer"
                  )}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </dialog>
  );
}
