import { cn, getMediaUrl } from "../../lib/utils";
import { IconHome, IconPost, IconUser } from "./Icons";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

type Tab = "home" | "post" | "profile";

interface NavbarProps {
  avatarUrl?: string;
  username?: string;
  defaultTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export default function Navbar({
  avatarUrl: propAvatarUrl,
  username: propUsername,
  defaultTab = "home",
  onTabChange,
}: NavbarProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Prioritize auth context over props
  const username = propUsername || user?.username || "User";
  const rawAvatarUrl = propAvatarUrl || user?.profilePicture;
  const avatarUrl = rawAvatarUrl ? getMediaUrl(rawAvatarUrl) : null;

  // Sync active tab with current route
  useEffect(() => {
    if (location.pathname === "/") {
      setActiveTab("home");
    } else if (location.pathname === "/posting") {
      setActiveTab("post");
    } else if (location.pathname === "/profile") {
      setActiveTab("profile");
    }
  }, [location.pathname]);

  const routes: Record<Tab, string> = {
    home: "/",
    post: "/posting",
    profile: isAuthenticated ? "/profile" : "/Auth",
  };

  function handleTabClick(tab: Tab) {
    // Rediriger vers /Auth si l'utilisateur clique sur "Publier" sans être connecté
    if (tab === "post" && !isAuthenticated) {
      navigate("/Auth");
      return;
    }
    setActiveTab(tab);
    onTabChange?.(tab);
    navigate(routes[tab]);
  }

  const itemClass = (tab: Tab) =>
    cn(
      "flex items-center gap-3 rounded-lg p-2 transition-colors cursor-pointer",
      "lg:w-full lg:px-4 lg:py-3",
      activeTab === tab ? "text-secondary" : "text-primary hover:text-fg",
    );

  return (
    <nav
      className={cn(
        "fixed z-50 bg-bg",
        // Mobile : barre en bas
        "bottom-0 left-0 right-0 flex flex-row items-center justify-around h-16 px-4 border-t border-white/10",
        // Desktop : sidebar à gauche
        "lg:shadow-2xl lg:top-0 lg:left-0 lg:right-auto lg:bottom-0 lg:flex-col lg:justify-start lg:items-start lg:w-56 lg:h-screen lg:px-4 lg:py-8 lg:gap-2",
      )}
    >
      <button onClick={() => handleTabClick("home")} className={itemClass("home")}>
        <IconHome className="size-6 shrink-0" />
        <span className="hidden lg:inline text-sm font-medium">Accueil</span>
      </button>

      <button onClick={() => handleTabClick("post")} className={itemClass("post")}>
        <IconPost className="size-6 shrink-0" />
        <span className="hidden lg:inline text-sm font-medium">Publier</span>
      </button>

      <button
        onClick={() => handleTabClick("profile")}
        className={cn(
          "flex items-center gap-3 cursor-pointer transition-all rounded-lg p-2",
          "lg:w-full lg:px-4 lg:py-3",
        )}
      >
        {isAuthenticated ? (
          <img
            src={avatarUrl ?? `https://ui-avatars.com/api/?name=${username}&background=random`}
            alt={username}
            className={cn(
              "size-9 rounded-full object-cover ring-2 shrink-0",
              activeTab === "profile" ? "ring-secondary" : "ring-primary",
            )}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center size-9 rounded-full ring-2 shrink-0 bg-white",
              activeTab === "profile" ? "ring-secondary" : "ring-primary",
            )}
          >
            <IconUser className="size-5" />
          </div>
        )}
        <span className="hidden lg:inline text-sm font-medium text-fg truncate">
          {isAuthenticated ? "Votre compte" : "Se connecter"}
        </span>
      </button>
    </nav>
  );
}