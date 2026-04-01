import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/ui/Navbar";
import Post from "../components/ui/Post";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from 'framer-motion'; 
import type { PostType } from "../types/post";

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const limit = 7;
  
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchResults = useCallback(
    async (reset = false) => {
      if (!query.trim()) {
        setPosts([]);
        setLoading(false);
        setHasMore(false);
        hasMoreRef.current = false;
        return;
      }
      
      if (isFetchingRef.current) return;
      if (!hasMoreRef.current && !reset) return;

      try {
        isFetchingRef.current = true;
        setLoading(() => reset ? true : false);
        setLoadingMore(() => reset ? false : true);
        
        const currentOffset = reset ? 0 : posts.length;
        
        const data = await apiFetch<PostType[]>(
          `/posts/search?q=${encodeURIComponent(query)}&limit=${limit}&offset=${currentOffset}`
        );
        
        const more = data.length >= limit;
        setHasMore(more);
        hasMoreRef.current = more;
        
        setPosts((prev) => {
          if (reset) return data;
          
          const existingIds = new Set(prev.map(p => p.id));
          const newPosts = data.filter(p => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
      } catch (err: any) {
        setError(err.message || "Erreur lors de la recherche");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        isFetchingRef.current = false;
      }
    },
    [query, posts.length]
  );

  useEffect(() => {
    fetchResults(true);
  }, [query]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        fetchResults(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchResults, hasMore, loading, loadingMore]);

  const handlePostDeleted = (deletedId: number) => {
    setPosts(prev => prev.filter(post => post.id !== deletedId));
  };

  return (
    <div data-theme="default" className="bg-bg min-h-screen flex flex-col">
      <Navbar username={user?.username || "Invité"} />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 pb-24 sm:p-6 lg:p-4 text-fg">
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-inactive hover:text-fg transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"></path><path d="M12 19l-7-7 7-7"></path></svg>
            Retour
          </button>
          <h1 className="text-24 font-bold">Résultats pour "{query}"</h1>
        </div>

        {loading && posts.length === 0 && (
          <p className="text-center text-fg/60">Recherche en cours...</p>
        )}
        
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <p className="text-center text-fg/60">
            Aucun résultat trouvé pour cette recherche.
          </p>
        )}

        {!error &&
          posts.map((post, index) => (
            <motion.div
              key={`${post.id}-${index}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % limit) * 0.1 }}
              className="mb-4"
            >
              <Post
                post={post}
                onDelete={handlePostDeleted}
                onPin={(id, isPinnedNow) => {
                  if (user) {
                    user.pinnedPostId = isPinnedNow ? id : undefined;
                  }
                  fetchResults(true); 
                }}
                onRetweet={() => {
                  fetchResults(true);
                }}
                onUpdate={(updatedPost) => {
                  setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
                }}
              />
            </motion.div>
          ))}

        {loadingMore && (
          <p className="text-center text-fg/60 py-4">
            Chargement de plus de résultats...
          </p>
        )}
      </main>
    </div>
  );
}
