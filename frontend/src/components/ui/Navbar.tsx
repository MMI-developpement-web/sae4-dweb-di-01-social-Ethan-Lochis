import { cn } from "../../lib/utils";
import { IconHome, IconPost } from "./Icons";
import { useState } from "react";

type Tab = "home" | "post" | "profile";

interface NavbarProps {
  className?: string;
  avatarUrl?: string;
  username?: string;
  defaultTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export default function Navbar({
  className,
  avatarUrl,
  username = "User",
  defaultTab = "home",
  onTabChange,
}: NavbarProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  function handleTabClick(tab: Tab) {
    setActiveTab(tab);
    onTabChange?.(tab);
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "flex items-center justify-around h-16 px-4",
        "bg-bg border-t border-white/10",
        className,
      )}
    >
      <button
        onClick={() => handleTabClick("home")}
        className={cn(
          "flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer",
          activeTab === "home" ? "text-secondary" : "text-primary",
        )}
      >
        <IconHome className="size-6" />
      </button>

      <button
        onClick={() => handleTabClick("post")}
        className={cn(
          "flex items-center justify-center p-2 rounded-lg transition-colors cursor-pointer",
          activeTab === "post" ? "text-secondary" : "text-primary",
        )}
      >
        <IconPost className="size-6" />
      </button>

      <button
        onClick={() => handleTabClick("profile")}
        className={cn(
          "rounded-full transition-all cursor-pointer ring-2",
          activeTab === "profile" ? "ring-secondary" : "ring-primary",
        )}
      >
        <img
          src={
            avatarUrl ??
            `https://ui-avatars.com/api/?name=${username}&background=random`
          }
          alt={username}
          className="size-9 rounded-full object-cover"
        />
      </button>
    </nav>
  );
}