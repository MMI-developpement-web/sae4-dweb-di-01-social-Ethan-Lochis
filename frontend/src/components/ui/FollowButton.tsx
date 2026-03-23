import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useFollow } from "../../contexts/FollowContext";
import Button from "./Button";
import { IconSpinner } from "./Icons";
import { apiFetch } from "../../lib/api";

interface FollowButtonProps {
  userId: number;
}

export default function FollowButton({ userId }: FollowButtonProps) {
  const { user, token } = useAuth();
  const { followedUsers, toggleFollow } = useFollow();
  const [isLoading, setIsLoading] = useState(false);

  const isFollowed = followedUsers.has(userId);

  // Ne pas afficher si non connecté ou si c'est le profil courant
  if (!user || user.id === userId) {
    return null;
  }

  async function handleToggleFollow() {
    if (isLoading || !token) return;
    setIsLoading(true);

    try {
      const method = isFollowed ? "DELETE" : "POST";
      await apiFetch(`/users/${userId}/follow`, { method });
      toggleFollow(userId, !isFollowed);
    } catch (error) {
      console.error("Erreur réseau :", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button
      variant={isFollowed ? "secondary" : "primary"}
      size="sm"
      onClick={handleToggleFollow}
      disabled={isLoading}
    >
      {isLoading && <IconSpinner className="size-4 mr-2" />}
      {isFollowed ? "Ne plus suivre" : "Suivre"}
    </Button>
  );
}
