import { useState, useEffect } from "react";
import Navbar from "../components/ui/Navbar";
import ProfileHeader from "../components/ui/ProfileHeader";
import Post from "../components/ui/Post";
import ProfileEditModal from "../components/ProfileEditModal";
import BlockedUsersModal from "../components/ui/BlockedUsersModal";
import { apiFetch } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { IconSpinner } from "../components/ui/Icons";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import type { PostType } from "../types/post";


export default function Profile() {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followingCount, setFollowingCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = useState(false);
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  
  const isCurrentUser = !username || username === user?.username;

  const handleLogout = () => {
    logout();
    navigate("/Auth");
  };

  const handlePostDeleted = (deletedId: number) => {
    setPosts(prev => prev.filter(post => post.id !== deletedId));
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user && isCurrentUser) {
        setProfileUser(null);
        setPosts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const endpoint = isCurrentUser ? "/users/me" : `/users/username/${encodeURIComponent(username!)}`;
        const stats = await apiFetch<{
          user: any;
          followedIds: number[];
          followingCount: number;
          followerCount: number;
        }>(endpoint);
        
        setProfileUser(stats.user);
        setFollowingCount(stats.followingCount);
        setFollowerCount(stats.followerCount);

        const postsData = await apiFetch<PostType[]>(`/posts/user/${stats.user.id}`);
        
        const sortedPosts = [...postsData].sort((a, b) => {
          if (a.id === stats.user.pinnedPostId) return -1;
          if (b.id === stats.user.pinnedPostId) return 1;
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
  }, [user, username, isCurrentUser]);

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto bg-bg-lighter min-h-screen p-4 pb-24 sm:p-8 lg:p-12 lg:pb-12 shadow-lg">
        {profileUser ? (
          <ProfileHeader
            username={profileUser.username}
            avatarUrl={profileUser.profilePicture || undefined}
            bio={profileUser.bio}
            location={profileUser.location}
            postCount={posts.length}
            followingCount={followingCount}
            followerCount={followerCount}
            userId={profileUser.id}
            onLogout={isCurrentUser ? handleLogout : undefined}
            onEditProfile={isCurrentUser ? () => setIsEditModalOpen(true) : undefined}
            onViewBlocked={isCurrentUser ? () => setIsBlockedModalOpen(true) : undefined}
          />
        ) : !loading && error ? (
           <div className="p-8 text-center text-red-500">
             {error}
           </div>
        ) : !loading && isCurrentUser ? (
          <div className="p-8 text-center text-gray-500">
            Veuillez vous connecter pour voir votre profil.
          </div>
        ) : null}

        <section className="mt-2" aria-label="Publications du profil">
          <h2 className="px-6 py-4 text-xl font-bold border-b text-fg">
            Publicactions
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
              Aucun post n'a été publié.
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
                        const newPinnedId = isPinnedNow ? id : undefined;
                        updateUser({ ...user, pinnedPostId: newPinnedId });
                      }
                      // Forcer un rechargement pour ré-appliquer le tri
                      setLoading(true);
                      const pinnedId = isPinnedNow ? id : undefined;
                      setTimeout(() => setPosts(prev => {
                        const newPosts = [...prev].sort((a, b) => {
                          if (a.id === pinnedId) return -1;
                          if (b.id === pinnedId) return 1;
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
