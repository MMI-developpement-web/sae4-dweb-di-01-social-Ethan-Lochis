import { cn } from "../../lib/utils";
import { IconHome, IconPost } from "./Icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Tab = "home" | "post" | "profile";

interface NavbarProps {
  avatarUrl?: string;
  username?: string;
  defaultTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export default function Navbar({
  avatarUrl,
  username = "User",
  defaultTab = "home",
  onTabChange,
}: NavbarProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);
  const navigate = useNavigate();

  const routes: Record<Tab, string> = {
    home: "/",
    post: "/posting",
    profile: "/profile",
  };

  function handleTabClick(tab: Tab) {
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
        "lg:top-0 lg:left-0 lg:right-auto lg:bottom-0 lg:flex-col lg:justify-start lg:items-start lg:w-56 lg:h-screen lg:px-4 lg:py-8 lg:gap-2 lg:border-t-0 lg:border-r",
      )}
    >
      <button onClick={() => handleTabClick("home")} className={itemClass("home")}>
        <IconHome className="size-6 shrink-0" />
        <span className="hidden lg:inline text-sm font-medium">Accueil</span>
      </button>

      <button onClick={() => handleTabClick("post")} className={itemClass("post")}>
        <IconPost className="size-6 shrink-0" />
        <span className="hidden lg:inline text-sm font-medium">Publications</span>
      </button>

      <button
        onClick={() => handleTabClick("profile")}
        className={cn(
          "flex items-center gap-3 cursor-pointer transition-all rounded-lg p-2",
          "lg:w-full lg:px-4 lg:py-3 hover:text-fg",
        )}
      >
        <img
          src={avatarUrl ?? `https://ui-avatars.com/api/?name=${username}&background=random`}
          alt={username}
          className={cn(
            "size-9 rounded-full object-cover ring-2 shrink-0",
            activeTab === "profile" ? "ring-secondary" : "ring-primary",
          )}
        />
        <span className="hidden lg:inline text-sm font-medium text-fg truncate">{username}</span>
      </button>
    </nav>
  );
}