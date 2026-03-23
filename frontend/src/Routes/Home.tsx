import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/ui/Navbar";
import Posting from "../components/Posting";
import Post from "../components/ui/Post";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { RefreshIcon } from "../components/ui/Icons";
import { motion } from 'framer-motion'; 
import Button from "../components/ui/Button";

interface PostType {
  id: number;
  TextContent: string;
  CreatedAt: string;
  Author: {
    id: number;
    username: string;
    isFollowedByCurrentUser?: boolean;
  };
  likesCount?: number;
  isLikedByCurrentUser?: boolean;
}

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [feed, setFeed] = useState<"foryou" | "following">("foryou");
  // 0 = Désactivé. Sinon, valeur en millisecondes (ex: 30000 = 30s)
  // On lit le localStorage au démarrage, sinon on met 0 par défaut
  const [refreshInterval, setRefreshInterval] = useState<number>(() => {
    const saved = localStorage.getItem("feed_refresh_interval");
    return saved ? parseInt(saved, 10) : 0;
  });
  const { user } = useAuth();
  const limit = 7;

  // Quand l'utilisateur change la valeur, on sauvegarde dans le localStorage
  const handleIntervalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    setRefreshInterval(value);
    localStorage.setItem("feed_refresh_interval", value.toString());
  };

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (!reset && (loadingMore || loading || !hasMore)) return;

      // In order to avoid stale closures with offset, we'll use a functional update or refs.
      // However, with useCallback and correct dependencies, this works.
      const currentOffset = reset ? 0 : offset;

      if (reset) {
        if (posts.length === 0) setLoading(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await apiFetch<PostType[]>(
          `/posts?limit=${limit}&offset=${currentOffset}&feed=${feed}`,
        );
        
        setHasMore(data.length >= limit);
        
        setPosts((prev) => (reset ? data : [...prev, ...data]));
        setOffset(currentOffset + limit);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des posts");
      } finally {
        if (reset) setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset, hasMore, loadingMore, loading, feed, posts.length],
  );

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feed]);

  // Polling useEffect - Auto-refresh de la timeline
  useEffect(() => {
    // Si l'utilisateur a désactivé l'auto-refresh, on ne fait rien
    if (refreshInterval === 0) return;

    const intervalId = setInterval(() => {
      // SÉCURITÉ UX CRUCIALE : 
      // On ne rafraîchit automatiquement QUE si l'utilisateur est tout en haut de la page.
      // S'il a scrollé vers le bas pour lire des anciens posts, on ne le dérange pas !
      if (window.scrollY < 100) {
        // On relance le fetch de manière transparente (sans bloquer l'UI)
        fetchPosts(true);
      }
    }, refreshInterval);

    // Fonction de nettoyage (très important en React pour éviter les fuites de mémoire)
    return () => clearInterval(intervalId);
    
  }, [refreshInterval, fetchPosts]);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we are close to the bottom
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 500
      ) {
        fetchPosts(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchPosts]);

  const handlePostCreated = () => {
    fetchPosts(true);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchPosts(true);
    setIsRefreshing(false);
  };

  const handlePostDeleted = (deletedId: number) => {
    setPosts(prev => prev.filter(post => post.id !== deletedId));
  };

  return (
    <div data-theme="default" className="bg-bg min-h-screen">
      <header className="lg:pl-56 flex justify-start items-start bg-bg border-b border-white/10 p-3 ">
        <div>
          <img src="./Logo.png" alt="Kontakt logo" className="max-h-8 lg:max-h-16 w-auto" />
        </div>
      </header>

      <main className="pb-20 lg:pb-0 lg:pl-56">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 text-fg">
          <section className="hidden sm:block">
            {user ? (
              <Posting onPostCreated={handlePostCreated} />
            ) : (
              <div className="bg-fg/10 border border-fg/20 rounded-lg p-6 text-center">
                <p className="text-fg/70 mb-8">Connectez-vous pour avoir accès à toutes les fonctionnalités</p>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => window.location.href = "./Auth"}
                >
                  Se connecter
                </Button>
              </div>
            )}
          </section>

          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h1 className="text-26 font-semibold my-2">
                Votre fil d'actualité
              </h1>
              <div className="flex items-center gap-3">
                {/* Le nouveau sélecteur */}
                <select 
                  value={refreshInterval} 
                  onChange={handleIntervalChange}
                  className="bg-bg border border-white/10 text-fg text-sm rounded-md px-2 py-1 outline-none focus:border-secondary transition-colors cursor-pointer"
                >
                  <option value={0}>Auto-refresh : Off</option>
                  <option value={10000}>10 secondes (utiliser pour le test)</option>
                  <option value={60000}>Toutes les minutes</option>
                  <option value={30000}>Toutes les 5 minutes</option>
                  <option value={60000}>Toutes les 15 minutes</option>
                </select>

                {/* Ton bouton actuel */}
                <button 
                  onClick={handleRefresh} 
                  disabled={isRefreshing}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  aria-label="Rafraîchir"
                >
                  <RefreshIcon isSpinning={isRefreshing} />
                </button>
              </div>
            </div>

            {user && (
              <nav className="flex bg-fg/10 rounded-lg p-1 w-full sm:w-1/2 mx-auto sm:mx-0 mb-2" aria-label="Filtres de contenu">
                <button
                  onClick={() => setFeed("foryou")}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    feed === "foryou"
                      ? "bg-secondary text-fg shadow-lg"
                      : "text-fg/60 hover:text-fg hover:bg-fg/5"
                  }`}
                >
                  Pour vous
                </button>
                <button
                  onClick={() => setFeed("following")}
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    feed === "following"
                      ? "bg-secondary text-fg shadow-lg"
                      : "text-fg/60 hover:text-fg hover:bg-fg/5"
                  }`}
                >
                  Suivis
                </button>
              </nav>
            )}

            {loading && posts.length === 0 && (
              <p className="text-center text-fg/60">Chargement des posts...</p>
            )}
            {error && <p className="text-center text-red-500">{error}</p>}

            {!loading && !error && posts.length === 0 && (
              <p className="text-center text-fg/60">
                Aucun post pour le moment.
              </p>
            )}

            {!error &&
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    // On limite le délai aux 7 premiers posts (la limite de ton fetch)
                    // pour éviter que les anciens posts mettent 10 secondes à apparaître
                    // quand tu scrolles vers le bas (infinite scroll)
                    delay: (index % limit) * 0.1 
                  }}
                >
                  <Post
                    id={post.id}
                    authorId={post.Author?.id}
                    username={post.Author.username}
                    text={post.TextContent}
                    timestamp={new Date(post.CreatedAt).toLocaleDateString()}
                    likesCount={post.likesCount}
                    likedByCurrentUser={post.isLikedByCurrentUser}
                    onDelete={handlePostDeleted}
                  />
                </motion.div>
              ))}

            {loadingMore && (
              <p className="text-center text-fg/60 py-4">
                Chargement de plus de posts...
              </p>
            )}
            {!hasMore && posts.length > 0 && (
              <p className="text-center text-fg/60 py-4">
                Vous avez vu tous les posts.
              </p>
            )}
          </section>
        </div>
      </main>

      <Navbar username={user?.username || "Invité"} />
    </div>
  );
}
