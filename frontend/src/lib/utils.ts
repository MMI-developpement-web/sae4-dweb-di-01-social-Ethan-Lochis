import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convertit une URL relative de média en URL absolue pointant vers le Backend
 * @param relativePath - URL relative (ex: "/uploads/media/abc123.jpg")
 * @returns URL absolue ou null si pas de chemin fourni
 */
export function getMediaUrl(relativePath: string | null | undefined): string | null {
  if (!relativePath) return null;
  if (relativePath.startsWith("http")) return relativePath;

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
  const baseUrl = apiUrl.replace(/\/api\/?$/, ""); // Enlever "/api" du suffixe
  // Ajouter "/" entre baseUrl et relativePath
  const path = relativePath.startsWith("/") ? relativePath : "/" + relativePath;
  return baseUrl + path;
}
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "À l'instant";
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
