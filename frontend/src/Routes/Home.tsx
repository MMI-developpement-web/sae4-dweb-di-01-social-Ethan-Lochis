import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/ui/Navbar";
import Posting from "../components/Posting";
import Post from "../components/ui/Post";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { RefreshIcon } from "../components/ui/Icons";

interface PostType {
  id: number;
  TextContent: string;
  CreatedAt: string;
  Author: {
    id: number;
    username: string;
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
  const { user } = useAuth();
  const limit = 7;

  const fetchPosts = useCallback(
    async (reset = false) => {
      if (loadingMore || (!reset && loading) || (!hasMore && !reset)) return;

      // In order to avoid stale closures with offset, we'll use a functional update or refs.
      // However, with useCallback and correct dependencies, this works.
      const currentOffset = reset ? 0 : offset;

      if (reset) {
        setLoading(true);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await apiFetch<PostType[]>(
          `/posts?limit=${limit}&offset=${currentOffset}`,
        );
        if (data.length < limit) {
          setHasMore(false);
        }
        setPosts((prev) => (reset ? data : [...prev, ...data]));
        setOffset(currentOffset + limit);
      } catch (err: any) {
        setError(err.message || "Erreur lors du chargement des posts");
      } finally {
        if (reset) setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset, hasMore, loadingMore, loading],
  );

  useEffect(() => {
    fetchPosts(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  return (
    <div data-theme="default" className="bg-bg min-h-screen">
      <header className="lg:pl-56 flex justify-start items-start bg-bg border-b border-white/10 py-3 ">
        <div>
          <img src="./Logo.png" alt="Kontakt logo" className="h-24 w-auto" />
        </div>
      </header>

      <main className="pb-20 lg:pb-0 lg:pl-56">
        <div className="mx-auto flex max-w-2xl flex-col gap-4 p-4 text-fg">
          <div className="hidden sm:block">
            <Posting onPostCreated={handlePostCreated} />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h1 className="text-26 font-semibold my-2">
                Votre fil d'actualité
              </h1>
              <button 
                onClick={handleRefresh} 
                disabled={isRefreshing}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
                aria-label="Rafraîchir"
              >
                <RefreshIcon isSpinning={isRefreshing} />
              </button>
            </div>
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
              posts.map((post) => (
                <Post
                  key={post.id}
                  id={post.id}
                  username={post.Author.username}
                  text={post.TextContent}
                  timestamp={new Date(post.CreatedAt).toLocaleDateString()}
                  likesCount={post.likesCount}
                  likedByCurrentUser={post.isLikedByCurrentUser}
                />
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
          </div>
        </div>
      </main>

      <Navbar username={user?.username || "Invité"} />
    </div>
  );
}
