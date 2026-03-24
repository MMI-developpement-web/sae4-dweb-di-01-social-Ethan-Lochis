import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";

interface FollowContextType {
  followedUsers: Set<number>;
  toggleFollow: (userId: number, isFollowing: boolean) => void;
  setFollowedUsers: (users: Set<number>) => void;
  isInitialized: boolean;
}

const FollowContext = createContext<FollowContextType | undefined>(undefined);

export function FollowProvider({ children }: { children: ReactNode }) {
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, token } = useAuth();

  // Initialiser les utilisateurs suivis quand l'utilisateur se connecte
  useEffect(() => {
    if (!user || !token) {
      setFollowedUsers(new Set());
      setIsInitialized(false);
      return;
    }

    const initializeFollowedUsers = async () => {
      try {
        const response = await apiFetch<{
          user: any;
          followedIds: number[];
        }>("/users/me");
        setFollowedUsers(new Set(response.followedIds));
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation des utilisateurs suivis:", error);
        setFollowedUsers(new Set());
        setIsInitialized(true);
      }
    };

    initializeFollowedUsers();
  }, [user, token]);

  const toggleFollow = (userId: number, isFollowing: boolean) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (isFollowing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  return (
    <FollowContext.Provider value={{ followedUsers, toggleFollow, setFollowedUsers, isInitialized }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error("useFollow must be used within FollowProvider");
  }
  return context;
}
