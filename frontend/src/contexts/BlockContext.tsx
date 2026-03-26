import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../lib/api";

interface BlockContextType {
  blockedUsers: Set<number>;
  toggleBlock: (userId: number, isBlocked: boolean) => void;
  isInitialized: boolean;
}

const BlockContext = createContext<BlockContextType | undefined>(undefined);

export function BlockProvider({ children }: { children: ReactNode }) {
  const [blockedUsers, setBlockedUsers] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, token } = useAuth();

  useEffect(() => {
    if (!user || !token) {
      setBlockedUsers(new Set());
      setIsInitialized(false);
      return;
    }

    const initializeBlockedUsers = async () => {
      try {
        const response = await apiFetch<{
          user: any;
          blockedIds: number[];
        }>("/users/me");
        setBlockedUsers(new Set(response.blockedIds || []));
        setIsInitialized(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation des utilisateurs bloqués:", error);
        setBlockedUsers(new Set());
        setIsInitialized(true);
      }
    };

    initializeBlockedUsers();
  }, [user, token]);

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
    <BlockContext.Provider value={{ blockedUsers, toggleBlock, isInitialized }}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlock() {
  const context = useContext(BlockContext);
  if (!context) {
    throw new Error("useBlock must be used within BlockProvider");
  }
  return context;
}
