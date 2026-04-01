import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../lib/api";
import type { PostType } from "../../types/post";
import { IconSearch } from "./Icons";
import { cn } from "../../lib/utils";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PostType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1024px)");
    setIsMobile(mql.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isMobileExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileExpanded]);

  const handleSearchNavigation = (searchQuery: string) => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setIsMobileExpanded(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearchNavigation(query);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim()) {
        setIsSearching(true);
        try {
          const data = await apiFetch(`/posts/search?q=${encodeURIComponent(query)}`);
          setResults(data as PostType[]);
          setShowDropdown(true);
        } catch (error) {
          console.error("Erreur de recherche:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  if (isMobile && !isMobileExpanded) {
    return (
      <div className="flex justify-end w-full">
        <button 
          onClick={() => setIsMobileExpanded(true)}
          className="p-2 bg-bg-lighter rounded-full text-primary hover:bg-white/10 transition-colors"
        >
          <IconSearch className="size-5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={!isMobile ? wrapperRef : undefined} 
      className={cn(
        isMobileExpanded ? "fixed inset-0 z-[100] bg-bg flex flex-col pt-6 px-4 pb-20 overflow-hidden" : "relative w-full max-w-md mx-auto"
      )}
    >
      <div className="relative flex items-center gap-2">
        {isMobileExpanded && (
          <button 
            onClick={() => setIsMobileExpanded(false)}
            className="p-2 -ml-2 text-inactive hover:text-fg transition-colors"
          >
            <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        )}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-inactive" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-full leading-5 bg-bg-lighter text-fg text-ellipsis placeholder-inactive focus:outline-none focus:ring-1 focus:ring-secondary focus:border-secondary transition-colors"
            placeholder={isMobile ? "Rechercher..." : "Rechercher des posts, @users, #hashtags..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
            autoFocus={isMobileExpanded}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <svg className="animate-spin h-4 w-4 text-inactive" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {(showDropdown || isMobileExpanded) && results.length > 0 && (
        <div className={cn(
          isMobileExpanded 
            ? "flex-1 mt-4 overflow-y-auto w-full bg-bg-lighter border border-white/10 rounded-xl shadow-xl flex flex-col" 
            : "absolute z-50 mt-2 w-full bg-bg-lighter border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-96 flex flex-col"
        )}>
          <div className="overflow-y-auto flex-1">
            {results.map((post) => (
              <div 
                key={post.id} 
                onClick={() => handleSearchNavigation(query)} // Could also navigate to a post, but just following previous logic
                className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors p-3 cursor-pointer"
              >
                <div className="text-14 font-medium text-fg">@{post.Author.username}</div>
                <div className="text-14 text-inactive truncate">{post.TextContent}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => handleSearchNavigation(query)}
            className="w-full text-center text-14 text-secondary hover:text-secondary-light hover:bg-white/5 transition-colors py-3 border-t border-white/10 font-medium shrink-0"
          >
            Voir tous les résultats pour "{query}"
          </button>
        </div>
      )}

      {(showDropdown || isMobileExpanded) && query.trim() && !isSearching && results.length === 0 && (
        <div className={cn(
          isMobileExpanded
            ? "mt-4 w-full bg-bg-lighter border border-white/10 rounded-xl shadow-xl flex flex-col text-center overflow-hidden shrink-0"
            : "absolute z-50 mt-2 w-full bg-bg-lighter border border-white/10 rounded-xl shadow-xl flex flex-col text-center overflow-hidden"
        )}>
          <div className="p-4 text-inactive text-14 border-b border-white/10">
            Aucun résultat direct trouvé.
          </div>
          <button
            onClick={() => handleSearchNavigation(query)}
            className="w-full text-center text-14 text-secondary hover:text-secondary-light hover:bg-white/5 transition-colors py-3 font-medium cursor-pointer"
          >
            Recherche avancée pour "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
