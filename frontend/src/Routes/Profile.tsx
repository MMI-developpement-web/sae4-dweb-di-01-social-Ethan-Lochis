import { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import ProfileHeader from "../components/ui/ProfileHeader";
import Post from "../components/ui/Post";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { IconSpinner } from "../components/ui/Icons";
import { useNavigate } from "react-router-dom";

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

export default function Profile() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/Auth");
  };

  const handlePostDeleted = (deletedId: number) => {
    setPosts(prev => prev.filter(post => post.id !== deletedId));
  };

  useEffect(() => {
  const fetchUserPosts = async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);  // ← ajouter ça
    try {
      const data = await apiFetch<PostType[]>(`/posts/user/${user.id}`);
      setPosts(data);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement des posts");
    } finally {
      setLoading(false);
    }
  };

  fetchUserPosts();
}, [user]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-150 w-full mx-auto bg-bg-lighter min-h-screen p-12 shadow-lg">
        {user ? (
          <ProfileHeader
            username={user.username}
            avatarUrl={user.profilePicture || undefined}
            postCount={posts.length}
            followingCount={0} // Mocké temporairement !
            followerCount={0} // Mocké temporairement !
            onLogout={handleLogout}
          />
        ) : (
          <div className="p-8 text-center text-gray-500">
            Veuillez vous connecter pour voir votre profil.
          </div>
        )}

        <section className="mt-2" aria-label="Publications du profil">
          <h2 className="px-6 py-4 text-xl font-bold border-b text-fg">
            Tous vos posts
          </h2>

          {loading && (
            <div className="flex justify-center items-center p-8 w-full ">
              <div className="w-1/6">
                <IconSpinner />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 mx-4 mt-4 text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="p-8 text-center text-fg">
              Vous n'avez pas encore publié de post.
            </div>
          )}

          {!loading && !error && posts.length > 0 && (
            <section className="mt-4 mb-8 flex flex-col gap-4">
              {posts.map((post) => (
                <Post
                  key={post.id}
                  id={post.id}
                  authorId={post.Author?.id}
                  username={post.Author.username}
                  text={post.TextContent}
                  timestamp={new Date(post.CreatedAt).toLocaleDateString()}
                  likesCount={post.likesCount}
                  likedByCurrentUser={post.isLikedByCurrentUser}
                  background="darker"
                  onDelete={handlePostDeleted}
                />
              ))}
            </section>
          )}
        </section>
      </main>
    </div>
  );
}
