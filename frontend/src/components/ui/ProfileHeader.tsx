import { useState, useRef, useEffect } from "react";
import Publisher from "./Publisher";
import { IconSettings, IconLogout } from "./Icons";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  postCount: number;
  followingCount: number;
  followerCount: number;
  onLogout?: () => void;
}

export default function ProfileHeader({
  username,
  avatarUrl,
  postCount,
  followingCount,
  followerCount,
  onLogout,
}: ProfileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="flex flex-col items-center gap-6 py-8  bg-bg-lighter text-fg relative">
      <div className="absolute top-4 right-4" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Paramètres"
        >
          <IconSettings className="size-6" />
        </button>

        {isMenuOpen && (
          <nav className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-10" aria-label="Menu utilisateur">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                onLogout?.();
              }}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <IconLogout className="size-5" />
              Se déconnecter
            </button>
          </nav>
        )}
      </div>

      <Publisher username={username} avatarUrl={avatarUrl} size="lg" ring="default" />

      <section className="flex w-full max-w-sm justify-between text-center mt-4" aria-label="Statistiques du profil">
        
        {/* --- STAT: POSTS --- */}
        <div className="flex flex-col items-center flex-1">
          <motion.span 
            key={postCount} 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-xl font-bold text-fg"
          >
            {postCount}
          </motion.span>
          <span className="text-sm font-medium">Posts</span>
        </div>

        {/* --- STAT: ABONNEMENTS --- */}
        <div className="flex flex-col items-center flex-1 border-x border-gray-200">
          <motion.span 
            key={followingCount} 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-xl font-bold text-fg"
          >
            {followingCount}
          </motion.span>
          <span className="text-sm font-medium">Abonnements</span>
        </div>

        {/* --- STAT: ABONNÉS --- */}
        <div className="flex flex-col items-center flex-1">
          <motion.span 
            key={followerCount} 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-xl font-bold text-fg"
          >
            {followerCount}
          </motion.span>
          <span className="text-sm font-medium">Abonnés</span>
        </div>

      </section>
    </header>
  );
}