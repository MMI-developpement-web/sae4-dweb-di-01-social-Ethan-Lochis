import { useState, useRef, useEffect } from "react";
import Publisher from "./Publisher";
import FollowButton from "./FollowButton";
import BlockButton from "./BlockButton";
import { IconSettings, IconLogout } from "./Icons";
import { motion } from "framer-motion";

interface ProfileHeaderProps {
  username: string;
  avatarUrl?: string;
  bio?: string | null;
  location?: string | null;
  postCount: number;
  followingCount: number;
  followerCount: number;
  onLogout?: () => void;
  onEditProfile?: () => void;
  onViewBlocked?: () => void;
  userId?: number;
}

export default function ProfileHeader({
  username,
  avatarUrl,
  bio,
  location,
  postCount,
  followingCount,
  followerCount,
  onLogout,
  onEditProfile,
  onViewBlocked,
  userId,
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
      {onEditProfile && (
        <div className="absolute top-4 right-4" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Paramètres"
          >
            <IconSettings className="size-6" />
          </button>

          {isMenuOpen && (
            <nav className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10 flex flex-col" aria-label="Menu utilisateur">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onEditProfile?.();
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left cursor-pointer border-b border-gray-100"
              >
                Modifier le profil
              </button>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onViewBlocked?.();
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left cursor-pointer border-b border-gray-100"
              >
                Profils bloqués
              </button>
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
      )}

      <Publisher username={username} avatarUrl={avatarUrl} size="lg" ring="default" />
      
      {(bio || location) && (
        <div className="flex flex-col items-center mt-2 text-center max-w-lg">
          {bio && <p className="text-sm text-fg mb-1">{bio}</p>}
          {location && <p className="text-xs text-gray-500 italic">{location}</p>}
        </div>
      )}

      {!onEditProfile && userId && (
        <div className="mt-2 flex gap-3">
          <FollowButton userId={userId} />
          <BlockButton userId={userId} />
        </div>
      )}

      <section className="flex w-full max-w-sm justify-between text-center mt-4" aria-label="Statistiques du profil">
        
        {/* --- STAT: POSTS --- */}
        <div className="flex flex-col items-center flex-1">
          <motion.span 
            key="posts" 
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
            key="following" 
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
            key="followers" 
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