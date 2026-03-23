import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import Button from "./Button";
import { IconSpinner } from "./Icons";

interface FollowButtonProps {
  userId: number;
  initialFollowed?: boolean;
}

export default function FollowButton({ userId, initialFollowed = false }: FollowButtonProps) {
  const { user, token } = useAuth();
  const [isFollowed, setIsFollowed] = useState(initialFollowed);
  const [isLoading, setIsLoading] = useState(false);

  // Ne pas afficher si non connecté ou si c'est le profil courant
  if (!user || user.id === userId) {
    return null;
  }

  async function handleToggleFollow() {
    if (isLoading || !token) return;
    setIsLoading(true);

    try {
      const method = isFollowed ? "DELETE" : "POST";
      const res = await fetch(`http://localhost:8080/api/users/${userId}/follow`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setIsFollowed(!isFollowed);
      } else {
        console.error("Erreur lors de l'action follow/unfollow");
      }
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
