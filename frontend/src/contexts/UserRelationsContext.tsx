import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";

interface UserRelationsContextType {
  followedUsers: Set<number>;
  blockedUsers: Set<number>;
  toggleFollow: (userId: number, isFollowing: boolean) => void;
  toggleBlock: (userId: number, isBlocked: boolean) => void;
  isInitialized: boolean;
}

const UserRelationsContext = createContext<UserRelationsContextType | undefined>(undefined);

export function UserRelationsProvider({ children }: { children: ReactNode }) {
  const [followedUsers, setFollowedUsers] = useState<Set<number>>(new Set());
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, token } = useAuth();

  // Un seul appel API pour initialiser les deux sets
  useEffect(() => {
    if (!user || !token) {
      setFollowedUsers(new Set());
      setBlockedUsers(new Set());
      setIsInitialized(false);
      return;
    }

    const initializeRelations = async () => {
      try {
        const response = await apiFetch<{
          user: any;
          followedIds: number[];
          blockedIds: number[];
        }>("/users/me");
        setFollowedUsers(new Set(response.followedIds || []));
        setBlockedUsers(new Set(response.blockedIds || []));
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation des relations:", error);
        setFollowedUsers(new Set());
        setBlockedUsers(new Set());
        setIsInitialized(true);
      }
    };

    initializeRelations();
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

  const toggleBlock = (userId: number, isBlocked: boolean) => {
    setBlockedUsers((prev) => {
      const newSet = new Set(prev);
      if (isBlocked) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  return (
    <UserRelationsContext.Provider value={{ followedUsers, blockedUsers, toggleFollow, toggleBlock, isInitialized }}>
      {children}
    </UserRelationsContext.Provider>
  );
}

// Hooks de compatibilité rétroactive — même API que les anciens contexts
export function useFollow() {
  const context = useContext(UserRelationsContext);
  if (!context) {
    throw new Error("useFollow must be used within UserRelationsProvider");
  }
  return {
    followedUsers: context.followedUsers,
    toggleFollow: context.toggleFollow,
    setFollowedUsers: () => {}, // no-op pour compat
    isInitialized: context.isInitialized,
  };
}

export function useBlock() {
  const context = useContext(UserRelationsContext);
  if (!context) {
    throw new Error("useBlock must be used within UserRelationsProvider");
  }
  return {
    blockedUsers: context.blockedUsers,
    toggleBlock: context.toggleBlock,
    isInitialized: context.isInitialized,
  };
}
