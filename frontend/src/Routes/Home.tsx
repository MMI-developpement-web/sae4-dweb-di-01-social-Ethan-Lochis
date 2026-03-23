import { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import Posting from "../components/Posting";
import Post from "../components/ui/Post";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface PostType {
  id: number;
  TextContent: string;
  CreatedAt: string;
  Author: {
    id: number;
    username: string;
  };
}

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPosts = async () => {
    try {
      const data = await apiFetch<PostType[]>('/posts');
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

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
            <Posting onPostCreated={fetchPosts} />
          </div>

          <div className="flex flex-col gap-3">
            <h1 className="text-26 font-semibold my-2">Votre fil d'actualité</h1>
            
            {loading && <p className="text-center text-fg/60">Chargement des posts...</p>}
            {error && <p className="text-center text-red-500">{error}</p>}
            
            {!loading && !error && posts.length === 0 && (
              <p className="text-center text-fg/60">Aucun post pour le moment.</p>
            )}

            {!loading && !error && posts.map((post) => (
                <Post
                  key={post.id}
                  username={post.Author.username}
                  text={post.TextContent}
                  timestamp={new Date(post.CreatedAt).toLocaleDateString()}
                />
            ))}
          </div>
        </div>
      </main>

      <Navbar username={user?.username || "Invité"} />
    </div>
  );
}