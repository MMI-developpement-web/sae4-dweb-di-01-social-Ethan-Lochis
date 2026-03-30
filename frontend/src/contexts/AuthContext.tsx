// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotification } from './NotificationContext';

interface User {
  id: number;
  username: string;
  email: string;
  roles: string[];
  profilePicture: string | null;
  bio?: string | null;
  location?: string | null;
  pinnedPostId?: number | null;
  isReadOnly?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  updateUser: (user: User) => void;
  logout: (reason?: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const { addNotification } = useNotification();

  const logout = (reason?: string) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Afficher le message de notification si raison fournie
    if (reason) {
      addNotification(reason, 'error', 5000);
    }
  };

  useEffect(() => {
    // Initialiser l'état depuis le localStorage
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Erreur', e);
        logout();
      }
    }

    // Écouter l'événement de déconnexion globale (ex: 401 Unauthorized)
    const handleUnauthorized = (event: Event) => {
      const customEvent = event as CustomEvent;
      const reason = customEvent.detail?.reason || 'Vous avez été déconnecté';
      logout(reason);
    };
    
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [addNotification]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const updateUser = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ token, user, login, updateUser, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
