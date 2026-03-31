import { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import ProfileHeader from "../components/ui/ProfileHeader";
import Post from "../components/ui/Post";
import ProfileEditModal from "../components/ProfileEditModal";
import BlockedUsersModal from "../components/ui/BlockedUsersModal";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { IconSpinner } from "../components/ui/Icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { PostType } from "../types/post";


export default function Profile() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
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
  const fetchUserData = async () => {
    if (!user) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch user stats (following/followers)
      const stats = await apiFetch<{
        user: any;
        followedIds: number[];
        followingCount: number;
        followerCount: number;
      }>("/users/me");
      
      setFollowingCount(stats.followingCount);
      setFollowerCount(stats.followerCount);

      // Fetch user posts
      const postsData = await apiFetch<PostType[]>(`/posts/user/${user.id}`);
      
      const sortedPosts = [...postsData].sort((a, b) => {
        if (a.id === user.pinnedPostId) return -1;
        if (b.id === user.pinnedPostId) return 1;
        return 0;
      });
      
      setPosts(sortedPosts);
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  fetchUserData();
}, [user]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-150 w-full mx-auto bg-bg-lighter min-h-screen p-12 shadow-lg">
        {user ? (
          <ProfileHeader
            username={user.username}
            avatarUrl={user.profilePicture || undefined}
            bio={user.bio}
            location={user.location}
            postCount={posts.length}
            followingCount={followingCount}
            followerCount={followerCount}
            onLogout={handleLogout}
            onEditProfile={() => setIsEditModalOpen(true)}
            onViewBlocked={() => setIsBlockedModalOpen(true)}
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
              {posts.map((post, index) => (
                <motion.div
                  key={post.id} // 👈 La key passe de <Post> à <motion.div>
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    // Si tu n'as pas de pagination sur cette page, tu peux juste faire index * 0.1
                    // Si tu as une limite (ex: 7), utilise (index % 7) * 0.1
                    delay: index * 0.1 
                  }}
                >
                  <Post
                    post={post}
                    background="darker"
                    onDelete={handlePostDeleted}
                    onPin={(id, isPinnedNow) => {
                      if (user) {
                        user.pinnedPostId = isPinnedNow ? id : undefined;
                      }
                      // Forcer un rechargement pour ré-appliquer le tri
                      setLoading(true);
                      setTimeout(() => setPosts(prev => {
                        const newPosts = [...prev].sort((a, b) => {
                          if (a.id === user?.pinnedPostId) return -1;
                          if (b.id === user?.pinnedPostId) return 1;
                          return 0;
                        });
                        setLoading(false);
                        return newPosts;
                      }), 100);
                    }}
                    onRetweet={(newPost) => {
                      setPosts(prev => [newPost, ...prev]);
                    }}
                    onUpdate={(updatedPost) => {
                      setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
                    }}
                  />
                </motion.div>
              ))}
            </section>
          )}
        </section>
      </main>
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />
      <BlockedUsersModal
        isOpen={isBlockedModalOpen}
        onClose={() => setIsBlockedModalOpen(false)}
      />
    </div>
  );
}
