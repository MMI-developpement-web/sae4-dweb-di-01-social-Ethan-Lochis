import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBlock } from "../../contexts/UserRelationsContext";
import Button from "./Button";
import { IconSpinner } from "./Icons";
import { apiFetch } from "../../lib/api";

interface BlockButtonProps {
  userId: number;
}

export default function BlockButton({ userId }: BlockButtonProps) {
  const { user, token } = useAuth();
  const { blockedUsers, toggleBlock } = useBlock();
  const [isLoading, setIsLoading] = useState(false);

  const isBlocked = blockedUsers.has(userId);

  // Ne pas afficher si non connecté ou si c'est le profil courant
  if (!user || user.id === userId) {
    return null;
  }

  async function handleToggleBlock() {
    if (isLoading || !token) return;
    setIsLoading(true);

    try {
      const method = isBlocked ? "DELETE" : "POST";
      await apiFetch(`/users/${userId}/block`, { method });
      toggleBlock(userId, !isBlocked);
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={isBlocked ? "outline" : "danger"}
      size="sm"
      onClick={handleToggleBlock}
      disabled={isLoading}
    >
      {isLoading && <IconSpinner className="size-4 mr-2" />}
      {isBlocked ? "Débloquer" : "Bloquer"}
    </Button>
  );
}
